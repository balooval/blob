

class Bbox {
    constructor(left, right, bottom, top) {
        this.left = left;
        this.right = right;
        this.bottom = bottom;
        this.top = top;
        
        this.width = 0;
        this.height = 0;

        this.#updateSize();
    }

    intersect(bbox) {
        if (bbox.left > this.right) return false;
        if (bbox.right < this.left) return false;
        if (bbox.top < this.bottom) return false;
        if (bbox.bottom > this.top) return false;
        return true;
    }

    translate(x, y) {
        const marginHor = this.width / 2;
        const marginVert = this.height / 2;
        this.left = x - marginHor;
        this.right = x + marginHor;
        this.bottom = y - marginVert;
        this.top = y + marginVert;
    }

    intersectBBox(bbox) {
        if (bbox.right < this.left) return false;
        if (bbox.left > this.right) return false;
        if (bbox.bottom > this.top) return false;
        if (bbox.top < this.bottom) return false;
        return true;
    }

    resize(bbox) {
        this.left = Math.min(this.left, bbox.left);
        this.right = Math.max(this.right, bbox.right);
        this.bottom = Math.min(this.bottom, bbox.bottom);
        this.top = Math.max(this.top, bbox.top);
        this.#updateSize();
    }

    #updateSize() {
        this.width = Math.abs(this.right - this.left);
        this.height = Math.abs(this.top - this.bottom);
    }
}

export {Bbox as default}