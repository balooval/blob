import { CircleBufferGeometry, Mesh, MeshBasicMaterial } from '../vendor/three.module.js';
import * as Renderer from './render3d.js';
import * as Utils from './utils.js';

let splats = [];
const gravity = 0.05;
const geometry = new CircleBufferGeometry(4, 8);
const materials = [
    new MeshBasicMaterial({color: 0xdd0000, transparent: true, opacity: 0.6}),
    new MeshBasicMaterial({color: 0xee0000, transparent: true, opacity: 0.6}),
    new MeshBasicMaterial({color: 0xff0000, transparent: true, opacity: 0.6}),
];

export function add(posX, posY, dirX, dirY) {
    const count = Utils.random(2, 5);

    for (let i = 0; i < count; i ++) {
        const mesh = new Mesh(geometry, Utils.randomElement(materials));
        const size = Utils.randomize(3, 2);
        mesh.scale.x = mesh.scale.y = mesh.scale.z = size;
        mesh.position.x = Utils.randomize(posX, 5);
        mesh.position.y = Utils.randomize(posY, 5);
        mesh.position.z = 2;
        Renderer.add(mesh);

        splats.push({
            accelX: Utils.random(dirX * -0.2, dirX * -0.6),
            accelY: Utils.random(dirY * -0.2, dirY * -0.6),
            alpha: 1,
            mesh: mesh,
        });
    }
}

export function get() {
    return splats;
}

export function onFrame() {
    splats = splats.filter(removeSplatIfNeeded);
    splats.forEach(updateSplat);
    
}

function updateSplat(splat) {
    splat.alpha *= 0.985;
    splat.mesh.scale.x = splat.mesh.scale.y = splat.mesh.scale.z = splat.alpha;

    splat.mesh.position.x += splat.accelX;
    splat.accelY -= gravity;
    splat.mesh.position.y += splat.accelY;
}

function removeSplatIfNeeded(splat) {
    if (splat.alpha > 0.3) {
        return true;
    }

    Renderer.scene.remove(splat.mesh);
    return false;
}