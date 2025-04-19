import * as Utils from './utils.js';

let splats = [];
const gravity = 0.2;

export function add(posX, posY) {
    const count = Utils.random(2, 5);
    for (let i = 0; i < count; i ++) {
        splats.push({
            x: Utils.randomize(posX, 5),
            y: Utils.randomize(posY, 5),
            accelX: Utils.random(-1.5, 1.5),
            accelY: Utils.random(-1, -3),
            size: Utils.randomize(2, 1.5),
            color: `${Utils.randomize(180, 50)}, 0, 0`,
            alpha: 1,
        });
    }
}

export function get() {
    return splats;
}

export function onFrame() {
    splats = splats.filter(splatIsInside);
    splats.forEach(updateSplat);
    
}

function updateSplat(splat) {
    splat.alpha *= 0.95;
    splat.x += splat.accelX;
    splat.accelY += gravity;
    splat.y += splat.accelY;
}

function splatIsInside(splat) {
    return splat.alpha > 0.1;
}