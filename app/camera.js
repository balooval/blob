import { Vector2 } from '../vendor/three.module.js';
import * as Utils from './utils.js';

let camera;
let target;

export function init(sceneCamera, targetToFollow) {
	camera = sceneCamera;
	target = targetToFollow;
}

export function onFrame() {
	const cameraPos2D = new Vector2(camera.position.x, camera.position.y)
	const distance = cameraPos2D.distanceTo(target.positionVector);

	if (distance < 100) {
		return;
	}

	const newPos = Utils.lerpVector(camera.position, target.positionVector, 0.02);
	camera.position.x = newPos.x;
	camera.position.y = newPos.y;
}