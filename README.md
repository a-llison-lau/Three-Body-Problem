# Three Body Problem Visualization

We simulate the restricted Euler problem and visualize known orbits from literature.

The visualization is at [here](https://three-body-problem.vercel.app/).

![Preview](https://imgur.com/XpemDaf.gif)

## 1. Contributing

To contribute to this project, make a fork and,

```
git clone https://github.com/<your-github-username>/Three-Body-Problem.git
cd Three-Body-Problem
npm install
npm run dev
```

The physics components are located in `src/computation/cpp/` (the python version is also available, but takes significantly longer time to run). To run the simulation,

```
cd src/computation/cpp/
make
./simulation <num_output_steps> <dt> <input_file>
```

Note that `num_output_steps` refer to the number of 0.01 units of time steps (not `dt` units of time steps). For more accurate simulation results, $\mathrm{d}t < 0.001$ is recommended. The results of the simulation are precomputed with `num_steps = 3600`, `dt = 0.00001` and stored in `public/position_files/<method>/<orbit>`, where `<method>` refers to the order of the symplectic integrator.