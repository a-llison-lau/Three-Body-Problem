# Introduction

The Three-Body Problem describes the motion of three masses, $m_1$, $m_2$, $m_3$, interacting through Newton’s inverse-square law of gravitation. While modern classical mechanics textbooks often cover chaotic systems, they rarely explore the three-body problem in detail. This may be due to the historical difficulty of finding solutions, though recent discoveries of numerous periodic orbits have renewed interest in the topic.

Here, we present visualizations of some of these known orbits.

# Mathematical Formulation

Knowing the separation $|\mathbf{r}_1 - \mathbf{r}_2|$ between any two bodies, we can calculate the total force acting on them:

$$\mathbf{F}_{12} = \frac{G m_1 m_2 (\mathbf{r}_1 - \mathbf{r}_2)}{|\mathbf{r}_1 - \mathbf{r}_2|^3},$$

where $G$ is the gravitational constant. We assume $G=1$ for simplicity. Including the contribution of forces from other bodies, we obtain:

$$\mathbf{F}_i = \sum_{j \neq i} \mathbf{F}_{ij} = \sum_{j \neq i} \frac{G m_i m_j (\mathbf{r}_i - \mathbf{r}_j)}{|\mathbf{r}_i - \mathbf{r}_j|^3}.$$

The force on each body relates to its acceleration by Newton's second law:
$$\mathbf{F}_i(t)=m_i\mathbf{a}_i(t),$$ 
where acceleration is defined by

$$\mathbf{a}_i(t)=\frac{d\mathbf{v}_i}{dt}.$$

Given the velocity of a point mass for every time $t$, we can obtain the trajectory of the system. The main focus is how the trajectory of the system varies with time.

# Symplectic Integrators

Conservation of energy can be achieved through symplectic integrators. At the $i$-th time step, velocity and position are updated by:

$$\begin{align*}v^{(i)} &= v^{(i - 1)} + c_ia^{(i)}\mathrm{d}t \\ x^{(i)} &= x^{(i - 1)} + d_iv^{(i)}\mathrm{d}t\end{align*}$$

where it is important to note that velocity must be updated before position.

Global error is the cumulative error over all steps compared to the exact solution of the differential equation. An integration method has order $n$ if the global error is of order $O(h^n)$, where $h$ is the stepsize. For example, Euler Method has the form $y_{n+1} = y_n + h f(t_n, y_n)$. The global error is of order $O(h)$ and hence is of order $1$. Thus, the approximation becomes more accurate as $h$ becomes smaller, with the cost of increased computational steps and computational time.

In our simulations, the user can choose between Euler, Verlet, Ruth and Neri integrators, with orders of $1$, $2$, $3$, and $4$ respectively.

## Comparison of Integrators

Here we provide a comparison of the integration methods with two metrics – the energy deviation and the momentum difference. The energy deviation is defined by

$$\frac{\Delta E}{E_0} = \left|\frac{E_\text{max} - E_\text{min}}{E_0}\right|$$

where $E_0$ is the energy at the start of the simulation, and a "good" model requires $\frac{E_0}{E_0} < 1$. The second metrix is the momentum difference. For many systems, the initial momentum is zero. Therefore, momentum deviation is not well defined. Instead, we check the momentum difference, defined as

$$\begin{align*}\text{Max }\Delta p_x &= |p_{\text{max}, x} - p_{\text{min}, x}| \\ \text{Max }\Delta p_y &= |p_{\text{max}, y} - p_{\text{min}, y}|\end{align*}$$

Tables $1$, $2$, $3$ presents the comparison of the integrators in these two metrics.

| Method           | Energy Deviation    | Max $\Delta p_x$           | Max $\Delta p_y$           |
| ---------------- | ------------------- | ----------------- | ----------------- |
| Neri (Order 4)   | 6.124 × 10⁻¹⁴       | 1.040 × 10⁻¹³     | 4.852 × 10⁻¹⁴     |
| Ruth (Order 3)   | 1.280 × 10⁻¹³       | 5.307 × 10⁻¹⁴     | 3.048 × 10⁻¹⁴     |
| Verlet (Order 2) | 5.893 × 10⁻⁹        | 3.841 × 10⁻¹⁴     | 2.232 × 10⁻¹⁴     |
| Euler (Order 1)  | 3.601 × 10⁻⁵        | 3.686 × 10⁻¹⁴     | 3.009 × 10⁻¹⁴     |

Table 1: Comparison of Ruth, Neri, Verlet and Euler Methods (Figure-8 Orbit)

| Method           | Energy Deviation  | Max $\Delta p_y$           | Max $\Delta p_y$           |
| ---------------- | ----------------- | ----------------- | ----------------- | ------------ |
| Neri (Order 4)   | 8.058 × 10⁻³      | 4.591 × 10⁻¹⁴     | 9.246 × 10⁻¹⁴     |
| Ruth (Order 3)   | 8.058 × 10⁻³      | 7.394 × 10⁻¹⁴     | 4.249 × 10⁻¹⁴     |
| Verlet (Order 2) | 9.676 × 10⁻²      | 2.287 × 10⁻¹⁴     | 1.882 × 10⁻¹⁴     |
| Euler (Order 1)  | 2.4329            | 3.625 × 10⁻¹⁴     | 2.312 × 10⁻¹⁴     |

Table 2: Comparison of Ruth, Neri, Verlet and Euler Methods (Bumblebee Orbit)

| Method           | Energy Deviation   | Max $\Delta p_x$           | Max $\Delta p_y$           |
| ---------------- | ------------------ | ----------------- | ----------------- |
| Neri (Order 4)   | 1.459 × 10⁻⁹       | 4.874 × 10⁻¹⁴     | 8.693 × 10⁻¹⁴     |
| Ruth (Order 3)   | 2.143 × 10⁻⁸       | 3.486 × 10⁻¹⁴     | 3.185 × 10⁻¹⁴     |
| Verlet (Order 2) | 4.775 × 10⁻⁵       | 2.387 × 10⁻¹⁴     | 3.835 × 10⁻¹⁴     |
| Euler (Order 1)  | 0.02070            | 2.031 × 10⁻¹⁴     | 2.183 × 10⁻¹⁴     |

Table 3: Comparison of Ruth, Neri, Verlet and Euler Methods (Moth Orbit)

# Analytical Orbits

The general Three-Body Problem is not analytic. However, special orbits that are analytical are found.

## Lagrange Orbit

For each two-body system, there exist $5$ points of equilibrium, in which there is no net force on the third body. Lagrange discovered the Lagrange Orbit in $1772$. It is a family of solutions in which the three equal masses form an equilateral triangle at each instant.

## Figure-8 Orbit

The most iconic of all the periodic orbits, in the Figure-8 orbit, the three bodies appear to have the same trajectory as the first body, except for a different phase. This allows the trajectories to form a knot-like figure-8 shape.

# Shape Sphere

In a three-body problem, the bodies act on each other based on gravitational forces. Therefore, the effect of translation can be excluded.

It is convenient to map $\mathbb{C}^2$ to $\mathbb{R}^3$, as we can then rescale and plot the resulting coordinates on a unit sphere.

This resultant sphere is named the "shape sphere", which can be defined as:

$$\left(z_1, z_2\right)=\mathcal{J}\left(x_1, x_2, x_3\right)=\left(\frac{1}{\sqrt{2}}\left(x_3-x_2\right), \sqrt{\frac{2}{3}}\left(x_1-\frac{1}{2}\left(x_2+x_3\right)\right)\right).$$

We then define the Hoft map:

$$\mathcal{K}: \mathbb{C}^2 \rightarrow \mathbb{R} \times \mathbb{C} \cong \mathbb{R}^3$$

specified by:

$$\mathcal{K}\left(z_1, z_2\right)=\left(u_1, u_2+i u_3\right)=\left(\left|z_1\right|^2-\left|z_2\right|^2, 2 \bar{z}_1 z_2\right) .$$

Each point on the shape sphere corresponds to a particular formulation of the three bodies. 

$E_1$, $E_2$, and $E_3$ refer to the collinear configurations in the three-body problem where one of the bodies sits at the midpoint of the segment defined by the other two. Each configuration is distinguished by which mass is at the midpoint. The coordinates of $E_1$ to $E_3$ are:

$$E_1 = (1, 0, 0), \quad E_2 = \left(-\frac{1}{2}, -\frac{\sqrt{3}}{2}, 0\right), \quad E_3 = \left(-\frac{1}{2}, \frac{\sqrt{3}}{2}, 0\right)$$

$M_1$, $M_2$, and $M_3$ refer to specific isosceles configurations in the three-body problem where two of the bodies are equidistant, and the third body is positioned uniquely. Each configuration is distinguished by which mass forms the unique position.

$M_i$ is a line on the sphere that runs from $E_i$ to its antipodal collision point $C_i$, which are positions on the sphere opposite to $E_i$.

The equilateral triangle formulation corresponds to $L_{\pm}$. They are located at $(0,0,1)$ and $(0,0,-1)$ respectively.

The visualisation of the shape sphere can be seen at the bottom right corner.

### References

[1] Yip and Smillie (2025), An Analysis of the Restricted Euler Problem Using Symplectic Integrators, Edinburgh Student Journal of Science, 1(3), 1–6.

Henry Yip: Original python code and results, research project supervised by Prof. Jenni Smillie at the School of Physics and Astronomy, University of Edinburgh.

Allison Lau: Web development, code optimization and adaptation.
