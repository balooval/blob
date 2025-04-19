import { Vector2 } from '../vendor/three.module.js';
import * as Render from './render3d.js';

export const mousePosition = [0, 0];
export const worldPosition = [0, 0];
const pointer = new Vector2();

export function init(elementId) {
    document.getElementById(elementId).addEventListener('mousemove', onMouseMove);
}

function onMouseMove(evt) {
    var rect = evt.target.getBoundingClientRect();
    mousePosition[0] = evt.clientX - rect.left;
    mousePosition[1] = evt.clientY - rect.top;

    pointer.x = (mousePosition[0] / Render.worldWidth) * 2 - 1;
	pointer.y = - (mousePosition[1] / Render.worldHeight) * 2 + 1;

    const positionVector = Render.getPosition(pointer);
    worldPosition[0] = positionVector.x;
    worldPosition[1] = positionVector.y;
}