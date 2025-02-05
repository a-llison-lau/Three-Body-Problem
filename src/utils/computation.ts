import { BodyConfig, Vector3 } from "../types/types";

const GRAVITATIONAL_CONSTANT = 1;
const c3 = [7 / 24, 3 / 4, -1 / 24];
const d3 = [2 / 3, -2 / 3, 1];
const c4 = [
  1 / (2 * (2 - 2 ** (1 / 3))),
  (1 - 2 ** (1 / 3)) / (2 * (2 - 2 ** (1 / 3))),
  (1 - 2 ** (1 / 3)) / (2 * (2 - 2 ** (1 / 3))),
  1 / (2 * (2 - 2 ** (1 / 3))),
];
const d4 = [
  1 / (2 - 2 ** (1 / 3)),
  (-1 * 2 ** (1 / 3)) / (2 - 2 ** (1 / 3)),
  1 / (2 - 2 ** (1 / 3)),
  0,
];

const getDistance = (
  a: Vector3,
  b: Vector3
): { dx: number; dy: number; dz: number; r: number } => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dz = b.z - a.z;
  const r = Math.sqrt(dx * dx + dy * dy + dz * dz);
  return { dx, dy, dz, r };
};

const getGravitationalForce = (
  body1: BodyConfig,
  body2: BodyConfig
): Vector3 => {
  const { dx, dy, dz, r } = getDistance(body1.position, body2.position);
  const forceMagnitude =
    (GRAVITATIONAL_CONSTANT * body1.mass * body2.mass) / (r * r);

  return {
    x: (forceMagnitude * dx) / r,
    y: (forceMagnitude * dy) / r,
    z: (forceMagnitude * dz) / r,
  };
};

const getBodyForces = (bodies: BodyConfig[]): Record<string, Vector3> => {
  const forces: Record<string, Vector3> = {};

  bodies.forEach((body) => {
    forces[body.id] = { x: 0, y: 0, z: 0 };
  });

  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const force = getGravitationalForce(bodies[i], bodies[j]);

      // Add force to first body
      forces[bodies[i].id].x += force.x;
      forces[bodies[i].id].y += force.y;
      forces[bodies[i].id].z += force.z;

      // Subtract force from second body
      forces[bodies[j].id].x -= force.x;
      forces[bodies[j].id].y -= force.y;
      forces[bodies[j].id].z -= force.z;
    }
  }

  return forces;
};

const updatePositionEuler = (body: BodyConfig, timeStep: number): void => {
  body.position.x += timeStep * body.velocity.x;
  body.position.y += timeStep * body.velocity.y;
  body.position.z += timeStep * body.velocity.z;
};

const updateVelocityEuler = (
  body: BodyConfig,
  timeStep: number,
  forces: Record<string, Vector3>
): void => {
  body.velocity.x += (timeStep * forces[body.id].x) / body.mass;
  body.velocity.y += (timeStep * forces[body.id].y) / body.mass;
  body.velocity.z += (timeStep * forces[body.id].z) / body.mass;
};

const updatePositionSecond = (
  body: BodyConfig,
  timeStep: number,
  forces: Record<string, Vector3>
): void => {
  body.position.x +=
    timeStep * body.velocity.x +
    timeStep ** 2 * (forces[body.id].x / (2 * body.mass));
  body.position.y +=
    timeStep * body.velocity.y +
    timeStep ** 2 * (forces[body.id].x / (2 * body.mass));
  body.position.z +=
    timeStep * body.velocity.z +
    timeStep ** 2 * (forces[body.id].x / (2 * body.mass));
};

const updatePositionSymplectic = (
  body: BodyConfig,
  timeStep: number,
  dCoeff: number
): void => {
  body.position.x += dCoeff * timeStep * body.velocity.x;
  body.position.y += dCoeff * timeStep * body.velocity.y;
  body.position.z += dCoeff * timeStep * body.velocity.z;
};

const updateVelocitySymplectic = (
  body: BodyConfig,
  timeStep: number,
  forces: Record<string, Vector3>,
  cCoeff: number
): void => {
  body.velocity.x += cCoeff * timeStep * (forces[body.id].x / body.mass);
  body.velocity.y += cCoeff * timeStep * (forces[body.id].y / body.mass);
  body.velocity.z += cCoeff * timeStep * (forces[body.id].z / body.mass);
};

/* Fourth-order update */
export const neriUpdate = (
  currentBodies: BodyConfig[],
  timeStep: number
): void => {
  for (let k = 0; k < 4; k++) {
    const forces = getBodyForces(currentBodies);
    currentBodies.forEach((body) => {
      updateVelocitySymplectic(body, timeStep, forces, c4[k]);
    });
    currentBodies.forEach((body) => {
      updatePositionSymplectic(body, timeStep, d4[k]);
    });
  }
};

/* Third-order update */
export const ruthUpdate = (
  currentBodies: BodyConfig[],
  timeStep: number
): void => {
  for (let k = 0; k < 3; k++) {
    const forces = getBodyForces(currentBodies);
    currentBodies.forEach((body) => {
      updateVelocitySymplectic(body, timeStep, forces, c3[k]);
    });
    currentBodies.forEach((body) => {
      updatePositionSymplectic(body, timeStep, d3[k]);
      console.log(body.id, body.position.x);
    });
  }
};

/* Second-order update */
export const verletUpdate = (
  currentBodies: BodyConfig[],
  timeStep: number
): void => {
  const forces = getBodyForces(currentBodies);
  currentBodies.forEach((body) => {
    updatePositionSecond(body, timeStep, forces);
  });
};

/* First-order update */
export const eulerUpdate = (
  currentBodies: BodyConfig[],
  timeStep: number
): void => {
  const forces = getBodyForces(currentBodies);
  currentBodies.forEach((body) => {
    updatePositionEuler(body, timeStep);
  });
  currentBodies.forEach((body) => {
    updateVelocityEuler(body, timeStep, forces);
  });
};
