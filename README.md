# Three Body Problem Visualization

The Three-Body Problem is far from fully solved despite centuries of effort. The restricted Euler Problem is a special case in which two bodies are fixed in place, resulting in two poisson-commuting conserved quantities, allowing the system to be fully integrable by the Liouville-Arnold theorem. We use an order-4 symplectic integrator to simulate the restricted Euler problem and visualize known orbits from literature.

## 1. Setup for Development (Local)

Run the following commands:

```
git clone https://github.com/a-llison-lau/three-body-problem.git
cd three-body
npm install
npm run dev
```

Click on the link returned from running `npm run dev`. This is the local development server (usually on http://localhost:5173, depending on your setup), and the website will be available locally for viewing.