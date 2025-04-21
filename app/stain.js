import { CircleBufferGeometry, Mesh, MeshBasicMaterial } from '../vendor/three.module.js';
import * as Renderer from './render3d.js';
import * as Utils from './utils.js';

let stains = [];
const geometry = new CircleBufferGeometry(4, 8);
const materials = [
    new MeshBasicMaterial({color: 0x990000, transparent: true, opacity: 0.5}),
    new MeshBasicMaterial({color: 0xbb0000, transparent: true, opacity: 0.5}),
    new MeshBasicMaterial({color: 0xee0000, transparent: true, opacity: 0.5}),
];

export function init() {
    Renderer.add(mesh);
}

export function add(posX, posY) {
    const count = Utils.random(2, 5);

    for (let i = 0; i < count; i ++) {
        const mesh = new Mesh(geometry, Utils.randomElement(materials));
        const size = Utils.randomize(3, 2);
        mesh.scale.x = mesh.scale.y = mesh.scale.z = size;
        mesh.position.x = Utils.randomize(posX, 5);
        mesh.position.y = Utils.randomize(posY, 5);
        mesh.position.z = 2;
        Renderer.add(mesh);

        stains.push({
            alpha: 1,
            mesh: mesh,
        });
    }
}

export function get() {
    return stains;
}

export function onFrame() {
    stains = stains.filter(removeStainIfNeeded);
    stains.forEach(updateStain);
}

function updateStain(stain) {
    stain.alpha *= 0.999;
    stain.mesh.scale.x = stain.mesh.scale.y = stain.mesh.scale.z = stain.alpha;
}

function removeStainIfNeeded(stain) {
    if (stain.alpha > 0.5) {
        return true;
    }

    Renderer.scene.remove(stain.mesh);
    return false;
}