import Blob from './blob.js';
import * as Render from './render3d.js';
import * as UiMouse from './uiMouse.js';

let blob;

export function init() {
	Render.init('viewport');
	UiMouse.init('viewport');
	blob =  new Blob();
	onFrame();
}

function onFrame() {
	Render.draw();
	blob.onFrame();
	requestAnimationFrame(onFrame);
}