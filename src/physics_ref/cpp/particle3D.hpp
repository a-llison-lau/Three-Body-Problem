#pragma once
#include <string>
#include <vector>
#include <array>
#include <iostream>
#include <fstream>
#include <cmath>

class Particle3D {
public:
    std::string label;
    long double mass;
    std::array<long double, 3> position;
    std::array<long double, 3> velocity;

    // Constructor
    Particle3D(const std::string& label, long double mass, 
               const std::array<long double, 3>& position, 
               const std::array<long double, 3>& velocity)
        : label(label), mass(mass), position(position), velocity(velocity) {}

    // String representation
    std::string to_string() const {
        return label + "    " + 
               std::to_string(position[0]) + " " + 
               std::to_string(position[1]) + " " + 
               std::to_string(position[2]);
    }

    // Calculate kinetic energy
    long double kinetic_energy() const {
        long double v_squared = 0.0;
        for (int i = 0; i < 3; ++i) {
            v_squared += velocity[i] * velocity[i];
        }
        return 0.5 * mass * v_squared;
    }

    // Calculate momentum
    std::array<long double, 3> momentum() const {
        std::array<long double, 3> p;
        for (int i = 0; i < 3; ++i) {
            p[i] = mass * velocity[i];
        }
        return p;
    }

    // Update methods
    void update_position_symplectic(long double dt, long double d_coeff) {
        for (int i = 0; i < 3; ++i) {
            position[i] += d_coeff * dt * velocity[i];
        }
    }

    void update_velocity_symplectic(long double dt, const std::array<long double, 3>& force, long double c_coeff) {
        for (int i = 0; i < 3; ++i) {
            velocity[i] += c_coeff * dt * force[i] / mass;
        }
    }

    // Static methods
    static long double total_kinetic_energy(const std::vector<Particle3D>& particles) {
        long double total = 0.0;
        for (const auto& p : particles) {
            total += p.kinetic_energy();
        }
        return total;
    }

    static std::array<long double, 3> com_velocity(const std::vector<Particle3D>& particles) {
        std::array<long double, 3> total_momentum = {0.0, 0.0, 0.0};
        long double total_mass = 0.0;

        for (const auto& p : particles) {
            auto p_momentum = p.momentum();
            for (int i = 0; i < 3; ++i) {
                total_momentum[i] += p_momentum[i];
            }
            total_mass += p.mass;
        }

        std::array<long double, 3> com_vel;
        for (int i = 0; i < 3; ++i) {
            com_vel[i] = total_momentum[i] / total_mass;
        }
        return com_vel;
    }
};