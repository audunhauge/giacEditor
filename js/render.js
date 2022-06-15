// @ts-check

import { lang, trans } from './translate.js';
import { wrap, $, create } from './Minos.js';
import { web, tg } from './editor.js';
import { code2svg, parse, eva, range } from './trig.js';
import { toast, curry, compose, colorscale1, colorscale2, colorscale3, nice } from './util.js';
import {
    hyperC, hyper, binomial, binomialC,
    normal, normalC, fisher, fisherCrit
} from './probability.js';

import { frekTable, statsTable, anovaTable, dataTable, transpose } from './tables.js';

const { abs, min, max, sin, cos, PI, floor, log, exp, E } = Math;


export var tableList = {};
export var svgList = {};


// @ts-ignore
export const katx = (s, mode) => katex.renderToString(String(s), {
    throwOnError: false,
    displayMode: mode,
});

export function cleanUpMathLex(code) {
    if (code === "") return "";
    return code
        .replace(/\*\*/gm, "^")
        .replace(/x\(/gm, (m, a) => 'x*(')   //  x(x-2) => x*(x+2)
        // only for x so that sin(x) != sin*(x)
        .replace(/\)\(/gm, ")*(") // (x+a)(x-2) => (x+a)*(x-2)
        .replace(/([0-9])\(/gm, (m, a) => a + "*(")  // 3( => 3*(
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


export const makeLatex = (txt, { mode, klass }) => {
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

export const litex = txt => makeLatex(txt, { mode: false, klass: "" });


const lotex = txt => {
    try {
        const simplex = cleanUpMathLex(txt);
        // @ts-ignore 
        return MathLex.render(MathLex.parse(simplex), "latex");
    } catch (er) {
        return txt;
    }
}


const giaClean = (exp, fallback = "?") => {
    const v = exp.replace(/["*]/g, '').replace('mbox', 'boxed');
    if (v.startsWith("GIAC")) return fallback;
    return v;
}

export const giaEval = exp => {
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
//const giaTex = exp => giaClean(giaEval(`latex(${exp})`));
const giaTex = (exp, old = "?") => giaClean(exp, old);


const operate = (exp, op) => {
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

export const renderPoldiv = (id, txt, size = "") => {
    const lines = txt.split('\n').filter(e => e != "");
    if (lines.length < 2) {
        $(id).innerHTML = "Must have exactly two equations"
        return;
    }
    const [numerator, denominator, ...rest] = lines;
    // if rest is non empty then reveal as many lines as given by rest
    const answer = giaEval(`propfrac((${numerator})/(${denominator}))`);
    const parts = answer.replace(/\(.+?\)/g, 'u').replace(/([+-])/g, (_, pm) => '#' + pm).split('#');
    const pnumber = parts.length;
    const howmany = min(rest.length || pnumber, pnumber);
    const visibleAnswer = (howmany === pnumber) ? answer : parts.slice(0, howmany).join("");
    const heading = `<div class="poldiv"><span class="num">${katx(simplify(numerator))}</span><span> : </span>
                    <span class="deno">${litex(denominator)}</span><span> = </span> <span class="ans">${litex(visibleAnswer)}</span></div>`;
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
        howto += `<div>${f}${litex(rem)}</div><div>${u}${litex(pol)}</div>`
    }
    $(id).innerHTML = heading + howto;
}


const diff = arr => {
    if (arr.length < 2) return arr;
    const d = arr.map((v, i) => arr[i + 1] - v);
    d[d.length] = d[d.length - 1];
    return d;
}

export const renderSigram = (id, txt, funks, size = "") => {
    const lines = txt.split('\n').filter(e => e != "");
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
        const kalex = renderLikning(clean, comment, { mode: false, klass: "" });
        newMath[i] = `<span data-nr="${'I'.repeat(i + 1)}" class="eqset">${kalex}</span>`;
    }
    let eqnb = 1;
    for (let i = 2; i < lines.length; i++) {
        const [todo, comment = ""] = lines[i].split("::");
        comments += comment ? 1 : 0;            // count number of comments
        let [idx, line] = todo.split(":");     //  "1:+2"  "2:*3"
        const [a, op, b] = todo.split('');
        if ("+-".includes(op) && +a + +b === 3) {
            // 1+2 2-1 2+1 1-2
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

export const renderPiece = (id, txt, size = "") => {
    const lines = txt.split('\n').filter(e => e != "");
    //let lat = `f(a,b) =   \begin{cases} 2 \cdot x+a \quad \text{for } x\le 1 \\\\      x^2+bx  \quad \text{for } x \gt 1
    //\end{cases}`;
    if (lines.length < 3) {
        $(id).innerHTML = "Expecting<br>f(x)<br>part1:limits<br>part2:limits<br>..more parts"
        return;
    }
    const funcName = lines[0];
    let lat = funcName + '=' + '\\begin{cases}\n';
    for (let i = 1; i < lines.length; i++) {
        const [exp, limit] = lines[i].split(":");
        lat += lotex(exp) + ' \\quad \\text{for } ' + lotex(limit) + '\\\\\n';
    }
    lat += ' \\end{cases}\n';
    $(id).innerHTML = katx(lat, true);
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
 * Computer Algebra System
 * @param {string} id div containing result
 * @param {string} txt lines of algebra
 * @param {string} size TODO remove
 * @returns {number} percentage of lines+1 with comments 
 */
export function renderAlgebra(id, txt, funks, size = "") {
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
            funks[exp] = giaEval(rhs);
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

export function renderMath(id, math, funks, size = "") {
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

const distfu = {
    normal: normal,
    normalC: normalC,
    binom: binomial,
    hyper: hyper,
    binomC: binomialC,
    hyperC: hyperC,
}

const distPlot = (fu, range, type) => {
    const values = range.map(fu);
    const large = max(...values);
    const largeX = range[values.indexOf(large)];
    // find first value > 0.00001 and trim
    const first = values.findIndex(e => e > 0.00001);
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
    return [trueRange.map((x, i) => `<div title="${x}:${truValues[i]}" style="left:${i * w}px;height:${floor(truValues[i] * scale)}px"></div>`).join("")
        , largeX + "," + large.toFixed(3), trueRange.length];
};
const distRange = (fu, range, type, fuc) => {
    const mufu = type === "normal" ? fuc : fu;
    const eqles = type === "normal" ? "≤" : "=";
    const ys = range.map(mufu);
    let sum = ys.reduce((s, v) => s + v, 0);
    return [range.map((x, i) => `<div><span>P(X ${eqles} ${x}) </span> = <span> ${ys[i].toFixed(4)} </span></div>`).join("")
        , sum];
}

export function renderDist(id, ls, params, type) {
    let txt = "";
    let header = "";
    type = type.trimStart();
    let plot = "";
    const lines = ls.split("\n").filter(l => l.length);
    let fu = distfu[type];
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
            hi = min(+hi, maximum);
            const [graph, largest, width] = distPlot(fu, range(+lo, +hi), type);
            plot += `<div style="width:${width * 5}px" title="${lo}:${hi} max=(${largest})">` + graph + '</div>';
            txt += `<div><span>Plot </span><span> ${lo},${hi} </span></div>`;
            continue;
        }
        if (line.startsWith("range")) {
            let [_, lo, hi] = line.match(/^range +([0-9.-]+),([0-9.-]+)/) || [];
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
 *   ,a,b,c,d,e,f
 *   x,1,2,3,4,5,6
 *   y,4,5,6,7,8,9
 *   commands  (any lines without , are assumed to be commands)
 *   data = [[1,2,3,4,5,6],[4,5,6,7,8,9]]
 *   all rows padded to same length
 */
export function renderTable(id, text, type, name, regpoints) {
    const parent = $(id)
    let txt = '';
    let haveHead = false;
    let data = [];
    const rows = [];
    const commands = [];
    const lines = text.replaceAll('"', '').split("\n").filter(l => l !== "");
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
                const num = elements.filter(v => Number.isFinite(+v)).length;
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
            start = master.findIndex(e => Number.isFinite(+e));
            // start is first numeric value of master row
            // now want to skip rows with mainly text
            skip = rows.findIndex(r => Number.isFinite(+r[start])) || 0;
            for (let i = skip; i < rows.length; i++) {
                data.push(rows[i].slice(start).map(e => Number.isFinite(+e) ? Number(e) : String(e)));
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
                const v = (row[j] || '').replace(/['"]/g,'');
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
            regpoints[name || 'tbl'] = data;
        } else {
            // assume we need to transpose
            const tra = transpose(data);
            if (tra.length > 1) {
                regpoints[name || 'tbl'] = tra.slice(0,2);
            }
        }
    }
    tableList[id] = txt;
    parent.innerHTML = txt;
    if (tableRender[type]) {
        tableRender[type](data.slice(), commands, id, haveHead).map(t => {
            const d = create("div");
            d.className = "subtype";
            d.innerHTML = t;
            parent.append(d);
        });
    }

}


 function _renderTable(id, text, type, name) {
    const parent = $(id)
    let txt = '';
    let haveHead = false;
    const data = [];
    const commands = [];
    const lines = text.split("\n").filter(l => l !== "");
    if (lines.length < 1) {
        txt += "Must have lines of data";
    } else {
        txt += `<table id="${name}">`;
        if (type !== "") txt += `<caption>${name || type}</caption>`;
        const headers = lines[0].replaceAll('"', '').split(/[,;\t]/);
        if (!Number.isFinite(+headers[0]) && !headers[0].includes(":")) {
            // not number and not start:stop - assume header
            txt += '<thead><tr>' + wrap(headers, "th") + '</tr></thead>';
            lines.shift();
            haveHead = true;
        }
        txt += '<tbody>';
        const w = headers.length;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].replaceAll('"', '');
            const values = line.split(/[,;\t]/).slice(0, w);
            if (values.length > 1) {
                const base = Array(w).fill("");
                values.forEach((v, i) => base[i] = v);
                txt += '<tr>' + wrap(base, "td") + '</tr>';
                data.push(base.map(e => Number.isFinite(+e) ? Number(e) : String(e)));
            } else {  // assume a command
                commands.push(lines[i]);
            }
        }
        txt += '</tbody>';
        txt += '</table>';
    }
    tableList[id] = txt;
    parent.innerHTML = txt;
    if (tableRender[type]) {
        tableRender[type](data.slice(), commands, id, haveHead).map(t => {
            const d = create("div");
            d.className = "subtype";
            d.innerHTML = t;
            parent.append(d);
        });
    }

}

const parsePy = py => {
    const prelude = 'from pylab import *\nreplot()\n';
    try {
        // @ts-ignore
        return __BRYTHON__.python_to_js(prelude + py);
    } catch (e) {
        if (e.name) {
            const msg = `Error at line ${Number(e.lineno) - 3}<br>`
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
                const info = e.args ? e.args[0] : "";
                if (e.name) {
                    const inf = info || `${e.name} is perhaps undefined?`;
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

const plotDomain = (size, rest) => {
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
        optobj.yAxis = { domain: [+ymin, +ymax] };
    }
    return optobj;
}


function plotGraph(parent, fu, size, funks, regpoints, colors) {
    const div = create('div');
    div.id = "plot" + Date.now();
    parent.append(div);
    try {
        const def = fu.replace(/([^,;]+)/g, (a, f) => {
            if (funks[f]) return funks[f].replace("matrix", "");
            if (regpoints[f]) {
                const [x, y] = regpoints[f];
                const xy = x.map((v, i) => [v, y[i]]);
                return JSON.stringify(xy);
            }
            return a;
        });
        const optdObj = plot(def, size, colors);
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
    return fu2.replace(/e\^([a-z])/g, (_, a) => {  // e^x
        return `exp(${a})`;
    })
        .replace(/e\^\(([^)]+)\)/g, (_, a) => {  // e^(-x^2)
            return `exp(${a})`;
        })
}

const polarPlot = (parent, lines, width, klass) => {
    const givenRange = klass.match(/ ([0-9.-]+),([0-9.-]+)/);
    const [_, lo = 0, hi = 6.285] = (givenRange || []);
    const range = [Number(lo), Number(hi)];
    for (const line of lines) {
        const div = create('div');
        div.id = "plot" + Date.now();
        parent.append(div);
        const pickApart = line.match(/([^ ]+)( \d+)?( [0-9a-z#,]+)?/);
        const [_, fu, size = 500, colors] = pickApart || [];
        let [polar, ...rest] = fu.split(",");
        const optObj = plotDomain(min(size, +width), rest);
        optObj.data = [{ r: polar, fnType: "polar", range, graphType: "polyline" }];
        optObj.target = "#" + div.id;
        try {
            // @ts-ignore
            functionPlot(optObj);
        } catch (e) {
            console.log("Polar:", e);
        }
    }
}

const paramPlot = (parent, lines, width, klass) => {
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
        const [_, fu, size = 500, colors] = pickApart || [];
        let [x, ...rest] = fu.split(",");
        const optObj = plotDomain(min(size, +width), rest);
        optObj.data = [{ x, y, range, fnType: "parametric", graphType: "polyline" }];
        optObj.target = "#" + div.id;
        try {
            // @ts-ignore
            functionPlot(optObj);
        } catch (e) {
            console.log("parametric:", e);
        }
    }
}

export function renderPlot(id, plot, funks, regpoints, klass = "") {
    const parent = $(id);
    const [_, width = 350] = (klass.match(/ (\d+)$/)) || [];
    parent.style.setProperty("--min", String(width) + "px");
    const lines = plot.split('\n').filter(e => e != "");
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
            const [_, fu, size = 500, colors] = pickApart;
            plotGraph(parent, alg2plot(fu), min(size, +width), funks, regpoints, colors);
        }
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


// Exaples:
// a plot(x)
// b plot(x,-5,5) 200
// c plot(x^2;x,-5,5,-25,25) 300 red,green,blue
// d plot([[1,2],[3,4],[5,6]])
// e plot([[1,2,4,8,16,32]])
// f plot( {yAxis: {domain: [-1.897959183, 1.897959183]},xAxis: {domain: [-3, 3]},data: [{r: '2 * sin(4 theta)',fnType: 'polar',graphType: 'polyline' }] } )
// f plot({target: '#multiple',data: [ { fn: 'x', color: 'pink' }, { fn: '-x' }, { fn: 'x * x' }, { fn: 'x * x * x' }, { fn: 'x * x * x * x' } ] } )
export function plot(str, size = 500, colors) {
    // first try to pick out any xy range
    // assume ---,1,2,3,4  or ---,1,2  or ---,-5,5
    const parts = str.split(",");
    const lastNum = parts.findLastIndex(v => !Number.isFinite(+v));
    const xyRange = parts.slice(lastNum + 1).slice(-4)
    // now we have [1,2,3,4] or [1,2] or [-5,5]
    const optobj = plotDomain(size, xyRange);
    optobj.data = [];
    // join together the body parts and split on ;
    const funks = parts.slice(0, lastNum + 1).join(",").split(";");
    // funks can be "[1,2,3];x;[[1,2],[3,4]];f;x+3;g(x)".split(";")
    const colorList = colors ? colors.trim().split(",") : [];
    funks.forEach((f, i) => {
        _plot(f, optobj, colorList[i]);
    });
    return optobj;
}




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
                obj = fy.slice(5, -1).replace(/√/g, 'sqrt').split(",").map(fn => ({ fn, graphType }));
                // @ts-ignore
                // obj = { fn, graphType };
            } else {
                const fy = giaEval(`solve(${f})`);
                if (fy.startsWith("list[")) {
                    const x = fy.slice(5, -1).replace(/√(\d+)/g, (_, n) => `sqrt(${n})`);
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




