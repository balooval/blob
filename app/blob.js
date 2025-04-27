import * as Utils from './utils.js';
import * as Map from './map.js';
import * as Keyboard from './keyboard.js';
import * as Gamepad from './gamepad.js';
import {
    Mesh,
    MeshBasicMaterial,
    SphereGeometry,
    Vector2,
} from '../vendor/three.module.js';
import * as Render from './render3d.js';
import * as ImageLoader from './ImageLoader.js';
import Bbox from './bbox.js';
import Arm from './blobArm.js';
import * as Splats from './splats.js';

const ARM_MAX_LENGTH = 150;
const GRAVITY_ACCEL = 0.2;
// const ARM_COUNT = 4;
const ARM_COUNT = 16;

export default class Blob {
    constructor() {
        this.acidProduction = 0;
        this.size = 50;
        const startPos = Map.getStartPosition();
        this.vectorPosition = new Vector2(startPos[0], startPos[1]);
        this.lastPosition = this.vectorPosition.clone();
        this.nextPosition = this.vectorPosition.clone();
        this.translationDone = new Vector2(0, 0);
        this.keyboardMove = new Vector2(0, 0);
        this.moveAngle = 0;
        this.arms = this.initArms(ARM_COUNT);
        this.time = 0;
        this.fallTranslation = 0;
        this.floatingTranslation = new Vector2(0, 0);
        this.searchForWalls = true;
        this.bbox = new Bbox(0, ARM_MAX_LENGTH * 2.5, 0, ARM_MAX_LENGTH * 2.5);
        this.bodyGeometry = new SphereGeometry(20);
        const material = new MeshBasicMaterial({color: '#ffffff', map: ImageLoader.get('mouth')});
        this.bodyMesh = new Mesh(this.bodyGeometry, material);
        Render.add(this.bodyMesh);

        this.eyes = this.#buidEyes(6);

        Keyboard.evt.addEventListener('DOWN', this, this.onKeyDown);
        Keyboard.evt.addEventListener('UP', this, this.onKeyUp);
        Gamepad.evt.addEventListener('PRESS', this, this.onGamepadDown);
        Gamepad.evt.addEventListener('RELEASE', this, this.onGamepadUp);

        this.inputMoves = {
			left: 0,
			right: 0,
			up: 0,
			down: 0,
		};

        this.keyboardVector = new Vector2();
    }

    onFrame() {
        this.time ++;

        this.#updateKeyboardVector();

        if (this.arms.some(arm => arm.state === 'STATE_STUCKED') === true) {
            this.fallTranslation = 0;
            this.floatingTranslation.copy(this.keyboardVector);
        } else {
            this.fallTranslation += 0.3;
            this.floatingTranslation.x *= 0.999;
            this.floatingTranslation.y -= GRAVITY_ACCEL;
        }

        this.lastPosition.copy(this.vectorPosition);
        this.nextPosition.addVectors(this.vectorPosition, this.floatingTranslation);
        const wallIntersection = this.#hitWall(this.lastPosition, this.nextPosition);

        if (wallIntersection) {
            this.vectorPosition.copy(this.lastPosition);
            
        } else {
            this.vectorPosition.copy(this.nextPosition)
        }

        this.bbox.translate(this.vectorPosition.x, this.vectorPosition.y);

        this.bodyMesh.position.x = this.vectorPosition.x;
        this.bodyMesh.position.y = this.vectorPosition.y;

        this.translationDone.subVectors(this.vectorPosition, this.lastPosition)
        this.moveAngle = Math.atan2(this.translationDone.y, this.translationDone.x);
        
        if (this.translationDone.manhattanLength() === 0) {
            this.moveAngle = 0;
        }

        this.arms.map(arm => arm.onFrame(this.vectorPosition.x, this.vectorPosition.y));
        
        this.#updateSize();
        this.#updateEyes();

        // this.produceAcid();
    }

    produceAcid() {
        this.acidProduction += Utils.random(0, 1);
        const acidQuantity = Utils.random(0, 500);

        if (acidQuantity < this.acidProduction) {
            // this.acidProduction = 0;
            this.acidProduction -= acidQuantity;
            Splats.addAcid(Utils.randomize(this.vectorPosition.x, 5), this.vectorPosition.y, 0, 0, acidQuantity);
        }
    }

    #hitWall(start, end) {
        return Map.getWallIntersectionToCircle(end.x, end.y, 20, this.bbox);
    }

    #updateKeyboardVector() {
        this.inputMoves = Gamepad.getMove(this.inputMoves);
        this.keyboardVector.x = this.inputMoves.right - this.inputMoves.left;
        this.keyboardVector.y = this.inputMoves.up - this.inputMoves.down;
        
        if (this.keyboardVector.manhattanLength() === 0) {
            this.keyboardVector;
        }
        
        this.arms.forEach(arm => arm.forcedDirection = this.keyboardVector);
        this.keyboardMove.copy(this.keyboardVector);
        const moveVector = new Vector2(this.keyboardVector.x, this.keyboardVector.y);
        const forces = this.arms.map(arm => arm.getAttractForce(moveVector));
        const total = Math.min(3, Utils.addNumbers(forces) * 50);
        this.keyboardVector.multiplyScalar(total);

        return this.keyboardVector;
    }

    #releaseWalls() {
        this.searchForWalls = false;
        this.arms.forEach(arm => arm.releaseWall());
    }
    
    #holdWalls() {
        this.searchForWalls = true;
    }

    #updateEyes() {
        this.eyes.forEach(eye => {
            eye.onFrame();
        });
    }

    #updateSize() {
        const armsSize = this.arms.map(arm => arm.length).reduce((prev, cum) => prev + cum);
        this.size = (2000 - armsSize) / 50;
        // this.bodyMesh.scale.x = this.bodyMesh.scale.y = this.bodyMesh.scale.z = this.size * 0.05;
    }

    initArms(count) {
        const arms = [];
        const angleStep = (Math.PI * 2) / count;

        for (let i = 0; i < count; i ++) {
            arms.push(new Arm(angleStep * i, this, ARM_MAX_LENGTH));
        }

        return arms;
    }

    onGamepadDown(code) {
		switch (code) {
			case 'BTN_2':
				this.#releaseWalls();
			break;
		}
	}

    onGamepadUp(code) {
		switch (code) {
			case 'BTN_2':
				this.#holdWalls();
			break;
		}
	}

    onKeyDown(code) {
		switch (code) {
			case 'LEFT':
			case 'Q':
				this.inputMoves.left = 1;
			break;
			case 'RIGHT':
			case 'D':
				this.inputMoves.right = 1;
			break;
			case 'DOWN':
			case 'S':
				this.inputMoves.down = 1;
			break;
			case 'UP':
			case 'Z':
				this.inputMoves.up = 1;
			break;
			case 'SPACE':
				this.#releaseWalls();
			break;
		}
	}

    onKeyUp(code) {
		switch (code) {
			case 'LEFT':
			case 'Q':
				this.inputMoves.left = 0;
			break;
			case 'RIGHT':
			case 'D':
				this.inputMoves.right = 0;
			break;
			case 'DOWN':
			case 'S':
				this.inputMoves.down = 0;
			break;
			case 'UP':
			case 'Z':
				this.inputMoves.up = 0;
			break;
            case 'SPACE':
				this.#holdWalls();
			break;
		}
	}

    #buidEyes(eyesCount) {
        const eyes = [];
        const angleStep = (Math.PI * 2) / eyesCount;

        for (let i = 0; i < eyesCount; i ++) {
            const angle = angleStep * i;
            const eye = new Eye(this, angle);
            eyes.push(eye);
        }

        return eyes;
    }
}



class Eye {
    static eyeGeometry = new SphereGeometry(10);
    static material = new MeshBasicMaterial({color: '#ffffff'});

    constructor(blob, angle) {
        Eye.material.map = ImageLoader.get('eye');

        this.blob = blob;
        this.angle = angle;
        this.time = 0;
        this.timeDirection = Utils.random(-0.1, 0.1);
        this.size = Utils.random(0.8, 1.2);

        this.lookAtX = 0;
        this.lookAtY = 0;

        this.radius = Utils.random(10, 20);
        this.eyeMesh = new Mesh(Eye.eyeGeometry, Eye.material);
        this.eyeMesh.scale.x = this.eyeMesh.scale.y = this.eyeMesh.scale.z = this.size;
        Render.add(this.eyeMesh);
    }

    onFrame() {
        this.lookAtX = Utils.lerpFloat(this.lookAtX, this.blob.translationDone.x, 0.05);
        this.lookAtY = Utils.lerpFloat(this.lookAtY, this.blob.translationDone.y, 0.05);
        
        this.time += this.timeDirection * 0.05;

        const angle = this.angle + this.time;
        const posX = this.blob.vectorPosition.x + Math.cos(angle) * this.radius;
        const posY = this.blob.vectorPosition.y + Math.sin(angle) * this.radius;
        this.eyeMesh.position.x = posX;
        this.eyeMesh.position.y = posY;
        this.eyeMesh.position.z = 10;
        this.eyeMesh.lookAt(
            posX + this.lookAtX * 50,
            posY + this.lookAtY * 50,
            100
        );
    }
}