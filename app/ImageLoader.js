import {
	NearestFilter,
	RepeatWrapping,
	TextureLoader
} from '../../vendor/three.module.js';

let textureLoader = new TextureLoader();
let imagesList;
const textLoaded = {};

export function get(_id) {
	if (!textLoaded[_id]) {
		return null;
	}
	return textLoaded[_id];
}

export function loadBatch(list) {
	imagesList = list;
	return new Promise(resolveCallback => loadNextTexture(resolveCallback));
}
	
function loadNextTexture(resolveCallback) {
	const nextText = imagesList.shift();
	textureLoader.load(
		nextText.url, 
		texture => {
			texture.wrapS = RepeatWrapping;
			texture.wrapT = RepeatWrapping;
			texture.magFilter = NearestFilter;
			texture.minFilter = NearestFilter;
			textLoaded[nextText.id] = texture;
			
			if (imagesList.length == 0) {
				resolveCallback();
			} else {
				loadNextTexture(resolveCallback);
			}
		},
	);
}