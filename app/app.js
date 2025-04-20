import Blob from './blob.js';
import * as Render from './render3d.js';
import * as UiMouse from './uiMouse.js';
import * as ImageLoader from './ImageLoader.js';
import * as Map from './map.js';

let blob;

export function init() {
	ImageLoader.loadBatch([
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
		Render.init('viewport');
		UiMouse.init('viewport');

		const wallsMesh = Map.buildMesh();
		Render.add(wallsMesh);
		blob =  new Blob();
		onFrame();
	});
}

function onFrame() {
	Render.draw();
	blob.onFrame();
	requestAnimationFrame(onFrame);
}