To produce an xyz file with the positions, 
%run Verlet_Integration_Loop 10000 0.001 Figure_8.txt Figure_8.xyz 4

For trajectories run
%run plot_xyz.py Figure_8.xyz --trajectory

For animations run
%run plot_xyz.py Figure_8.xyz --steps=100 — output Figure_8.gif
