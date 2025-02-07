import numpy as np
from particle3D import Particle3D
from . import Forces_and_Separations
import sys
import time
import matplotlib.pyplot as plt

proximity_threshold = 100

def generate_planets_from_file(file_path):
    particles = []
    try:
        with open(file_path, 'r') as file:
            for line in file:
               particles.append(Particle3D.read_line(line))
    except FileNotFoundError:
        print(f"File not found: {file_path}")
        return None 
    return particles


start_time=time.time()

def main():

    current_time=0.0
       
    # Extract the number of simulation steps from the first command-line argument
    numstep = int(sys.argv[1])
    
    # Extract the time step from the second command-line argument
    dt = float(sys.argv[2])
    
    # Extract the name of input file from the third command-line argument
    input_file = sys.argv[3]
    
    # Extract the name of output file from the fourth command-line argument
    output_file = sys.argv[4]
    
    # "Yes" command increases the jupiter mass by 20 times. This is needed in my report

    # Generate a list of particles based on the function descried above
    particles = generate_planets_from_file(input_file)
      
    # Centre-of-mass corrections to avoid an undesirable drift during long simulations.
    # A static Method from particle3D - com_velocity is used 
    for i in range(len(particles)):
       particles[i].velocity -= Particle3D.com_velocity(particles)
           
    # Initialise arrays that we will store results in
    n = len(particles)
    times = np.zeros(numstep)
    energy = np.zeros(numstep)
    positions = np.zeros((n, numstep, 3))

    # Separations between particles, using the code from Unit 1
    separations = Forces_and_Separations.compute_separations(particles)
    
    # Forces from Unit 1. As compute_forces_potential gives forces and potential (in order), we take the first element (forces)
    forces = Forces_and_Separations.compute_forces_potential(particles, separations)[0]
      
    # A list containing the total energy of the system over time
    Energy_List = []
   
   
    c_3 = [7/24, 3/4, -1/24]
    d_3 = [2/3, -2/3, 1]
    
    
    c_4 = [
    1 / (2 * (2 - 2**(1/3))),
    (1 - 2**(1/3)) / (2 * (2 - 2**(1/3))),
    (1 - 2**(1/3)) / (2 * (2 - 2**(1/3))),
    1 / (2 * (2 - 2**(1/3)))
    ]

    d_4 = [
    1 / (2 - 2**(1/3)),
    (-2**(1/3)) / (2 - 2**(1/3)),
    1 / (2 - 2**(1/3)),
    0
    ]

    Momentum_x = []
    Momentum_y = []
    Momentum_z = []
    Momentum_total = []
    a_list = []
    initial_positions = np.array([particle.position for particle in particles])
    
    proximity = []

    with open(output_file, "w") as output_file:
       for step in range(numstep):
           
           Momentum_x_sum = 0.0  # Reset the momentum sums for each time step
           Momentum_y_sum = 0.0
           Momentum_z_sum = 0.0
           
           times[step] = current_time
           current_time += dt
           
           X_t = np.array([particle.position for particle in particles])
           r_diff = X_t - initial_positions
           p_t = np.array([particle.velocity for particle in particles])
           proximity.append(np.sqrt(np.sum(r_diff**2) + np.sum(p_t**2))) 
           
           if sys.argv[5] == "4": 
                            
                for k in range(4):
                    separations = Forces_and_Separations.compute_separations(particles)
                    forces, potential = Forces_and_Separations.compute_forces_potential(particles, separations)
                    
                    particles[0].update_velocity_symplectic(dt, forces[0], c_4[k])
                    particles[1].update_velocity_symplectic(dt, forces[1], c_4[k])
                    particles[2].update_velocity_symplectic(dt, forces[2], c_4[k])
                    
                    particles[0].update_position_symplectic(dt, d_4[k])
                    particles[1].update_position_symplectic(dt, d_4[k])
                    particles[2].update_position_symplectic(dt, d_4[k])
        
                    
        
           elif sys.argv[5] == "3":              
              for k in range(3):
                    separations = Forces_and_Separations.compute_separations(particles)
                    forces, potential = Forces_and_Separations.compute_forces_potential(particles, separations)
                    
                    particles[0].update_velocity_symplectic(dt, forces[0], c_3[k])
                    particles[1].update_velocity_symplectic(dt, forces[1], c_3[k])
                    particles[2].update_velocity_symplectic(dt, forces[2], c_3[k])
                    
                    particles[0].update_position_symplectic(dt, d_3[k])
                    particles[1].update_position_symplectic(dt, d_3[k])
                    particles[2].update_position_symplectic(dt, d_3[k])
        
           
           elif sys.argv[5] == "1":
            for m in range(n):
              particles[m].update_position_euler(dt)
           
            separations = Forces_and_Separations.compute_separations(particles)
            forces, potential = Forces_and_Separations.compute_forces_potential(particles, separations)
           
            for j in range(n):
              particles[j].update_velocity_euler(dt, forces[j])
          
           elif sys.argv[5] == "2":               
            for m in range(n):
               particles[m].update_position_2nd(dt, forces[m])
           # Updates positions and calculates distances
           
         
           for m in range(3):
             
               positions[m][i] = particles[m].position         
               Momentum_x_sum += particles[m].velocity[0] * particles[m].mass               
               Momentum_y_sum += particles[m].velocity[1] * particles[m].mass
               Momentum_z_sum += particles[m].velocity[2] * particles[m].mass
               Momentum_total_sum = Momentum_x_sum+  Momentum_y_sum+Momentum_z_sum 
              
           Momentum_x.append(Momentum_x_sum)
           Momentum_y.append(Momentum_y_sum)        
           Momentum_z.append(Momentum_z_sum)
           Momentum_total.append(Momentum_total_sum)
           
           Momentum_total_sum = 0
           
           for i in range(len(particles)):
            for j in range(i + 1, len(particles)):
              
               if np.linalg.norm(separations[i, j]) > proximity_threshold :
                                     
                   times_stop = times[:step + 1]
             
                   print("Planets are too far apart. Stopping the program.")
                   plt.figure()
                   plt.plot(times_stop, Momentum_x, label='Momentum in x direction')
                   plt.plot(times_stop, Momentum_y, label='Momentum in y direction')
                   plt.plot(times_stop, Momentum_total, label='Total Momentum')
                   plt.legend()
                   plt.xlabel('Time')
                   plt.ylabel('Momentum')
                   plt.title('Momentum vs Time')
                   plt.show()
                   
            
       
                   # Exit the program
                   return
           
           # Write the number of particles and point label
           output_file.write(f"{n}\nPoint = {i + 1}\n")
   
           # Write positions to the output file
           for particle in particles:
              output_file.write(f"{particle.label} {particle.position[0]} {particle.position[1]} {particle.position[2]} "
        f"{particle.velocity[0]} {particle.velocity[1]} {particle.velocity[2]}\n")
          
           # Update forces and potential
           separations_updated = Forces_and_Separations.compute_separations(particles)
           forces_updated, potential_updated = Forces_and_Separations.compute_forces_potential(particles, separations_updated)
           
           if sys.argv[5] == "2":
              for k in range(n):
               particles[k].update_velocity(dt, 0.5 * (forces[k] + forces_updated[k]))

           forces = forces_updated

           # Kinetic energy calculation
           kinetic_energy = Particle3D.total_kinetic_energy(particles)

           # Total energy 
           energy[i] = kinetic_energy + potential_updated
           Energy_List.append(energy[i])
              
    # The maximum total energy of system
    Max_Energy = max(Energy_List)
    Max_Momentum_x = max(Momentum_x)
    Max_Momentum_y = max(Momentum_y)
    
    # The minimum total energy of system
    Min_Energy = min(Energy_List) 
    Min_Momentum_x = min(Momentum_x)
    Min_Momentum_y = min(Momentum_y)
       
      
    # The initial energy of the system
    Initial_Energy = Energy_List[0]
  
    # Caluclating the deviation, the definition is given in background file.
    # It will be printed below
    Energy_Deviation = np.abs((Max_Energy - Min_Energy) / Initial_Energy)
    Momentum_Difference_x = np.abs(Max_Momentum_x - Min_Momentum_x) 
    Momentum_Difference_y = np.abs(Max_Momentum_y - Min_Momentum_y) 
    print("The Energy Deviation is", Energy_Deviation, end ='\n\n')  
    print("Maximum Difference in Momentum (x-direction) is ", Momentum_Difference_x, end ='\n\n')  
    print("Maximum Difference in Momentum (y-direction) is ", Momentum_Difference_y, end ='\n\n')  
    
    
    end_time=time.time()
    
    print("The total run time is", end_time-start_time, "seconds") 
    plt.plot(times,Energy_List, label='Energy of the System')
    plt.title("Energy over time for Figure-8 Orbit (Fourth-Order Method)")
    plt.legend()  # This will display the labels in a legend box.
    plt.show()  # This will display the plot.
    plt.show()
    
    plt.plot(times,Momentum_x, label='Momentum (x-direction) of the System')
    plt.plot(times,Momentum_y, label='Momentum (x-direction) of the System')
    plt.title("Energy over time for Figure-8 Orbit (Fourth-Order Method)")
    plt.legend()  # This will display the labels in a legend box.
    plt.show()  # This will display the plot.
    plt.show()
  
    
if __name__ == "__main__":
    main()
