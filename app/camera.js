import { DirectionalLight, DirectionalLightHelper, Vector2, Vector3 } from '../vendor/three.module.js';
import * as Utils from './utils.js';
import * as Render from './render3d.js';

let camera;
let target;
let light;
let helper;

export function init(sceneCamera, targetToFollow) {
	camera = sceneCamera;
	target = targetToFollow;
	light = new DirectionalLight(0xffffff, 1);
	light.position.z = 200;
	// light.lookAt(new Vector3(0, 0, 0));
	light.target = target.bodyMesh;
	
	Render.add(light);
	
	helper = new DirectionalLightHelper(light);
	// Render.add(helper);
}

export function onFrame() {
	/*
	const targetDestination = new Vector2(
		target.positionVector.x + target.translationDone[0] * 100,
		target.positionVector.y + target.translationDone[1] * 100,
	)
	const cameraPos2D = new Vector2(camera.position.x, camera.position.y)
	const distance = cameraPos2D.distanceTo(targetDestination);

	// if (distance < 100) {
	// 	return;
	// }

	const newPos = Utils.lerpVector(camera.position, targetDestination, 0.02);
	camera.position.x = newPos.x;
	camera.position.y = newPos.y;
	*/

	light.position.x = target.positionVector.x;
	light.position.y = target.positionVector.y;

	helper.update();

	const cameraPos2D = new Vector2(camera.position.x, camera.position.y)
	const distance = cameraPos2D.distanceTo(target.positionVector);

	if (distance < 100) {
		return;
	}

	const newPos = Utils.lerpVector(camera.position, target.positionVector, 0.02);
	camera.position.x = newPos.x;
	camera.position.y = newPos.y;
	
	// light.lookAt(new Vector3(newPos.x, newPos.y, 0));
	// light.target = target.bodyMesh;

	
}