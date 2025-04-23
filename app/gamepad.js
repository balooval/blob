import Evt from './event.js';

let mainGamepad;
export let evt = null;

export function init() {
    evt = new Evt();
}

gameControl.on('connect', gamepad => {
    mainGamepad = gamepad;
    console.log(mainGamepad);
    
    mainGamepad
    .before('button2', onButton2)
    .after('button2', offButton2);
});

function onButton2() {
    evt.fireEvent('PRESS', 'BTN_2');
}

function offButton2() {
    evt.fireEvent('RELEASE', 'BTN_2');
}

let deadZone = 0.2;

export function getMove(inputMoves) {
    if (!mainGamepad) {
        return inputMoves;
    }

    let hor = parseFloat(mainGamepad.axeValues[0][0]);
    let vert = parseFloat(mainGamepad.axeValues[0][1]);

    if (Math.abs(hor) < deadZone) {
        hor = 0;
    }
    if (Math.abs(vert) < deadZone) {
        vert = 0;
    }

    return {
        left: Math.abs(Math.min(0, hor)),
        right: Math.max(0, hor),
        up: Math.abs(Math.min(0, vert)),
        down: Math.max(0, vert),
    };
}