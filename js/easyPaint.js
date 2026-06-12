// @ts-check

import { figure, fitBezierPath, svgRelBez, svgPathFromBeziers } from './bezier.js';

import { create, qs, $ } from './util.js';


import { colornames, T, Point, pt } from './trig.js';

const alf = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";



export const easyPaint = (div) => {

    const [LINE, CIRCLE, SQUARE, DOT, BEZIER, EXIT] = "line circle square dot bezier exit".split(" ");
    const glyph = { line: "/", circle: "°", square: "#", dot: ":", bezier: "~", };
    const POS = { x: 0, y: 0 };
    let mode = DOT;
    let artwork = "";
    let easel;
    const state = {count:0};

    // assigned in forEach to each button
    const dispatch = (e) => {
        const b = e.target.dataset.name;
        switch (b) {
            case EXIT:
                div.classList.add("hidden");
                return;
            case DOT:
                if (!artwork.endsWith(b)) artwork += glyph[b];
                break;
            case LINE:
                if (!artwork.endsWith(b)) artwork += glyph[b];
                state.count = 0;
                break;
            case BEZIER:
                if (!artwork.endsWith(b)) artwork += glyph[b];
                state.count = 0;
                break;
            case CIRCLE:
                if (!artwork.endsWith(b)) artwork += glyph[b];
                state.count = 0;
                break;

        }
        if (mode !== b || artwork === "") artwork += glyph[b];
        mode = b;
    }

    const divsvg = create("div");
    div.appendChild(divsvg);
    divsvg.setAttribute("id", "innersvg");
    divsvg.innerHTML = `<svg id="easel" viewBox="0 0 600 600" width="600">
      <g id="innereas" class="inner" transform="scale(1)">
      </g>
    </svg> `;
    easel = $("easel");
    const stat = create("div");
    stat.className = "stats";
    div.appendChild(stat);
    stat.innerHTML = "mousecoords";
    const tools = create("div");
    tools.className = "tools";

    // create buttons and assign actions in dispatch
    [LINE, CIRCLE, SQUARE, DOT, BEZIER, EXIT].forEach(e => {
        const a = create("span");
        a.className = "tegn";
        a.innerHTML = e;
        a.dataset.name = e;
        tools.appendChild(a);
        a.addEventListener("click", dispatch);
    });
    div.appendChild(tools);
    qs('[data-name="exit"]')?.addEventListener("click", () => {
        div.classList.add("hidden");
    });


    // update complete svg

    const paint = e => {
        let repaint = true;
        const g = $("innereas");
        switch (mode) {
            case DOT:
                artwork += alf[POS.x] + alf[POS.y];
                break;
            case CIRCLE:
                if (state.count === 0) {
                    state.A = { x: POS.x, y: POS.y };
                    state.count = 1;
                    state.p = pt( Math.floor(state.A.x * 600 / 61), 600 - Math.floor(state.A.y * 600 / 61) );
                    marker(state.p, g, "line");
                    repaint = false
                } else {
                    const q = pt( Math.floor(POS.x * 600 / 61), 600 - Math.floor(POS.y * 600 / 61) );
                    const r = Math.floor((state.p.sub(q)).length());
                    artwork += alf[state.A.x] + alf[state.A.y];
                    artwork += alf[Math.floor(61 * r / 600)];
                    state.count = 0;
                    g.querySelectorAll("circle.line").forEach(el => el.remove());
                    repaint = true;
                }
                break;
            case SQUARE:
                break;
            case LINE:
                if (state.count === 0) {
                    state.A = { x: POS.x, y: POS.y };
                    state.count = 1;
                    const p = { x: Math.floor(state.A.x * 600 / 61), y: 600 - Math.floor(state.A.y * 600 / 61) };
                    marker(p, g, "line");
                    repaint = false
                } else {
                    artwork += alf[state.A.x] + alf[state.A.y];
                    artwork += alf[POS.x] + alf[POS.y];
                    state.count = 0;
                    g.querySelectorAll("circle.line").forEach(el => el.remove());
                }
                break;
            case BEZIER:
                if (state.count === 0) {
                    state.A = { x: POS.x, y: POS.y };
                    state.count = 1;
                    const p = { x: Math.floor(state.A.x * 600 / 61), y: 600 - Math.floor(state.A.y * 600 / 61) };
                    marker(p, g, "line");
                    repaint = false
                } else {
                    if (state.count === 1) {
                        artwork += alf[state.A.x] + alf[state.A.y];
                    }
                    artwork += alf[POS.x] + alf[POS.y];
                    state.count = 2;
                    g.querySelectorAll("circle.line").forEach(el => el.remove());
                }
                break;
                break;
            case DOT:
                break;

        }

        if (repaint) {
            const shp = figure(artwork);
            const svgCode = T.ink(shp, { z: 16.8, r: 4, s: 1, sy: 1, w: 600, wy: 600 });
            divsvg.innerHTML = `<svg id="easel" viewBox="0 0 600 600" width="600">
            <g id="innereas" class="inner" transform="scale(1)">
              ${svgCode}
            </g>
        </svg> `;
        }
    }


    const track = e => {
        const g = $("innereas");
        g.querySelectorAll("circle.point").forEach(el => el.remove());
        const rect = divsvg.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const a = Math.floor(61 * x / 600);
        const b = 61 - Math.floor(61 * (y + 0.5) / 600);
        if (a >= 0 && a < 62 && b >= 0 && b < 62) {
            POS.x = a; POS.y = b;
            const xa = alf[a];
            const ya = alf[b];
            stat.innerHTML = `${xa}${ya} `;
            const p = { x: Math.floor(a * 600 / 61), y: 600 - Math.floor(b * 600 / 61) };
            marker(p, g);
        }
    }

    divsvg.addEventListener("mousemove", track);
    divsvg.addEventListener("click", paint);

}

const marker = (p, g, k = "point") => {
    const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    c.classList.add(k);
    c.setAttribute("cx", p.x);
    c.setAttribute("cy", p.y);
    c.setAttribute("r", "5");
    //c.setAttribute("idx", i);
    c.setAttribute("fill", "#d33");
    c.style.cursor = "pointer";
    //c.dataset.index = String(i);
    g.appendChild(c);
}