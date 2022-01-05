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
 * svgCircle(s,r,size)
 * svgDot(s,size)
 * svgText(s,null,"S",size)
 * r = roll(1,9)
 * A = 3*Math.sqrt(3)*r*r
 * trib = tri({p,a:6,B:30,C:30, ABC:",,S",size})
 * tri2svg(trib)
 */


const SIN = x => Math.sin(Math.PI * x / 180);
const COS = x => Math.cos(Math.PI * x / 180);
const ASIN = x => 180 * Math.asin(x) / Math.PI;

const nice = x => {
    if (x % 1 === 0) return String(x);
    return x.toFixed(2);
};

const fx = (x, size) => {
    let wx = size.w * x / size.s;
    // clean up for use as coordinates
    return nice(wx);
};

const fy = (y, size) => {
    let hy = size.w - size.w * y / size.s;
    // clean up for use as coordinates
    return nice(hy);
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
const range = (lo, hi, step = 1) => {
    // range(1,10,1) => [1,2,3,4,5,6,7,8,9]
    // range(1,4,0.1) => [1.0, 1.1, 1.2, 1.3 .. 3.9]
    step = step === 0 || isNaN(step) ? 1 : step;
    let list = [],
        i = lo;
    if (hi <= lo) return list;
    while (i < hi) {
        list.push(i.toFixed(2));
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


const svgOuter = (contents, w = 500) => {
    let s = w / 500;
    let id = "s" + Date.now();
    return `<svg id="${id}" width="${w}" viewBox="0 0  ${w} ${w}"> 
    <g transform="scale(${s})">
      ${contents}
    </g>
  </svg>`;
}

class T {
    static size = { w: 300, s: 8, c: "blue" };

    static circle = (p, r, s) => {
        const size = s || T.size;
        let color = T.size.c || "blue";
        return `<circle cx="${fx(p.x, size)}" cy="${fy(p.y, size)}" r="${fx(r, size)}" stroke="${color}" fill="none"/>`;
    }

    static line = (p, q, s) => {
        const size = s || T.size;
        let color = size.c || "blue";
        return `<line x1="${fx(p.x, size)}" y1="${fy(p.y, size)}" x2="${fx(q.x, size)}" y2="${fy(q.y, size)}"   stroke="${color}" />`;
    }

    static dot = (p, s) => {
        const size = s || T.size;
        let color = size.c || "blue";
        return `<circle cx="${fx(p.x, size)}" cy="${fy(p.y, size)}" r="3" fill="${color}"/>`;
    }

    static text = (p, q, s, z) => {
        const size = z || T.size;
        let now = String(Math.random()).substr(2, 8);
        if (q === null || q === undefined) {
            let v = new Point(1, 0); // direction of path for text
            q = p.add(v);
        }
        let path = `M ${fx(p.x, size)} ${fy(p.y, size)} L ${fx(q.x, size)} ${fy(q.y, size)}`;
        let scale = 10 / size.s;
        let percent = clamp(100 * scale, 50, 100);
        let color = size.c || "blue";
        let fz = `font-size="${percent}%"`;
        return `<path id="mm${now}" d="${path}"  />
        <text ${fz}><textPath x="${p.x}" y="${p.y}" 
         startOffset="25%" href="#mm${now}">
        <tspan dy="-5">
        ${s}
        </tspan>
        </textpath></text>`;
    }

    static square = (p, q, a, b,z) => {
        //      r_____s
        //      |     |
        //      |     |b
        //      |_____|
        //     p   a   t
        const size = z || T.size;
        let color = T.size.c || "blue";
        let v = new Point(1, 0); // use point as vector
        if (q != null) {
            // need to create unit vector (p,q)
            v = q.sub(p).unit();
        }
        let n = v.norm();
        let t = p.add(v.mult(a));
        let r = p.add(n.mult(b));
        let s = r.add(v.mult(a));
        let poly = [p, t, s, r].map(e => fx(e.x, size) + "," + fy(e.y, size)).join(" ");
        return `<polygon points="${poly}" stroke="${color}" fill="none" />`;
    }

    static tri2svg = p => {
        const scale1 = 10 / (T.size.s || 8); // font scale for scale (s:10 = normal)
        // let scale2 = p.size.w / 400;  // font scale for size (w:400 = normal)
        const percent = clamp(100 * scale1, 50, 100);
        const color = p.size?.c || "blue";
        const err = p.error || "";
        const fz = `font-size="${percent}%"`;
        let s = `<text fill="red" x ="30" y="30" >Invalid triangle ${err}</text>`;
        if (p.valid) {
            s = "";
            if (p.polygon) {
                s += `<polygon points="${p.polygon}" stroke="${color}" fill="none" />`;
            }
            if (p.ABC) {
                s += p.ABC.map(e => `<text ${fz} x="${e.x}" y="${e.y}">${e.txt}</text>`).join("");
            }
            if (p.abc) {
                s += p.abc.map(e => `<text ${fz} x="${e.x}" y="${e.y}" text-anchor="${e.anchor}">${e.txt}</text>`).join("");
            }
            if (p.vert) {
                s += p.vert.map(e => `<circle cx="${e.x}" cy="${e.y}" r="3" fill="${color}" />`).join("");
            }
            if (p.vABC) {
                // the path must be unique - or all angles will follow same paths 0,1,2
                let now = String(Math.random()).substr(2, 6);
                s += p.vABC.map((e, i) => `<path id="mm${i + now}" d="${e.p}" />
            <text ${fz}><textPath x="${e.x}" y="${e.y}"
             startOffset="25%" href="#mm${i + now}">
            <tspan dy="5" dx="5">
            ${e.txt}
            </tspan>
            </textpath></text>`).join("");
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

        let fxz = x => fx(x, size);
        let fyz = x => fy(x, size);

        let V = new Point(1, 0); // unit vector along x-axis
        let ret = {
            valid: true,
            polygon: "",
            points: {},
            scaled: [],
            area: 0,
            radius: 1,
            center: V,
            ABC: [],
            vert: [],
            vABC: [],
            angles: [],
            abc: [],
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
        let factor = 250 / size.w;
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
                dd = Math.max(0.3, factor * vec2.dot(jad));
                pa = pnt.sub(vec1.unit().mult(side / 2)).add(vec2.mult(dd));
                return { x: fxz(pa.x), y: fyz(pa.y), txt: txt, anchor };
            }
        }
        return ret;
    }
}


const { sqrt, sin, cos, tan, asin, atan2, acos, atan, PI: π,
    log: ln, log10: lg, log, abs, max, min, random: rnd } = Math;


const {circle, line, square, text, dot, tri2svg, tri} = T;

const mathEnvironment = {
    SIN, COS, ASIN, Point, nice, fx, fy, clamp, triheight, circumcirc,
    circle, line, square, text, dot, tri2svg, tri,
    abs, max, min, rnd, roll, shuffle, range, sqrt, ln, lg, log,
    sin, cos, tan, asin, atan2, acos, atan, π,
}

const eva = (exp, variables) => {
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
    if ( ( (value && value.charAt(0) === '>') || !value) && v && v.charAt(0) === '<') {
        // not p=xxx, assume we have svg fragment
        variables.SVG += v;
    }
    return v;
}


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
    .replace(/^trekant\((.+),(.+),(.+)\)$/gm, (_, p, q, r) => `line(${p},${q})\nline(${q},${r})\nline(${p},${r})`)
    .replace(/^([a-zA-Z])=\((.+),(.+)\)$/gm, (_, p, u, v) => `${p}=new Point(${u},${v})`)
    .replace(/^([a-zA-Z])=([a-zA-Z])\s*\+\s*\[(.+),(.+)\]$/gm, (_, p, q, u, v) => `${p}=${q}.add(new Point(${u},${v}))`)
    .replace(/^([a-zA-Z])=([a-zA-Z])\s*\-\s*\[(.+),(.+)\]$/gm, (_, p, q, u, v) => `${p}=${q}.sub(new Point(${u},${v}))`)
    .replace(/^dot\((.+),(.+)\)$/gm, (_, u, v) => `dot(new Point(${u},${v}))`)
    .replace(/^dot\((.+)\)$/gm, (_, p) => `dot(${p})`)
    .replace(/^square\(([^,)]+),([^,)]+),([^,)]+)\)$/gm, (_, p, w,h) => `square(${p},null,${w},${h})`)
    .replace(/^text\(([^,)]+),([^,)]+)\)$/gm, (_, p, s) => `text(${p},null,${s})`)
    .replace(/^text\(([^,)]+),([^,)]+),([^,)]+)\)$/gm, (_, p, q, s) => `text(${p},${q},${s})`)
    .replace(/^(.+)=tri\(([^{,]+),(.+),(.+),(.+)\)$/gm, (_, t, p, a, b, c) => `${t}=tri({p:${p},a:${a},b:${b},c:${c} })`)
    .replace(/^trekant\((.+)\)$/gm, (_, t) => `tri2svg(${t},${size})`)



/**
 * 
 * @param {array} kode lines of code to evaluate
 */
export const code2svg = (kode, w, s) => {
    const variables = { SVG: "" };
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
        .split("").forEach(e => variables[e] = 0);
    T.size = { w, s,c:"blue" };
    Object.assign(variables, mathEnvironment);
    kode.forEach(line => {
        eva(line, variables);
    });
    return variables.SVG;

}