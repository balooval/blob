import Blob from './blob.js';
import * as Render from './render3d.js';
import * as UiMouse from './uiMouse.js';
import * as ImageLoader from './ImageLoader.js';

let blob;

export function init() {
	ImageLoader.loadBatch([
		{
			id: 'arm',
			url: './assets/arm.png'
		}
	]).then(res => {
		Render.init('viewport');
		UiMouse.init('viewport');
		blob =  new Blob();
		onFrame();
	});
}

function onFrame() {
	Render.draw();
	blob.onFrame();
	requestAnimationFrame(onFrame);
}