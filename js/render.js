// @ts-check

import { lang, trans } from './translate.js';
import { wrap, $, create } from './Minos.js';
import { web } from './editor.js';
import { code2svg, parse } from './trig.js';

const { min, max } = Math;

// @ts-ignore
const katx = (s, mode) => katex.renderToString(String(s), {
    throwOnError: false,
    displayMode: mode,
});

function cleanUpMathLex(code) {
    if (code === "") return "";
    return code
        .replace(/\*\*/gm, "^")
        .replace(/\)\(/gm, ")*(") // (x+a)(x-2) => (x+a)*(x-2)
        .replace(/([0-9])\(/gm, (m, a, b) => a + "*(")  // 3( => 3*(
        .replace(/([0-9])([a-z])/gm, (m, a, b) => a + "*" + b); // 3a => 3*a
}



const simplify = exp => {
    try {
        const g = (exp.charAt(0) === ' ')
            // @ts-ignore
            ? giaEval(`latex((${exp}))`)
            // @ts-ignore
            : giaEval(`latex(simplify(${exp}))`)
        return giaClean(g);
    } catch (e) {
        console.log("Simplyfy ", e, exp);
        return exp;
    }
}


const makeLatex = (txt, { mode, klass }) => {
    const clean = cleanUpMathLex(txt);
    try {
        // @ts-ignore
        const m = MathLex.parse(clean);
        // @ts-ignore
        const tex = MathLex.render(m, "latex");
        return katx(String(tex), mode);
    } catch (e) {
        //console.log(e, txt, clean);
        return katx(String(clean), mode);
    }
}


const giaClean = exp => exp.replace(/["*]/g, '').replace('mbox', 'boxed');

const giaEval = exp => {
    const txt = trans(lang[web.chosen], exp);
    try {
        // @ts-ignore
        return UI.eval(txt);
    } catch (e) {
        console.log("Eval ", e, exp, txt);
        return exp;
    }
}

const solve = exp => giaEval(`latex(solve(${exp}))`);
const giaTex = exp => giaClean(giaEval(`latex(${exp})`));


const operate = (exp, op) => {
    try {
        if ((op.charAt(0) === " ")) {
            // dont simplify
            // @ts-ignore
            return giaEval(`(${exp})${op.substr(1)}`)
        } else if ("+-*/|".includes(op.charAt(0))) {
            // @ts-ignore
            return giaEval(`simplify((${exp})${op})`)
        } else {
            // @ts-ignore
            return giaEval(`(${op}(${exp}))`)
        }
    } catch (e) {
        console.log("Simplyfy ", e, exp);
        return exp;
    }
}




/**
 * Handles following text section
 * 
 * @poldiv
 * x⁴ + 4x³ + 2x² - 5x + 12
 * x - 2
 * 
 * Produces
 * 
 *                                                           58
 *                                                         -------
 * x⁴ + 4x³ + 2x² - 5x + 12 : x-2 = x³ + 6x² + 14x + 23 +  (x - 2)
 * x⁴ - 2x³
 *      6x³ + 2x² - 5x + 12
 *      6x³ -12x²
 *           14x² - 5x + 12
 *           14x² -28x
 *                 23x + 12
 *                 23x - 46
 *                 ---------
 *                       58
 */

export const renderPoldiv = (id, txt, size = "") => {
    const lines = txt.split('\n').filter(e => e != "");
    if (lines.length < 2) {
        $(id).innerHTML = "Must have exactly two equations"
        return;
    }
    const [numerator, denominator,...rest] = lines;
    // if rest is non empty then reveal as many lines as given by rest
    const answer = giaEval(`propfrac((${numerator})/(${denominator}))`);
    const parts = answer.replace(/\(.+?\)/g,'u').replace(/([+-])/g, (_, pm) => '#' + pm).split('#');
    const pnumber = parts.length;
    const howmany = min(rest.length || pnumber,pnumber);
    const visibleAnswer = (howmany === pnumber) ? answer : parts.slice(0,howmany).join("");
    const heading = `<div class="poldiv"><span class="num">${katx(simplify(numerator))}</span><span> : </span>
                    <span class="deno">${katx(giaTex(denominator))}</span><span> = </span> <span class="ans">${katx(giaTex(visibleAnswer))}</span></div>`;
    const filler = simplify(numerator).replace(/([+-])/g, (_, pm) => '#' + pm).split('#')
    let pol = numerator;
    let howto = ''
    for (let i = 0; i < howmany; i++) {
        const f = i ? '<span class="filler">' + katx(filler.slice(0, i).join("") + '+') + '</span>' : '';
        const u = '<span class="filler">' + katx(filler.slice(0, i + 1).join("") + '+') + '</span>'
        const p = parts[i]
        if (p.includes("/")) {
            howto += `<div>${f}______</div>`;
            break;
        }
        const rem = giaEval(`simplify((${p})*(${denominator}))`);
        pol = giaEval(`simplify((${pol})-(${rem}))`);
        howto += `<div>${f}${katx(giaTex(rem))}</div><div>${u}${katx(giaTex(pol))}</div>`
    }
    $(id).innerHTML = heading + howto;
}

export const renderEqnSet = (id, txt, size = "") => {
    let comments = 0;
    const newMath = [];
    const lines = txt.split('\n').filter(e => e != "");
    let eqs = [];
    if (lines.length < 2) {
        $(id).innerHTML = "Must have exactly two equations"
        return;
    }
    for (let i = 0; i < 2; i++) {
        const [line, comment = ""] = lines[i].split("::");
        eqs[i] = line;
        const clean = cleanUpMathLex(line);
        newMath[i] = `<span data-nr="${'i'.repeat(i + 1)}" class="eqset">${katx(clean)}</span>`;
    }
    for (let i = 2; i < lines.length; i++) {
        const [todo, comment = ""] = lines[i].split("::");
        comments += comment ? 1 : 0;            // count number of comments
        const [idx, line] = todo.split(":");     //  "1:+2"  "2:*3"
        const [a, op, b] = todo.split('');
        if ("+-".includes(op) && +a + +b === 3) {
            // 1+2 2-1 2+1 1-2
            const nuline = giaEval(`simplify((${eqs[+a - 1]})${op}(${eqs[+b - 1]}))`);
            eqs[+a - 1] = nuline;
            newMath[i] = `<span data-nr="${'i'.repeat(+a)}" class="eqset">${katx(eqs[+a - 1])}</span><span>${todo}</span>`;
            continue;
        }
        if (line) {
            const orig = eqs[(+idx) - 1];
            const eq = operate(orig, line);
            eqs[+idx - 1] = eq;
            newMath[i] = `<span data-nr="${'i'.repeat(idx)}" class="eqset">${katx(eq)}</span><span>${todo}</span>`;
        }
    }
    $(id).innerHTML = wrap(newMath, 'div');
}


export const renderSimple = (line, { mode, klass }, comment = '') => {
    const latex = makeLatex(line, { mode, klass });
    return `<div><span>${latex}</span><span>${comment}</span></div>`;
}

const seplist = {
    ">": "\\gt",
    "<": "\\lt",
    "=": "=",
    ">=": "\\ge",
    "<=": "\\le",
}

export const renderLikning = (line, comment, { mode, klass }) => {
    const [sep = "="] = (line.match(/>=|<=|>|<|=/) || []);
    const [left = "", right = "0"] = line.split(sep);
    const leftLatex = makeLatex(left, { mode, klass });
    const rightLatex = makeLatex(right, { mode, klass });
    const sepLatex = katx(seplist[sep], mode);
    return `<div class="eq"><span>${leftLatex}</span>
    <span> ${sepLatex} </span>
    <span>${rightLatex}</span><span>${comment}</span></div>`;
}


/**
 * 
 * @param {string} id div containing result
 * @param {string} txt lines of algebra
 * @param {string} size TODO remove
 * @returns {number} percentage of lines+1 with comments 
 */
export function renderAlgebra(id, txt, size = "") {
    let comments = 0;
    const newMath = [];
    const mode = size.includes("senter");
    const klass = size;
    const plotSizeW = Number(size.match(/\d+/)?.[0] || 200);
    const plotSizeH = plotSizeW * 0.6;
    const lines = txt.split('\n').filter(e => e != "");
    const gives = renderSimple("\\rightarrow", { mode, klass });
    for (let i = 0; i < lines.length; i++) {
        const [line, comment = ""] = lines[i].split("::");
        if (line.includes('plot')) {
            // assume geometric commands
            const rawSvg = giaEval(line);
            const cleanSvg = rawSvg ?
                rawSvg.slice(1, -1).replace(/width="(.+?)cm"/, `width="${plotSizeW}px"`)
                    .replace(/height="(.+?)cm"/, `height="${plotSizeH}px"`)
                : 'unable to plot this';
            // newMath[i] = cleanSvg;
            newMath[i] = `<span>${cleanSvg}</span>
            <span></span>
            <span>${line.replace(/</g, "&lt;")}</span><span>${comment}</span>`;
            continue;
        }
        comments += comment ? 1 : 0;  // count number of comments
        const clean = cleanUpMathLex(line);
        const assign = clean.includes(":=");
        const [lhs, rhs, ...xs] = clean.split("=");
        const math = (assign || xs) ?
            simplify(clean)
            : (lhs && rhs && rhs.length >= 1)
                ? solve(`(${lhs}=(${rhs}))`)
                : simplify(lhs);
        if (assign) {
            const [exp] = clean.split(":=");
            newMath[i] = `<span>${exp}</span>
            <span> := </span>
            <span>${katx(math, mode)}</span><span>${comment}</span>`;
        } else {
            newMath[i] = `<span>${renderSimple(line, { mode, klass })}</span>
            <span>${gives}</span>
            <span>${katx(math, mode)}</span><span>${comment}</span>`;
        }
    }
    $(id).innerHTML = wrap(newMath, 'div');
    return comments / (lines.length + 1);
}


/**
 * 
 * @param {string} id div containing result
 * @param {string} txt lines of algebra
 * @param {string} size TODO remove
 * @returns {number} percentage of lines+1 with comments 
 */
export function renderEquation(id, txt, size = "") {
    let comments = 0;
    const newMath = [];
    const lines = txt.split('\n').filter(e => e != "");
    let lhs, rhs;
    for (let i = 0; i < lines.length; i++) {
        const [line, comment = ""] = lines[i].split("::");
        comments += comment ? 1 : 0;  // count number of comments
        const clean = cleanUpMathLex(line);
        if (i === 0) {
            [lhs, rhs] = clean.split("=");
            newMath[i] = `<span>${katx((simplify((lhs))))}</span>
           <span>=</span>
           <span>${katx((simplify(rhs)))}</span><span>${comment}</span>`;
        } else {
            lhs = operate(lhs, line);
            [rhs] = operate(rhs, line).split("=");
            newMath[i] = `<span>${katx(giaTex(lhs))}</span>
            <span>=</span>
            <span>${katx(giaTex(rhs))}</span><span>${line} <span class="comment">${comment}</span></span>`;
        }
    }
    $(id).innerHTML = wrap(newMath, 'div');
    return comments / (lines.length + 1);
}

export function renderMath(id, math, size = "") {
    const newMath = [];
    const mode = size.includes("senter");
    const likning = size.includes("likning");
    const klass = size;
    const lines = math.split('\n').filter(e => e != "");
    for (let i = 0; i < lines.length; i++) {
        const [line, comment = ""] = lines[i].split("::");
        if (likning) {
            newMath[i] = renderLikning(line, comment, { mode, klass });
        } else {
            newMath[i] = renderSimple(line, { mode, klass }, comment);
        }
    }
    $(id).innerHTML = wrap(newMath, 'div');
}





function plotGraph(parent, fu, size, colors) {
    const div = create('div');
    div.id = "plot" + Date.now();
    parent.append(div);
    try {
        const optdObj = plot(fu, size, colors);
        optdObj.target = "#" + div.id;
        optdObj.grid = true;
        // @ts-ignore
        functionPlot(optdObj);
    } catch (e) {
        console.log("Failed plot:", fu, e);
    }
}

const alg2plot = fu => {
    const fu2 = cleanUpMathLex(fu);
    return fu2.replace(/e\^([a-z])/, (_, a) => {
        return `exp(${a})`;
    })
        .replace(/e\^\(([^)]+)\)/, (_, a) => {
            return `exp(${a})`;
        })
}

export function renderPlot(id, plot, klass = "") {
    const parent = $(id);
    const [_, width = 350] = (klass.match(/ (\d+)$/)) || [];
    parent.style.setProperty("--min", String(width) + "px");
    const lines = plot.split('\n').filter(e => e != "");
    for (let i = 0; i < lines.length; i++) {
        const pickApart = lines[i].match(/([^ ]+)( \d+)?( [0-9a-z#,]+)?/);
        const [_, fu, size = 500, colors] = pickApart;
        plotGraph(parent, alg2plot(fu), min(size, +width), colors);
    }
}

export function renderTrig(id, trig, klass = "") {
    const parent = $(id);
    const [_, w = 350, s = 8, scale = 1] = (klass.match(/ (\d+\.?\d*)? ?(\d+\.?\d*)? ?([0-9.]+)?\s*$/)) || [];
    const parsed = parse(trig, `{w:${w},s:${s}}`);
    const lines = parsed.split('\n').filter(e => e != "");
    const svg = code2svg(lines, w, s);
    parent.innerHTML = `<svg id="${id}" width="${w}" viewBox="0 0  ${w} ${w}"> 
      <g transform="scale(${scale})">
        ${svg}
      </g>
    </svg>`;
}


export function plot(str, size = 500, colors) {
    let [o, ...rest] = str.split(",");
    if (str.startsWith("{") || str.startsWith("[")) {
        o = str;
        rest = [];
    }
    let obj;
    try {
        obj = JSON.parse(o);
    } catch (er) {
        obj = o;
    }
    // Exaples:
    // a plot(x)
    // b plot(x,-5,5) 200
    // c plot(x^2;x,-5,5,-25,25) 300 red,green,blue
    // d plot([[1,2],[3,4],[5,6]])
    // e plot([[1,2,4,8,16,32]])
    // f plot( {yAxis: {domain: [-1.897959183, 1.897959183]},xAxis: {domain: [-3, 3]},data: [{r: '2 * sin(4 theta)',fnType: 'polar',graphType: 'polyline' }] } )
    // f plot({target: '#multiple',data: [ { fn: 'x', color: 'pink' }, { fn: '-x' }, { fn: 'x * x' }, { fn: 'x * x * x' }, { fn: 'x * x * x * x' } ] } )
    let xmin = -5,
        xmax = 5,
        ymin,
        ymax;
    let width = max(70, +size),
        height = max(70, +size);
    const colorList = colors ? colors.trim().split(",") : [];
    if (rest.length > 0) {
        // type b,c
        [xmin = -5, xmax = 5, ymin, ymax] = rest;
    }
    const optobj = {
        width,
        height,
        xAxis: { domain: [+xmin, +xmax] },
    };
    if (ymin !== undefined && ymax !== undefined) {
        optobj.yAxis = { domain: [+ymin, +ymax] };
    }
    if (Array.isArray(obj)) {
        // type d,e
        if (Array.isArray(obj[0])) {
            ymax = obj.reduce((s, v) => Math.max(v[1], s), obj[0][1]);
            ymin = obj.reduce((s, v) => Math.min(v[1], s), obj[0][1]);
            xmax = obj.reduce((s, v) => Math.max(v[0], s), obj[0][0]);
            xmin = obj.reduce((s, v) => Math.min(v[0], s), obj[0][0]);
            optobj.yAxis = { domain: [ymin - 2, ymax + 2] };
            optobj.xAxis = { domain: [xmin, xmax] };
            // type d
            // data: [{ points: [  [1, 1],  [2, 1], [2, 2],  [1, 2],  [1, 1]  ],  fnType: 'points',  graphType: 'scatter'  }]
            optobj.data = [{ points: obj, fnType: "points", graphType: "scatter" }];
            // @ts-ignore
            return optobj;
        } else {
            // type e
            ymax = Math.max(...obj);
            ymin = Math.min(...obj);
            xmin = 0;
            xmax = obj.length;
            optobj.yAxis = { domain: [ymin - 2, ymax + 2] };
            optobj.xAxis = { domain: [xmin, xmax] };
            const points = obj.map((e, i) => [i, e]);
            optobj.data = [{ points, fnType: "points", graphType: "scatter" }];
            // @ts-ignore
            return optobj;
        }
    } else if (typeof o === "string") {
        // type a,b,c
        optobj.data = obj.split(";").map((fu, i) => {
            const obj = { fn: fu, graphType: "polyline" };
            if (colorList[i]) obj.color = colorList[i];
            return obj;
        });
        // @ts-ignore
        return optobj;
    } else if (typeof obj === "object") {
        // @ts-ignore
        return o;
    } else {
        console.log("plot() given invalid params");
        return {};
    }
}



