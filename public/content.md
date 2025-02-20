# Introduction of the Three-Body Problem
This website is a visualisation of the three-body problem, where we track the trajectory of three bodies under the influence of gravitational forces.

# Mathematical Formuation behind the Three-Body Problem

Knowing the separation $|\mathbf{r}_1 - \mathbf{r}_2|$ between any two bodies, we can calculate the total force acting on them:

$$\mathbf{F}_{12} = \frac{G m_1 m_2 (\mathbf{r}_1 - \mathbf{r}_2)}{|\mathbf{r}_1 - \mathbf{r}_2|^3},$$

where $G$ is the gravitational constant. We assume $G=1$ for simplicity. 

Including the contribution of forces from other bodies, we obtain:

$$\mathbf{F}_i = \sum_{j \neq i} \mathbf{F}_{ij} = \sum_{j \neq i} \frac{G m_i m_j (\mathbf{r}_i - \mathbf{r}_j)}{|\mathbf{r}_i - \mathbf{r}_j|^3}.$$

The force on each body relates to its acceleration by Newton's second law:
$$\mathbf{F}_i(t)=m_i\mathbf{a}_i(t),$$ 
where acceleration is defined by: $$\mathbf{a}_i(t)=\frac{d\mathbf{v}_i}{dt}.$$

Given the velocity of a point mass for every time $t$, we can obtain the trajectory of the system. The main focus is how the trajectory of the system varies with time. 

## Symplectic Integrators
Global error is the cumulative error over all steps compared to the exact solution of the differential equation. An integration method has order $n$ if the global error is of order $O(h^n)$, where $h$ is the stepsize. For example, Euler Method has the form $y_{n+1} = y_n + h f(t_n, y_n)$. The global error is of order $O(h)$ and hence is of order $1$. This means the global error decreases linearly with the step size $h$. Thus, the approximation becomes more accurate as $h$ becomes smaller, with the cost of increased computational steps and computational time. 

In our simulations, the user can choose between Euler, Verlet, Ruth and Neri integrators, with orders of 1,2,3 and 4 respectively. 

### Comparison Between Methods

Table 1: Comparison of Ruth, Neri, Verlet and Euler Methods (Figure-8 Orbit)

| Method           | Energy Deviation    | Max Δpₓ           | Max Δpᵧ           | Run Time (s) |
| ---------------- | ------------------- | ----------------- | ----------------- | ------------ |
| Neri (Order 4)   | 6.124 × 10⁻¹⁴       | 1.040 × 10⁻¹³     | 4.852 × 10⁻¹⁴     | 29.60        |
| Ruth (Order 3)   | 1.280 × 10⁻¹³       | 5.307 × 10⁻¹⁴     | 3.048 × 10⁻¹⁴     | 25.91        |
| Verlet (Order 2) | 5.893 × 10⁻⁹        | 3.841 × 10⁻¹⁴     | 2.232 × 10⁻¹⁴     | 12.31        |
| Euler (Order 1)  | 3.601 × 10⁻⁵        | 3.686 × 10⁻¹⁴     | 3.009 × 10⁻¹⁴     | 15.53        |


Table 2: Comparison of Ruth, Neri, Verlet and Euler Methods (Bumblebee Orbit)

| Method           | Energy Deviation  | Max Δpₓ           | Max Δpᵧ           | Run Time (s) |
| ---------------- | ----------------- | ----------------- | ----------------- | ------------ |
| Neri (Order 4)   | 8.058 × 10⁻³      | 4.591 × 10⁻¹⁴     | 9.246 × 10⁻¹⁴     | 27.79        |
| Ruth (Order 3)   | 8.058 × 10⁻³      | 7.394 × 10⁻¹⁴     | 4.249 × 10⁻¹⁴     | 23.84        |
| Verlet (Order 2) | 9.676 × 10⁻²      | 2.287 × 10⁻¹⁴     | 1.882 × 10⁻¹⁴     | 11.56        |
| Euler (Order 1)  | 2.4329            | 3.625 × 10⁻¹⁴     | 2.312 × 10⁻¹⁴     | 15.71        |


Table 3: Comparison of Ruth, Neri, Verlet and Euler Methods (Moth Orbit)

| Method           | Energy Deviation   | Max Δpₓ           | Max Δpᵧ           | Run Time (s) |
| ---------------- | ------------------ | ----------------- | ----------------- | ------------ |
| Neri (Order 4)   | 1.459 × 10⁻⁹       | 4.874 × 10⁻¹⁴     | 8.693 × 10⁻¹⁴     | 28.06        |
| Ruth (Order 3)   | 2.143 × 10⁻⁸       | 3.486 × 10⁻¹⁴     | 3.185 × 10⁻¹⁴     | 22.39        |
| Verlet (Order 2) | 4.775 × 10⁻⁵       | 2.387 × 10⁻¹⁴     | 3.835 × 10⁻¹⁴     | 11.55        |
| Euler (Order 1)  | 0.02070            | 2.031 × 10⁻¹⁴     | 2.183 × 10⁻¹⁴     | 13.76        |


## Analytical Orbits
The general Three-Body Problem is not analytic. However, special orbits that are analytical are found. Some of these are shown below:

### Lagrange Orbit

For each two-body system, there exist $5$ points of equilibrium, in which there is no net force on the third body. These points can be labelled from $L_1$ to $L_5$.

Lagrange discovered the Lagrange Orbit in $1772$. It is a family of solutions in which the three equal masses form an equilateral triangle at each instant. The third mass lies either on $L_4$ or $L_5$ of the first two masses. 
### Figure-8 Orbit
The most iconic of all the periodic orbits, in the Figure-8 orbit, the three bodies appear to have the same trajectory as the first body, except for a different phase. This allows the trajectories to form a knot-like figure-8 shape. 