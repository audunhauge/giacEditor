
// @ts-check

import { qs, $, create } from './util.js';
const { min, max, sqrt, floor } = Math;



// t in [0..31]  
const sfc = t => String.fromCharCode(t);
const byt = t => t < 10 ? sfc(t + 48) : t > 35 ? sfc(t + 61) : sfc(t + 55);
const tyb = s => s > 96 ? s - 61 : (s > 57 ? s - 55 : s - 48);
// n in [0..1023]
const encode = n => byt((n & 1023) >> 5) + byt(n & 31);
const decode = s => {
  const a = tyb(s.charCodeAt(0));
  const b = tyb(s.charCodeAt(1));
  return (a << 5) | b;
}


const decodeL = (list, s, optin ) => {  // 1024 == 1
  const pts = [];
  const opt = Object.assign({},optin);
  for (let i = 0; i < list.length; i += 2) {
    const [a, b] = list.slice(i, i + 2).split('');
    const p = { x: tyb(a.charCodeAt(0))*s/1024, y: tyb(b.charCodeAt(0))*s/1024 };
    pts.push(p);
  }
  return {pts,opt};
}

const decodeCirc = (list, s, optin ) => {  // 1024 == 1
  const pts = [];
  const opt = Object.assign({},optin);
  for (let i = 0; i < list.length; i += 3) {
    const [x, y, r] = list.slice(i, i + 3).split('').map(e => tyb(e.charCodeAt(0))*s/1024);
    const circ = { x,y,r,opt}
    pts.push(circ);
  }
  return pts;
}

const decodeDots = (list, s, optin ) => {  // 1024 == 1
  const pts = [];
  const opt = Object.assign({},optin);
  for (let i = 0; i < list.length; i += 2) {
    const [x, y] = list.slice(i, i + 2).split('').map(e => tyb(e.charCodeAt(0))*s/1024);
    const circ = { x,y,opt}
    pts.push(circ);
  }
  return pts;
}


// draw a limited square
const decodeSqrs = (list, s, optin) => {  // 1024 == 1
  // if list length is mod 5 then assume xywhr  where r is rotation
  // else just xywh
  const pts = [];
  const opt = Object.assign({},optin);
  if (list.length % 5 === 0) {
    for (let i = 0; i < list.length; i += 5) {
      let [x, y, w, h,r] = list.slice(i, i + 5).split('').map(e => tyb(e.charCodeAt(0)) * s / 1024);
      const sqr = {x, y, w, h, r:r*1024/61, opt};
      pts.push(sqr);
    }
  } else {
    for (let i = 0; i < list.length; i += 4) {
      const [x, y, w, h] = list.slice(i, i + 4).split('').map(e => tyb(e.charCodeAt(0)) * s / 1024);
      const sqr = {x, y, w, h,r:0, opt};
      pts.push(sqr);
    }
  }
  return pts;
}

const decodeLine = (list, s , optin) => {  // 1024 == 1
  const pts = [];
  const opt = Object.assign({},optin);
  for (let i = 0; i < list.length; i += 4) {
    const [x1, y1, x2, y2] = list.slice(i, i + 4).split('').map(e => tyb(e.charCodeAt(0))*s/1024);
    const line = {x1,y1,x2,y2,opt};
    pts.push(line);
  }
  return pts;
}

const decodeText =(list, s , optin) => {  // xyr  until end
  const opt = Object.assign({},optin);
  const [x1,y1,r] = list.slice(0,3).split('');
  const x = tyb(x1.charCodeAt(0)) * s / 1024;
  const y = tyb(y1.charCodeAt(0)) * s / 1024;
  const txt = list.slice(3);
  const rot = r === 'V' ? 0.5 : tyb(r.charCodeAt(0)) / 61;
  return [{x,y,rot,txt,opt}];   // all others return array - so ...
}

const decodeSymb = (list, s, optin) => {  // 1024 == 1
  const pts = [];
  const opt = Object.assign({},optin);
  if (list.length % 3 === 0) {  // no rotation
    for (let i = 0; i < list.length; i += 3) {
      const [x1, y1, t] = list.slice(i, i + 3).split('');
      const x = tyb(x1.charCodeAt(0)) * s / 1024;
      const y = tyb(y1.charCodeAt(0)) * s / 1024;
      const symb = { x, y, t, opt };
      pts.push(symb);
    }
  } else if (list.length % 4 === 0) {  // last value is rotation
    for (let i = 0; i < list.length; i += 4) {
      const [x1, y1, t,r] = list.slice(i, i + 4).split('');
      const x = tyb(x1.charCodeAt(0)) * s / 1024;
      const y = tyb(y1.charCodeAt(0)) * s / 1024;
      const rot = tyb(r.charCodeAt(0)) / 61;
      const symb = { x, y, t, rot, opt };
      pts.push(symb);
    }
  }
  return pts;
}


const decodeColors = (list) => {  
  const [r,c,f,t0] = list.split('');
  const t = t0 ? tyb(t0.charCodeAt(0)) / 61 : t0 ;
  return {r:tyb(r.charCodeAt(0))/10, c, f, t};  // color set by nakedColor in trig.js#shape
  // r pen width, c=color f=fill t=transparence t/61 (fill-opacity)
}


// converts a line of text "°ar6#3B34X" to shapes to be rendered by ink(shape) in trig.js
export const figure = (list, s = 1) => {
  const shapeList = { shape: 1 };  // so that we can pick it out in jumbled param list
  const bez = []; const lines = []; const circles = [];
  const sqrs = []; const vects = []; const syms = [];
  const dots = []; const text = []; 
  let mode = "~";  // bezier shape
  let opt = {};
  list.split(/([~°/#$&>:§])/).forEach(l => {
    if ("~°/$#&>:§".includes(l) && l.length === 1) {
      mode = l;
    } else if (l !== "") {
      switch (mode) {
        case "~":  // bezier shapes
          {
            bez.push(decodeL(l, s, opt));
            break;
          }
        case "°":  // circles
          {
            circles.push(decodeCirc(l, s, opt));
            break;
          }
        case ">":  // vectors just as lines but marked with arrow
          {
            vects.push(decodeLine(l, s, opt));
            break;
          }
        case "/":  // lines
          {
            lines.push(decodeLine(l, s, opt));
            break;
          }
        case "&":  // symbols (xy) (symb) (rot?)  mod 3,4 to choose
          {
            syms.push(decodeSymb(l, s, opt));
            break;
          }
        case ":":  // dots (xy) ...
          {
            dots.push(decodeDots(l, s, opt));
            break;
          }
        case "$":  // text   (xyr) text until next split
          {
            text.push(decodeText(l, s, opt));
            break;
          }
        case "§":  // (linewidth) (color) (fill)
          {
            opt = decodeColors(l);
            break;
          }
        case "#":  // squares
          {
            sqrs.push(decodeSqrs(l, s, opt));
            break;
          }

      }
    }
  });
  if (circles.length) {
    shapeList.circles = circles.flatMap(e => e);
  }
  if (syms.length) {
    shapeList.syms = syms.flatMap(e => e);
  }
  if (text.length) {
    shapeList.text = text.flatMap(e => e);
  }
  if (lines.length) {
    shapeList.lines = lines.flatMap(e => e);
  }
  if (dots.length) {
    shapeList.dots = dots.flatMap(e => e);
  }
  if (lines.length) {
    shapeList.lines = lines.flatMap(e => e);
  }
  if (sqrs.length) {
    shapeList.sqrs = sqrs.flatMap(e => e);
  }
  if (vects.length) {
    shapeList.vects = vects.flatMap(e => e);
  }
  if (bez.length) {
    shapeList.bez = bez;
  }
  return shapeList;
}

// assumes we draw in box 400x400, 0,0 bottom left corner
const encodePoints = (ps, mi, ma) => {
  //const diff = ma - mi;
  const sc = n => floor(n * 62 / 400);
  //return ps.map(p => encode(sc(p.x - mi)) + encode(sc(p.y - mi))).join("");
  //const sc = n => floor(n * 61 / diff);
  return ps.map(p => byt(sc(p.x)) + byt(sc(400-p.y))).join("");
}


export function fitBezierPath(points, tolerance = 0.01) {
  function douglasPeucker(pts, eps) {
    const lineDist = (p, a, b) => {
      const A = p.x - a.x, B = p.y - a.y, C = b.x - a.x, D = b.y - a.y;
      const dot = A * C + B * D, lenSq = C * C + D * D;
      const t = max(0, min(1, dot / lenSq));
      const x = a.x + t * C, y = a.y + t * D;
      const dx = p.x - x, dy = p.y - y;
      return sqrt(dx * dx + dy * dy);
    };
    function simplify(pts) {
      let maxDist = 0, index = 0;
      for (let i = 1; i < pts.length - 1; i++) {
        const d = lineDist(pts[i], pts[0], pts[pts.length - 1]);
        if (d > maxDist) { maxDist = d; index = i; }
      }
      if (maxDist > eps) {
        const left = simplify(pts.slice(0, index + 1));
        const right = simplify(pts.slice(index));
        return left.slice(0, -1).concat(right);
      } else return [pts[0], pts[pts.length - 1]];
    }
    return simplify(pts);
  }

  const simple = douglasPeucker(points, tolerance);
  const curves = [];
  for (let i = 0; i < simple.length - 1; i++) {
    const p0 = simple[i > 0 ? i - 1 : i];
    const p1 = simple[i];
    const p2 = simple[i + 1];
    const p3 = simple[i + 2 < simple.length ? i + 2 : i + 1];
    const c1 = {
      x: p1.x + (p2.x - p0.x) / 6,
      y: p1.y + (p2.y - p0.y) / 6,
    };
    const c2 = {
      x: p2.x - (p3.x - p1.x) / 6,
      y: p2.y - (p3.y - p1.y) / 6,
    };
    curves.push({ p0: p1, c1, c2, p3: p2 });
  }
  return curves;
}



/// click and drag


export function svgPathFromBeziers(curves, close=false) {
  if (!curves.length) return "";
  let d = `M ${curves[0].p0.x} ${curves[0].p0.y}`;
  for (const c of curves)
    d += ` C ${c.c1.x} ${c.c1.y}, ${c.c2.x} ${c.c2.y}, ${c.p3.x} ${c.p3.y}`;
  if (close) d += " Z";
  return d;
}

// curves + startingpoint
export function svgRelBez(curves,p) {
  if (!curves.length) return "";
  let [x0,y0] = [p.x,p.y];
  let d = `M ${x0 + curves[0].p0.x} ${y0 + curves[0].p0.y}`;
  for (const c of curves) {
    d += ` C ${c.c1.x+x0} ${c.c1.y+y0}, ${c.c2.x+x0} ${c.c2.y+y0}, ${c.p3.x+x0} ${c.p3.y+y0}`;
  }
  return d;
}


// ====== Data Structures ======
const state = {
  /** @type {object[]} */
  lines: [[]],   // one empty path so far
  idx: 0,  // on starting path
  /** @type {object} */
  svg: null,
  /** @type {object} */
  pathEl: null,
  /** @type {object} */
  dragTarget: null,
  /** @type {object} */
  g: null,
};


// ====== Add Point ======
function addPoint(x, y) {
  state.lines[state.idx].push({ x, y });
  redraw();
}

// ====== Redraw everything ======
function redraw() {
  
  const { g, pathEl, lines, svg } = state;
  if (!g) return;

  // Remove old point markers
  g.querySelectorAll("circle.point").forEach(el => el.remove());

  let strP = '';
  let txt = [];
  const minimum = min(...lines.flat().map(p => min(p.x, p.y)));
  const maximum = max(...lines.flat().map(p => max(p.x, p.y)));
  lines.forEach(points => {
    if (points.length > 1) {
      const curves = fitBezierPath(points);
      const d = svgPathFromBeziers(curves);
      strP += d + ' ';


      const list = encodePoints(points, minimum, maximum);
      txt.push(list);
    }

    // Draw all points
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.classList.add("point");
      c.setAttribute("cx", p.x);
      c.setAttribute("cy", p.y);
      c.setAttribute("r", "5");
      //c.setAttribute("idx", i);
      c.setAttribute("fill", "#d33");
      c.style.cursor = "pointer";
      c.dataset.index = String(i);
      g.appendChild(c);
    }
  });
  pathEl.setAttribute("d", strP);
  const div = svg.parentNode.querySelector("svg + div");
  div.innerHTML = txt.join('z');  // z not used to encode - want ability to select
  // the whole string by doubleclick thus not ,.-+ etc
}



// ====== Interaction Handling ======
export function init(id) {
  /** @type {object} */
  const svg = qs("#" + id + " svg");
  if (svg === null) return;
  state.lines = [[]];
  state.idx = 0;
  state.svg = svg;
  const g = qs("#" + id + " svg g.inner");
  state.g = g;
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", "#0077cc");
  path.setAttribute("stroke-width", "2");
  svg.appendChild(path);
  state.pathEl = path;


  // Add points on click (when not dragging)
  svg.addEventListener("click", (e) => {
    if (state.dragTarget) return; // ignore if dragging

    if (e.metaKey) {  // command-click to start a new path
      state.idx += 1;
      state.lines.push([]);

    }

    if (e.shiftKey) {  // shift-click removes a point
      if (e.target.tagName === "circle") {
        // const f = Number(e.target.getAttribute("idx"));
        const index = Number(e.target.dataset.index);
        state.lines[state.idx] = state.lines[state.idx].filter((p, i) => i !== index);
        // state.points = state.points.filter((p, i) => i !== f);
        redraw();
        e.preventDefault();
      }
      return;
    }

    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    addPoint(x, y);
  });

  // Start drag
  svg.addEventListener("mousedown", (e) => {
    if (e.target.tagName === "circle") {
      state.dragTarget = e.target;
      e.preventDefault();
    }
  });

  // Move point while dragging
  svg.addEventListener("mousemove", (e) => {
    if (!state.dragTarget) return;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const index = Number(state.dragTarget.dataset.index);
    state.lines[state.idx][index] = { x, y };
    // state.points[index] = { x, y };
    redraw();
  });

  // End drag
  svg.addEventListener("mouseup", () => (state.dragTarget = null));
  svg.addEventListener("mouseleave", () => (state.dragTarget = null));
}



