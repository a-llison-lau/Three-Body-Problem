// src/utils/physics.ts
import { BodyConfig, Vector3 } from '../types/simulation';

export const GRAVITATIONAL_CONSTANT = 1;

export const calculateDistance = (a: Vector3, b: Vector3): { dx: number, dy: number, dz: number, r: number } => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dz = b.z - a.z;
    const r = Math.sqrt(dx * dx + dy * dy + dz * dz);
    return {dx, dy, dz, r};
};

export const computeGravitationalForce = (body1: BodyConfig, body2: BodyConfig): Vector3 => {
    const { dx, dy, dz, r } = calculateDistance(body1.position, body2.position);
    const forceMagnitude = (GRAVITATIONAL_CONSTANT * body1.mass * body2.mass) / (r * r);

    return {
        x: (forceMagnitude * dx) / r,
        y: (forceMagnitude * dy) / r,
        z: (forceMagnitude * dz) / r
    };
};

export const computeBodyForces = (bodies: BodyConfig[]): Record<string, Vector3> => {
    const forces: Record<string, Vector3> = {};

    bodies.forEach(body => { forces[body.id] = { x: 0, y: 0, z: 0 } });

    for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
            const force = computeGravitationalForce(bodies[i], bodies[j]);
            
            // Add force to first body
            forces[bodies[i].id].x += force.x;
            forces[bodies[i].id].y += force.y;
            forces[bodies[i].id].z += force.z;
            
            // Subtract force from second body (Newton's third law)
            forces[bodies[j].id].x -= force.x;
            forces[bodies[j].id].y -= force.y;
            forces[bodies[j].id].z -= force.z;
        }
    }

    return forces;
};

export const updateBodyTrail = (body: BodyConfig, trailPositions: number[], trailLength: number): { positions: number[], colors: number[], sizes: number[] } => {
    // Add current position to trail
    trailPositions.unshift(body.position.x, body.position.y, body.position.z);

    // Trim trail to specified length
    if (trailPositions.length > trailLength * 3) {
        trailPositions.splice(trailLength * 3);
    }

    // Create color gradient and size arrays
    const colors: number[] = [];
    const sizes: number[] = [];

    // Create color gradient and size reduction
    for (let j = 0; j < trailLength && j * 3 < trailPositions.length; j++) {
        const ratio = j / trailLength;

        // Color gradient based on body's original color
        const baseColor =
        body.color === "red" ? [1, 0, 0] : (body.color === "green" ? [0, 1, 0] : [0, 0, 1]);

        // Interpolate from full color to white
        colors.push(
            baseColor[0] * (1 - ratio) + ratio,
            baseColor[1] * (1 - ratio) + ratio,
            baseColor[2] * (1 - ratio) + ratio
        );

        // Reduce point size towards the end of the trail
        sizes.push(0.1 * (1 - ratio));
    }

    return { 
        positions: trailPositions, 
        colors, 
        sizes 
    };
};