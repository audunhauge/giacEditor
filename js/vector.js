// @ts-check


/**
 * Simple base class, all figures must be placed at (x,y)
 */
class Point {
    /**
     * Create a point given x,y
     * @param {{x:number,y:number}} point (x,y)
     */
    constructor({ x, y }) {
        this.x = x;
        this.y = y;
    }
}

/**
 * Utility class - add,sub,length of vector
 * Used to find dist between two points
 */
class Vector extends Point {
    constructor({ x, y }) {
        super({ x, y });
    }

    /**
     * Returns u+v where u,v are vectors
     * @param {Point|Vector} v
     * @returns {Vector}
     */
    add(v) {
        return new Vector({ x: this.x + v.x, y: this.y + v.y });
    }

    /**
     * Returns u-v
     * @param {Point|Vector} v
     * @returns {Vector}
     */
    sub(v) {
        return new Vector({ x: this.x - v.x, y: this.y - v.y });
    }

    /**
     * Multiplies (scales) a vector with scalar
     * @param {number} k real number
     */
    mult(k) {
        return new Vector({ x: this.x * k, y: this.y * k });
    }

    /**
     * Multiplies two vectors - dot product
     * @param {Point|Vector} v
     */
    dot(v) {
        return this.x * v.x + this.y * v.y;
    }

    /**
     * Calculates length of vector
     * @returns {number}
     */
    get length() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }

    div(v) {
        if (v instanceof Vector) {
            return new Vector({ x: this.x / v.x, y: this.y / v.y });
        } else {
            return new Vector({ x: this.x / v, y: this.y / v });
        }
    }
    unit() {
        return this.div(this.length);
    }
    norm() {
        return new Vector({ x: -this.y, y: this.x });
    }
}

/**
 * A base class for all shapes
 * @extends Point
 */
class Shape extends Point {
    static idx = 1; // every shape gets an id
    /**
     * Construct a Shape given x,y and c=color, f=fill
     * @param {Object} init parameters for the shape
     * @param {number} init.x xpos
     * @param {number} init.y ypos
     * @param {string} init.c color
     * @param {string} init.f color
     * @param {number} init.t transparancy percent
     * @param {number} init.thick line width
     */
    constructor({ x, y, c = "red", f = "none", t = 0, thick = 1 }) {
        super({ x, y });
        this.c = c;
        this.f = f;
        this.t = t;
        this.thick = thick;
        this.id = Shape.idx++;
        this.center = { x, y }; // adjust in subclass
        this.r = 1; // adjust in subclass
        this.points = [];
    }
    /**
     * Draw the figure on given canvas
     * Calls virtual drawme implemented by subclass
     * @returns {string}
     */
    get svg() {
        return this.drawme();
    }
    /**
     * Subclass shape drawing function - must override
     * @abstract virtual draw function
     * @returns {string}
     */
    drawme() {
        // virtual function - override in subclass
        console.log("drawme must be implemented in subclass", this);
        return "";
    }

    /**
     *
     * @param {Vector} d displacement
     */
    move(d) {
        // virtual function - override in subclass
        console.log("move must be implemented in subclass", this);
    }

    rotate(d) {
        console.log("rotate must be implemented in subclass", this);
    }

    /**
     * Returns true if this shape intersects another shape
     * @param {Shape} b the other shape
     * @returns {boolean} true if they intersect
     */
    intersecting(b) {
        console.log("intersecting must be implemented in subclass", this);
        return false;
    }

    /**
     * Returns true if point is inside shape
     * @param {Point} p
     * @returns {boolean} true if they intersect
     */
    contains(p) {
        console.log("contains must be implemented in subclass", this);
        return false;
    }

    get info() {
        const { x, y, c, f } = this;
        return `<div>${this.constructor.name} 
                  <span style="color:${c};background:${f}">⬜</span>
              </div>`;
    }

    /**
     * Returns true if type === name
     * Used as if (s.isa("Circle")) { ... }
     * @param {string} name
     */
    isa(name) {
        return name === this.type;
    }

    scale(d) {
        console.log("override scale in subclass");
    }

    get type() {
        return "Shape";
    }

    get polygon() {
        return [this.x, this.y];
    }

}

/**
 * A circle
 * @extends Shape
 */
class Circle extends Shape {
  /**
     * Construct circle given x,y,r and c=color
    /**
     * Construct a square given x,y and w,h, c is color
       * @param {Object} init parameters for the shape
     * @param {number} init.x xpos
     * @param {number} init.y ypos
     * @param {number} init.r radius
     * @param {string} init.c color
     * @param {string} init.f color
     * @param {number} init.t transparancy percent
     * @param {number} init.thick line width
     */
  constructor({ x, y, r, c = "red", f = "none", t = 0, thick = 1  }) {
    super({ x, y, c, f,thick ,t});
    this.r = r;
    this.bb = { x: x - r, y: y - r, w: r + r, h: r + r };
    this.center = { x, y };
  }
  /**
   * Draw a svg circle
   */
  drawme() {
    return `<circle ></circle>`;
  }
  // must override move as bb needs adjusting for circle
  move(d) {
    this.x += d.x;
    this.y += d.y;
    this.bb.x = this.x - this.r;
    this.bb.y = this.y - this.r;
  }

  /**
   * Returns a bounding polygon
   */
  get polygon() {
    const { x, y, r } = this;
    return [x - r, y - r, x + r, y - r, x + r, y + r, x - r, y + r];
  }

  // point inside circle
  contains(p) {
    // return polygonPoint(this.polygon, p);
    const {x,y,r} = this;
    return (x-p.x)**2 + (y-p.y)**2 < r**2;
  }

  scale(d) {
    const s = Math.max(1 + d.x / 100, 1 / this.r);
    this.r *= s;
  }
  get type() {
    return "Circle";
  }

  rotate(d, modify) {}
}

class Dot extends Circle {
  /**
     * Construct circle given x,y,r and c=color
    /**
     * Construct a square given x,y and w,h, c is color
       * @param {Object} init parameters for the shape
     * @param {number} init.x xpos
     * @param {number} init.y ypos
     * @param {number} init.r radius
     * @param {string} init.c color
     * @param {string} init.f color
     * @param {number} init.t transparancy percent
     * @param {number} init.thick line width
     */
  constructor({ x, y, c = "red", f = "none", t = 0, thick = 1  }) {
    super({ x, y, c, r:1,f,thick ,t});
    const r = 1;
    this.r = r
    this.bb = { x: x - r, y: y - r, w: r + r, h: r + r };
    this.center = { x, y };
  }
}


// pure functions


/**
 * Check if point is inside polygon
 * Ignores some edge cases for speed  (point on/near edge)
 * @param {Array.<number>} points [x1,y1, x2,y2, ...]
 * @param {Point} p
 */
function polygonPoint(points, { x, y }) {
  const length = points.length;
  let c = false;
  let i, j;
  for (i = 0, j = length - 2; i < length; i += 2) {
    if (
      points[i + 1] > y !== points[j + 1] > y &&
      x <
        ((points[j] - points[i]) * (y - points[i + 1])) /
          (points[j + 1] - points[i + 1]) +
          points[i]
    ) {
      c = !c;
    }
    j = i;
  }
  return c;
}