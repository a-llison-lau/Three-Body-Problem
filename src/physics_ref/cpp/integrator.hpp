#pragma once
#include "particle3D.hpp"
#include "forces_and_separations.hpp"
#include <map>
#include <vector>

class Integrator {
public:
    static const std::map<int, std::pair<std::vector<double>, std::vector<double>>> COEFFICIENTS;

    static void symplectic_step(std::vector<Particle3D>& particles, 
                              double dt, 
                              const std::pair<std::vector<double>, std::vector<double>>& coeffs,
                              int steps) {
        for (int k = 0; k < steps; ++k) {
            auto separations = ForcesAndSeparations::compute_separations(particles);
            auto [forces, _] = ForcesAndSeparations::compute_forces_potential(particles, separations);

            // Update velocities
            for (size_t i = 0; i < particles.size(); ++i) {
                particles[i].update_velocity_symplectic(dt, forces[i], coeffs.first[k]);
            }

            // Update positions
            for (auto& particle : particles) {
                particle.update_position_symplectic(dt, coeffs.second[k]);
            }
        }
    }
};

// Initialize static member
const std::map<int, std::pair<std::vector<double>, std::vector<double>>> 
Integrator::COEFFICIENTS = {
    {1, {{1.0}, {1.0}}},
    {2, {{0.5, 0.5}, {1.0, 0.0}}},
    {3, {{7.0/24.0, 3.0/4.0, -1.0/24.0}, {2.0/3.0, -2.0/3.0, 1.0}}},
    {4, {
        {1.0/(2.0*(2.0-std::pow(2.0,1.0/3.0))), 
         (1.0-std::pow(2.0,1.0/3.0))/(2.0*(2.0-std::pow(2.0,1.0/3.0))),
         (1.0-std::pow(2.0,1.0/3.0))/(2.0*(2.0-std::pow(2.0,1.0/3.0))),
         1.0/(2.0*(2.0-std::pow(2.0,1.0/3.0)))},
        {1.0/(2.0-std::pow(2.0,1.0/3.0)),
         -std::pow(2.0,1.0/3.0)/(2.0-std::pow(2.0,1.0/3.0)),
         1.0/(2.0-std::pow(2.0,1.0/3.0)),
         0.0}
    }}
};