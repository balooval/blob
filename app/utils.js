const eps = 0.0000001;

function sqr(x) {
    return x * x;
}

function dist2(v, w) {
    return sqr(v.x - w.x) + sqr(v.y - w.y)
}

function distToSegmentSquared(p, v, w) {
    const l2 = dist2(v, w);
    if (l2 == 0) {
        return dist2(p, v);
    }

    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return dist2(
        p,
        {
            x: v.x + t * (w.x - v.x),
            y: v.y + t * (w.y - v.y)
        }
    );
}

export function addNumbers(numbers) {
    return numbers.reduce((value, sum) => sum + value, 0);
}

export function length(sX, sY, dX, dY) {
    Math.sqrt(sqr(sX - dX) + sqr(sY - dY));
}

export function pointsAngle(pointA, pointB) {
    return Math.atan2(
        pointB[1] - pointA[1],
        pointB[0] - pointA[0],
    );
}

export function random(min, max) {
    const length = max - min;
    return min + (Math.random() * length);
}

export function randomize(value, radius) {
    const amplitude = radius * 2;
    return value + (Math.random() * amplitude) - radius;
}

export function randomElement(collection) {
    if (collection.length === 0) {
		return null;
	}
    const index = Math.floor(Math.random() * collection.length);
    return collection[index];
}

export function lerpFloat(valueA, valueB, percent) {
    const distance = valueB - valueA;
    const value = valueA + (distance * percent);
    return value;
}

export function lerpPoint(pointA, pointB, percent) {
    return [
        lerpFloat(pointA[0], pointB[0], percent),
        lerpFloat(pointA[1], pointB[1], percent),
    ]
}

export function radians(_degres){
    return Math.PI * _degres / 180;
}

export function degree(radians){
    return 180 * radians / Math.PI;
}

export function angleDiff(angleA, angleB) {
    return Math.atan2(Math.sin(angleA - angleB), Math.cos(angleA - angleB));
}

export function distToSegment(point, startPos, endPos) {
    return Math.sqrt(distToSegmentSquared(point, startPos, endPos));
}

export function distance(pointA, pointB) {
    return Math.sqrt(dist2(pointA, pointB));
}

export function nearestPoint(point, segment) {
    const l2 = dist2(segment[0], segment[1]);
    if (l2 == 0) {
        return point;
    }

    let t = ((point.x - segment[0].x) * (segment[1].x - segment[0].x) + (point.y - segment[0].y) * (segment[1].y - segment[0].y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return {
        x: segment[0].x + t * (segment[1].x - segment[0].x),
        y: segment[0].y + t * (segment[1].y - segment[0].y)
    };
}

export function segmentIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
    const x = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
    const y = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
    
    if (isNaN(x) || isNaN(y)) {
        return null;
    }

	if (x1 >= x2) {
		if (!between(x2, x, x1)) return null;
	} else {
		if (!between(x1, x, x2)) return null;
	}

	if (y1 >= y2) {
		if (!between(y2, y, y1)) return null;
	} else {
		if (!between(y1, y, y2)) return null;
	}

	if (x3 >= x4) {
		if (!between(x4, x, x3)) return null;
	} else {
		if (!between(x3, x, x4)) return null;
	}

	if (y3 >= y4) {
		if (!between(y4, y, y3)) return null;
	} else {
		if (!between(y3, y, y4)) return null;
	}

    return {x: x, y: y};
}

function between(a, b, c) {
    return a - eps <= b && b <= c + eps;
}

export function hslToRgb(h, s, l) {
    s /= 100;
    l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [255 * f(0), 255 * f(8), 255 * f(4)];
};