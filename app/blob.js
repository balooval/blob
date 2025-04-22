import * as UiMouse from './uiMouse.js';
import * as Utils from './utils.js';
import * as Map from './map.js';
import * as Stains from './stain.js';
import * as Splats from './splats.js';
import { BufferAttribute, BufferGeometry, Color, DoubleSide, Line, LineBasicMaterial, Mesh, MeshBasicMaterial, MeshNormalMaterial, MeshPhysicalMaterial, PlaneBufferGeometry, SphereGeometry, Vector3 } from '../vendor/three.module.js';
import * as Render from './render3d.js';
import * as ImageLoader from './ImageLoader.js';

export default class Blob {
    constructor() {
        this.size = 50;
        this.posX = 200;
        this.posY = 150;
        this.translation = [0, 0];
        this.moveAngle = 0;
        // this.arms = this.initArms(4);
        this.arms = this.initArms(16);
        this.time = 0;

        this.bodyGeometry = new SphereGeometry(20);
        const material = new MeshBasicMaterial({color: '#ffffff', map: ImageLoader.get('eye')});
        // const material = new MeshBasicMaterial({color: '#AA0000'});
        // const material = new MeshPhysicalMaterial({color: '#ff0000'});
        this.bodyMesh = new Mesh(this.bodyGeometry, material);
        Render.add(this.bodyMesh);

        this.eyes = this.#buidEyes(8);
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

    onFrame() {
        this.time ++;

        const lastPosX = this.posX;
        const lastPosY = this.posY;

        this.posX = UiMouse.worldPosition[0];
        this.posY = UiMouse.worldPosition[1];

        this.bodyMesh.position.x = this.posX;
        this.bodyMesh.position.y = this.posY;

        this.translation[0] = this.posX - lastPosX;
        this.translation[1] = this.posY - lastPosY;
        
        
        this.moveAngle = Math.atan2(this.translation[1], this.translation[0]);
        if (Math.abs(this.translation[0]) + Math.abs(this.translation[1]) === 0) {
            this.moveAngle = 0;
        }

        this.arms.map(arm => arm.onFrame(this.posX, this.posY));

        this.#updateSize();
        this.#updateEyes();
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
            arms.push(new Arm(angleStep * i));
        }

        return arms;
    }
}

class Eye {
    static eyeGeometry = new SphereGeometry(10);
    // static material = new MeshBasicMaterial({color: '#00ff00'});
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
        // this.eyeMesh.rotation.y = Math.PI * -0.5;
        Render.add(this.eyeMesh);
    }

    onFrame() {
        // this.lookAtX *= 0.95;
        this.lookAtX = Utils.lerpFloat(this.lookAtX, this.blob.translation[0], 0.05);
        this.lookAtY = Utils.lerpFloat(this.lookAtY, this.blob.translation[1], 0.05);
        // console.log(Math.round(this.lookAtX * 1000) / 1000);
        
        
        this.time += this.timeDirection * 0.05;
        // this.time += Utils.random(-0.05, 0.05);

        const angle = this.angle + this.time;
        const posX = this.blob.posX + Math.cos(angle) * this.radius;
        const posY = this.blob.posY + Math.sin(angle) * this.radius;
        this.eyeMesh.position.x = posX;
        this.eyeMesh.position.y = posY;
        this.eyeMesh.position.z = 10;
        this.eyeMesh.lookAt(
            posX + this.lookAtX * 50, //(this.blob.translation[0] * 100),
            posY + this.lookAtY * 50, //(this.blob.translation[0] * 100),
            100
        );
    }
}

class Arm {
    static #STATE_IDLE = 'STATE_IDLE';
    static #STATE_DEPLOY = 'STATE_DEPLOY';
    static #STATE_STUCKED = 'STATE_STUCKED';
    static #STATE_RETRACT = 'STATE_RETRACT';

    constructor(angle) {
        this.state = Arm.#STATE_IDLE;
        this.startOffset = 2;
        this.posX = 0;
        this.posY = 0;
        this.viewAngle = angle;
        this.baseAngle = angle;
        this.angle = this.baseAngle;
        this.maxLength = Utils.random(100, 150);
        this.viewLength = Utils.random(80, 100);
        this.maxAngleDiff = 1;
        this.baseLength = 5;
        this.length = this.baseLength;
        this.baseWidth = Utils.randomize(10, 5);
        this.width = this.baseWidth;
        this.color = new Color(Utils.random(0.8, 1), 0, 0);

        this.segmentsCount = 10;
        // this.segmentsCount = 5;

        this.targetPosX = this.posX + Math.cos(this.angle) * this.length;
        this.targetPosY = this.posY + Math.sin(this.angle) * this.length;

        this.hooks = [];

        this.wallPoint = {wall: null, intersection: {x: 0, y: 0}};
        this.isStuck = false;
        this.time = Math.round(Utils.random(0, 100));
        this.timeDirection = Utils.random(-1, 1);
        // this.color = `rgb(${Utils.random(200, 255)}, 0, 0)`;
        this.hsl = [1, Utils.random(35, 80), 40];
        const rgb = Utils.hslToRgb(1, Utils.random(35, 80), 40);
        // this.color = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
        this.eyeClosed = true;
        this.direction = [0, 0];
        this.softness = Utils.randomize(4, 2) / this.baseWidth;

        this.segments = this.buildSegments();

        this.meshSegments = this.#buildMeshFace(this.segmentsCount);
        Render.add(this.meshSegments);
        this.meshStraight = this.#buildMeshStraight();
        Render.add(this.meshStraight);
    }

    #buildMeshStraight() {
        const material = new MeshBasicMaterial({
            color: 0xCC0000,
            transparent: true,
            alphaMap: ImageLoader.get('arm-alpha'),
        });
        const z = 2;
        const positions = [
            0, 0, z,
            0, 0, z,
            0, 0, z,
            0, 0, z,
        ];
        const uv = [
            0, 0,
            1, 0,
            1, 1,
            0, 1,
        ];
        const facesIndex = [
            3,
            0,
            1,

            3,
            1,
            2,
        ];

        const vertices = new Float32Array(positions);
        const geometry = new BufferGeometry();
        geometry.setIndex(facesIndex);
        geometry.setAttribute('position', new BufferAttribute(vertices, 3));
        geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uv), 2));
        geometry.computeVertexNormals();
        geometry.normalizeNormals();

        return new Mesh(geometry, material);
    }

    #buildMeshFace(segmentsCount) {
        // const material = new MeshBasicMaterial({color: 0xffffff, map: ImageLoader.get('arm-alpha')});
        
        const material = new MeshBasicMaterial({
            // color: 0xff0000,
            color: this.color,
            transparent: true,
            alphaMap: ImageLoader.get('arm-alpha'),
        });
        // const material = new MeshPhysicalMaterial({color: 0xffffff, map: ImageLoader.get('arm')});
        let index = 0;
        const facesIndex = [];
        const positions = [];
        const normals = [];
        const uv = [];
        const z = Utils.random(5, 15);
        const uvStep = 1 / segmentsCount;
        
        for (let i = 0; i < segmentsCount + 1; i ++) {
            positions.push(
                0, 0, z,
                0, 0, z,
            );
            normals.push(
                0.5, 0, 0.5,
                -0.5, 0, 0.5,
            );
            uv.push(
                0, i * 0.8,
                1, i * 0.8,
            );
            // uv.push(
            //     0, uvStep * i,
            //     1, uvStep * i,
            // );
        }

        index = 0;

        for (let i = 0; i < segmentsCount; i ++) {
            facesIndex.push(
                index + 1,
                index + 0,
                index + 2,

                index + 2,
                index + 3,
                index + 1,
            )
            index += 2;
        }

        const vertices = new Float32Array(positions);

        const geometry = new BufferGeometry();
        geometry.setIndex(facesIndex);
        geometry.setAttribute('position', new BufferAttribute(vertices, 3));
        // geometry.setAttribute('normal', new BufferAttribute(new Float32Array(normals), 3));
        geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uv), 2));
        geometry.computeVertexNormals();
        geometry.normalizeNormals();

        return new Mesh(geometry, material);
    }

    updagesegmentsVertices() {
        let uvAttribute = this.meshSegments.geometry.attributes.uv;
        let uvValues = uvAttribute.array;
        let positionAttributeFace = this.meshSegments.geometry.attributes.position;
        let positionsFace = positionAttributeFace.array;

        for (let i = 0; i < this.segmentsCount + 0; i ++) {
            let indexFace = i * 6;
            let indexUv = i * 4;
            
            // const faceWidth = Math.max(0.4, this.segments[i].width / (1 + (i * 0.1)));
            const faceWidth = Math.max(0.15, Math.round(this.segments[i].width * 0.6));

            const startX = this.segments[i].start.x;
            const startY = this.segments[i].start.y;
            const endX = this.segments[i].end.x;
            const endY = this.segments[i].end.y;
            const directionAngle = Utils.pointsAngle([startX, startY], [endX, endY]);
            // const borderAngle = this.time * 0.02//directionAngle// - Math.PI * 1;
            const borderAngle = directionAngle * -1 - Math.PI * 2;

            const offsetX = Math.sin(borderAngle) * faceWidth;
            const offsetY = Math.cos(borderAngle) * faceWidth;

            positionsFace[indexFace + 0] = startX - offsetX;
            positionsFace[indexFace + 1] = startY - offsetY;

            positionsFace[indexFace + 3] = startX + offsetX;
            positionsFace[indexFace + 4] = startY + offsetY;

            uvValues[indexUv + 1] = i * 0.8 + Math.abs(this.time) * 0.03;
            uvValues[indexUv + 3] = i * 0.8 + Math.abs(this.time) * 0.03;

            if (i === this.segmentsCount - 1) {
                indexFace += 6;
                positionsFace[indexFace + 0] = endX - offsetX;
                positionsFace[indexFace + 1] = endY - offsetY;

                positionsFace[indexFace + 3] = endX + offsetX;
                positionsFace[indexFace + 4] = endY + offsetY;
            }
        }

        
        positionAttributeFace.needsUpdate = true;
        uvAttribute.needsUpdate = true;

        this.meshSegments.geometry.computeVertexNormals();




        let positionAttributeStraight = this.meshStraight.geometry.attributes.position;
        let positionsStraight = positionAttributeStraight.array;
        const startWidth = Math.max(0.3, this.segments[0].width * 0.2);
        const endWidth = Math.max(0.3, this.segments[this.segmentsCount - 1].width * 0.3);

        const startX = this.segments[0].start.x;
        const startY = this.segments[0].start.y;
        const endX = this.segments[this.segmentsCount - 1].end.x;
        const endY = this.segments[this.segmentsCount - 1].end.y;
        const directionAngle = Utils.pointsAngle([startX, startY], [endX, endY]);
        const borderAngle = directionAngle * -1 - Math.PI * 2;

        const sin = Math.sin(borderAngle);
        const cos = Math.cos(borderAngle);
        const startOffsetX = sin * startWidth;
        const startOffsetY = cos * startWidth;
        const endOffsetX = sin * endWidth;
        const endOffsetY = cos * endWidth;

        positionsStraight[0] = startX + startOffsetX;
        positionsStraight[1] = startY + startOffsetY;
        positionsStraight[3] = startX - startOffsetX;
        positionsStraight[4] = startY - startOffsetY;
        positionsStraight[6] = endX - endOffsetX;
        positionsStraight[7] = endY - endOffsetY;
        positionsStraight[9] = endX + endOffsetX;
        positionsStraight[10] = endY + endOffsetY;

        positionAttributeStraight.needsUpdate = true;
    }

    onFrame(posX, posY) {
        this.posX = posX + Math.cos(this.angle) * this.startOffset;
        this.posY = posY + Math.sin(this.angle) * this.startOffset;

        // this.mesh.position.x = this.posX;
        // this.mesh.position.y = this.posY;
        
        this.time += this.timeDirection;
        this.update();
        this.segments = this.buildSegments();
        this.updagesegmentsVertices();

        if (this.state === Arm.#STATE_STUCKED) {
            return this.updateStuckState();
        }

        if (this.state === Arm.#STATE_RETRACT) {
            return this.retract();
        }

        if (this.state === Arm.#STATE_DEPLOY) {
            return this.deploy();
        }

        this.idle();
    }

    update() {
        this.length = Utils.distance({x: this.posX, y: this.posY}, {x: this.targetPosX, y: this.targetPosY});

        this.eyeClosed = Math.abs(this.time % 100) < 15;

        this.direction = [Math.cos(this.viewAngle), Math.sin(this.viewAngle)];
        
        const gap = this.maxLength - this.baseLength;
        this.elongationPercent =  (this.length - this.baseLength) / gap;
        
        if (this.state === Arm.#STATE_IDLE) {
            this.width = this.baseWidth * 0.9;
            return;
        }
        
        const widthFactor = Math.max(1 - this.elongationPercent, 0.3);
        this.width = widthFactor * this.baseWidth;
    }

    isReadyToStuck() {
        const angleDiff = Utils.angleDiff(this.baseAngle, this.angle);

        if (Math.abs(angleDiff) > 0.001) {
            return false;
        }

        return true;
    }

    updateStuckState() {
        this.length = Utils.distance({x: this.posX, y: this.posY}, {x: this.targetPosX, y: this.targetPosY});
        this.angle = Utils.pointsAngle([this.posX, this.posY], [this.targetPosX, this.targetPosY]);

        // console.log(this.posX, this.posY);
        

        if (this.mustQuiStuck() === true) {
            this.isStuck = false;
            this.state = Arm.#STATE_RETRACT;
        }
    }

    mustQuiStuck() {
        if (this.stuckDistanceIsOk() === false) {
            return true;
        }
        if (this.stuckAngleIsOk() === false) {
            return true;
        }

        return false;
    }

    stuckDistanceIsOk() {
        if (this.length > this.maxLength) {
            return false;
        }

        return true;
    }

    stuckAngleIsOk() {
        const angleDiff = Utils.angleDiff(this.baseAngle, this.angle);

        if (Math.abs(angleDiff) > this.maxAngleDiff) {
            return false;
        }

        return true;
    }
    
    idle() {
        const waveLenght = Math.abs(Math.cos(this.time * 0.01) * (this.baseLength * 5));
        this.targetPosX = this.posX + Math.cos(this.angle) * waveLenght;
        this.targetPosY = this.posY + Math.sin(this.angle) * waveLenght;

        this.viewAngle = this.baseAngle + Math.cos(this.time * 0.1) * 0.5;

        this.scanForDeploy();
    }

    scanForDeploy() {
        const touchedPoint = this.getTouchedPoint();
        
        if (touchedPoint) {
            this.wallPoint = touchedPoint;
            this.state = Arm.#STATE_DEPLOY;
        }
    }

    deploy() {
        const distance = Utils.distance({x: this.posX, y: this.posY}, this.wallPoint.intersection);

        if (distance > this.maxLength) {
            this.state = Arm.#STATE_RETRACT;
            return;
        }

        const targetPoint = Utils.lerpPoint(
            [this.targetPosX, this.targetPosY],
            [this.wallPoint.intersection.x, this.wallPoint.intersection.y],
            0.5
        );
        
        this.targetPosX = targetPoint[0];
        this.targetPosY = targetPoint[1];

        this.length = Utils.distance({x: this.posX, y: this.posY}, {x: this.targetPosX, y: this.targetPosY});

        const diff = Utils.distance({x: this.targetPosX, y: this.targetPosY}, this.wallPoint.intersection);
        if (diff < 5) {
            this.stuckToWall(this.wallPoint);
        }
    }

    stuckToWall(wallPoint) {
        this.targetPosX = wallPoint.intersection.x;
        this.targetPosY = wallPoint.intersection.y;
        this.isStuck = true;
        this.state = Arm.#STATE_STUCKED;
        Stains.add(this.targetPosX, this.targetPosY);
        Splats.add(this.targetPosX, this.targetPosY);

        const hooksCount = 4;
        const distance = 10;
        for (let i = 0; i < hooksCount; i ++) {
            const hookDistance = Utils.random(distance * -1, distance);
            this.hooks.push([
                this.targetPosX + wallPoint.wall.direction[0] * hookDistance,
                this.targetPosY + wallPoint.wall.direction[1] * hookDistance,
            ]);
        }
    }

    getTouchedPoint() {
        return Map.walls.map(wall => {
            const viewSegment = this.getViewSegment();
            const intersection = Utils.segmentIntersection(
                viewSegment[0].x,
                viewSegment[0].y,
                viewSegment[1].x,
                viewSegment[1].y,
                wall.positions[0].x,
                wall.positions[0].y,
                wall.positions[1].x,
                wall.positions[1].y,
            );
            return {
                intersection: intersection,
                wall: wall,
            }
        }).filter(point => point.intersection !== null)
        .pop();
    }

    retract() {
        let isRetracted = true;
        this.hooks = [];

        const diff = this.length - this.baseLength;

        if (diff > 0.1) {
            this.length = this.baseLength + (diff * 0.8);
            isRetracted = false;
        }

        this.targetPosX = this.posX + Math.cos(this.angle) * this.length;
        this.targetPosY = this.posY + Math.sin(this.angle) * this.length;

        const angleDiff = Utils.angleDiff(this.baseAngle, this.angle);
        if (Math.abs(angleDiff) > 0.001) {
            this.angle += angleDiff * 0.5;
            isRetracted = false;
        }

        if (isRetracted === true) {
            this.state = Arm.#STATE_IDLE;
        }
    }

    getViewSegment() {
        return [
            {
                x: this.posX,
                y: this.posY,
            },
            {
                x: this.posX + Math.cos(this.viewAngle) * this.viewLength,
                y: this.posY + Math.sin(this.viewAngle) * this.viewLength,
            },
        ];
    }

    buildSegments() {
        const res = [];
        const percentStep = 1 / this.segmentsCount;
        let waveFactor = 5;
        let waveReduction = 1.1;

        if (this.state === Arm.#STATE_STUCKED) {
            waveFactor = 50 * this.softness;
            waveReduction = 0.7;
        }

        const targetAngle = Math.atan2(this.targetPosY - this.posY, this.targetPosX - this.posX);
        const perpAngle = targetAngle + Math.PI / 2;
        let previousPos = [this.posX, this.posY];
        
        let ecart = 0;
        let distanceWidth = 1;
        const widthStep = Math.PI / this.segmentsCount;

        
        for (let i = 0; i < this.segmentsCount; i ++) {
            const test = 1 + (Math.tan(i * percentStep) * 2);

            const point = Utils.lerpPoint(
                [this.posX, this.posY],
                [this.targetPosX, this.targetPosY],
                percentStep * (i + 1)
            );
            
            ecart = Math.cos((this.time + (i * 10)) * 0.08) * waveFactor;
            ecart *= 1 - this.elongationPercent;

            const segmentEndPos = [
                point[0] + Math.cos(perpAngle) * ecart,
                point[1] + Math.sin(perpAngle) * ecart,
            ];
            
            waveFactor *= waveReduction;
            
            // const width = Math.max(1, (this.width * 2) / test);

            let segmentWidthFactor = Math.abs(Math.cos(widthStep * i)) + 0.5;
            segmentWidthFactor *= distanceWidth;
            segmentWidthFactor *= 2;
            distanceWidth *= 0.8;
            
            const width = Math.min(segmentWidthFactor * this.width, 15);

            res.push({
                start: {
                    x: previousPos[0],
                    y: previousPos[1],
                },
                end: {
                    x: segmentEndPos[0],
                    y: segmentEndPos[1],
                },
                width: width,
            });

            previousPos = segmentEndPos;
        }

        return res;
    }
}