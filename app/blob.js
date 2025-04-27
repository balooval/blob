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

const armMaxLength = 150;
const GRAVITY_ACCEL = 0.2;

export default class Blob {
    constructor() {
        this.acidProduction = 0;
        this.size = 50;
        const startPos = Map.getStartPosition();
        this.posX = startPos[0];
        this.posY = startPos[1];
        this.positionVector = new Vector2(this.posX, this.posY);
        this.translationDone = [0, 0];
        this.moveAngle = 0;
        // this.arms = this.initArms(4);
        this.arms = this.initArms(16);
        this.time = 0;
        this.fallTranslation = 0;
        this.floatingTranslation = [0, 0];
        this.translationForces = [0, 0];
        this.searchForWalls = true;

        this.bbox = new Bbox(0, armMaxLength * 2.5, 0, armMaxLength * 2.5);

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

        this.inputMoves = Gamepad.getMove(this.inputMoves);
        const keyboardTranslation = this.#moveFromKeyboard();

        this.translationForces[0] += keyboardTranslation.x;
        this.translationForces[1] += keyboardTranslation.y;

        if (this.arms.some(arm => arm.state === 'STATE_STUCKED') === true) {
            this.fallTranslation = 0;
            this.floatingTranslation[0] = keyboardTranslation.x;
            this.floatingTranslation[1] = keyboardTranslation.y;
        } else {
            this.fallTranslation += 0.3;
            this.floatingTranslation[0] *= 0.999;
            this.floatingTranslation[1] -= GRAVITY_ACCEL;
            keyboardTranslation.x = 0;
            keyboardTranslation.y = 0;
        }

        const lastPosX = this.posX;
        const lastPosY = this.posY;

        const nexPos = [
            this.posX + this.floatingTranslation[0],
            this.posY + this.floatingTranslation[1],
        ];

        const wallIntersection = this.#hitWall(
            lastPosX, lastPosY,
            nexPos[0], nexPos[1],
        );

        if (wallIntersection) {
            // const finalPosition = Utils.lerpPoint([lastPosX, lastPosY], [wallIntersection.x, wallIntersection.y], 0.1);
            this.posX = lastPosX;
            this.posY = lastPosY;
            
        } else {
            this.posX = nexPos[0];
            this.posY = nexPos[1];
        }

        this.positionVector.x = this.posX;
        this.positionVector.y = this.posY;

        this.bbox.translate(this.posX, this.posY);

        this.bodyMesh.position.x = this.posX;
        this.bodyMesh.position.y = this.posY;

        this.translationDone[0] = this.posX - lastPosX;
        this.translationDone[1] = this.posY - lastPosY;
        
        this.moveAngle = Math.atan2(this.translationDone[1], this.translationDone[0]);
        if (Math.abs(this.translationDone[0]) + Math.abs(this.translationDone[1]) === 0) {
            this.moveAngle = 0;
        }

        this.arms.map(arm => arm.onFrame(this.posX, this.posY));
        
        this.#updateSize();
        this.#updateEyes();

        
        /*
        this.acidProduction += Utils.random(0, 1);
        const acidQuantity = Utils.random(0, 500);

        if (acidQuantity < this.acidProduction) {
            // this.acidProduction = 0;
            this.acidProduction -= acidQuantity;
            Splats.addAcid(Utils.randomize(this.posX, 5), this.posY, 0, 0, acidQuantity);
        }
        */
    }

    #hitWall(startX, startY, endX, endY) {
        const moveSegment = [
            {
                x: startX,
                y: startY,
            },
            {
                x: endX,
                y: endY,
            },
        ];

        return Map.getWallIntersectionToCircle(endX, endY, 20, this.bbox);
    }

    #moveFromKeyboard() {
        this.keyboardVector.x = this.inputMoves.right - this.inputMoves.left;
        this.keyboardVector.y = this.inputMoves.up - this.inputMoves.down;

        this.arms.forEach(arm => arm.forcedDirection = this.keyboardVector);
        
        if (this.keyboardVector.manhattanLength() === 0) {
            return new Vector2(0, 0);
        }

        const moveVector = new Vector2(this.keyboardVector.x, this.keyboardVector.y);
        const forces = this.arms.map(arm => arm.getAttractForce(moveVector));
        const total = Math.min(3, Utils.addNumbers(forces) * 50);
        
        return moveVector.multiplyScalar(total);
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
            arms.push(new Arm(angleStep * i, this, armMaxLength));
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
        this.lookAtX = Utils.lerpFloat(this.lookAtX, this.blob.translationDone[0], 0.05);
        this.lookAtY = Utils.lerpFloat(this.lookAtY, this.blob.translationDone[1], 0.05);
        
        this.time += this.timeDirection * 0.05;

        const angle = this.angle + this.time;
        const posX = this.blob.posX + Math.cos(angle) * this.radius;
        const posY = this.blob.posY + Math.sin(angle) * this.radius;
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