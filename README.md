# Three Body Problem Visualization

🚧 WIP 🚧

The Three-Body Problem is far from fully solved despite centuries of effort. The restricted Euler Problem is a special case in which two bodies are fixed in place, resulting in two poisson-commuting conserved quantities, allowing the system to be fully integrable by the Liouville-Arnold theorem. We simulate the restricted Euler problem and visualize known orbits from literature.

## 1. Setup for Development (Local)

To contribute to this project, make a fork and,

```
git clone https://github.com/<your-github-username>/Three-Body-Problem.git
cd Three-Body-Problem
npm install
npm run dev
```

The physics components are located in `src/resources`. To run the simulation,

```
cd src/resources
python integration_loop_refactored.py <num_steps> <dt> initial_conditions.txt
```

Note that `num_steps` refer to the number of 0.01 units of time steps (not `dt` units of time steps). For more accurate simulation results, $\mathrm{d}t < 0.001$ is recommended. The results of the simulation are precomputed with `num_steps = 3600`, `dt = 0.00001` and stored in `public/position_files/<method>/<orbit>`, where `<method>` refers to the order of the symplectic integrator.