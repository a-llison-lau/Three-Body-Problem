export interface Vector3 {
    x: number;
    y: number;
    z: number;
}
  
export interface BodyConfig {
    id: string;
    position: Vector3;
    velocity: Vector3;
    mass: number;
    color: string;
    size: number;
}