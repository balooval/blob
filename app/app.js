import Blob from './blob.js';
import * as Render from './render3d.js';
import * as UiMouse from './uiMouse.js';
import * as ImageLoader from './ImageLoader.js';
import * as Map from './map.js';
import * as Stain from './stain.js';
import * as Splats from './splats.js';
import * as Keyboard from './keyboard.js';
import * as Gamepad from './gamepad.js';
import * as Camera from './camera.js';
import * as Debug from './debug.js';

let blob;

export function init() {
	ImageLoader.loadBatch([
		{
			id: 'mouth',
			url: './assets/mouth.png'
		},
		{
			id: 'test',
			url: './assets/test.png'
		},
		{
			id: 'arm',
			url: './assets/arm.png'
		},
		{
			id: 'arm-alpha',
			url: './assets/arm-alpha.png'
		},
		{
			id: 'eye',
			url: './assets/eye.png'
		},
		
	]).then(res => {
		Debug.init();
		Render.init('viewport');
		UiMouse.init('viewport');
		Keyboard.init();
		Gamepad.init();
		
		Map.init();
		blob =  new Blob();
		Camera.init(Render.camera, blob);
		onFrame();
	});
}

function onFrame() {
	Render.draw();
	blob.onFrame();
	Stain.onFrame();
	Splats.onFrame();
	Camera.onFrame();
	requestAnimationFrame(onFrame);
}