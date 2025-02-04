"""
Particle3D, a class to describe point particles in 3D space. An instance describes a particle in Euclidean 3D space: 
velocity and position are [3] arrays

Author: Henry Yip
Number: S2231321
"""
import numpy as np

class Particle3D(object):
    """
    Class to describe point-particles in 3D space

    Attributes
    ----------
    label: name of the particle
    mass: mass of the particle
    position: position of the particle
    velocity: velocity of the particle

    Methods
    -------
    __init__
    __str__
    kinetic_energy: computes the kinetic energy
    momentum: computes the linear momentum
    update_position_1st: updates the position to 1st order
    update_position_2nd: updates the position to 2nd order
    update_velocity: updates the velocity

    Static Methods
    --------------
    read_file: initializes a P3D instance from a file handle
    total_kinetic_energy: computes total K.E. of a list of particles
    com_velocity: computes centre-of-mass velocity of a list of particles
    """

    def __init__(self, label, mass, position, velocity):
        """
        Initialises a particle in 3D space.

        Parameters
        ----------
        label: str
            name of the particle
        mass: float
            mass of the particle
        position: [3] float array
            position vector
        velocity: [3] float array
            velocity vector
        """
        self.label=str(label)
        self.mass=float(mass)
        self.position=np.array(position)
        self.velocity=np.array(velocity)

    def __str__(self):
    
        """
        Return an XYZ-format string. The format is
        label    x  y  z

        Returns
        -------
        str
        """
        XYZ=f"{self.label}    {self.position[0]} {self.position[1]} {self.position[2]}"
        return XYZ

    def kinetic_energy(self):
        """
        Returns the kinetic energy of a Particle3D instance

        Returns
        -------
        ke: float
            1/2 m v**2
        """
        Kinetic_Energy = (1/2) * (self.mass) * (np.linalg.norm(self.velocity)) ** 2
        return  Kinetic_Energy
    
    def momentum(self):
        """
        Returns the momentum of a Particle3D instance
        
        Returns m*v
        """
        Momentum = (self.mass) * (self.velocity)
        return Momentum

    def update_position_1st(self, dt):
        """
        Return the updated position by r'=r+v*dt as required, where r' is the new position
        """
        update_position_1st = self.position + dt * (self.velocity)
        self.position = update_position_1st  
    
    def update_position_2nd(self,dt,force):
        """
        Return the updated position, r', by r'= r+dt·v+dt^2·(f/2m), where f is given by force
        """
        update_position_2nd = self.position + (dt) * (self.velocity)+ (((dt) ** 2) * force) / (2 * self.mass)
        self.position= update_position_2nd

     
    def update_velocity(self, dt, force):
        """
        Return the updated velocity, v', by v'=v+dt·(f/m)
        """
        Update_Velocity = self.velocity + (dt) * ((force) / self.mass)
        self.velocity = Update_Velocity
    
       
    def update_position_symplectic(self, dt, d_coeff):
       """
       Update the position using the symplectic method coefficients.

       Parameters
       ----------
       dt : float
           Time step
       c_coeff : float
           Coefficient for the position update
       """
       self.position += d_coeff * dt * self.velocity

    def update_velocity_symplectic(self, dt, force, c_coeff):
       """
       Update the velocity using the symplectic method coefficients.

       Parameters
       ----------
       dt : float
           Time step
       force : np.array
           Force vector acting on the particle
       d_coeff : float
           Coefficient for the velocity update
       """
       self.velocity += c_coeff * dt * force / self.mass
        
    def update_position_euler(self, dt):
        """
        Update the position using the Euler method.
    
        Parameters
        ----------
        dt : float
            Time step
        """
        self.position += dt * self.velocity

    def update_velocity_euler(self, dt, force):
        """
        Update the velocity using the Euler method.
    
        Parameters
        ----------
        dt : float
            Time step
        force : np.array
            Force vector acting on the particle
        """
        self.velocity += dt * force / self.mass
 
    @staticmethod
    def read_line(line):
        """
        Creates a Particle3D instance given a line of text.

        The input line should be in the format:
        label   <mass>  <x> <y> <z>    <vx> <vy> <vz>

        Parameters
        ----------
        filename: str
            Readable file handle in the above format

        Returns
        -------
        p: Particle3D
        """
        lst = line.split()
        label = lst[0]
        mass = lst[1]
        position = np.array([float(lst[2]),float(lst[3]),float(lst[4])])
        velocity = np.array([float(lst[5]),float(lst[6]),float(lst[7])])
        New_Particle = Particle3D(label, float(mass), position, velocity)

        return New_Particle

    @staticmethod
    def total_kinetic_energy(particles):
        """
        Computes the total kinetic energy of a list of P3D's.
        
        Summing up the kinetic energy of every particle and returning it at the end
        
        """
        Total_Kinetic_Energy = 0
        for p in particles:
             Total_Kinetic_Energy += p.kinetic_energy()
        return Total_Kinetic_Energy
  
    @staticmethod
    def com_velocity(particles):
        """
        Computes the CoM velocity of a list of P3D's

        Parameters
        ----------
        particles: list
            A list of Particle3D instances

        Returns
        -------
        com_vel: array
            Centre-of-mass velocity
        """
        total_momentum = np.zeros(3)
        total_mass = 0
        for p in particles:
            total_momentum += p.momentum()
            total_mass += p.mass
        com_vel = total_momentum / total_mass    
        return com_vel 
 