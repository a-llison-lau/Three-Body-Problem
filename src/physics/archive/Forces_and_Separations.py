"""
CompMod Unit 1: We have defined two functions: compute_separations and compute_forces_potential.
The first function calculates the separations between n particles, in each component, while the second function returns
the total force acting on each particle (in each component) due to other forces, as well as the total potential of the system.

Author: Henry Yip
Number: S2231321

"""
import numpy as np

def compute_separations(particles):   
    """  
    Compute the separation between particles in each component, stored in 
    an array named separations. 
    
    separations[i][j][k] gives the value of the separation between 
    the i_th and j_th particle in k_th component. 
    
    Parameters:
    - particles (list): Particles in the system

    Returns:
    - separations (3d array): Vector separation of each pair of particles.
    """   
    # n is the number of particles
    n = len(particles)
    
    # Size as described in document
    separations = np.zeros((n,n,3)) 
    
    # looping for the ith particle
    for i in range(n):
         for j in range(i+1, n):
                # Distance between particles given a coordinate k. 
                d = ((particles[j].position) - (particles[i].position))
                
                # The vector from a to b is the negative of the vector from b to a.
                separations[i][j] = d
                separations[j][i] = -d
                
    return separations

def compute_forces_potential(particles, separations):    
    """
    This function returns two values. The first is the total force acting on each particle, in 3 components. 
    in an array named total_force_array. Total_force_array[i][k] refers to the total force on particle i in kth component..
    
    The second is the total potential energy of the system.
    
    Parameters:
    - particles (list): Particles in the system
    - separations (3d array): Vector separation of each pair of particles
    
    Returns: 
    - force (2d array): Force on each particle 
    - potential (float): Total system potential energy      
    """ 
    # Unit is AU^3 M_earth^-1 day^-2
    G = 1

    # N is the number of particles
    N=len(particles)

    # An array storing the force between 2 particles (i and j) in each component (n)
    force_array=np.zeros((N,N,3))
      
    potential=0
    for i in range(N):
        # Only calculate once for each pair, by Newton's Third Law, Force from a to b has same magnitude but different direction as Force from b to a
        for j in range(i+1,N):
            
            # Separation_i_j has size 3, it contains the distance between particle i and particle j (in all 3 components)
            # We have not specified which n component to sum over, so it returns all the components of forces between i and j 
            separation_i_j=separations[i,j]
                   
            mod_distance=np.linalg.norm(separation_i_j)
                 
            # Storing masses for particles i and j in variables to shorten code length
            m_i=particles[i].mass
            m_j=particles[j].mass
            
            # Force between two particles is given by GMm\vec{r}/r^3
            force=(G*(m_i)*(m_j)*(separation_i_j))/mod_distance**3
            
            # Total Potential is given by -GMm/r, summed up between all particles
            potential+=-G*(m_i)*(m_j)/mod_distance
            
            # Assigning the value of force for each component into the force_array. Second line uses Newton's third law
        
            force_array[i,j]=force
            force_array[j,i]=-force
    
    # We are asked to calculate the total force on each particle, so we sum up
    forces=np.sum(force_array, axis=1)
    
    return forces, potential 

    
  