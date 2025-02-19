#pragma once

struct SimulationConfig {
    long double output_interval = 0.05;
    long double dt;
    long double proximity_threshold;
    long double total_time;
    int num_integration_steps;

    SimulationConfig(int num_steps, long double dt_, long double proximity_threshold_ = 100.0)
        : dt(dt_), proximity_threshold(proximity_threshold_) {
        total_time = num_steps * output_interval;
        num_integration_steps = static_cast<int>(total_time / dt);
    }
};