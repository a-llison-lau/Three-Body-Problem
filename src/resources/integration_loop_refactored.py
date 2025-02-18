import numpy as np
from particle3D import Particle3D
import Forces_and_Separations
import sys
import time
from tqdm import tqdm
import matplotlib.pyplot as plt
from typing import List, Tuple, Dict

class SimulationConfig:
    """Configuration class for simulation parameters"""
    def __init__(self, num_steps: int, dt: float, proximity_threshold: float = 100):
        self.output_interval = 0.1
        self.dt = dt
        self.proximity_threshold = proximity_threshold
        
        # Calculate actual number of integration steps needed
        self.total_time = num_steps * self.output_interval
        self.num_integration_steps = int(self.total_time / self.dt)

class InitialCondition:
    def __init__(self, name: str, particles: List[Particle3D]):
        self.name = name
        self.particles = particles

class Integrator:
    """Class handling different integration methods"""
    # Symplectic integrator coefficients
    COEFFICIENTS = {
        3: {
            "c": [7/24, 3/4, -1/24],
            "d": [2/3, -2/3, 1]
        },
        4: {
            "c": [
                1/(2*(2-2**(1/3))),
                (1-2**(1/3))/(2*(2-2**(1/3))),
                (1-2**(1/3))/(2*(2-2**(1/3))),
                1/(2*(2-2**(1/3)))
            ],
            "d": [
                1/(2-2**(1/3)),
                (-2**(1/3))/(2-2**(1/3)),
                1/(2-2**(1/3)),
                0
            ]
        }
    }
    
    @staticmethod
    def symplectic_step(particles: List[Particle3D], dt: float, forces: np.ndarray, coeffs: Dict[str, List[float]], steps: int) -> None:
        """Perform one step of symplectic integration"""
        for k in range(steps):
            for particle, force in zip(particles, forces):
                particle.update_velocity_symplectic(dt, force, coeffs["c"][k])
                particle.update_position_symplectic(dt, coeffs["d"][k])
        # print(f"position: {particle.position}, velocity: {particle.velocity}")

    
    @staticmethod
    def euler_step(particles: List[Particle3D], dt: float, forces: np.ndarray) -> None:
        """Perform one step of Euler integration"""
        for particle in particles:
            particle.update_position_euler(dt)
        for particle, force in zip(particles, forces):
            particle.update_velocity_euler(dt, force)
    
    @staticmethod
    def verlet_step(particles: List[Particle3D], dt: float, forces: np.ndarray, 
                    forces_updated: np.ndarray) -> None:
        """Perform one step of Velocity Verlet integration"""
        for particle, force in zip(particles, forces):
            particle.update_position_2nd(dt, force)
        for particle, force, force_updated in zip(particles, forces, forces_updated):
            particle.update_velocity(dt, 0.5 * (force + force_updated))

def parse_initial_conditions(file_path: str) -> List[InitialCondition]:
    """Parse the initial conditions file and return a list of configurations"""
    initial_conditions = []
    current_name = None
    current_particles = []
    
    try:
        with open(file_path, 'r') as file:
            lines = file.readlines()
            
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            if not line[0].isdigit():  # This is a configuration name
                if current_name and current_particles:
                    initial_conditions.append(InitialCondition(current_name, current_particles))
                current_name = line
                current_particles = []
            else:  # This is a particle definition
                particle = Particle3D.read_line(line)
                current_particles.append(particle)
                
        # Add the last configuration
        if current_name and current_particles:
            initial_conditions.append(InitialCondition(current_name, current_particles))
            
        return initial_conditions
    except FileNotFoundError:
        raise FileNotFoundError(f"Initial conditions file not found: {file_path}")

class NBodySimulation:
    def __init__(self, config: SimulationConfig):
        self.config = config
        self.next_output_time = 0.0  # Track when to write next output
    
    def run_simulation(self, initial_condition: InitialCondition, method: int) -> None:
        """Run simulation for a specific initial condition"""
        self.particles = initial_condition.particles.copy()
        self.n_particles = len(self.particles)
        self._initialize_system()
        
        output_file_path = f"/Users/allisonlau/VSCodeProjects/three-body/public/position_files/{method}/{initial_condition.name}.txt"
        print(f"\nProcessing configuration: {initial_condition.name}")
        
        # Initialize arrays based on number of integration steps
        times = np.zeros(self.config.num_integration_steps)
        energy = np.zeros(self.config.num_integration_steps)
        momentum_history = {
            'x': [], 'y': [], 'z': [], 'total': []
        }
        
        current_time = 0.0
        separations = Forces_and_Separations.compute_separations(self.particles)
        forces, _ = Forces_and_Separations.compute_forces_potential(self.particles, separations)
        
        with open(output_file_path, "w") as output_file:
            for step in tqdm(range(self.config.num_integration_steps), 
                           desc=f"Simulating {initial_condition.name}",
                           ncols=100):
                current_time = self._run_step(method, step, current_time, forces, momentum_history, 
                                           times, energy, output_file)
                if current_time is None:  # Simulation terminated early
                    break
        
        self._print_statistics(initial_condition.name, energy, momentum_history, output_file_path)
    
    def _initialize_system(self) -> None:
        """Initialize the system by correcting center of mass velocity"""
        com_velocity = Particle3D.com_velocity(self.particles)
        for particle in self.particles:
            particle.velocity -= com_velocity
    
    def _calculate_momentum(self) -> Tuple[float, float, float, float]:
        """Calculate system momentum components"""
        momentum = np.zeros(3)
        for particle in self.particles:
            momentum += particle.velocity * particle.mass
        return (*momentum, np.sum(momentum))
    
    def _run_step(self, method: int, step: int, current_time: float, forces: np.ndarray, momentum_history: Dict, times: np.ndarray, energy: np.ndarray, output_file) -> float:
        """Run a single simulation step"""
        times[step] = current_time
        current_time += self.config.dt
        
        # Integration step
        if method in (3, 4):
            steps = method
            separations = Forces_and_Separations.compute_separations(self.particles)
            forces, potential = Forces_and_Separations.compute_forces_potential(self.particles, separations)
            Integrator.symplectic_step(self.particles, self.config.dt, forces, 
                                     Integrator.COEFFICIENTS[method], steps)
        elif method == 1:
            Integrator.euler_step(self.particles, self.config.dt, forces)
        elif method == 2:
            Integrator.verlet_step(self.particles, self.config.dt, forces, forces)
        
        # Update system state
        separations = Forces_and_Separations.compute_separations(self.particles)
        if self._check_proximity(separations):
            # Record final state before terminating
            forces, potential = Forces_and_Separations.compute_forces_potential(self.particles, separations)
            kinetic = Particle3D.total_kinetic_energy(self.particles)
            energy[step] = kinetic + potential
            mx, my, mz, mt = self._calculate_momentum()
            for key, value in zip(['x', 'y', 'z', 'total'], [mx, my, mz, mt]):
                momentum_history[key].append(value)
            
            self._plot_results(times[:step + 1], momentum_history)
            return None
            
        forces, potential = Forces_and_Separations.compute_forces_potential(self.particles, separations)
        
        # Always record energy and momentum for every step
        kinetic = Particle3D.total_kinetic_energy(self.particles)
        energy[step] = kinetic + potential
        mx, my, mz, mt = self._calculate_momentum()
        for key, value in zip(['x', 'y', 'z', 'total'], [mx, my, mz, mt]):
            momentum_history[key].append(value)
        
        # Write to file only at specified intervals
        if current_time >= self.next_output_time:
            self._record_state(step, momentum_history, energy, potential, output_file)
            self.next_output_time = current_time + self.config.output_interval
        
        return current_time
    
    def _check_proximity(self, separations: np.ndarray) -> bool:
        """Check if particles exceed proximity threshold"""
        for i in range(self.n_particles):
            for j in range(i + 1, self.n_particles):
                if np.linalg.norm(separations[i, j]) > self.config.proximity_threshold:
                    return True
        return False
    
    def _record_state(self, step: int, momentum_history: Dict, energy: np.ndarray, 
                     potential: float, output_file) -> None:
        """Record the current state of the system"""
        # Calculate current momentum and energy
        mx, my, mz, mt = self._calculate_momentum()
        kinetic = Particle3D.total_kinetic_energy(self.particles)
        current_energy = kinetic + potential
        energy[step] = current_energy
        
        # Calculate changes from previous step
        if step > 0:
            d_mx = mx - momentum_history['x'][-1]
            d_my = my - momentum_history['y'][-1]
            d_mz = mz - momentum_history['z'][-1]
            d_energy = current_energy - energy[step-1]
        else:
            d_mx = d_my = d_mz = d_energy = 0.0
        
        # Store current values in history
        for key, value in zip(['x', 'y', 'z', 'total'], [mx, my, mz, mt]):
            momentum_history[key].append(value)
        
        # Write momentum and energy changes
        output_file.write(f"dMomentum = {d_mx:.6e} {d_my:.6e} {d_mz:.6e}\n")
        output_file.write(f"dEnergy = {d_energy:.6e}\n")
        # Write particle states
        for particle in self.particles:
            output_file.write(f"{particle.label} {' '.join(map(str, particle.position))} "
                            f"{' '.join(map(str, particle.velocity))}\n")
    
    def _plot_results(self, times: np.ndarray, momentum_history: Dict) -> None:
        """Plot simulation results"""
        plt.figure()
        for component in ['x', 'y', 'total']:
            plt.plot(times, momentum_history[component], 
                    label=f'Momentum in {component} direction')
        plt.legend()
        plt.xlabel('Time')
        plt.ylabel('Momentum')
        plt.title('Momentum vs Time')
        plt.show()
    
    def _print_statistics(self, config_name: str, energy: np.ndarray, 
                         momentum_history: Dict, output_file_path: str) -> None:
        """Print statistics for a specific configuration"""
        energy_list = energy[energy != 0]
        if len(energy_list) > 0:  # Only calculate if we have data
            energy_deviation = np.abs((np.max(energy_list) - np.min(energy_list)) / energy_list[0])
            momentum_diff_x = np.abs(np.max(momentum_history['x']) - np.min(momentum_history['x']))
            momentum_diff_y = np.abs(np.max(momentum_history['y']) - np.min(momentum_history['y']))
            
            print(f"\nStatistics for {config_name}:")
            print(f"Energy Deviation: {energy_deviation:.6e}")
            print(f"Maximum Difference in Momentum (x-direction): {momentum_diff_x:.6e}")
            print(f"Maximum Difference in Momentum (y-direction): {momentum_diff_y:.6e}")
            print(f"Data saved to {output_file_path}")

def main():
    if len(sys.argv) != 4:
        print("Usage: python script.py <num_output_steps> <dt> <input_file>")
        print("Note: num_output_steps represents how many 0.01 time intervals to simulate")
        sys.exit(1)
    
    if float(sys.argv[2]) > 0.1:
        print("Usage: Maximum dt 0.1")
        sys.exit(1)
    
    start_time = time.time()
    
    config = SimulationConfig(
        num_steps=int(sys.argv[1]),
        dt=float(sys.argv[2]),
    )
    
    # Parse initial conditions file
    input_file = sys.argv[3]
    try:
        initial_conditions = parse_initial_conditions(input_file)
    except FileNotFoundError as e:
        print(f"Error: {e}")
        sys.exit(1)
    
    simulation = NBodySimulation(config)

    # Print simulation information
    print(f"Found {len(initial_conditions)} configurations in {input_file}")
    print(f"Will simulate for {config.total_time} time units")
    print(f"Using {config.num_integration_steps} integration steps with dt={config.dt}")
    
    for initial_condition in initial_conditions:
        for method in [1, 2, 3, 4]:
            simulation.run_simulation(initial_condition=initial_condition, method=method)
    
    print(f"\nTotal run time: {time.time() - start_time:.2f} seconds")

if __name__ == "__main__":
    main()