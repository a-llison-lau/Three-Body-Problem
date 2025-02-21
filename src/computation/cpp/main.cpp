#include "particle3D.hpp"
#include "forces_and_separations.hpp"
#include "simulation_config.hpp"
#include "integrator.hpp"
#include <iostream>
#include <fstream>
#include <sstream>
#include <chrono>
#include <filesystem>

class InitialCondition
{
public:
    std::string name;
    std::vector<Particle3D> particles;

    InitialCondition(const std::string &name_, const std::vector<Particle3D> &particles_)
        : name(name_), particles(particles_) {}
};

class NBodySimulation
{
private:
    SimulationConfig config;
    long double next_output_time;
    std::vector<Particle3D> particles;
    size_t n_particles;
    std::vector<std::array<long double, 3>> initial_momentum;
    long double initial_total_energy;

    void initialize_system()
    {
        auto com_velocity = Particle3D::com_velocity(particles);
        for (auto &particle : particles)
        {
            for (int i = 0; i < 3; ++i)
            {
                particle.velocity[i] -= com_velocity[i];
            }
        }

        // Store initial momentum and total energy
        initial_momentum.resize(n_particles);
        for (size_t i = 0; i < n_particles; ++i)
        {
            for (int j = 0; j < 3; ++j)
            {
                initial_momentum[i][j] = particles[i].mass * particles[i].velocity[j];
            }
        }

        // Calculate initial total energy
        initial_total_energy = 0.0;
        auto separations = ForcesAndSeparations::compute_separations(particles);
        auto [forces, potential] = ForcesAndSeparations::compute_forces_potential(particles, separations);
        for (size_t i = 0; i < n_particles; ++i)
        {
            long double kinetic_energy = 0.5 * particles[i].mass * (particles[i].velocity[0] * particles[i].velocity[0] + particles[i].velocity[1] * particles[i].velocity[1] + particles[i].velocity[2] * particles[i].velocity[2]);
            initial_total_energy += kinetic_energy;
        }
        initial_total_energy += potential;
    }

    bool check_proximity(const std::vector<std::vector<std::array<long double, 3>>> &separations)
    {
        for (size_t i = 0; i < n_particles; ++i)
        {
            for (size_t j = i + 1; j < n_particles; ++j)
            {
                long double dist_squared = 0.0;
                for (int k = 0; k < 3; ++k)
                {
                    dist_squared += separations[i][j][k] * separations[i][j][k];
                }
                if (std::sqrt(dist_squared) > config.proximity_threshold)
                {
                    return true;
                }
            }
        }
        return false;
    }

    long double compute_total_energy()
    {
        long double total_energy = 0.0;
        auto separations = ForcesAndSeparations::compute_separations(particles);
        auto [forces, potential] = ForcesAndSeparations::compute_forces_potential(particles, separations);
        for (size_t i = 0; i < n_particles; ++i)
        {
            long double kinetic_energy = 0.5 * particles[i].mass * (particles[i].velocity[0] * particles[i].velocity[0] + particles[i].velocity[1] * particles[i].velocity[1] + particles[i].velocity[2] * particles[i].velocity[2]);
            total_energy += kinetic_energy;
        }
        total_energy += potential;
        return total_energy;
    }

    void write_statistics(std::ofstream &output_file, long double dMomentum[3], long double dEnergy, long double current_time)
    {
        // Write momentum change
        output_file << "dMomentum = "
                    << dMomentum[0] << " " << dMomentum[1] << " " << dMomentum[2] << std::endl;

        // Write energy change
        output_file << "dEnergy = " << dEnergy << std::endl;

        // Write particle data
        for (const auto &particle : particles)
        {
            output_file << particle.label << " ";
            for (int i = 0; i < 3; ++i)
                output_file << particle.position[i] << " ";
            for (int i = 0; i < 3; ++i)
                output_file << particle.velocity[i] << " ";
            output_file << std::endl;
        }

        next_output_time = current_time + config.output_interval;
    }

public:
    NBodySimulation(const SimulationConfig &config_)
        : config(config_), next_output_time(0.0) {}

    void run_simulation(const InitialCondition &initial_condition, int method)
    {
        next_output_time = 0.0;
        particles = initial_condition.particles;
        n_particles = particles.size();
        initialize_system();

        std::string output_path = "../../../public/position_files/" + std::to_string(method) + "/";
        std::filesystem::create_directories(output_path);
        std::string modified_name = initial_condition.name.substr(0, initial_condition.name.size() - 1);
        std::string output_file_path = output_path + modified_name + ".txt";

        std::cout << "\nProcessing configuration: " << initial_condition.name
                  << " with method " << method << std::endl;

        std::ofstream output_file(output_file_path);
        if (!output_file)
        {
            std::cerr << "Failed to open output file: " << output_file_path << std::endl;
            return;
        }

        long double current_time = 0.0;
        auto &coeffs = Integrator::COEFFICIENTS.at(method);

        // Write first time step statistics (at time = 0)
        long double dMomentum[3] = {0.0, 0.0, 0.0};
        long double dEnergy = 0.0; // Energy difference at the first step
        write_statistics(output_file, dMomentum, dEnergy, current_time);

        for (int step = 0; step < config.num_integration_steps; ++step)
        {
            current_time += config.dt;

            Integrator::symplectic_step(particles, config.dt, coeffs, method);

            auto separations = ForcesAndSeparations::compute_separations(particles);
            if (check_proximity(separations))
            {
                std::cout << "Simulation terminated early due to proximity threshold" << std::endl;
                break;
            }

            if (current_time >= next_output_time)
            {
                // Calculate change in momentum and energy
                long double total_energy = compute_total_energy();
                long double dMomentum[3] = {0.0, 0.0, 0.0};
                for (size_t i = 0; i < n_particles; ++i)
                {
                    for (int j = 0; j < 3; ++j)
                    {
                        dMomentum[j] += (particles[i].mass * particles[i].velocity[j]) - initial_momentum[i][j];
                    }
                }

                long double dEnergy = total_energy - initial_total_energy;
                write_statistics(output_file, dMomentum, dEnergy, current_time);
            }
        }

        output_file.close();
        std::cout << "Data saved to " << output_file_path << std::endl;
    }
};

std::vector<InitialCondition> parse_initial_conditions(const std::string &file_path)
{
    std::vector<InitialCondition> initial_conditions;
    std::string current_name;
    std::vector<Particle3D> current_particles;

    std::ifstream file(file_path);
    if (!file)
    {
        throw std::runtime_error("Failed to open file: " + file_path);
    }

    std::string line;
    while (std::getline(file, line))
    {
        if (line.empty())
            continue;

        if (!std::isdigit(line[0]))
        {
            if (!current_name.empty())
            {
                initial_conditions.emplace_back(current_name, current_particles);
                current_particles.clear();
            }
            current_name = line;
        }
        else
        {
            std::istringstream iss(line);
            std::string label;
            long double mass;
            std::array<long double, 3> position, velocity;

            iss >> label >> mass;
            for (int i = 0; i < 3; ++i)
                iss >> position[i];
            for (int i = 0; i < 3; ++i)
                iss >> velocity[i];

            current_particles.emplace_back(label, mass, position, velocity);
        }
    }

    if (!current_name.empty())
    {
        initial_conditions.emplace_back(current_name, current_particles);
    }

    return initial_conditions;
}

int main(int argc, char *argv[])
{
    if (argc != 4)
    {
        std::cerr << "Usage: " << argv[0] << " <num_output_steps> <dt> <input_file>\n";
        std::cerr << "Note: num_output_steps represents how many 0.01 time intervals to simulate\n";
        return 1;
    }

    long double dt = std::stod(argv[2]);
    if (dt > 0.05)
    {
        std::cerr << "Usage: Maximum dt 0.05\n";
        return 1;
    }

    auto start_time = std::chrono::high_resolution_clock::now();

    // Create simulation configuration
    SimulationConfig config(
        std::stoi(argv[1]), // num_steps
        dt                  // dt
    );

    // Parse initial conditions
    std::vector<InitialCondition> initial_conditions;
    try
    {
        initial_conditions = parse_initial_conditions(argv[3]);
    }
    catch (const std::exception &e)
    {
        std::cerr << "Error: " << e.what() << std::endl;
        return 1;
    }

    // Create simulation instance
    NBodySimulation simulation(config);

    // Print simulation information
    std::cout << "Found " << initial_conditions.size() << " configurations in " << argv[3] << std::endl;
    std::cout << "Will simulate for " << config.total_time << " time units" << std::endl;
    std::cout << "Using " << config.num_integration_steps << " integration steps with dt=" << config.dt << std::endl;

    // Create output directories if they don't exist
    for (int method = 1; method <= 4; ++method)
    {
        std::string dir = "../../../public/position_files/" + std::to_string(method);
        std::filesystem::create_directories(dir);
    }

    // Run simulations for each initial condition and method
    for (const auto &initial_condition : initial_conditions)
    {
        for (int method = 1; method <= 4; ++method)
        {
            simulation.run_simulation(initial_condition, method);
        }
    }

    // Calculate and print total runtime
    auto end_time = std::chrono::high_resolution_clock::now();
    auto duration = std::chrono::duration_cast<std::chrono::seconds>(end_time - start_time);
    std::cout << "\nTotal run time: " << duration.count() << " seconds" << std::endl;

    return 0;
}