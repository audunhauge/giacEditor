// @ts-check

/**
 * To draw geometric shapes with svg, triangles,circles,squares and lines
 * Triangles can be specified by combinations of points,length and angles
 * any sufficiently specified tri is rendered as svg.
 * New tris can be adjoined to existing by refering to tria.p1 p2 or p3
 * Create a vector from p1 to p2, use this in next tri to specify 
 * direction of first leg
 * @trig 300 8
 * p = new Point(1,1)
 * // the width and size/scale picked up from @trig directive
 * tria = tri({p,a:6,b:6,c:6,ABC:"A,B,C",abc:"c,a,b",size:{w:300,s:8} }) 
 * -- assumed to be stored in size  so ...,size}
 * size = tria.size
 * s = tria.center
 * r = tria.radius
 * tri2svg(tria)
 * r = roll(1,9)
 * A = 3*Math.sqrt(3)*r*r
 * trib = tri({p,a:6,B:30,C:30, ABC:",,S",size})
 * tri2svg(trib)
 */

import { init, decodeList, fitBezierPath, svgRelBez, svgPathFromBeziers } from './bezier.js';
import { qs, $, create, curry } from './util.js';
import { makeLatex } from './render.js'

// https://www.researchgate.net/figure/The-26-color-qualitative-alphabet-palette-derived-from-Polychrome-36_fig3_334894331
// colors for the alphabet
const objzip = (a,b) => Object.fromEntries(a.map((k, i) => [k, b[i]]));

const alphabet = "#b1f #00f #871 #83c #666 #286 #0f0 "

const graphcolor = "black blue green red #a05 #19d #5c7 #e65 #a2f #e80 #d0b #b87 #0ba".split(" ");

//const colornames = { r:"red",g:"green",b:"blue",a:"#a05",b:"#19d",c:"#5c7",d:"#e65",e:"#a2f"};

const colornames = objzip("abgrcdefhijkl".split(''),graphcolor);

const SIN = (/** @type {number} */ x) => Math.sin(Math.PI * x / 180);
const COS = (/** @type {number} */ x) => Math.cos(Math.PI * x / 180);
const ASIN = (/** @type {number} */ x) => 180 * Math.asin(x) / Math.PI;

const nice = x => {
    if (x % 1 === 0) return String(x);
    return x.toFixed(2);
};

const near = x => {
    if (x % 1 === 0) return String(x);
    return x.toFixed(1);
};



// used for labeling tickmarks
const sp = n => {
    if (Number.isInteger(10 * n)) return n.toFixed(1);
    return n.toFixed(2)
}

export const fx = (x, size) => {
    let wx = size.w * x / size.s;
    // clean up for use as coordinates
    return near(wx);
};

export const fy = (y, size) => {
    let hy = size.wy - size.wy * y / size.sy;
    // clean up for use as coordinates
    return near(hy);
};

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

const shuffle = (elements) => {
    let length = elements.length;
    let shuffled = Array(length);
    for (let index = 0; index < length; index++) {
        let rand = Math.round(Math.random() * index);
        if (rand !== index) shuffled[index] = shuffled[rand];
        shuffled[rand] = elements[index];
    }
    return shuffled;
}
export const range = (lo, hi, step = 1) => {
    // range(1,10,1) => [1,2,3,4,5,6,7,8,9]
    // range(1,4,0.1) => [1.0, 1.1, 1.2, 1.3 .. 3.9]
    hi = Number(hi);
    lo = Number(lo);
    step = step === 0 || isNaN(step) ? 1 : step;
    let list = [],
        i = lo;
    if (hi <= lo) return list;
    while (i < hi) {
        list.push(Number(i.toFixed(2)));
        i += step;
    }
    return list;
}
const roll = (lo, hi) => {
    if (lo == undefined) {
        return Math.random();
    }
    if (hi == undefined) {
        hi = lo;
        lo = 1;
    }
    return Math.floor(Math.random() * (1 + hi - lo)) + lo;
}


class Point {

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    add(v) {
        if (v instanceof Point) {
            return new Point(this.x + v.x, this.y + v.y);
        } else {
            return new Point(this.x + v, this.y + v);
        }
    }
    sub(v) {
        if (v instanceof Point) {
            return new Point(this.x - v.x, this.y - v.y);
        } else {
            return new Point(this.x - v, this.y - v);
        }
    }
    dot(v) {
        return this.x * v.x + this.y * v.y;
    }
    mult(v) {
        if (v instanceof Point) {
            return new Point(this.x * v.x, this.y * v.y);
        } else {
            return new Point(this.x * v, this.y * v);
        }
    }
    div(v) {
        if (v instanceof Point) {
            return new Point(this.x / v.x, this.y / v.y);
        } else {
            return new Point(this.x / v, this.y / v);
        }
    }
    unit() {
        return this.div(this.length());
    }
    norm() {
        return new Point(-this.y, this.x);
    }
}

const pt = (x, y) => new Point(x, y);

const triheight = (p, q, r) => {
    // p,q,r point
    // return { h:num,s:point }
    //                  r
    //               . /|
    //            .   / | h
    //       p ._____/  |
    //               q   s
    //
    // triangle defined by p,q,r
    // find the height h of the triangle, h is normal to p-q
    // and the point s (may be on segment p-q)
    let A = new Point(p.x, p.y),
        B = new Point(q.x, q.y),
        C = new Point(r.x, r.y);
    let v = B.sub(A),
        a = v.length(),
        b = C.sub(B).length(),
        c = A.sub(C).length();
    let area2 = Math.sqrt((a + b + c) * (a + b - c) * (a + c - b) * (b + c - a)) / 2; // twice the area
    let h = area2 / a; // area = (h*a)/2
    let n = v.norm().unit(); // normal vector for p-q
    let s = C.sub(n.mult(h)); // new point s = r - h*n
    return { h, s };
}

const circumcirc = (param) => {
    let { p0, p1, p2 } = param;
    // o:point, p:point, q:point
    // finds center for circumcircle given three points (triangle)
    let v = p1.sub(p0);
    let u = p2.sub(p1);
    let A = p0.add(v.div(2));
    let B = p1.add(u.div(2));
    v = v.unit().norm();
    u = u.unit().norm();
    let r = (-A.x * u.y + A.y * u.x + B.x * u.y - B.y * u.x) / (v.x * u.y - v.y * u.x);
    let center = new Point(A.x + r * v.x, A.y + r * v.y);
    let radius = p0.sub(center).length();
    return { center, r: radius };
}


const measure = (element) => {
    if (element === 0) return 0;
    const bbox = element.getBBox();
    return bbox;

}

const svgText = (x, y, s, id, z) => {
    const size = Object.assign({}, T.size, z);
    const txt = String(s);
    const transform = size.transform ?? '';
    const r = Number(size.rt || size.r || 1);
    const scale = r * 10 / size.s;
    const percent = clamp(100 * scale, 10, 900);
    const color = size.c || "black";
    const fz = `font-size="${percent.toFixed(2)}%"`;
    const sofs = size.o || 25;
    const dy = size.dy || -5;
    const dx = size.dx || 0;
    return `<text id="${id}" ${fz} x="${x}" y="${y}" fill="${color}"
         startOffset="${sofs}%" ${transform} >
        <tspan dy="${dy}" dx="${dx}">
        ${txt}
        </tspan>
        </text>`;
}

var gini = 0;

// translate a list of points by a vector/point p,
const translate = (pts,p) => {
     const q = {x:+fx(p.x,T.size),y:+fy(p.y,T.size)};
     const qs = pts.map(p => ( {x:p.x+q.x , y:p.y+q.y} ) );
     return qs;
};

// scale a list of points by a factor
const rescale = (pts, s) => {
    const qs = pts.map(p => ( {x:p.x*s , y:p.y*s}  ) )
    return qs;
}


export class T {
    static size = { w: 300, wy: 300, s: 8, sy: 8, c: "blue" };

    static aftereffects = { x: ["ole"], y: ["ole"] };
    static rubber = [];  // place latex over given positions
    static bezrend = null;

    static init = () => { T.rubber = []; T.aftereffects = { x: [], y: [] } };

    static renderAfter = (svgid) => {
        // a list of element-ids that need to
        // be shifted width of text to the left
        // used by axis to set label on xaxis
        this.aftereffects.x.forEach(e => {
            const elm = document.getElementById(e);
            const x = elm?.getAttribute("x") ?? 0;
            const bb = measure(elm);
            const w = bb?.width ?? 0;
            elm?.setAttribute("x", String(+x - w - 2));
        })
        const svg = $(svgid);
        this.rubber.forEach(e => {
            const { div, id } = e;
            const circ = $(id)
            const x = circ?.getAttribute("cx") ?? 0;
            const y = circ?.getAttribute("cy") ?? 0;
            const px = +x - (T.size.x ?? 0) * T.size.w / T.size.s;
            const py = +y + (T.size.y ?? 0) * T.size.wy / T.size.sy;
            svg.append(div);
            const h = div.getBoundingClientRect().height;
            div.style.top = (py -  2*h) + "px";
            div.style.left = px + "px"
        })
        if (this.bezrend) {
            init(this.bezrend);
        }
    }

    // creates a div containing latex and places over svg element
    static latex = (p, latex,s) => {
        const ff = String(Math.random()).slice(2,7);
        const size = Object.assign({}, T.size,s);
        const fill = size.c ?? "black";
        const r = size.r ?? 0.1;
        const idx = T.rubber.length;
        const id = 'latex' + idx + ff;
        const exp = String(latex).replaceAll("**", "^");  // reverse ^ => ** => ^
        const txt = makeLatex(exp, { mode: false, klass: "" });
        const div = create('div');
        div.innerHTML = txt;
        div.style.fontSize = r + "rem";
        div.style.color = fill;
        T.rubber.push({ div, id });
        return `<circle id="${id}" cx="${fx(p.x, size)}" cy="${fy(p.y, size)}" r="0.1" fill="#0000"/>`;
    }

    static origin = (x, y) => { T.size.x = x; T.size.y = y };

    static circle = (p, r, s) => {
        const size = Object.assign({}, T.size, s); // s || T.size;
        let color = size.c || "blue";
        return `<circle cx="${fx(p.x, size)}" cy="${fy(p.y, size)}" r="${fx(r, size)}" stroke="${color}"  stroke-width="${size.r}" fill="none"/>`;
    }

    static line = (p, q, s) => {
        //const size = s || T.size;
        const size = Object.assign({}, T.size, s);
        const color = size.c ?? "blue";
        const r = size.r ?? 1;
        return `<line x1="${fx(p.x, size)}" y1="${fy(p.y, size)}" stroke-width="${r}" x2="${fx(q.x, size)}" y2="${fy(q.y, size)}"   stroke="${color}" />`;
    }

    static markedline = (p, q, s) => {
        const cc = Object.assign({}, T.size, s);
        const color = cc.c ?? "blue";
        const direction = cc.direction ?? "end";
        const m = 12;
        const r = cc.r || 1;
        const mname = cc.marker ?? 'arrow';
        const marks = {
            arrow: `<path d="M -6 0 L 2 5 L -6 10 L -2 5 z" fill="${color}" />`,
            x: `<path d="M -5 1 L -4 0 L 0 4 L 4 0 L 5 1 L 1 5 L 5 9 L 4 10 
                                    L 0 6 L -4 10 L -5 9 L -1 5 z" fill="${color}" />`,
            end: `<path d="M -2 0 l 3 0 l 0 10 l -3 0 l 0 -1 l 2 0 l 0 -8 l -2 0 z" fill="${color}" />`
        }
        const mark = marks[mname] ?? marks.arrow;
        const id = mname + String(Math.random()).slice(2, 6)
        return `<defs>
        <marker
            id="${id}"
            refX="1"
            refY="5"
            viewBox="-6 0 10 10"
            markerUnits="strokeWidth"
            markerWidth="${m}"
            markerHeight="${m}"
            orient="auto-start-reverse">
            ${mark}
        </marker>
        </defs>
    <line x1="${fx(p.x, cc)}" y1="${fy(p.y, cc)}" stroke-width="${r}" x2="${fx(q.x, cc)}" y2="${fy(q.y, cc)}" 
    marker-${direction}="url(#${id})"  stroke="${color}" />`;
    }

    // simply alias for marked line
    static vec = (p, q, s) => {
        const cc = Object.assign({}, T.size, { r: 1 }, s);
        return markedline(p, q, cc)
    }

    // draws a quad bez  two points (start,end) and two controlls (points)
    static bez = (p, q, r, t, s) => {
        // const size = s || T.size;
        const size = Object.assign({}, T.size, s);
        const color = size.c || "blue";
        const strokeWidth = size.r || 1;
        const b = `<path d="M ${fx(p.x, size)} ${fy(p.y, size)} 
                    C ${fx(q.x, size)} ${fy(q.y, size)},
                      ${fx(r.x, size)} ${fy(r.y, size)},
                      ${fx(t.x, size)} ${fy(t.y, size)}"
                        stroke-width="${strokeWidth}"
                        stroke="${color}"  fill="none" />`;
        return b;
    }

    static bezz = (ps, s) => {
        const size = Object.assign({}, T.size, s);
        const color = size.c || "blue";
        const strokeWidth = size.r || 1;
        const path = svgPathFromBeziers(ps);
        const b = `<path d="${path}"
                        stroke-width="${strokeWidth}"
                        stroke="${color}"  fill="none" />`;
        return b;

    }

    // assumes  p point, sh a list of points to draw as bezier, s=size options etc

    static shapeCircles = (circleList,p,options) => {
        const a = circleList.map(c => {
            let {x,y,r,opt} = c;
            const z = options.z;
            x = x*z+p.x;
            y = y*z+p.y;
            const size = Object.assign(options, opt);
            if (size.c) {
                size.c = nakedColor(size.c);
            }
            return circle({x,y},r*z,size)
        }).join("");
        return a;
    }

    static shapeLines = (lineList,p,options) => {
        const adj = [p.x,p.y,p.x,p.y];
        const z = options.z || 1
        const a = lineList.map(c => {
            let [x1,y1,x2,y2] = c.map((e,i) => e*z + adj[i] );
            return line({x:x1,y:y1},{x:x2,y:y2},options)
        }).join("");
        return a;
    }

     static shapeVects = (lineList,p,options) => {
        const adj = [p.x,p.y,p.x,p.y];
        const cc = Object.assign({}, T.size, { r: 1 }, options);
        const z = options.z || 1
        const a = lineList.map(c => {
            let [x1,y1,x2,y2] = c.map((e,i) => e*z + adj[i] );
            return vec({x:x1,y:y1},{x:x2,y:y2},cc);
        }).join("");
        return a;
    }

    static shapeSyms = (symlist,p,options) => {
        const z = options.z || 1
        const cc = Object.assign({}, T.size, { r: 1 }, options);
        const a = symlist.map(c => {
            let [x,y,t] = c;
            const id = "shp" + String(Math.random()).slice(2, 8);
            return svgText(fx(x*z+p.x,T.size),fy(y*z+p.y,T.size), t, id, cc);
        }).join("");
        return a;
    }

    static shapeRect = (rectList, p, options) => {
        const size = Object.assign({}, T.size, options);
        const z = options.z || 1
        const sw = size.r || 1;
        const a = rectList.map(rect => {
            let { x, y, w, h, r, opt } = rect;
            const c = nakedColor(opt.c) || size.c || "blue";
            x = x * z + p.x;
            y = y * z + p.y;
            const points = [{ x, y }, { x: x + w * z, y }, { x: x + w * z, y: y + h * z }, { x, y: y + h * z }]
                .map(e => fx(e.x, size) + "," + fy(e.y, size)).join(" ");
            const trans = r ? `transform="rotate(${floor(90 * r)} ${fx(x,size)} ${fy(y,size)})"` : "";
            return `<polygon points="${points}" ${trans} stroke-width="${sw}" stroke="${c}" fill="none" />`;
        }).join("");
        return a;
    }

    static shape = (...s) => {
        const p = s.find(e => e instanceof Point) || pt(0, 0);
        const sh = s.find(e => e.shape) || {};
        const options = s.find(e => e.z) || { z: 10 };
        const siz = options.z || 1;
        const size = Object.assign({}, T.size, options);
        let pz = [];
        if (sh.bez) {
            //const qa = sh.bez.map(lis => rescale(lis, siz));
            //const qz = qa.map(lis => translate(lis, p));
            
            pz = sh.bez.map(q => {
                const qa = q.map(e =>  ( { x:+fx(p.x+e.x*siz,size), y:+fy(p.y+e.y*siz,size) }) );
                const bzp = fitBezierPath(qa);
                
                const pth = bezz(bzp, options);
                return pth;
            });
        }
        if (sh.syms) {
            pz.push(this.shapeSyms(sh.syms, p, options));
        }
        if (sh.circles) {
            pz.push(this.shapeCircles(sh.circles, p, options));
        }
        if (sh.lines) {
            pz.push(this.shapeLines(sh.lines, p, options));
        }
        if (sh.vects) {
            pz.push(this.shapeVects(sh.vects, p, options));
        }
         if (sh.sqrs) {
            pz.push(this.shapeRect(sh.sqrs, p, options));
        }
        return pz.join(" ");
    }

    static draw = (base64, s) => {
        const size = Object.assign({}, T.size, s);
        const svg = size.id;
        T.bezrend = svg;
        return '';
        /*
        const color = size.c || "blue";
        const strokeWidth = size.r || 1;
        const curves = decodeBeziers(base64);
        if (!curves.length) return '';
        let d = `M ${fx(curves[0].p0.x, size)} ${fy(curves[0].p0.y, size)}`;
        for (const c of curves)
            d += ` C ${fx(c.c1.x, size)} ${fy(c.c1.y, size)}, ${fx(c.c2.x, size)} ${fy(c.c2.y, size)}, ${fx(c.p3.x, size)} ${fy(c.p3.y, size)}`;
        return '<path d="' + d + `" stroke-width="${strokeWidth}" stroke="${color}"  fill="none" />`;
        */
    }




    /**
     * Given an array of points, return an SVG path (cubic Beziers) that
     * interpolates all points smoothly.
     * 
     * points: [{x, y}, ...]  OR  [[x,y], ...]
     * returns: string for `d` attribute of <path>
     * @param {any[]} points
     */
    static bezpath = (points, s) => {
        const size = Object.assign({}, T.size, s);
        const color = size.c || "blue";
        const strokeWidth = size.r || 1;
        if (!points || points.length === 0) return '';
        // normalize input to objects {x,y}
        const pts = points.map(p => Array.isArray(p) ? { x: p[0], y: p[1] } : { x: p.x, y: p.y });
        const n = pts.length - 1;
        if (n === 0) {
            return `M ${fx(pts[0].x, size)} ${fy(pts[0].y, size)}`;
        }
        if (n === 1) {
            // Straight single cubic: control points one-third and two-thirds along line
            const c1 = { x: (2 * pts[0].x + pts[1].x) / 3, y: (2 * pts[0].y + pts[1].y) / 3 };
            const c2 = { x: (2 * pts[1].x + pts[0].x) / 3, y: (2 * pts[1].y + pts[0].y) / 3 };
            return `M ${pts[0].x} ${pts[0].y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${pts[1].x} ${pts[1].y}`;
        }

        // Solve for first control points (array of points)
        // Using the standard tridiagonal solver approach (see "A Primer on Bézier Curves")
        const rhsX = new Array(n);
        const rhsY = new Array(n);

        // Set up right-hand side
        rhsX[0] = pts[0].x + 2 * pts[1].x;
        rhsY[0] = pts[0].y + 2 * pts[1].y;
        for (let i = 1; i < n - 1; i++) {
            rhsX[i] = 4 * pts[i].x + 2 * pts[i + 1].x;
            rhsY[i] = 4 * pts[i].y + 2 * pts[i + 1].y;
        }
        rhsX[n - 1] = (8 * pts[n - 1].x + pts[n].x) / 2;
        rhsY[n - 1] = (8 * pts[n - 1].y + pts[n].y) / 2;

        // Solve tridiagonal system
        /**
           * @param {any[]} rhs
           */
        function solveTridiagonal(rhs) {
            const x = new Array(n);
            const tmp = new Array(n);
            let b = 2.0;
            x[0] = rhs[0] / b;
            // forward sweep
            for (let i = 1; i < n; i++) {
                tmp[i] = 1.0 / b;
                b = (i < n - 1 ? 4.0 : 3.5) - tmp[i];
                x[i] = (rhs[i] - x[i - 1]) / b;
            }
            // back substitution
            for (let i = n - 2; i >= 0; --i) {
                x[i] -= tmp[i + 1] * x[i + 1];
            }
            return x;
        }

        const xFirst = solveTridiagonal(rhsX);
        const yFirst = solveTridiagonal(rhsY);

        // Build control points arrays
        const firstControl = new Array(n);
        const secondControl = new Array(n);

        for (let i = 0; i < n; i++) {
            firstControl[i] = { x: xFirst[i], y: yFirst[i] };
            if (i < n - 1) {
                secondControl[i] = {
                    x: 2 * pts[i + 1].x - xFirst[i + 1],
                    y: 2 * pts[i + 1].y - yFirst[i + 1]
                };
            } else {
                secondControl[i] = {
                    x: (xFirst[n - 1] + pts[n].x) / 2,
                    y: (yFirst[n - 1] + pts[n].y) / 2
                };
            }
        }

        // Build SVG path string
        let d = `M ${fx(pts[0].x, size)} ${fy(pts[0].y, size)}`;
        for (let i = 0; i < n; i++) {
            const c1 = firstControl[i];
            const c2 = secondControl[i];
            const p = pts[i + 1];
            d += ` C ${fx(c1.x, size)} ${fy(c1.y, size)}, ${fx(c2.x, size)} ${fy(c2.y, size)}, ${fx(p.x, size)} ${fy(p.y, size)}`;
        }
        return `<path d="${d}"  stroke-width="${strokeWidth}"
                        stroke="${color}"  fill="none"  />`;
    }

    // assumes a trig xxx 12
    // list colors with name - color key for multiple graphs
    static legend = (...args) => {
        const [s = "fghijklmn", cc = { r: 4, rt: 0.7 }] = args;
        const size = Object.assign({ rt: 1 }, T.size, cc);
        const names = (s ? s : "fghijklmn").split("");
        const n = names.length;
        return names.map((e, i) => {
            const p = pt(1, n - i);
            const q = pt(2, n - i);
            const d = pt(1, -0.5)
            const r = q.add(d)
            size.c = graphcolor[i % graphcolor.length];
            return line(p, q, size) + text(r, e, size);
        }).join("");
    }


    // create a label connected to a function
    // labels placed in a list and adjusted
    static label = (f, a, cc) => {
        const size = Object.assign({ rt: 1 }, T.size, cc);
        const p = pt(a, f(a));
        return text(p, f.name, size);
    }

    static plots = (...s) => {
        const xyfus = s.filter(e => typeof e === "function" && e(1) instanceof Point);
        const yfus = s.filter(e => typeof e === "function" && Number.isFinite(e(1)));
        const points = s.filter(e => Array.isArray(e) && e[0] instanceof Point);
        const ranges = s.filter(e => Array.isArray(e) && Number.isFinite(e[0]));
        const options = s.filter(e => !Array.isArray(e) && typeof e === "object");
        const cc = options.length ? options[0] : { r: 0.6 };
        const size = Object.assign({}, { x: 0, y: 0 }, T.size, { r: 0.6 }, cc);
        const rng0 = ranges.length ? ranges[0] : null;
        const rng = rng0 ? rng0 : range(+size.x, +size.x + +size.s, size.s / size.w);
        const fus = xyfus.concat(yfus.map(e => (t => pt(t, e(t)))));
        const bad = p => Number.isNaN(p.x + p.y)
        const m = size.s / size.w;
        const seg = (p, q, s) => {
            if (bad(p) || bad(q)) return '';
            return line(p, q, s);
        }
        let q = 0; let r = 0; let p = null;
        const pline = (fxy, s, t, cc) => {
            r = p; p = fxy(t);
            q = r ?? p;
            if (Math.abs(p.sub(q).length()) < m) {
                // dont draw very short lines
                p = q;
                return s
            };
            return s + seg(p, q, cc)
        }
        const pointline = points.map((s, i) => {
            cc.c = graphcolor[i % graphcolor.length];
            r = null;
            return s.map(p => {
                q = r ?? p;
                if (Math.abs(p.sub(q).length()) < m) {
                    // dont draw very short lines
                    r = p;
                    return "";
                };
                r = p;
                return seg(p, q, cc)
            }).join("")
        }).join("");
        return fus.map((fxy, i) => {
            q = 0; r = 0; p = null; size.c = graphcolor[i % graphcolor.length];
            return rng.reduce((s, t) => pline(fxy, s, t, size), "");
        }).join('') + pointline;

    }

    static plot = (fxy0, rng0, cc) => {
        let c = "blue";
        if (cc?.c === undefined) {
            c = graphcolor[gini];
            gini = (gini + 1) % graphcolor.length;
        }
        const size = Object.assign({}, { x: 0, y: 0 }, T.size, { c, r: 0.6 }, cc);
        const fxy = fxy0(1) instanceof Point ? fxy0 : (t => pt(t, fxy0(t)));
        // if fxy0 does not return point, assume regular func of t
        const rng = rng0 ? rng0 : range(+size.x, +size.x + +size.s, size.s / size.w);
        const bad = p => Number.isNaN(p.x + p.y)
        const m = size.s / size.w;
        const seg = (p, q, s) => {
            if (bad(p) || bad(q)) return '';
            return line(p, q, s);
        }
        let q = 0; let r = 0; let p = null;
        const pline = (fxy, s, t, cc) => {
            r = p; p = fxy(t);
            q = r ?? p;
            if (Math.abs(p.sub(q).length()) < m) {
                // dont draw very short lines
                p = q;
                return s
            };
            return s + seg(p, q, cc)
        }
        let marker = '';
        if (size.marker) {
            const direction = size.direction ?? "end";
            const [a, b] = (direction === "end") ? rng.slice(-2) : rng.slice(0, 2);
            const p = fxy(a); const q = fxy(b);
            marker = T.markedline(p, q, size);
        }
        return rng.reduce((s, t) => pline(fxy, s, t, size), "") + marker;
    }

    static grid = (...ps) => {
        let dx, dy, cc, b, c;
        [dx, b, c] = ps;
        if (Number.isFinite(+b)) {
            dy = +b;
        }
        if (c === undefined) cc = b;
        const size = Object.assign({ x: 0, y: 0 }, T.size, { c: "#aaa", r: 0.3 }, cc);
        const x = +size.x
        const y = +size.y
        const wx = +size.s
        const wy = +size.sy
        dx = dx ?? 0.1;
        dy = dy ?? dx;
        const xr = range(floor(x / dx) * dx, floor(x + wx + 1), dx)
        const yr = range(floor(y / dy) * dy, floor(wy + y + 1), dy)
        const gy = b => b.reduce((s, v) => { const p = pt(x, v); const q = pt(x + wx, v); return s + line(p, q, size) }, "")
        const gx = b => b.reduce((s, v) => { const p = pt(v, y); const q = pt(v, wy + y); return s + line(p, q, size) }, "")
        return gx(xr) + gy(yr)
    }

    static yaxis = (d, cc) => {
        if (cc == undefined) {
            cc = { r: 0.6, c: "gray" }
        }
        const size = Object.assign({ x: 0, y: 0 }, T.size, cc);
        const y = +size.y
        const wmin = Math.min(+size.sy,+size.s);
        const wy = +size.sy;
        const color = size.c ?? "gray";
        const xbase = size.xbase ?? 0;
        const ybase = size.ybase ?? 0;
        let m = Math.min(0.75, 40 * size.sy / 450 * size.wy / 450);  // font size
        m = size.rt ? size.rt : m;
        const oy = 0.1 * wmin / 6;
        let names = '';
        if (size.namey) {
            const name = size.namey;
            const id = "yax" + String(Math.random()).slice(2, 8);
            const myz = Object.assign({ id, o: "0" }, size);
            const p = pt(-20 * size.s / size.w, +y + +size.sy - 10 * size.sy / size.wy);
            const q = pt(-20 * size.s / size.w, +y - 10 * size.sy / size.wy);
            names += text(p, q, name, myz);
            // T.aftereffects.y.push(id);
        }
        const mark = cc.marker;
        const mlin = mark ? markedline : line;
        const yis = () => { const p = pt(ybase, y); const q = pt(ybase, y + wy); return mlin(p, q, cc) }
        const nums = (p, d, w) => range(floor(p / d) * d, floor(p + w + 1), d)
        const ynum = (d, r = 0.25) => {
            let yn = nums(y, d, wy);
            if (xbase == 0) yn = yn.filter(x => x != 0);  // avoid double (0,0)
            return yn.reduce((s, v) => {
                const p = pt(ybase + oy / 2, v); const q = pt(ybase - oy / 2, v);
                return s + text(p, null, sp(v), { r, o: "1", dy: "3", c: color }) + line(p, q, cc)
            }, "");
        }
        return yis() + ynum(d, m) + names;
    }


    static xaxis = (d, cc) => {
        if (cc == undefined) {
            cc = { r: 0.8, c: "gray" }
        }
        const size = Object.assign({ x: 0, y: 0 }, T.size, cc);
        const x = +size.x
        const w = +size.s
        const wmin = Math.min(+size.sy,+size.s);
        const wy = +size.sy
        const color = size.c ?? "gray";
        const xbase = size.xbase ?? 0;
        let mm = Math.min(0.75, 40 * Math.min(size.s / 450 * size.w / 450, size.sy / 450 * size.wy / 450));  // font size
        const m = size.rt ? size.rt : 0.75;
        const oy = 0.1 * wy / 6;
        let names = '';
        if (size.namex) {
            const name = size.namex;
            const px = +size.w + x * +size.w / (+size.s); const py = +size.wy - 2;
            const id = "xax" + String(Math.random()).slice(2, 8);
            names += svgText(px, py, name, id, size);
            T.aftereffects.x.push(id);
        }
        const mark = cc.marker;
        const mlin = mark ? markedline : line;
        const xis = () => { const p = pt(x, xbase); const q = pt(x + w, xbase); return mlin(p, q, cc) };
        const nums = (p, d, w) => range(floor(p / d) * d, floor(p + w + 1), d)
        const xnum = (d, r = 0.25) => nums(x, d, w).reduce((s, v) => {
            const p = pt(v, xbase); const q = pt(v, xbase - oy);
            return s + text(p, null, sp(v), { r, o: "1", dy: "16", c: color }) + line(p, q, cc)
        }, "");
        return xis() + xnum(d, m) + names;
    }

    static axis = (d, cc) => {
        return this.xaxis(d, cc) + this.yaxis(d, cc);
    }

    static dot = (p, s) => {
        // const size = s || T.size;
        const size = Object.assign({}, T.size, s);
        let color = s?.c || "blue";  // T.size.r may be smallish
        const r = s?.r || 3;
        return `<circle cx="${fx(p.x, size)}" cy="${fy(p.y, size)}" r="${r}" fill="${color}"/>`;
    }

    // many dots
    static dots = (...s) => {
        const dotlist = s.filter(e => e.x !== undefined);
        const [s0] = s.slice(-1);
        const ss = dotlist.length === s.length ? {} : s0;
        const size = Object.assign({}, T.size, ss);
        // @ts-ignore
        let color = ss?.c || "blue";
        // @ts-ignore
        let r = ss?.r || "3";
        return s.map(p => `<circle cx="${fx(p.x, size)}" cy="${fy(p.y, size)}" r="${r}" fill="${color}"/>`).join("");
    }

    static text = (p, q, s, z) => {
        // const size = z || T.size;
        const as = typeof s === "object" ? s : z;
        const size = Object.assign({}, T.size, as, z);
        const txt = typeof s === "string" ? String(s) : String(q);
        let now = String(Math.random()).slice(2, 10);
        if (typeof q === "string" || q === null || q === undefined) {
            const l = Math.max(1, Number((txt.length / 2).toFixed(2)));
            let v = pt(l, 0); // direction of path for text
            q = p.add(v);
        }
        const path = `M ${fx(p.x, size)} ${fy(p.y, size)} L ${fx(q.x, size)} ${fy(q.y, size)}`;
        const r = Number(size.rt || size.r || 1);
        const id = size.id ? `id="${size.id}"` : '';
        const scale = r * 10 / size.s;
        const percent = clamp(100 * scale, 10, 900);
        const color = size.c || "black";
        const fz = `font-size="${percent}%"`;
        const sofs = size.o ?? 1;
        const dy = size.dy ?? -5;
        const dx = size.dx ?? 0;
        return `<path id="mm${now}" d="${path}"  stroke-opacity="0.0" />
        <text ${fz} ${id}><textPath x="${p.x}" y="${p.y}" fill="${color}"
         startOffset="${sofs}%" href="#mm${now}">
        <tspan dy="${dy}" dx="${dx}">
        ${txt}
        </tspan>
        </textpath></text>`;
    }

    static square = (p, q, a, b, z) => {
        //      r_____s
        //      |     |
        //      |     |b
        //      |_____|
        //     p   a   t
        // const size = z || T.size;
        const size = Object.assign({}, T.size, z);
        const color = size.c || "blue";
        const strokeWidth = size.r || 1;
        let t, r, s;
        let v = new Point(1, 0); // use point as vector
        if (!(p?.norm && q?.norm && a?.norm && b?.norm)) {
            if (q != null) {
                // need to create unit vector (p,q)
                v = q.sub(p).unit();
            }
            const n = v.norm();
            t = p.add(v.mult(a));
            r = p.add(n.mult(b));
            s = r.add(v.mult(a));
        } else {
            [t, r, s] = [q, a, b];
        }
        const poly = [p, t, s, r].map(e => fx(e.x, size) + "," + fy(e.y, size)).join(" ");
        return `<polygon points="${poly}" stroke-width="${strokeWidth}" stroke="${color}" fill="none" />`;
    }

    static tri2svg = p => {
        const scale1 = 10 / (T.size.s || 8); // font scale for scale (s:10 = normal)
        // let scale2 = p.size.w / 400;  // font scale for size (w:400 = normal)
        const percent = clamp(100 * scale1, 50, 100);
        const color = p.size?.c || "blue";
        const r = p.size?.r || "1";
        const err = p.error || "";
        const fz = `font-size="${percent}%"`;
        let s = `<text fill="red" x ="30" y="30" >Invalid triangle ${err}</text>`;
        if (p.valid) {
            s = "";
            if (p.polygon) {
                s += `<polygon points="${p.polygon}" stroke="${color}" fill="none" stroke-width="${r}"  />`;
            }
            if (p.ABC) {
                s += p.ABC.map(e => e.x ? `<text ${fz} x="${e.x}" y="${e.y}">${e.txt}</text>` : '').join("");
            }
            if (p.abc) {
                s += p.abc.map(e => e.x ? `<text ${fz} x="${e.x}" y="${e.y}" text-anchor="${e.anchor}">${e.txt}</text>` : '').join("");
            }
            if (p.vert) {
                s += p.vert.map(e => e.x ? `<circle cx="${e.x}" cy="${e.y}" r="3" fill="${color}" />` : '').join("");
            }
            if (p.vABC) {
                // the path must be unique - or all angles will follow same paths 0,1,2
                let now = String(Math.random()).substr(2, 6);
                s += p.vABC.map((e, i) => e.p ? `<path id="mm${i + now}" d="${e.p}" />
            <text ${fz}><textPath x="${e.x}" y="${e.y}"
             startOffset="25%" href="#mm${i + now}">
            <tspan dy="5" dx="5">
            ${e.txt}
            </tspan>
            </textpath></text>` : '').join("");
            }
        }
        return s;
    }

    static tri = param => {
        let { a = 0, b = 0, c = 0, A = 0, B = 0, C = 0, } = param;
        let sides = [a, b, c].filter(e => e !== 0);
        let angles = [A, B, C].filter(e => e > 0);
        if (sides.length === 3) {
            // three sides is sufficient - ignore any angles
            //return qz.triangle(p,q,a,b,c,"","","",0);
            let sorted = [a, b, c].map(e => Math.abs(e)).sort((x, y) => x - y);
            let [u, v, w] = sorted;
            if (w > u + v) return { valid: false, error: "sides too short" }; // can't construct
            return T.trig(param);
        }
        if (angles.length === 2) {
            // calculate missing angle
            let third = 180 - (A + B + C);
            A = A || third;
            B = B || third;
            C = C || third;
            angles = [A, B, C];
        }
        if (angles.length === 3 && sides.length > 0) {
            // three angles and a side is sufficient
            let sum = A + B + C;
            if (Math.abs(sum - 180) > 100 * Number.EPSILON) return { valid: false }; // AngleSum must be 180
            // calculate missing sides if any
            let sinus = [a, b, c].map((e, i) => e / SIN(angles[i])).filter(e => e !== 0).pop();
            // @ts-ignore
            sides = [a, b, c].map((e, i) => e ? e : sinus * SIN(angles[i]));
            param.a = sides[0];
            param.b = sides[1];
            param.c = sides[2];
            return T.trig(param);
        }
        if (angles.length === 1 && sides.length === 2) {
            // all good if angle between sides
            let goodSides = [a, b, c].map(e => e !== 0); // [true,true,false] variant of
            let goodAngles = [A, B, C].map(e => e !== 0); // [true,false,false] variant of
            // they should disagree on all points
            let good = goodSides.reduce((s, v, i) => s && v !== goodAngles[i], true); // true if sides=[1,1,0] and angles = [0,0,1]
            if (good) {
                let angle = A + B + C; // as two are zero
                let [u, v] = sides; // the two given sides
                let aa = Math.sqrt(u * u + v * v - 2 * u * v * COS(angle));
                sides = [a, b, c].map(e => e ? e : aa); // one is zero - replace with calculated value
                param.a = sides[0];
                param.b = sides[1];
                param.c = sides[2];
                return T.trig(param);
            }
            // check if angle is opposite longest of two sides
            let angSide = [[a, A], [b, B], [c, C]].sort((x, y) => y[0] - x[0]);
            if (angSide[0][1] !== 0) {
                // two sides and angle opposite longest side
                // find missing side
                angles = [A, B, C];
                sides = [a, b, c];
                let idx = angles.map((e, i) => i).filter(i => angles[i])[0]; // idx of angle != 0
                let sinus = sides[idx] / SIN(angles[idx]);
                let sunis = SIN(angles[idx]) / sides[idx]; // reciproc
                angles = [A, B, C].map((e, i) => e ? e : ASIN(sunis * sides[i])); // found one more angle
                let missing = 180 - angles.reduce((s, v) => s + v, 0);
                angles = angles.map(e => e ? e : missing);
                sides = [a, b, c].map((e, i) => e ? e : sinus * SIN(angles[i])); // now all sides
                param.a = sides[0];
                param.b = sides[1];
                param.c = sides[2];
                return T.trig(param);
            }
        }
        return { valid: false, error: "insufficient" };
    }

    static trig = param => {
        let {
            a = 0,
            b = 0,
            c = 0,
            abc = "", // text on edges
            ABC = "", // text on vertices
            vABC = "", // "abc" show angles
            vert = "", // "abc" show dot on vertice
            p = { x: 1, y: 2 },
            q,
            size = T.size
        } = param;

        size = Object.assign({}, T.size, size);

        let fxz = x => fx(x, size);
        let fyz = x => fy(x, size);

        let V = new Point(1, 0); // unit vector along x-axis
        let ret = {
            valid: true,
            polygon: "",
            points: {},
            scaled: [{}],
            area: 0,
            radius: 1,
            center: V,
            ABC: [{}],
            vert: [{}],
            vABC: [{}],
            angles: [{}],
            abc: [{}],
            size,
            circum: V,
            cr: 0
        }; // return value
        p = new Point(p.x, p.y);
        let p0 = new Point(p.x, p.y);
        let p1 = new Point(p.x, p.y);
        let p2 = new Point(p.x, p.y);
        let v = new Point(1, 0); // use point as vector
        if (q != null) {
            // need to create unit vector (p,q)
            v = new Point(q.x - p.x, q.y - p.y).unit();
        }
        let n = v.norm(); // normal vector for v
        p1 = p1.add(v.mult(a));
        let rx = (a * a + b * b - c * c) / (2 * a);
        p2 = p2.add(v.mult(a - rx));
        let ry = Math.sqrt(b * b - rx * rx);
        p2 = p2.add(n.mult(ry));
        ret.polygon = [p0, p1, p2].map(e => fxz(e.x) + "," + fyz(e.y)).join(" ");
        ret.points = { p0, p1, p2 };
        ret.scaled = [p0, p1, p2].map(e => [fxz(e.x), fyz(e.y)]); // scaled points
        let ciru = circumcirc(ret.points);
        ret.cr = ciru.r;
        ret.circum = ciru.center;
        let ab = p1.sub(p0);
        let bc = p2.sub(p1);
        let ca = p0.sub(p2);
        a = Math.abs(a);
        b = Math.abs(b);
        c = Math.abs(c);
        ret.area = Math.sqrt((a + b + c) * (a + b - c) * (a + c - b) * (b + c - a)) / 4;
        let s = (a + b + c) / 2;
        let r = ret.area / s;
        let e = (b + a - c) / 2;
        let t = new Point(p1.x - e * v.x, p1.y - e * v.y); // tangent for incircle on segment-a
        let CO = new Point(t.x + n.x * r, t.y + n.y * r); // center of incircle
        let pa, dd; // dd is delta to adjust for text being placed by lower left corner
        let Ca = CO.sub(p0).unit(); // vectors towards triangle center
        let Cb = CO.sub(p1).unit();
        let Cc = CO.sub(p2).unit();
        let Px;
        let adj = new Point(1, 1).unit();
        let jad = new Point(-1, -1).unit(); // opposite of adj
        ret.center = CO;
        ret.radius = r;
        let factor = 150 / size.w;
        if (ABC) {
            // supplied text for corner points
            // text pushed away from triangle center
            ret.ABC = [];
            Px = ABC.split(",");
            dd = Math.max(0.3, factor * Ca.dot(adj));
            pa = p0.sub(Ca.mult(dd));
            ret.ABC.push({ x: fxz(pa.x), y: fyz(pa.y), txt: Px[0] });
            dd = Math.max(0.3, factor * Cb.dot(adj));
            pa = p1.sub(Cb.mult(dd));
            ret.ABC.push({ x: fxz(pa.x), y: fyz(pa.y), txt: Px[1] });
            dd = Math.max(0.3, factor * Cc.dot(adj));
            pa = p2.sub(Cc.mult(dd));
            ret.ABC.push({ x: fxz(pa.x), y: fyz(pa.y), txt: Px[2] });
        }

        if (vert) {
            // vert = "abc" flag for placing point on vertice
            ret.vert = [];
            if (vert.includes("a")) {
                ret.vert.push({ x: fxz(p0.x), y: fyz(p0.y) });
            }
            if (vert.includes("b")) {
                ret.vert.push({ x: fxz(p1.x), y: fyz(p1.y) });
            }
            if (vert.includes("c")) {
                ret.vert.push({ x: fxz(p2.x), y: fyz(p2.y) });
            }
        }

        if (vABC) {
            // show angles inside triangle
            ret.vABC = [];
            let Acos = 180 - Math.acos(ab.dot(ca) / (a * c)) * 180 / Math.PI;
            let Bcos = 180 - Math.acos(ab.dot(bc) / (a * b)) * 180 / Math.PI;
            let Ccos = 180 - Math.acos(bc.dot(ca) / (c * b)) * 180 / Math.PI;
            ret.angles = [Acos, Bcos, Ccos];
            let ag = p0.add(ab.unit().sub(ca.unit()).mult(1)); // displace angle text from p0
            let bg = p1.add(bc.unit().sub(ab.unit()).mult(1)); // change mult(1) to push further
            let cg = p2.add(ca.unit().sub(bc.unit()).mult(1)); //

            let w = new Point(1, -1);

            if (vABC.includes("a")) {
                let dot = ab.dot(w);
                let start = p0;
                let stop = ag;
                if (dot < 0) {
                    start = ag;
                    stop = p0;
                }
                let pathA = `M ${fxz(start.x)} ${fyz(start.y)} L ${fxz(stop.x)} ${fyz(stop.y)}`;
                ret.vABC.push({
                    x: fxz(ag.x),
                    y: fyz(ag.y),
                    txt: Acos.toFixed(1),
                    p: pathA
                });
            }
            if (vABC.includes("b")) {
                let dot = bc.dot(w);
                let start = p1;
                let stop = bg;
                if (dot < 0) {
                    start = bg;
                    stop = p1;
                }
                let pathB = `M ${fxz(start.x)} ${fyz(start.y)} L ${fxz(stop.x)} ${fyz(stop.y)}`;
                //let pathB = `M ${fx(p1.x)} ${fyz(p1.y)} L ${fx(bg.x)} ${fyz(bg.y)}`;
                ret.vABC.push({
                    x: fxz(bg.x),
                    y: fyz(bg.y),
                    txt: Bcos.toFixed(1),
                    p: pathB
                });
            }
            if (vABC.includes("c")) {
                let dot = ca.dot(V);
                let start = p2;
                let stop = cg;
                if (dot < 0) {
                    start = cg;
                    stop = p2;
                }
                let pathC = `M ${fxz(start.x)} ${fyz(start.y)} L ${fxz(stop.x)} ${fyz(stop.y)}`;
                //let pathC = `M ${fxz(p2.x)} ${fyz(p2.y)} L ${fxz(cg.x)} ${fyz(cg.y)}`;
                ret.vABC.push({
                    x: fxz(cg.x),
                    y: fyz(cg.y),
                    txt: Ccos.toFixed(1),
                    p: pathC
                });
            }
        }

        if (abc) {
            ret.abc = [];
            let sides = [a, b, c];

            // place side text using text - not textpath - needed if printing
            let Sx = abc.split(",").map((e, i) => e === "$" ? nice(sides[i]) : e);
            ret.abc.push(sideText(ab, Cc, p1, Sx[0], a));
            ret.abc.push(sideText(bc, Ca, p2, Sx[1], b));
            ret.abc.push(sideText(ca, Cb, p0, Sx[2], c));

            function sideText(vec1, vec2, pnt, txt, side) {
                let dot; // (1,0) dot Side
                let anchor; // start|middle|end
                dot = vec1.unit().norm().dot(V); // ~ 0 means nearly horizontal
                anchor = dot < 0 ? "start" : "end";
                anchor = Math.abs(dot) < 0.1 ? "middle" : anchor;
                dd = Math.max(0.5, factor * vec2.dot(jad));
                if (anchor === "middle") {
                    pa = pnt.sub(vec1.unit().mult(side / 2)).add(vec2.mult(.7));
                } else {
                    pa = pnt.sub(vec1.unit().mult(side / 2.2)).add(vec2.mult(dd));
                }
                return { x: fxz(pa.x), y: fyz(pa.y), txt: txt, anchor };
            }
        }
        return ret;
    }
}


const { sqrt, sin, cos, tan, asin, atan2, acos, atan, PI: π, floor,
    round, exp, sinh, cosh, tanh, asinh, acosh, atanh, pow,
    log: ln, log10: lg, log, abs, max, min, random: rnd
} = Math;


const { circle, line, plot, bez, bezz, square, text, dot, dots, tri2svg, tri, plots,
    legend, label, bezpath, draw, latex, shape,
    origin, size, grid, axis, xaxis, yaxis, markedline, vec } = T;

const mathEnvironment = {
    sinh, cosh, exp, tanh, asinh, acosh, atanh, pow, bezpath, draw, latex, curry,
    decodeList, fitBezierPath, svgPathFromBeziers, shape,
    SIN, COS, ASIN, Point, nice, fx, fy, clamp, triheight, circumcirc, 
    plot, pt, grid, axis, xaxis, yaxis, plots, legend, label, bezz,
    circle, line, bez, square, text, dot, dots, tri2svg, tri, origin, size, markedline, vec,
    abs, max, min, rnd, roll, shuffle, range, sqrt, ln, lg, log, floor, round,
    sin, cos, tan, asin, atan2, acos, atan, π,
}

export const eva = (exp0, variables) => {
    const exp = exp0.replaceAll("^", "**");
    let v = "";
    const [lhs, value] = exp.split("=");
    try {
        function ctxEval(exp, ctx) { // evaluates expression in the scope of context object
            return (new Function('expression', 'context', 'with(context){return eval(expression)}'))(exp, ctx);
        }
        v = ctxEval(exp, variables);
    } catch (error) {
        console.log(error, exp, variables);
    }
    //if (((value && value.charAt(0) === '>') || !value) && v && v.charAt(0) === '<') {
    if (((value && lhs.length > 3) || !value) && v && v.charAt && v.charAt(0) === '<') {
        // not (p=xxx, p1=xxx  p12=xxx): assume we have svg fragment
        variables.SVG += v;
    }
    return v;
}

const nakedColor = txt => colornames[txt] ?? txt



/**
 * Parses code for constructs
 * Strips spaces around =
 * p=(3,4)          => p=new Point(3,4)
 * q=p+[1,0]        => q=p.add(1,0)
 * @param {string} kode 
 */
export const parse = (kode, size = "{w:300,s:8}") => kode
    .replace(/\s*=\s*/gm, '=') // p = xx => p=xx
    .replace(/^\s+/gm, '')   // leading space
    .replace(/\s+$/gm, '')   // trailing space
    .replace(/^firkant/gm, 'square')
    .replace(/^linje/gm, 'line')
    .replace(/^tekst/gm, 'text')
    .replace(/^sirkel/gm, 'circle')
    .replace(/^trekant/gm, 'triangle')
    .replace(/({[^}]*?)c:([a-z]+)([,}])/gm, (_, p, u,v) => `${p}c:"${nakedColor(u)}"${v}`)
    .replace(/([ =(])func\((.+?)\)$/gm, (_, p, u) => `${p} (t => {x=t; return ${u}} )`)
    .replace(/([a-z]):=(.+?)$/gm, (_, p, u) => `${p}= t => {x=t; return ${u}} `)
    .replace(/([ =(])xy\((.+?),(.+?)\)$/gm, (_, p, u, v) => `${p} (t => pt(${u},${v}) )`)
    .replace(/^triangle\((.+),(.+),(.+)\)$/gm, (_, p, q, r) => `line(${p},${q})\nline(${q},${r})\nline(${p},${r})`)
    .replace(/^([a-zA-Z])=\((.+),(.+)\)$/gm, (_, p, u, v) => `${p}=new Point(${u},${v})`)
    .replace(/^([a-zA-Z])=([a-zA-Z])\s*\+\s*\[(.+),(.+)\]$/gm, (_, p, q, u, v) => `${p}=${q}.add(new Point(${u},${v}))`)
    .replace(/^([a-zA-Z])=([a-zA-Z])\s*\-\s*\[(.+),(.+)\]$/gm, (_, p, q, u, v) => `${p}=${q}.sub(new Point(${u},${v}))`)
    .replace(/^dot\(([-+0-9.]+),([-+0-9.]+)\)$/gm, (_, u, v) => `dot(new Point(${u},${v}))`)    // dot(1,2)
    .replace(/^square\(([^,)]+),([^,)]+),([^,)]+)\)$/gm, (_, p, w, h) => `square(${p},null,${w},${h})`)
    .replace(/^text\(([^,)]+),([^,)]+)\)$/gm, (_, p, s) => `text(${p},null,${s})`)
    .replace(/^text\(([^,)]+),([^,)]+),([^,)]+)\)$/gm, (_, p, q, s) => `text(${p},${q},${s})`)
    .replace(/^(.+)=tri\(([^{,]+),(.+),(.+),(.+)\)$/gm, (_, t, p, a, b, c) => `${t}=tri({p:${p},a:${a},b:${b},c:${c} })`)
    .replace(/^triangle\((.+)\)$/gm, (_, t) => `tri2svg(${t},${size})`)



/**
 * 
 * @param {array} kode lines of code to evaluate
 */
export const code2svg = (id, kode, w = 400, s = 8, wy = 400, sy = 8) => {
    const variables = { SVG: "" };
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
        .split("").forEach(e => variables[e] = 0);
    const r = 40 * s / w;  // default font size
    T.size = { id, w, s, wy, sy, c: "blue", r };
    gini = 0;
    mathEnvironment.size = T.size;
    Object.assign(variables, mathEnvironment);
    kode.forEach(line => {
        eva(line, variables);
    });
    return variables.SVG;

}

/**
 * TODO  this code lets user add points to a @trig
 */

let B = null;
function mm(e) {
    const x = e.clientX - B.x;
    const y = e.clientY - B.y;
    //web.mx = x;
    //web.my = y;
}

let ed = { value: '' };  // DUMMY

function mp(e) {
    const x = e.clientX - B.x;
    const y = e.clientY - B.y;
    //let wx = 300 * x / 8;
    if (!ed.value.endsWith('\n')) {
        ed.value += '\n';
    }
    ed.value += `q=(${nice(8 * x / 350)},${nice(-8 * (y - 350) / 350)});p.push(q)\n`;
}

// EXPERIMENTS BELOW
// can we move points
/*
let movePoints = false;
//$("pointer").onclick = () => {
() => {
    const trig = null; //qs("div.trig svg");
    if (trig) {
        B = trig.getBoundingClientRect(); // x,y for top left corner of canvas
        if (movePoints) {
            trig.removeEventListener("mousemove", mm);
            trig.removeEventListener("click", mp);
            movePoints = false;
        } else {
            trig.addEventListener("mousemove", mm);
            trig.addEventListener("click", mp);
            movePoints = true;
        }
    }
}
*/

/*
export const svgPathFromBeziers = (curves, s) => {
    const size = Object.assign({}, T.size, s);
    const color = size.c || "blue";
    const strokeWidth = size.r || 1;
    if (!curves.length) return '';
    let d = `M ${fx(curves[0].p0.x, size)} ${fy(curves[0].p0.y, size)}`;
    for (const c of curves) {
        if (Number.isFinite(c.c1.x)) {
            d += ` C ${fx(c.c1.x, size)} ${fy(c.c1.y, size)}, ${fx(c.c2.x, size)} ${fy(c.c2.y, size)}, ${fx(c.p3.x, size)} ${fy(c.p3.y, size)}`;
        }
    }
    return '<path d="' + d + `" stroke-width="${strokeWidth}" stroke="${color}"  fill="none" />`;
}
*/