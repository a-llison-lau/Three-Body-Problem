// forces_and_separations.hpp
#pragma once
#include "particle3D.hpp"
#include <vector>
#include <array>

class ForcesAndSeparations {
public:
    static std::vector<std::vector<std::array<long double, 3>>> compute_separations(
        const std::vector<Particle3D>& particles) {
        
        size_t n = particles.size();
        std::vector<std::vector<std::array<long double, 3>>> separations(
            n, std::vector<std::array<long double, 3>>(n, std::array<long double, 3>{0.0, 0.0, 0.0}));

        for (size_t i = 0; i < n; ++i) {
            for (size_t j = i + 1; j < n; ++j) {
                std::array<long double, 3> d;
                for (int k = 0; k < 3; ++k) {
                    d[k] = particles[j].position[k] - particles[i].position[k];
                    separations[i][j][k] = d[k];
                    separations[j][i][k] = -d[k];
                }
            }
        }
        return separations;
    }

    static std::pair<std::vector<std::array<long double, 3>>, long double> 
    compute_forces_potential(const std::vector<Particle3D>& particles,
                           const std::vector<std::vector<std::array<long double, 3>>>& separations) {
        
        const long double G = 1.0; // AU^3 M_earth^-1 day^-2
        size_t N = particles.size();
        
        std::vector<std::array<long double, 3>> forces(N, std::array<long double, 3>{0.0, 0.0, 0.0});
        long double potential = 0.0;

        for (size_t i = 0; i < N; ++i) {
            for (size_t j = i + 1; j < N; ++j) {
                long double mod_distance = 0.0;
                for (int k = 0; k < 3; ++k) {
                    mod_distance += separations[i][j][k] * separations[i][j][k];
                }
                mod_distance = std::sqrt(mod_distance);

                long double m_i = particles[i].mass;
                long double m_j = particles[j].mass;
                
                std::array<long double, 3> force;
                for (int k = 0; k < 3; ++k) {
                    force[k] = G * m_i * m_j * separations[i][j][k] / 
                              (mod_distance * mod_distance * mod_distance);
                    forces[i][k] += force[k];
                    forces[j][k] -= force[k];
                }

                potential += -G * m_i * m_j / mod_distance;
            }
        }

        return {forces, potential};
    }
};