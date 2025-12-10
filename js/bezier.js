
// @ts-nocheck

import { qs, $, create } from './util.js';
const { min, max, sqrt, floor } = Math;


/**
 * Given an array of points, return an SVG path (cubic Beziers) that
 * interpolates all points smoothly.
 * 
 * points: [{x, y}, ...]  OR  [[x,y], ...]
 * returns: string for `d` attribute of <path>
 * @param {any[]} points
 */
function bezpath(points) {
  if (!points || points.length === 0) return '';
  // normalize input to objects {x,y}
  const pts = points.map(p => Array.isArray(p) ? { x: p[0], y: p[1] } : { x: p.x, y: p.y });
  const n = pts.length - 1;
  if (n === 0) {
    return `M ${pts[0].x} ${pts[0].y}`;
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
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < n; i++) {
    const c1 = firstControl[i];
    const c2 = secondControl[i];
    const p = pts[i + 1];
    d += ` C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p.x} ${p.y}`;
  }
  return `<path d="${d}" />`;
}


// t in [0..31]
const byt = t => t < 10 ? String.fromCharCode(t + 48) : String.fromCharCode(t + 55);
const tyb = s => s > 58 ? s - 55 : s - 48;
// n in [0..1023]
const encode = n => byt((n & 1023) >> 5) + byt(n & 31);
const decode = s => {
  const a = tyb(s.charCodeAt(0));
  const b = tyb(s.charCodeAt(1));
  return (a << 5) | b;
}


const decodeL = (list, s ) => {  // 1024 == 1
  const pts = [];
  for (let i = 0; i < list.length; i += 4) {
    const [a, b, c, d] = list.slice(i, i + 4).split('');
    const p0 = { x: decode(a + b), y: decode(c + d) };
    const q = { x: p0.x * s / 1024 , y: p0.y * s / 1024 }
    pts.push(q);
  }
  return pts;
}

export const decodeList = (list,p = { x: 0, y: 0 }, s = 1) => {
  const lines = [];
  list.split('z').forEach(l => {
    lines.push(decodeL(l,p,s));
  })
  return lines;
}

const encodePoints = (ps, mi, ma) => {
  const diff = ma - mi;
  const sc = n => floor(n * 1023 / diff);
  return ps.map(p => encode(sc(p.x - mi)) + encode(sc(p.y - mi))).join("");
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


export function svgPathFromBeziers(curves) {
  if (!curves.length) return "";
  let d = `M ${curves[0].p0.x} ${curves[0].p0.y}`;
  for (const c of curves)
    d += ` C ${c.c1.x} ${c.c1.y}, ${c.c2.x} ${c.c2.y}, ${c.p3.x} ${c.p3.y}`;
  return d;
}


// ====== Data Structures ======
const state = {
  lines: [[]],   // one empty path so far
  idx: 0,  // on starting path
  svg: null,
  pathEl: null,
  dragTarget: null,
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
      c.setAttribute("r", 5);
      //c.setAttribute("idx", i);
      c.setAttribute("fill", "#d33");
      c.style.cursor = "pointer";
      c.dataset.index = i;
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
  const svg = qs("#" + id + " svg");
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



