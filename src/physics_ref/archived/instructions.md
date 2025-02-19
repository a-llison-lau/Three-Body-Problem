To produce an xyz file with the positions, 
%run Verlet_Integration_Loop 10000 0.00001 Figure_8.txt Figure_8.xyz 4

For trajectories run
%run plot_xyz.py Figure_8.xyz --trajectory

For animations run
%run plot_xyz.py Figure_8.xyz --steps=100 — output Figure_8.gif

Refactored code
cd src/resources
python integration_loop_refactored.py 3600 0.00001 initial_conditions.txt
