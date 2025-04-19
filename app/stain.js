import * as Utils from './utils.js';

let stains = [];

export function add(posX, posY) {
    const count = Utils.random(2, 5);
    for (let i = 0; i < count; i ++) {
        stains.push({
            x: Utils.randomize(posX, 5),
            y: Utils.randomize(posY, 5),
            size: Utils.randomize(3, 2),
            time: Date.now(),
            color: `${Utils.randomize(180, 50)}, 0, 0`,
            alpha: 1,
        });
    }

    // stains.push({
    //     x: posX,
    //     y: posY,
    //     time: Date.now(),
    // });
}

export function get() {
    return stains;
}

export function onFrame() {
    stains = stains.filter(stainIsFresh);
    stains.forEach(updateStain);
    
}

function updateStain(stain) {
    stain.alpha *= 0.995;
}

function stainIsFresh(stain) {
    return stain.alpha > 0.1;
}