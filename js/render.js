// @ts-check

import { lang, trans } from './translate.js';
import { wrap, $, create } from './Minos.js';
// @ts-ignore
import { web, tg, currentLanguage, mdLatex, chemicals, chemnames, lochemnames } from './editor.js';
// @ts-ignore
import { code2svg, parse, eva, range, T } from './trig.js';
// @ts-ignore
import { toast, curry, chunk, shuffle, compose, colorscale1, colorscale2, colorscale3, nice, group } from './util.js';
import {
    hyperC, hyper, binomial, binomialC,
    // @ts-ignore
    normal, normalC, fisher, fisherCrit
} from './probability.js';


// @ts-ignore
import { periodic, pt } from './periodic.js';


import { frekTable, statsTable, anovaTable, dataTable, transpose } from './tables.js';

import AsciiMathParser from './ascii2tex.js';
import { balance } from './balanceChem.js';

const ascii = new AsciiMathParser();

// @ts-ignore
const { abs, min, max, sin, cos, PI, floor, log, exp, E } = Math;


export var tableList = {};
export var svgList = {};





// @ts-ignore
export const katx = (s, mode) => katex.renderToString(String(s), {
    throwOnError: false,
    displayMode: mode,
});

/**
 * @param {string} code
 */
export function cleanUpMathLex(code) {
    if (code === "") return "";
    return code
        .replace(/\*\*/gm, "^")
        // @ts-ignore
        .replace(/x\(/gm, (/** @type {any} */ m, /** @type {any} */ a) => 'x*(')   //  x(x-2) => x*(x+2)
        // only for x so that sin(x) != sin*(x)
        .replace(/\)\(/gm, ")*(") // (x+a)(x-2) => (x+a)*(x-2)
        // @ts-ignore
        .replace(/([0-9])\(/gm, (/** @type {any} */ m, /** @type {string} */ a) => a + "*(")  // 3( => 3*(
        // @ts-ignore
        .replace(/([0-9])([a-z])/gm, (/** @type {any} */ m, /** @type {string} */ a, /** @type {string} */ b) => a + "*" + b); // 3a => 3*a
}



const simplify = (/** @type {any} */ exp) => {
    try {
        //const g = (exp.charAt(0) === ' ')
        // @ts-ignore
        const txt = trans(lang[currentLanguage], exp);
        //  factor/faktor or leading space -> no simplify
        const g = (txt.includes(" ") || txt.startsWith("fa"))
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


// @ts-ignore
// @ts-ignore
export const makeLatex = (/** @type {string | string[]} */ txt, { mode, klass }) => {
    // @ts-ignore
    const clean = cleanUpMathLex(txt);
    try {
        // discover mcChem 
        if (txt.includes('\ce')) return katx(String(txt), mode);
        const tex = ascii.parse(txt);
        return katx(String(tex), mode);
    } catch (e) {
        //console.log(e, txt, clean);
        return katx(String(clean), mode);
    }
}

export const litex = (/** @type {string} */ txt) => makeLatex(txt, { mode: false, klass: "" });


const lotex = (/** @type {any} */ txt) => {
    try {
        const simplex = cleanUpMathLex(txt);
        // @ts-ignore 
        //return MathLex.render(MathLex.parse(simplex), "latex");
        return ascii.parse(simplex);
    } catch (er) {
        simplify
        return txt;
    }
}


const giaClean = (/** @type {string} */ exp, fallback = "?") => {
    const v = exp.replace(/["*]/g, '').replaceAll('mbox', 'boxed');
    if (v.startsWith("GIAC")) return fallback;
    return v;
}

export const giaEval = (/** @type {string} */ exp) => {
    // @ts-ignore
    const txt = trans(lang[currentLanguage], exp);
    try {
        // @ts-ignore
        return UI.eval(txt);
    } catch (e) {
        console.log("Eval ", e, exp, txt);
        return exp;
    }
}

// @ts-ignore
const solve = (/** @type {any} */ exp) => giaEval(`latex(solve(${exp}))`);
//const giaTex = exp => giaClean(giaEval(`latex(${exp})`));
const giaTex = (/** @type {any} */ exp, old = "?") => giaClean(exp, old);


const operate = (/** @type {any} */ exp, /** @type {string} */ op) => {
    const sim = (op.charAt(0) === " ") ? '' : 'simplify';
    try {
        op = sim ? op : op.slice(1);
        if ("+-*/|".includes(op.charAt(0))) {
            // @ts-ignore
            return giaEval(`${sim}((${exp})${op})`)
        } else {
            // @ts-ignore
            return giaEval(`${sim}(${op}(${exp}))`)
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

// @ts-ignore
export const renderPoldiv = (/** @type {string} */ id, /** @type {string} */ txt, size = "") => {
    const lines = txt.split('\n').filter((/** @type {string} */ e) => e != "");
    if (lines.length < 2) {
        $(id).innerHTML = "Must have exactly two equations"
        return;
    }
    const [numerator, denominator, ...rest] = lines;
    // if rest is non empty then reveal as many lines as given by rest
    const answer = giaEval(`propfrac((${numerator})/(${denominator}))`);
    const parts = answer.replace(/\(.+?\)/g, 'u').replace(/([+-])/g, (/** @type {any} */ _, /** @type {string} */ pm) => '#' + pm).split('#');
    const pnumber = parts.length;
    const howmany = min(rest.length || pnumber, pnumber);
    const visibleAnswer = (howmany === pnumber) ? answer : parts.slice(0, howmany).join("");
    const heading = `<div class="poldiv"><span class="num">${katx(simplify(numerator))}</span><span> : </span>
                    <span class="deno">${litex(denominator)}</span><span> = </span> <span class="ans">${litex(visibleAnswer)}</span></div>`;
    const filler = simplify(numerator).replace(/([+-])/g, (/** @type {any} */ _, /** @type {string} */ pm) => '#' + pm).split('#')
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
        howto += `<div>${f}${litex(rem)}</div><div>${u}${litex(pol)}</div>`
    }
    $(id).innerHTML = heading + howto;
}


const diff = (/** @type {any[]} */ arr) => {
    if (arr.length < 2) return arr;
    const d = arr.map((/** @type {number} */ v, /** @type {number} */ i) => arr[i + 1] - v);
    d[d.length] = d[d.length - 1];
    return d;
}

export const renderSigram = (/** @type {string} */ id, /** @type {string} */ txt, /** @type {{ [x: string]: any; }} */ funks, size = "") => {
    const lines = txt.split('\n').filter((/** @type {string} */ e) => e != "");
    if (lines.length < 1) {
        $(id).innerHTML = "Enter polynomial"
        return;
    }
    const [lo, hi] = size.split(",");
    const a = Number(lo) || -10;
    const b = Number(hi) || 10;
    const delta = (b - a) / 200;
    const signums = [];
    const d = range(a, b, delta);
    for (let i = 0; i < lines.length; i++) {
        const [a, b] = lines[i].split(':');
        const expression = b ? b : a;
        const name = b ? a : "";
        let r;
        try {
            const def = funks[expression];
            const exp = def ? cleanUpMathLex(def).replace(/\^/g, '**') : cleanUpMathLex(expression).replace(/\^/g, '**');
            //const f = (new Function('expression', 'context', 'with(context){return eval(expression)}'))(exp, Math);
            const f = new Function("x", `with(Math){ return((${exp.replace(/'/g, "")})) }`);
            r = d.map(x => f(Number(x)));
            if (exp.startsWith("'")) {
                r = diff(r)
            }
            if (exp.startsWith("''")) {
                r = diff(r)
            }
            r = r.map(Math.sign);
        } catch (err) {
            // @ts-ignore
            r = d.map(v => 0);  // dummy sign line
        }
        r.push(2);
        let p = r[0];
        let s = [];
        let c = 0;
        // find sign change
        for (let i = 1; i < r.length; i++) {
            const v = r[i];
            if (v !== p) {
                s.push({ i, c });
                p = v;
                c = i;
            }
        }
        const latex = makeLatex((name || expression), { mode: false, klass: "" });
        const sgn = `<div><div>${latex}</div><div class="sigline">` +
            s.map(v => `<span data-x="${d[v.i] ?? d[v.i - 1]}" class="sign${r[v.i - 1]
                }" style="width:${v.i - v.c}px;left:${v.c}px"></span>`).join("") + '</div></div>';
        signums.push(sgn);
    }
    $(id).innerHTML = signums.join('');
}

export const renderEqnSet = (/** @type {string} */ id, /** @type {string} */ txt, klass = "") => {
    let comments = 0;
    const order = min(5, max(2, (Number(klass) ?? 2)));
    const newMath = [];
    const lines = txt.split('\n').filter((/** @type {string} */ e) => e != "");
    let eqs = [];
    if (lines.length < order) {
        $(id).innerHTML = `Must have ${order} equations`;
        return;
    }
    for (let i = 0; i < order; i++) {
        const [line, comment = ""] = lines[i].split("::");
        eqs[i] = line;
        const clean = cleanUpMathLex(line);
        // @ts-ignore
        const kalex = renderLikning(clean, comment, { mode: false, klass: "" });
        newMath[i] = `<span data-nr="${'I'.repeat(i + 1)}" class="eqset green">${kalex}</span>`;
    }
    let eqnb = 1;
    for (let i = order; i < lines.length; i++) {
        const [todo, comment = ""] = lines[i].split("::");
        comments += comment ? 1 : 0;            // count number of comments
        let [idx, line] = todo.split(":");     //  "1:+2"  "2:*3"
        const [a, op, b] = todo.split('');
        if ("+-".includes(op) && +a + +b > 1) {
            // 1+2 2-1 2+1 1-2 1+3
            const nuline = giaEval(`simplify((${eqs[+a - 1]})${op}(${eqs[+b - 1]}))`);
            eqs[+a - 1] = nuline;
            const kalex = renderLikning(nuline, comment, { mode: false, klass: "" });
            newMath[i] = `<span data-nr="${'I'.repeat(+a)}" class="eqset">${kalex}</span><span>${todo}</span>`;
            continue;
        }
        if (line === undefined) {
            // no idx - use previous
            line = idx;
        } else {
            eqnb = Number(idx);
        }
        if (line) {
            const orig = eqs[(eqnb) - 1];
            const eq = operate(orig, line);
            eqs[eqnb - 1] = eq;
            const kalex = renderLikning(eq, comment, { mode: false, klass: "" });
            newMath[i] = `<span data-nr="${'I'.repeat(eqnb)}" class="eqset">${kalex}</span><span>${todo}</span>`;
        }
    }
    $(id).innerHTML = wrap(newMath, 'div');
}

export const renderPiece = (/** @type {string} */ id, /** @type {string} */ txt, ksize = "") => {
    const startlines = txt.split('\n').filter((/** @type {string} */ e) => e != "");
    //let lat = `f(a,b) =   \begin{cases} 2 \cdot x+a \quad \text{for } x\le 1 \\\\      x^2+bx  \quad \text{for } x \gt 1
    //\end{cases}`;
    if (startlines.length < 3) {
        $(id).innerHTML = "Expecting<br>f(x)<br>part1:limits<br>part2:limits<br>..more parts"
        return;
    }
    // check if we have xrange/yrange or nofun,nogra,grid 
    // @ts-ignore
    const { commands = [], lines } = group(startlines, (/** @type {string} */ e) => e.match(/(^[xy]range)|(^no)/) ? "commands" : "lines");
    const size = Number(ksize.match(/\d\d+/)?.[0] || 400);
    const parent = $(id);
    const funcName = lines[0];
    const plots = [];
    let lat = funcName + '=' + '\\begin{cases}\n';
    for (let i = 1; i < lines.length; i++) {
        const [exp, limit] = lines[i].split(":");
        lat += lotex(exp) + ' \\quad \\text{for } ' + lotex(limit) + '\\\\\n';
        plots.push({ exp, limit });
    }
    lat += ' \\end{cases}\n';
    // dont show function if command contains "nofun"
    if (!commands.find((/** @type {string} */ e) => e.startsWith("nofun"))) {
        parent.innerHTML = katx(lat, true);
    }
    if (!commands.find((/** @type {string} */ e) => e.startsWith("nogra"))) {
        const div = create('div');
        div.id = "piece" + Date.now();
        parent.append(div);
        let mlo = 0, mhi = 0;
        /**
         * @type {{ exp: any; lo: number; hi: number; }[]}
         */
        const fun = [];
        plots.forEach(({ exp, limit }) => {
            // planning on adding a dot at end of graph if [3,4] vs <3,4>
            // difficulty placing the dot in graph?
            const dotRight = limit.match(/\<=(-?[0-9.]+)/) || limit.match(/(-?[0-9.]+)\>=/);   //  trial
            const dotLeft = limit.match(/\>=(-?[0-9.]+)/) || limit.match(/(-?[0-9.]+)\<=/);   //  trial
            console.log(dotRight, dotLeft);     //  trial
            const rlo = limit.match(/\>=?(-?[0-9.]+)/) || [];
            const rhi = limit.match(/\<=?(-?[0-9.]+)/) || [];
            const llo = limit.match(/(-?[0-9.]+)\</) || [];
            const lhi = limit.match(/(-?[0-9.]+)\>/) || [];
            const lo = Number(rlo[1] ?? llo[1] ?? -10);
            const hi = Number(rhi[1] ?? lhi[1] ?? 10);
            mlo = min(mlo, lo);
            mhi = max(mhi, hi);
            fun.push({ exp, lo, hi });
        });
        let xlo, xhi, ylo, yhi;
        if (commands) {
            // xrange or yrange
            // @ts-ignore
            const { xrange, yrange } = group(commands, (/** @type {string} */ e) => e.startsWith('x') ? 'xrange' : 'yrange');
            if (xrange) {
                xlo = Number((xrange[0].match(/(-?[0-9.]+),/) || [])[1]) ?? mlo;
                xhi = Number((xrange[0].match(/,(-?[0-9.]+)/) || [])[1]) ?? mhi;
            }
            if (yrange) {
                ylo = Number((yrange[0].match(/(-?[0-9.]+),/) || [])[1]) ?? -10;
                yhi = Number((yrange[0].match(/,(-?[0-9.]+)/) || [])[1]) ?? -10;
            }
        }
        const optObj = plotDomain(size, [xlo, xhi, ylo, yhi]);
        // const optObj = plotDomain(mlo,mhi);
        // @ts-ignore
        optObj.data = fun.map(({ exp, lo, hi }) => ({ fn: exp, range: [lo, hi], graphType: "polyline" }));
        // @ts-ignore
        optObj.target = "#" + div.id;
        if (! commands.includes("nogrid")) {
            // @ts-ignore
            optObj.grid = true;
        }
        try {
            // @ts-ignore
            functionPlot(optObj);
        } catch (e) {
            console.log("Piecewise:", e);
        }
    }
}


// @ts-ignore
export const renderSimple = (/** @type {string} */ line, { mode, klass, chemistry = false }, comment = '') => {
    if (chemistry) {
        if (line.startsWith("balance")) {
            try {
                const b = balance(line.slice(7));
                if (b?.coffs && b?.eqn) {
                    const chex = katx(String('\\ce{' + b.eqn.toHtml(b.coffs) + '}'), mode);
                    return `<div><span>${chex}</span><span class="comment">${comment}</span></div>`;            
                }
                return '<div>No balance found</div>';
            } catch (e) {
                // @ts-ignore
                return `<div>balance : ${e.message}</div>`;
            }
        }
        const chex = katx(String('\\ce{' + line + '}'), mode);
        return `<div><span>${chex}</span><span class="comment">${comment}</span></div>`;
    } else {
        const latex = makeLatex(line, { mode, klass });
        return `<div><span>${latex}</span><span class="comment">${comment}</span></div>`;
    }
}

const seplist = {
    ">": "\\gt",
    "<": "\\lt",
    "=": "=",
    ">=": "\\ge",
    "<=": "\\le",
}

// @ts-ignore
export const renderLikning = (/** @type {{ match: (arg0: RegExp) => any; split: (arg0: any) => [("" | undefined)?, ("0" | undefined)?]; }} */ line, /** @type {any} */ comment, { mode, klass, chemistry = false }) => {
    const [sep = "="] = (line.match(/>=|<=|>|<|=/) || []);
    const [left = "", right = "0"] = line.split(sep);
    const leftLatex = makeLatex(left, { mode, klass });
    const rightLatex = makeLatex(right, { mode, klass });
    // @ts-ignore
    const sepLatex = katx(seplist[sep], mode);
    return `<div class="eq"><span>${leftLatex}</span>
    <span> ${sepLatex} </span>
    <span>${rightLatex}</span><span class="comment">${comment}</span></div>`;
}


/**
 * Computer Algebra System
 * @param {string} id div containing result
 * @param {string} txt lines of algebra
 * @param {string} size TODO remove
 * @returns {number} percentage of lines+1 with comments
 * @param {{ [x: string]: any; }} funks
 */
export function renderAlgebra(id, txt, funks, size = "") {
    let comments = 0;
    const newMath = [];
    const [_, command] = (size.match(/command=([a-zø]+)/) || []);
    const mode = size.includes("large");
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
            <span>${line.replace(/</g, "&lt;")}</span><span class="comment">${comment}</span>`;
            continue;
        }
        const before = command ? command + '(' : "";
        const after = command ? ')' : "";
        const adjus = before + line + after;
        const [parts, ...nn] = adjus.split('(')
        const prefix = nn.length ? parts : '';  // løs(x+2=0), prefix=løs
        const isCAS = prefix.length && prefix.length > 2;
        // "Nløssimplifyforenklediffpoldivisjonintegrate faktorplot factorfsolve".includes(prefix);
        comments += comment ? 1 : 0;  // count number of comments
        const clean = cleanUpMathLex(adjus);
        const assign = clean.includes(":=");
        // @ts-ignore
        const [lhs, rhs, ...xs] = clean.split("=");
        let math = simplify(clean);
        if (assign) {
            const [exp] = clean.split(":=");
            funks[exp] = giaEval(rhs);
            newMath[i] = `<span>${exp}</span>
            <span> := </span>
            <span>${katx(math, mode)}</span><span class="comment">${comment}</span>`;
        } else {
            if (isCAS) {
                const rest = adjus.slice(prefix.length);  // rest = (x+2=0)
                newMath[i] = '<span>' + renderSimple('"' + prefix + '"' + rest + '', { mode, klass }) + `</span>
                <span>${gives}</span>
                <span>${katx(math, mode)}</span><span class="comment">${comment}</span>`;
            } else {
                newMath[i] = `<span>${renderSimple(line, { mode, klass })}</span>
              <span>${gives}</span>
              <span>${katx(math, mode)}</span><span class="comment">${comment}</span>`;
            }
        }
    }

    if (klass.includes("matte")) {   // dual display, CAS hidden on print
        //  CAS calculates answer to question, not printed
        // check if we have grid - moved down one level for this special case
        const [_, grid] = (size.match(/(grid[0-9])/) || ['', '']);
        const pre = renderMath('a', txt, null, size, true);
        $(id).innerHTML = `<aside class="math ${grid}">` + pre + `</aside><aside class="gui ${grid}">` + wrap(newMath, 'div', 'gridy') + '</aside>';
    } else {
        $(id).innerHTML = wrap(newMath, 'div', 'gridy');
    }
    return comments / (lines.length + 1);
}


/**
 * 
 * @param {string} id div containing result
 * @param {string} txt lines of algebra
 * @param {string} size TODO remove
 * @returns {number} percentage of lines+1 with comments 
 */
// @ts-ignore
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
           <span>${katx((simplify(rhs)))}</span><span class="comment">${comment}</span>`;
        } else {
            // @ts-ignore
            const [ol, or] = [lhs, rhs];
            lhs = operate(lhs, line);
            lhs = lhs.startsWith("GIAC") ? ol : lhs;
            [rhs] = operate(rhs, line).split("=");
            rhs = rhs.startsWith("GIAC") ? or : rhs;
            newMath[i] = `<span>${katx(giaTex(lhs, ol))}</span>
            <span>=</span>
            <span>${katx(giaTex(rhs, or))}</span><span>${line} <span class="comment">${comment}</span></span>`;
        }
    }
    $(id).innerHTML = wrap(newMath, 'div');
    return comments / (lines.length + 1);
}

/**
 * @param {string} id
 * @param {string} smiles
 * @param {any} happy
 */
export function renderCSearch(id, smiles, happy) {
    const item = smiles.toLowerCase();
    let hits = lochemnames.filter(e => e.includes(item));
    if (happy || hits.length === 0) {  // if happy only look for smiles
        // try to search for smile
        // @ts-ignore
        hits = chemnames.filter(e => chemicals[e].includes(smiles));
    }
    let smile = '';
    const list = hits.map(e => '<div>' + e + '</div>').join('');
    if (hits.length === 1) {
        const idx = lochemnames.findIndex(e => e === hits[0]);
        const upname = chemnames[idx];
        // @ts-ignore
        smile = '<div>' + chemicals[upname] + '</div>';
    }
    $(id).innerHTML = '<div>' + list + smile + '</div>';

}

/**
 * @param {string} id
 * @param {string} smiles
 */
export function renderChem(id, smiles, klass = "") {
    const [_, width, height] = klass.match(/(\d+),(\d+)/) || [0, 500, 200];
    const losmile = smiles.toLowerCase();
    const idx = lochemnames.findIndex(e => e === losmile);
    if (idx >= 0) {
        const upname = chemnames[idx]
        // @ts-ignore
        smiles = chemicals[upname];
    }
    $(id).setAttribute("width", width + "px");
    $(id).setAttribute("height", height + "px");
    // @ts-ignore
    let smilesDrawer = new SmilesDrawer.Drawer({ width, height });
    //let smilesSVG = new SmilesDrawer.SvgDrawer({ width, height});
    // @ts-ignore
    SmilesDrawer.parse(smiles.trim(), function (tree) {
        // Draw to the canvas
        smilesDrawer.draw(tree, id, "light", false);
        //smilesSVG.draw(tree, id, "light", false);
    });
}


/**
 * @param {string} id
 * @param {string} txt
 */
export function renderHint(id, txt, klass = "") {
    const parent = $(id);
    // @ts-ignore
    const [kls, ...header] = klass.trim().split(' ');
    const head = header.slice(-1)[0] ?? 'Hint';
    const contents = klass.includes("markdown") ? mdLatex(txt.trim()) : txt.trim();
    const p = klass.includes("periodic") ? periodic(klass.split(' ')) : contents;
    parent.innerHTML = `<div>${head}</div><div>${p}</div>`;
}


/**
 * @param {string} id
 * @param {string} math
 * @param {null} funks
 */
// @ts-ignore
export function renderMath(id, math, funks, size = "", just = false) {
    const newMath = [];
    const mode = size.includes("display");
    const chemistry = size.includes("chem");
    const likning = size.includes("likning");
    const klass = size;
    const orig = math.split('\n').filter((/** @type {string} */ e) => e != "");
    let lines = orig.slice();  // make a copy
    if (size.includes("random")) {
        const [_, count, group=1] = (size.match(/random\(([0-9]+),?([0-9]+)?\)/) || []);
        if (+group > 1) {
            const temp = chunk(lines,+group);  // split into groups
            lines = temp.map((/** @type {any[]} */ c) => shuffle(c)[0]);
            if (lines.length > +count) {
                // more than requested - so shuffle and pick
                lines = shuffle(lines).slice(0,+count);
            }
        } else {
            lines = shuffle(lines).slice(0,+count)
        }
    }
    for (let i = 0; i < lines.length; i++) {
        const [line, comment = ""] = lines[i].split("::");
        if (likning) {
            // @ts-ignore
            newMath[i] = renderLikning(line, comment, { mode, klass });
        } else {
            newMath[i] = renderSimple(line, { mode, klass, chemistry }, comment);
        }
    }
    if (just) return wrap(newMath, 'div', 'gridy');
    $(id).innerHTML = wrap(newMath, 'div');
    return '';
}

const distfu = {
    normal: normal,
    normalC: normalC,
    binom: binomial,
    hyper: hyper,
    binomC: binomialC,
    hyperC: hyperC,
}

// @ts-ignore
const distPlot = (/** @type {any} */ fu, /** @type {any[]} */ range, /** @type {any} */ type) => {
    const values = range.map(fu);
    const large = max(...values);
    const largeX = range[values.indexOf(large)];
    // find first value > 0.00001 and trim
    const first = values.findIndex((/** @type {number} */ e) => e > 0.00001);
    const leftValues = values.slice(first ? first - 1 : 0);  // skipped leading zeroes
    const leftRange = range.slice(first ? first - 1 : 0);
    let right;  // from right end - find first sufficiently large value
    for (right = leftValues.length - 1; right >= 0; right--) {
        if (leftValues[right] > 0.00001) break;
    }
    const truValues = leftValues.slice(0, right + 1);
    const trueRange = leftRange.slice(0, right + 1);
    const scale = 50 / large;
    const w = 5;
    return [trueRange.map((/** @type {any} */ x, /** @type {number} */ i) => `<div title="${x}:${truValues[i]}" style="left:${i * w}px;height:${floor(truValues[i] * scale)}px"></div>`).join("")
        , largeX + "," + large.toFixed(3), trueRange.length];
};
const distRange = (/** @type {any} */ fu, /** @type {any[]} */ range, /** @type {string} */ type, /** @type {any} */ fuc) => {
    const mufu = type === "normal" ? fuc : fu;
    const eqles = type === "normal" ? "≤" : "=";
    const ys = range.map(mufu);
    let sum = ys.reduce((/** @type {any} */ s, /** @type {any} */ v) => s + v, 0);
    // @ts-ignore
    return [range.map((/** @type {any} */ x, /** @type {string | number} */ i) => `<div><span>P(X ${eqles} ${x}) </span> = <span> ${ys[i].toFixed(4)} </span></div>`).join("")
        , sum];
}

/**
 * @param {string} id
 * @param {string} ls
 * @param {string} params
 * @param {string} type
 */
export function renderDist(id, ls, params, type) {
    let txt = "";
    let header = "";
    type = type.trimStart();
    let plot = "";
    const lines = ls.split("\n").filter((/** @type {string | any[]} */ l) => l.length);
    // @ts-ignore
    let fu = distfu[type];
    // @ts-ignore
    let fuc = distfu[type + "C"];
    if (!fu) return;
    let maximum = 0;  // updated by distribution
    const dis = tg("distribution with");
    if (type.endsWith("normal")) {
        const [_, my, sigma] = (params.match(/my=([0-9]+) +sigma=([0-9.]+)/) || []);
        header = `<h3>Normal ${dis} μ=${my} σ=${sigma}</h3>`;
        // fu = () => 0;  // point prob is zero for normal
        fuc = curry(fuc)(+my, +sigma);
        fu = curry(fu)(+my, +sigma);
        maximum = Number.MAX_SAFE_INTEGER;
    }
    if (type.endsWith("binom")) {
        const [_, n, p] = (params.match(/n=([0-9]+) +p=([0-9.]+)/) || []);
        header = `<h3>Binomial ${dis} n=${n} p=${p}</h3>`;
        fu = curry(fu)(+n, +p);
        fuc = curry(fuc)(+n, +p);
        maximum = +n + 1;
    }
    if (type.endsWith("hyper")) {
        const [_, n, m, r] = (params.match(/n=([0-9]+) +m=([0-9]+) +r=([0-9]+)/) || []);
        header = `<h3>Hypergeometric ${dis} n=${n} m=${m} r=${r}</h3>`;
        fu = curry(fu)(+n, +m, +r);
        fuc = curry(fuc)(+n, +m, +r);
        maximum = +r + 1;
    }
    let sum = 0;
    for (const line of lines) {
        if (line.startsWith("plot")) {
            let [_, lo, hi] = line.match(/^plot +([0-9.-]+),([0-9.-]+)/) || [];
            // @ts-ignore
            hi = min(+hi, maximum);
            const [graph, largest, width] = distPlot(fu, range(+lo, +hi), type);
            // @ts-ignore
            plot += `<div style="width:${width * 5}px" title="${lo}:${hi} max=(${largest})">` + graph + '</div>';
            txt += `<div><span>Plot </span><span> ${lo},${hi} </span></div>`;
            continue;
        }
        if (line.startsWith("range")) {
            let [_, lo, hi] = line.match(/^range +([0-9.-]+),([0-9.-]+)/) || [];
            // @ts-ignore
            hi = min(+hi, maximum);
            const [t, s] = distRange(fu, range(+lo, +hi), type, fuc);
            txt += t;
            sum = s;
            continue;
        }
        if (line === "sum") {
            txt += `<div><span>Sum </span> = <span> ${sum.toFixed(6)} </span></div>`;
            sum = 0;
            continue;
        }
        let partsum = 0;
        const [_, num, or, compare] = (line.match(/^([0-9]+) ?(\w+)? ?(\w+)?/) || []);
        if (or && compare) {
            if (compare.startsWith("meh") || compare.startsWith("mer") || compare.startsWith("mo") || compare.startsWith("pi")) {
                const diff = type === "normal" ? 0 : 1;
                partsum = (1 - fuc(+num - diff));
                const v = partsum.toFixed(6);
                txt += `<div><span>P(X ≥ ${num}) </span> = <span> ${v} </span></div>`;
            } else {
                partsum = fuc(+num);
                const v = partsum.toFixed(6);
                txt += `<div><span>P(X ≤ ${num}) </span> = <span> ${v} </span></div>`;
            }
        } else {
            partsum = (type === "normal") ? 0 : fu(+num);
            const v = partsum.toFixed(6);
            txt += `<div><span>P(X = ${num}) </span> = <span> ${v} </span></div>`;
        }
        sum += partsum;
    }
    const plots = plot ? `<div class="distplot">${plot}</div>` : '';
    $(id).innerHTML = header + '<div class="flexit"><div>' + txt + '</div>' + plots + '</div>';
}




const tableRender = {
    stats: statsTable,
    anova: anovaTable,
    frekvens: frekTable,
    dataset: dataTable,
}


// scan the table, discover shape
// inspect and locate subset with numeric data
// the rest is formated as headers
/**
 * ,a,b,c,d,e,f
 * x,1,2,3,4,5,6
 * y,4,5,6,7,8,9
 * commands  (any lines without , are assumed to be commands)
 * data = [[1,2,3,4,5,6],[4,5,6,7,8,9]]
 * all rows padded to same length
 * @param {string} id
 * @param {string} text
 * @param {string} type
 * @param {any} name
 * @param {{ [x: string]: number[][]; }} regpoints
 */
export function renderTable(id, text, type, name, regpoints) {
    const parent = $(id)
    let txt = '';
    let haveHead = false;
    // @ts-ignore
    let data = [];
    const rows = [];
    const commands = [];
    let toprow = null;   // col labels
    let leftcol = null;  // row labels
    const lines = text.replaceAll('"', '').split("\n").filter((/** @type {string} */ l) => l !== "");
    if (lines.length < 1) {
        txt += "Must have lines of data";
    } else {
        txt += `<table id="${name}">`;
        if (type !== "") txt += `<caption>${name || type}</caption>`;
        let wi = null, w = 0;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const elements = line.split(/[,;\t]/);
            if (elements.length > 1) {
                rows.push(elements);
                const num = elements.filter((/** @type {string | number} */ v) => Number.isFinite(+v)).length;
                if (num > w) {
                    wi = i;
                    w = num;
                }
            } else {
                commands.push(line);
            }
        }
        let start = 0, skip = 0;
        if (wi !== null) {
            // we have index of widest row - use as shape
            const master = rows[wi];
            start = master.findIndex((/** @type {string | number} */ e) => Number.isFinite(+e));
            // start is first numeric value of master row
            // now want to skip rows with mainly text
            skip = rows.findIndex(r => Number.isFinite(+r[start])) || 0;
            for (let i = skip; i < rows.length; i++) {
                data.push(rows[i].slice(start).map((/** @type {string | number} */ e) => Number.isFinite(+e) ? Number(e) : String(e)));
            }
            if (start > 0) {
                leftcol = transpose(rows).slice(0, 1)[0].slice(skip);  // use as headers for rows
            }
            if (skip > 0) {
                toprow = rows.slice(0, 1)[0].slice(start);  // use as headers for cols
            }
        } else {
            data = rows.slice();
        }
        const n = rows[0].length;
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            txt += '<tr>';
            for (let j = 0; j < n; j++) {
                // TODO variable for "td|th"
                const v = (row[j] || '').replace(/['"]/g, '');
                if (j < start || i < skip) {
                    txt += '<th>'
                    txt += v;
                    txt += '</th>'
                } else {
                    txt += '<td>'
                    txt += v;
                    txt += '</td>'
                }
            }
            txt += '</tr>';
        }
        txt += '</table>';
    }
    if (data.length) {
        if (data.length === 2) {
            // assume [ xs,ys ]
            // @ts-ignore
            regpoints[name || 'tbl'] = data;
        } else {
            // assume we need to transpose
            // @ts-ignore
            const tra = transpose(data);
            if (tra.length > 1) {
                regpoints[name || 'tbl'] = tra.slice(0, 2);
            }
        }
    }
    // @ts-ignore
    tableList[id] = txt;
    parent.innerHTML = txt;
    // @ts-ignore
    if (tableRender[type]) {
        // @ts-ignore
        tableRender[type](data.slice(), commands, id, { haveHead, leftcol, toprow }).map((/** @type {any} */ t) => {
            const d = create("div");
            d.className = "subtype";
            d.innerHTML = t;
            parent.append(d);
        });
    }

}


const parsePy = (/** @type {string} */ py) => {
    const prelude = 'from pylab import *\nreplot()\n';
    try {
        // @ts-ignore
        return __BRYTHON__.python_to_js(prelude + py);
    } catch (e) {
        // @ts-ignore
        if (e.name) {
            // @ts-ignore
            const msg = `Error at line ${Number(e.lineno) - 3}<br>`
                // @ts-ignore
                + `${e.msg}`;
            toast(msg);
        }
    }
    return '';
}

/**
 * check if we have :: xs = linspace(..); ys = f(xs)
 * If so then replace with :: ys = list(map(f,xs))
 * This is a hack to save switching from brython  ~ 0.75Mb
 * to pyodide ~ 12Mb
 * @param {string} py python code
 * @returns {string}
 */
function magicNumPyFix(py) {
    if (py.includes('linspace')) {
        // match pattern 'xxx = linspace(...)
        const def = py.match(/^(.+)= *linspace\(/m)
        if (def && def[1]) {
            // found xxx = linspace
            const xs = def[1].trimStart().trimEnd();
            // match pattern :: yyy = fu(varname)
            const reg = new RegExp(`^(.+) *= *(.+)\\(${xs}\\)$`, "m");
            const use = py.match(reg);
            if (use && use[1]) {
                const ys = use[1].trimEnd().trimStart();
                const fx = use[2].trimEnd().trimStart();
                py = py.replace(reg, `${ys} = array(map(${fx},${xs}))`);
            }
        }
    }
    return py
}

/**
 * @param {string} id
 * @param {string} py
 * @param {string | string[]} klass
 */
export function renderPy(id, py, klass) {
    if (py.endsWith("GO!\n")) {
        // @ts-ignore
        if (__BRYTHON__) {
            // @ts-ignore
            bryson.id = id;
            const fu = id + "_fu";
            const bar = id + "_bar";
            const bas = id + "_bas";
            // set up div for graphics, print and code
            $(id).innerHTML = `<div id="${fu}"></div>\n <div id="${bar}"></div>\n <div id="${bas}"></div>`;
            const fixedPy = magicNumPyFix(py);
            const ajscode = parsePy(fixedPy);
            try {
                eval(ajscode);
            } catch (e) {
                // @ts-ignore
                const info = e.args ? e.args[0] : "";
                // @ts-ignore
                if (e.name) {
                    // @ts-ignore
                    const inf = info || `${e.name} is perhaps undefined?`;
                    // @ts-ignore
                    const msg = `Error at line ${Number(e.$line_info.split(',')[0]) - 3}<br>`
                        + inf;
                    toast(msg);
                }
                console.log(e);
            }
            if (klass && klass.includes("code")) {
                const code = py.slice(1, -5).replace(/\&amp;/g, '&').replace(/\&gt;/g, '>').replace(/\&lt;/g, '<');
                $(bas).innerHTML = `<pre><code class="language-python">${code}</code></pre>`;
            }

        }
    } else {
        $(id).innerHTML = "End python prog with '#GO!' as last line";
    }
}

const plotDomain = (/** @type {number} */ size, /** @type {string | any[]} */ rest) => {
    let xmin = -5,
        xmax = 5,
        ymin = -5,
        ymax = 5;
    let width = max(70, +size),
        height = max(70, +size);
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
        // @ts-ignore
        optobj.yAxis = { domain: [+ymin, +ymax] };
    }
    return optobj;
}


/**
 * @param {{ append: (arg0: any) => void; }} parent
 * @param {string} fu
 * @param {number | undefined} size
 * @param {{ [x: string]: string; }} funks
 * @param {{ [x: string]: [any, any]; }} regpoints
 * @param {any} colors
 */
function plotGraph(parent, fu, size, funks, regpoints, colors) {
    const div = create('div');
    div.id = "plot" + Date.now();
    parent.append(div);
    try {
        const def = fu.replace(/([^,;]+)/g, (/** @type {any} */ a, /** @type {string | number} */ f) => {
            if (funks[f]) return funks[f].replace("matrix", "");
            if (regpoints[f]) {
                const [x, y] = regpoints[f];
                const xy = x.map((/** @type {any} */ v, /** @type {string | number} */ i) => [v, y[i]]);
                return JSON.stringify(xy);
            }
            return a;
        });
        const optdObj = plot(def, size, colors);
        // @ts-ignore
        optdObj.target = "#" + div.id;
        // @ts-ignore
        optdObj.grid = true;
        // @ts-ignore
        functionPlot(optdObj);
    } catch (e) {
        console.log("Failed plot:", fu, e);
    }
}

const alg2plot = (/** @type {any} */ fu) => {
    const fu2 = cleanUpMathLex(fu);
    return fu2.replace(/e\^([a-z])/g, (/** @type {any} */ _, /** @type {any} */ a) => {  // e^x
        return `exp(${a})`;
    })
        .replace(/e\^\(([^)]+)\)/g, (/** @type {any} */ _, /** @type {any} */ a) => {  // e^(-x^2)
            return `exp(${a})`;
        })
}

const polarPlot = (/** @type {{ append: (arg0: any) => void; }} */ parent, /** @type {any} */ lines, /** @type {string | number} */ width, /** @type {string} */ klass) => {
    const givenRange = klass.match(/ ([0-9.-]+),([0-9.-]+)/);
    const [_, lo = 0, hi = 6.285] = (givenRange || []);
    const range = [Number(lo), Number(hi)];
    for (const line of lines) {
        const div = create('div');
        div.id = "plot" + Date.now();
        parent.append(div);
        const pickApart = line.match(/([^ ]+)( \d+)?( [0-9a-z#,]+)?/);
        // @ts-ignore
        const [_, fu, size = 500, colors] = pickApart || [];
        let [polar, ...rest] = fu.split(",");
        const optObj = plotDomain(min(size, +width), rest);
        // @ts-ignore
        optObj.data = [{ r: polar, fnType: "polar", range, graphType: "polyline" }];
        // @ts-ignore
        optObj.target = "#" + div.id;
        try {
            // @ts-ignore
            functionPlot(optObj);
        } catch (e) {
            console.log("Polar:", e);
        }
    }
}

const paramPlot = (/** @type {{ append: (arg0: any) => void; }} */ parent, /** @type {string | any[]} */ lines, /** @type {string | number} */ width, /** @type {string} */ klass) => {
    const givenRange = klass.match(/ ([0-9.-]+),([0-9.-]+)/);
    const [_, lo = -10, hi = 10] = givenRange ? givenRange : [];
    const range = [Number(lo), Number(hi)];
    for (let i = 0; i < lines.length; i += 2) {
        const fx = lines[i];
        const y = lines[i + 1];
        const div = create('div');
        div.id = "plot" + Date.now();
        parent.append(div);
        const pickApart = fx.match(/([^ ]+)( \d+)?( [0-9a-z#,]+)?/);
        // @ts-ignore
        const [_, fu, size = 500, colors] = pickApart || [];
        let [x, ...rest] = fu.split(",");
        const optObj = plotDomain(min(size, +width), rest);
        // @ts-ignore
        optObj.data = [{ x, y, range, fnType: "parametric", graphType: "polyline" }];
        // @ts-ignore
        optObj.target = "#" + div.id;
        try {
            // @ts-ignore
            functionPlot(optObj);
        } catch (e) {
            console.log("parametric:", e);
        }
    }
}


/**
 * @param {string} id
 * @param {string} plot
 * @param {any} funks
 * @param {{}} regpoints
 */
export function renderPlot(id, plot, funks, regpoints, klass = "") {
    const parent = $(id);
    const [_, width = 350] = (klass.match(/ (\d+)$/)) || [];
    parent.style.setProperty("--min", String(width) + "px");
    const lines = plot.split('\n').filter((/** @type {string} */ e) => e != "");
    if (klass.includes("polar")) {
        // plot polar, r=f(theta)
        if (lines.length < 1) {
            parent.innerHTML = "Must give f(theta)";
            return;
        }
        polarPlot(parent, lines, width, klass);
    } else if (klass.includes("parametric")) {
        // plot parametric, x=f(t),y=f(t)
        if (lines.length < 2 || lines.length % 2 != 0) {
            parent.innerHTML = "Must give pairs of fx(t) and fy(t)";
            return;
        }
        paramPlot(parent, lines, width, klass);
    } else {
        for (let i = 0; i < lines.length; i++) {
            const pickApart = lines[i].match(/([^ ]+)( \d+)?( [0-9a-z#,]+)?/);
            // @ts-ignore
            const [_, fu, size = 500, colors] = pickApart;
            plotGraph(parent, alg2plot(fu), min(size, +width), funks, regpoints, colors);
        }
    }
}

/**
 * zips two arrays 
 * @param {Array<any>} a 
 * @param {Array<any>} b 
 * @returns Array
 */

const zip = (a, b) => a.map((val, i) => [val, b[i]]);


const parseOptions = (/** @type {string} */ s,o={}) => {
    const parts = s.trim().split(/\s+/);
    const oo = Object.assign({},o);
    const keys = Object.keys(o);
    // @ts-ignore
    const main = keys.filter(e => o[e]);
    // @ts-ignore
    const secunda = keys.filter(e => o[e] === undefined);
    const pairs = zip(main,secunda);
    for (const part of parts) {
        if (part === '') continue;
        if (part.includes('=')) {
            const [key, val] = part.split('=');
            // @ts-ignore
            oo[key] = Number(val);
        } else if (part.includes(',')) {
            const [a, b] = part.split(',');
            for (const [x,y] of pairs) {
                // @ts-ignore
                if (oo[x] !== o[x] || oo[y] !== undefined) continue;
                // @ts-ignore
                oo[x]=a; oo[y]=b; break;
            }
        } else {
            for (const x of main) {
                // @ts-ignore
                if (oo[x] !== o[x] ) continue;
                // @ts-ignore
                oo[x]=part; break;
            }
        }
    }
    // copy primary to secondary if undefined
    for (const [x,y] of pairs) {
       // @ts-ignore
       if (oo[y] === undefined) oo[y] = oo[x];
    }
    return oo;
}

/**
 * @param {string} id
 * @param {string} trig
 */
export function renderTrig(id, trig, klass = "") {
    const parent = $(id);
    // const [_, w = 350, s = 8, scale = 1] = (klass.match(/ (\d+\.?\d*)? ?(\d+\.?\d*)? ?([0-9.]+)?\s*$/)) || [];
    // @ts-ignore
    // @ts-ignore
    const { wx, wy, hx, hy, sx, sy } = parseOptions(klass, { wx: 350, wy: undefined, hx: 8, hy: undefined, sx: 1, sy: undefined });
    // sy is never used - just present for symmetry with x,y
    const parsed = parse(trig, `{w:${wx},s:${hx}}`);
    const [_1, x0 = 0, y0 = 0] = (trig.match(/origin\((-?[0-9.]+),(-?[0-9.]+)\)/)) || [];
    // @ts-ignore
    const x = +wx * x0 / +hx;
    // @ts-ignore
    const y = -wy * y0 / +hy;
    const lines = parsed.split('\n').filter(e => e != "");
    T.init();
    const svg = code2svg(lines, wx, hx, wy, hy);
    parent.innerHTML = `<svg id="${id}" width="${wx}" viewBox="${x} ${y}  ${wx} ${wy}"> 
      <g transform="scale(${sx})">
        ${svg}
      </g>
    </svg>`;
    T.renderAfter();
    // x-pos of some texts adjusted for textlength after render
}


// Exaples:
// a plot(x)
// b plot(x,-5,5) 200
// c plot(x^2;x,-5,5,-25,25) 300 red,green,blue
// d plot([[1,2],[3,4],[5,6]])
// e plot([[1,2,4,8,16,32]])
// f plot( {yAxis: {domain: [-1.897959183, 1.897959183]},xAxis: {domain: [-3, 3]},data: [{r: '2 * sin(4 theta)',fnType: 'polar',graphType: 'polyline' }] } )
// f plot({target: '#multiple',data: [ { fn: 'x', color: 'pink' }, { fn: '-x' }, { fn: 'x * x' }, { fn: 'x * x * x' }, { fn: 'x * x * x * x' } ] } )
/**
 * @param {string} str
 * @param {string} colors
 */
export function plot(str, size = 500, colors) {
    // first try to pick out any xy range
    // assume ---,1,2,3,4  or ---,1,2  or ---,-5,5
    const parts = str.split(",");
    const lastNum = parts.findLastIndex((/** @type {string | number} */ v) => !Number.isFinite(+v));
    const xyRange = parts.slice(lastNum + 1).slice(-4)
    // now we have [1,2,3,4] or [1,2] or [-5,5]
    const optobj = plotDomain(size, xyRange);
    // @ts-ignore
    optobj.data = [];
    // join together the body parts and split on ;
    const funks = parts.slice(0, lastNum + 1).join(",").split(";");
    // funks can be "[1,2,3];x;[[1,2],[3,4]];f;x+3;g(x)".split(";")
    const colorList = colors ? colors.trim().split(",") : [];
    funks.forEach((/** @type {any} */ f, /** @type {string | number} */ i) => {
        // @ts-ignore
        _plot(f, optobj, colorList[i]);
    });
    return optobj;
}




/**
 * @param {string} f
 * @param {{ width?: number; height?: number; xAxis: any; yAxis?: any; data?: any; }} optobj
 * @param {any} color
 * @param {undefined} [i]
 */
// @ts-ignore
function _plot(f, optobj, color, i) {
    let obj;
    try {
        obj = JSON.parse(f);
    } catch (er) {
        obj = f;
    }
    const [ymin = -5, ymax = 5] = optobj.yAxis ? optobj.yAxis.domain : [];
    const [xmin = -5, xmax = 5] = optobj.xAxis ? optobj.xAxis.domain : [];
    if (Array.isArray(obj)) {
        // type d,e
        if (Array.isArray(obj[0])) {
            const mymax = obj.reduce((s, v) => max(v[1], s), obj[0][1]);
            const mymin = obj.reduce((s, v) => min(v[1], s), obj[0][1]);
            const mxmax = obj.reduce((s, v) => max(v[0], s), obj[0][0]);
            const mxmin = obj.reduce((s, v) => min(v[0], s), obj[0][0]);
            optobj.yAxis = { domain: [min(ymin, mymin - 0.1), max(ymax, mymax + 0.1)] };
            optobj.xAxis = { domain: [min(xmin, mxmin), max(xmax, mxmax)] };
            // type d
            // data: [{ points: [  [1, 1],  [2, 1], [2, 2],  [1, 2],  [1, 1]  ],  fnType: 'points',  graphType: 'scatter'  }]
            optobj.data.push({ points: obj, fnType: "points", graphType: "scatter" });
            // @ts-ignore
            return optobj;
        } else {
            // type e
            const mymax = Math.max(...obj);
            const mymin = Math.min(...obj);
            const mxmin = 0;
            const mxmax = obj.length;
            optobj.yAxis = { domain: [min(ymin, mymin - 2), max(ymax, mymax + 2)] };
            optobj.xAxis = { domain: [min(xmin, mxmin), max(xmax, mxmax)] };
            const points = obj.map((e, i) => [i, e]);
            optobj.data.push({ points, fnType: "points", graphType: "scatter" });
            // @ts-ignore
            return optobj;
        }
    } else if (typeof f === "string") {
        // type a,b,c
        let graphType = 'polyline';
        let obj = {};
        const fn = f.replace(/√/g, "sqrt");
        if (f.includes("=")) {
            // assume Ax+By=C
            // try as y=f(x)
            const fy = giaEval(`solve(${f},y)`);
            if (fy.startsWith("list[")) {
                // found solution for y=
                obj = fy.slice(5, -1).replace(/√/g, 'sqrt').split(",").map((/** @type {any} */ fn) => ({ fn, graphType }));
                optobj.data = optobj.data.concat(obj);
                return optobj;
                // @ts-ignore
                // obj = { fn, graphType };
            } else {
                const fy = giaEval(`solve(${f})`);
                if (fy.startsWith("list[")) {
                    const x = fy.slice(5, -1).replace(/√(\d+)/g, (/** @type {any} */ _, /** @type {any} */ n) => `sqrt(${n})`);
                    // @ts-ignore
                    obj = { x, y: 't', fnType: 'parametric', graphType, range: [ymin, ymax] }
                }
            }
        } else {
            // @ts-ignore
            obj = { fn, graphType };
        }
        if (color) obj.color = color;

        optobj.data.push(obj);
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




