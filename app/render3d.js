import {
	AmbientLight,
	Mesh,
	OrthographicCamera,
	PerspectiveCamera,
	PlaneGeometry,
	PointLight,
	PointLightHelper,
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
const cameraZoom = 1;
const cameraWidth = worldWidth * cameraZoom;
const cameraHeight = worldHeight * cameraZoom;

const raycaster = new Raycaster();
let mousePositionMesh;
const ratio = 4 / 3;

export function init(elmtId) {
	const mainElmt = document.getElementById(elmtId);
	renderer = new WebGLRenderer({antialias: true});
	mainElmt.appendChild(renderer.domElement);
	
	// camera = new OrthographicCamera(cameraWidth / -2, cameraWidth / 2, cameraHeight / 2, cameraHeight / -2, 1, 1000);
	// camera.position.set(0, 0, 100);
	// camera.lookAt(new Vector3(0, 0, 0));
	
	camera = new PerspectiveCamera(75, 4/3);
	camera.position.set(0, 0, 400);
	camera.lookAt(new Vector3(0, 0, 0));

	window.onresize = function () {
		renderer.setSize(mainElmt.clientWidth, mainElmt.clientWidth / ratio);
		camera.aspect = ratio;
		camera.updateProjectionMatrix();
	};

	window.onresize();
	scene = new Scene();
	scene.add(camera);

	const geoPlane = new PlaneGeometry(worldWidth * 2, worldHeight * 2);
	mousePositionMesh = new Mesh(geoPlane);
	// scene.add(mousePositionMesh);

	const light = new PointLight(0xffffff, 2, 1000, 1);
	light.position.set(0, 0, 50);
	scene.add(light);
	
	// const helper = new PointLightHelper(light);
	// scene.add(helper);

	const ambiant = new AmbientLight(0x404040); // soft white light
	scene.add(ambiant);
}

export function add(object) {
	scene.add(object);
}

export function draw() {
	renderer.setRenderTarget(null);
	renderer.setClearColor(0x202020, 1);
	renderer.clear();
	renderer.render(scene, camera);
}

export function getPosition(pointer) {
	raycaster.setFromCamera(pointer, camera );
	const intersects = raycaster.intersectObjects([mousePositionMesh]);
	return intersects[0].point;
}
