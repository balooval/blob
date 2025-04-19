import {
	Mesh,
	OrthographicCamera,
	PlaneGeometry,
	Raycaster,
	Scene,
	Vector3,
	WebGLRenderer,
} from '../vendor/three.module.js';

export let renderer;
export let camera;

export let controls;
export let scene = null;
export const worldWidth = 800;
export const worldHeight = 600;

const raycaster = new Raycaster();
let mousePositionMesh;
const ratio = 4 / 3;

export function init(elmtId) {
	const mainElmt = document.getElementById(elmtId);
	renderer = new WebGLRenderer({antialias: true});
	mainElmt.appendChild(renderer.domElement);
	camera = new OrthographicCamera(worldWidth / -2, worldWidth / 2, worldHeight / 2, worldHeight / -2, 1, 1000);

	window.onresize = function () {
		renderer.setSize(mainElmt.clientWidth, mainElmt.clientWidth / ratio);
		camera.aspect = ratio;
		camera.updateProjectionMatrix();
	};

	window.onresize();
	scene = new Scene();
	camera.position.set(0, 0, 100);
	camera.lookAt(new Vector3(0, 0, 0));
	scene.add(camera);

	const geoPlane = new PlaneGeometry(worldWidth * 2, worldHeight * 2);
	mousePositionMesh = new Mesh(geoPlane);
	// scene.add(mousePositionMesh);
}

export function add(object) {
	scene.add(object);
}

export function draw() {
	renderer.setRenderTarget(null);
	renderer.setClearColor(0x606060, 1);
	renderer.clear();
	renderer.render(scene, camera);
}

export function getPosition(pointer) {
	raycaster.setFromCamera(pointer, camera );
	const intersects = raycaster.intersectObjects([mousePositionMesh]);
	return intersects[0].point;
}
