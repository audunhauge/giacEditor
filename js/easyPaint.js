// @ts-check

import { figure } from './bezier.js';

import { $, create, qs, toast } from './util.js';


import { ATAN2, pt, T } from './trig.js';

const alf = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const [CLEAR, TEXT, LINE, CIRCLE, SQUARE, DOT, BEZIER, POLYGON, SYMBOL, ATTRIBUTES, EXIT] =
    "clear  text  line  circle  square  dot  bezier  polygon  symbol  attributes  exit".split("  ");
const COMMANDS = [CLEAR, TEXT, LINE, CIRCLE, SQUARE, DOT, BEZIER, POLYGON, SYMBOL, ATTRIBUTES, EXIT];
const glyph = {
    attribute: "§", text: "$", line: "/", circle: "°", polygon: "∑",
    square: "#", dot: ":", bezier: "~", symbol: "&"
};



export const easyPaint = (div) => {

    const POS = { x: 0, y: 0 };
    let mode = DOT;
    let artwork = "";
    let easel;
    const state = { count: 0 };

    // assigned in forEach to each button
    const dispatch = (e) => {
        const b = e.target.dataset.name;
        switch (b) {
            case CLEAR:
                artwork = "";
                brush();
                break;
            case EXIT:
                div.classList.add("hidden");
                return;
            case SYMBOL:
                if (!artwork.endsWith(b)) artwork += glyph[b];
                break;
            case TEXT:
                if (!artwork.endsWith(b)) artwork += glyph[b];
                state.count = 0;
                break;
            case SQUARE:
                if (!artwork.endsWith(b)) artwork += glyph[b];
                state.count = 0;
                state.R = 0;  // no rotation
                break;
            case DOT:
                if (!artwork.endsWith(b)) artwork += glyph[b];
                break;
            case LINE:
                if (!artwork.endsWith(b)) artwork += glyph[b];
                state.count = 0;
                break;
            case POLYGON:
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
        mode = b;
    }

    const infomatic = create("div");
    const divsvg = create("div");
    div.appendChild(divsvg);
    div.append(infomatic);
    infomatic.innerHTML = `text : <input id="inpu" placeholder="symbol or text"></input>
    <div><span>Bgimg</span><input id="bgi" placeholder="background image"></input></div>
    <div><span id="artcopy">Save Artwork </span> <span id="artpaste">From clipboard</span><span id="art"></span></div>`;
    const bgi = $("bgi");
    divsvg.setAttribute("id", "innersvg");
    divsvg.innerHTML = `<svg id="easel" viewBox="0 0 600 600" width="600">
      <g id="innereas" class="inner" transform="scale(1)">
      </g>
    </svg> `;
    bgi.addEventListener('input', () => {
        divsvg.setAttribute("style", `background-image:url('${bgi.value}')`);
        // divsvg.style.backgroundImage = `url("${JSON.stringify(bgi.value)}")`;
    });
    easel = $("easel");
    const stat = create("div");
    stat.className = "stats";
    div.appendChild(stat);
    stat.innerHTML = "mousecoords";
    const tools = create("div");
    tools.className = "tools";
    $("artcopy").addEventListener("click", () => {
        const copyText = $("art").innerText;
        // Copy its value to the clipboard
        navigator.clipboard.writeText(copyText)
            .then(() => toast("Copied"))
            .catch(err => console.error("Error copying text: ", err));
    });
    $("artpaste").addEventListener("click", () => {
        navigator.clipboard
            .readText()
            .then((clipText) => { artwork = clipText; paint(); });
    });

    // create buttons and assign actions in dispatch
    COMMANDS.forEach(e => {
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
            case SYMBOL:
                artwork += alf[POS.x] + alf[POS.y] + $("inpu").value[0];
                break;
            case TEXT:
                if (state.count === 0) {
                    state.A = { x: POS.x, y: POS.y };
                    state.count = 1;
                    state.p = pt(Math.floor(state.A.x * 600 / 61), 600 - Math.floor(state.A.y * 600 / 61));
                    marker(state.p, g, "line");
                    repaint = false
                } else {
                    const q = pt(Math.floor(POS.x * 600 / 61), 600 - Math.floor(POS.y * 600 / 61));
                    const u = q.sub(state.p);
                    const ang = (ATAN2(u.y, u.x) + 270) % 360;
                    const r = alf[Math.floor(61 * ang / 360)];
                    if (!artwork.endsWith(TEXT)) artwork += glyph[TEXT];
                    artwork += alf[state.A.x] + alf[state.A.y];
                    artwork += r;
                    artwork += $("inpu").value;
                    state.count = 0;
                    g.querySelectorAll("circle.line").forEach(el => el.remove());
                    repaint = true;
                }
                break;
            case DOT:
                artwork += alf[POS.x] + alf[POS.y];
                break;
            case CIRCLE:
                if (state.count === 0) {
                    state.A = { x: POS.x, y: POS.y };
                    state.count = 1;
                    state.p = pt(Math.floor(state.A.x * 600 / 61), 600 - Math.floor(state.A.y * 600 / 61));
                    marker(state.p, g, "line");
                    repaint = false
                } else {
                    const q = pt(Math.floor(POS.x * 600 / 61), 600 - Math.floor(POS.y * 600 / 61));
                    const r = Math.round((state.p.sub(q)).length() + 0.5);
                    artwork += alf[state.A.x] + alf[state.A.y];
                    artwork += alf[Math.floor(61 * r / 600)];
                    state.count = 0;
                    g.querySelectorAll("circle.line").forEach(el => el.remove());
                    repaint = true;
                }
                break;
            case SQUARE:
                repaint = false;
                if (state.count === 0) {
                    state.L = [];
                }
                state.p = pt(Math.floor(POS.x * 600 / 61), 600 - Math.floor(POS.y * 600 / 61));
                marker(state.p, g, "line");
                state.L.push({ x: POS.x, y: POS.y });
                state.count++;
                if (state.count === 3) {
                    state.count = 0;
                    const [a] = state.L;
                    const [p, q, r] = state.L.map(z => pt(Math.floor(z.x * 600 / 61), Math.floor(z.y * 600 / 61)));
                    const w = alf[Math.round(0.5 + (q.sub(p)).length() * 61 / 600)];
                    const h = alf[Math.round(0.5 + (r.sub(q)).length() * 61 / 600)];
                    artwork += alf[a.x] + alf[a.y] + w + h;
                    // calculate angle
                    if (state.R !== 2) {
                        const u = q.sub(p);
                        const ang = (ATAN2(u.y, u.x) + 270) % 360;
                        const r = alf[Math.floor(61 * ang / 360)];
                        if (r !== "0" || state.R === 1) {
                            artwork += r;
                            state.R = 1;
                        } else {
                            state.R = 2;  // disallow rotation
                        }
                    }
                    repaint = true;
                }
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
            case POLYGON:
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
        }

        if (repaint) {
            brush();
        }
    }

    const brush = () => {
        const shp = figure(artwork);
        const svgCode = T.ink(shp, { z: 16.8, s: 1, sy: 1, w: 600, wy: 600 });
        divsvg.innerHTML = `<svg id="easel" viewBox="0 0 600 600" width="600">
            <g id="innereas" class="inner" transform="scale(1)">
              ${svgCode}
            </g>
        </svg> `;
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
            $("art").innerHTML = artwork;
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