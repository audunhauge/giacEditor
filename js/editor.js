// @ts-check

import {
    thingsWithId, updateMyProperties, qsa, qs,
    wrap, $, create, getLocalJSON, setLocalJSON, curry,
} from './Minos.js';


import { lang, trans, _translateAtCommands } from './translate.js';

const { home, app, back, aktiv, help, info, newfile, aside, editor,
    mathView, ed, examples, savedFiles, sp } = thingsWithId();


import { saveFileButton, readFileButton } from './filehandling.js';

import { startReplay } from './replay.js';

const langlist = Object.keys(lang);
let currentLanguage = "english";
let translateAtCommands = curry(_translateAtCommands)(lang[currentLanguage]);


const web = updateMyProperties({ langlist });
const sessionID = "mathEd";

web.lang = 0;  // start with first lang in list
$("lang").setAttribute("max", String(langlist.length - 1))

$("lang").onchange = () => {
    currentLanguage = web.chosen;
    translateAtCommands = curry(_translateAtCommands)(lang[currentLanguage]);
    renderAll();
}

$("replay").onclick = () => {
    startReplay(ed,renderAll);
}


const goHome = () => {
    const filename = web.filename;
    setLocalJSON("filename", filename);
    web.current = filename;
    app.classList.add("hidden");
    home.classList.remove("hidden");
    aktiv.classList.remove("hidden");
}

let oldSession;

const goEdit = () => {
    app.classList.remove("hidden");
    home.classList.add("hidden");
    oldSession = getLocalJSON(sessionID);  // previous contents
    const filename = getLocalJSON("filename") || "test.mxy"; // filename
    // set starting font size to 50/50 rem
    web.fs = 50;    // math region font size
    web.efs = 50;   // editor font size
    web.sp = 50;    // spacing between questions
    ed.value = oldSession || "";
    web.filename = filename;
    if (oldSession) {
        renderAll();
    }
}

sp.oninput = () => {
    const root = document.documentElement;
    root.style.setProperty("--spacing", `${web.sp / 50}rem`);
}

help.onclick = () => {
    info.classList.toggle("hidden");
}

back.onclick = goHome;

aktiv.onclick = goEdit;

let asideEd = null; // global variable

aside.onclick = async () => {
    if (asideEd == null || asideEd.closed) {
        asideEd = await window.open("aside.html", "AsideEdit",
            "popup,width=820,height=520");
    }
    // give aside editor time to render
    setTimeout(() => {
        const aed = asideEd.document.querySelector("#ed");
        aed.value = ed.value;
        editor.classList.toggle("hidden");
        if (!editor.classList.contains("hidden")) {
            asideEd.focus();
        };
    }, 100);
}



newfile.onclick = () => {
    const txt = "# Prøve\n";
    setLocalJSON(sessionID, txt);
    setLocalJSON("filename", "newfile");
    goEdit();
}


async function setup() {
    const url = "examples.json";
    const response = await fetch(url);
    const examples = await response.json();
    web.examples.push(...examples);
    // saved files may be none
    const savedFiles = getLocalJSON("savedfiles") || [];
    web.savedFiles.push(...savedFiles.slice(0, 5));
}

setup();

examples.onclick = async (e) => {
    const t = e.target;
    if (t.className === "file") {
        const name = t.dataset.name;
        const url = '/media/' + name;
        const response = await fetch(url);
        const txt = (response.ok)
            ? await response.text()
            : "Missing example";
        setLocalJSON(sessionID, txt);
        setLocalJSON("filename", name);
        goEdit();
    }
}


savedFiles.onclick = async (e) => {
    const t = e.target;
    if (t.className === "file") {
        const name = t.dataset.name;
        const txt = getLocalJSON("saved:" + name);
        setLocalJSON(sessionID, txt);
        setLocalJSON("filename", name);
        goEdit();
    }
}

import { code2svg, parse } from './trig.js';

const { min, max } = Math;


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



// @ts-ignore
const md = new remarkable.Remarkable("full", { html: true });

const seplist = {
    ">": "\\gt",
    "<": "\\lt",
    "=": "=",
    ">=": "\\ge",
    "<=": "\\le",
}


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

const renderSimple = (line, { mode, klass }, comment='') => {
    const latex = makeLatex(line, { mode, klass });
    return `<div><span>${latex}</span><span>${comment}</span></div>`;
}

const renderLikning = (line, comment, { mode, klass }) => {
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
function renderAlgebra(id, txt, size = "") {
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
function renderEquation(id, txt, size = "") {
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



const renderEqnSet = (id, txt, size = "") => {
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

function renderMath(id, math, size = "") {
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
            newMath[i] = renderSimple(line, { mode, klass },comment);
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

function renderPlot(id, plot, klass = "") {
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

function renderTrig(id, trig, klass = "") {
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

let oldRest = [];

export const renderAll = () => {
    const textWithSingleNewLineAtEnd = ed.value.replace(/\n*$/, '\n').replace(/^@fasit/gm, '@question fasit');
    const plots = [];
    const maths = [];
    const algebra = [];
    const eqsets = [];
    const trigs = [];
    const eqs = [];         // equations like 5x+5=2x-6 => transformed by |-5  |-2x |/3
    let ofs = 1234; // uniq id for math,alg etc
    const splitter = lang[currentLanguage]?.splitter || 'question';
    const splitReg = new RegExp(`@${splitter}`,"gm");
    const sections = textWithSingleNewLineAtEnd.split(splitReg).map(e => e.replace(/\s+$/, '\n'));
    const mdLatex = txt => md.render(txt).replace(/\$([^$]+)\$/gm, (_, m) => makeLatex(m, { mode: false, klass: "" }));
    const prepped = (textWithSingleNewLineAtEnd, seg) => {
        const international = translateAtCommands(textWithSingleNewLineAtEnd);
        return international
            .replace(/@plot( .*)?$([^€]+?)^$^/gm, (_, klass, plot) => {
                ofs++;
                plots.push({ plot, id: `graf${seg}_${ofs}`, klass, seg });
                return `<div class="plots ${klass}" id="graf${seg}_${ofs}"></div>\n`;
            })
            .replace(/@trig( .*)?$([^€]+?)^$^/gm, (_, klass, trig) => {
                ofs++;
                trigs.push({ trig, id: `trig${seg}_${ofs}`, klass, seg });
                return `<div class="trig ${klass}" id="trig${seg}_${ofs}"></div>\n`;
            })
            .replace(/@eqset( .*)?$([^€]+?)^$^/gm, (_, klass, eq) => {
                ofs++;
                eqsets.push({ eq, id: `eqs${seg}_${ofs}`, klass, seg });
                return `<div class="equation qset ${klass}" id="eqs${seg}_${ofs}"></div>\n`;
            })
            .replace(/^@math( .*)?$([^€]+?)^$^/gm, (_, size, math) => {
                ofs++;
                maths.push({ math, id: `ma${seg}_${ofs}`, size, seg });
                return `<div  class="math ${size}" id="ma${seg}_${ofs}"></div>\n`;
            })
            .replace(/^@cas( .*)?$([^€]+?)^$^/gm, (_, size, math) => {
                ofs++;
                algebra.push({ math, id: `alg${seg}_${ofs}`, size, seg });
                return `<div  class="algebra ${size}" id="alg${seg}_${ofs}"></div>\n`;
            })
            .replace(/^@eq( .*)?$([^€]+?)^$^/gm, (_, size, math) => {
                ofs++;
                eqs.push({ math, id: `eq${seg}_${ofs}`, size, seg });
                return `<div  class="equation ${size}" id="eq${seg}_${ofs}"></div>\n`;
            })
            .replace(/^@question( fasit)?( synlig)?( kolonner)?( .*)?$/gm, (_, fasit, synlig, kolonner, txt) => {
                const hr = fasit ? '<hr>' : '';
                return `<div class="oppgave ${kolonner || ""} ${fasit || ""} ${synlig || ""}" title="${splitter}">${txt || ""}${hr}</div>\n`;
            })
            .replace(/^@format( .*)?$/gm, (_, format) => {
                return `<div class="format ${format}"></div>\n`;
            })
            .replace(/^@ans( .*)?$/gm, (_, ans) => {
                return `<div><span class="answer"><span>${ans}</span></span></div>\n`;
            })
            .replace(/@dato( \d+)?/gm, (_, ofs) => {
                const theDay = new Date();
                theDay.setDate(theDay.getDate() + Number(ofs));
                return `<span class="date">${theDay.toLocaleDateString('en-GB')}</span>`;
            })
    }


    const dirtyList = [];
    let rerend = false;
    for (let i = 0; i < sections.length; i++) {
        if (sections[i] !== oldRest[i]) {
            dirtyList.push(i);
        }
    }
    if (sections.length < 3 || oldRest.length !== sections.length) {
        // just rerender everything
        const preludeMath = `<div class="prelude" id="seg0">\n` + mdLatex(prepped(sections[0], 0)) + '</div>';
        const theSections = sections.slice(1);
        const restMath = theSections.map((e, i) => `<div class="section" id="seg${i + 1}">\n` + prepped('@question' + e, i) + '\n</div>').join("");
        mathView.innerHTML = mdLatex(preludeMath + restMath);
        rerend = true;
    } else if (dirtyList.length === 1 && dirtyList[0] === oldRest.length) {
        // just append a new section
        const seg = dirtyList[0];
        const newSection = sections[seg];  // the new @question
        const div = create('div');
        const plain = `<div class="section" id="seg${seg}">\n` + prepped('@question' + newSection, seg) + '\n</div>';
        div.innerHTML = mdLatex(plain);
        mathView.append(div);
    } else {
        // same length -just update the dirty ones
        for (let i = 0; i < dirtyList.length; i++) {
            const seg = dirtyList[i];
            const txt = sections[seg];
            const section = $('seg' + seg);
            section.classList.toggle("red");
            if (seg === 0) {
                section.innerHTML = mdLatex(prepped(txt, seg));
            } else {
                section.innerHTML = mdLatex(prepped('@question' + txt, seg));
            }
        }
    }

    // lift fasit out to the section level
    // expect only one fasit - strange to have more than one
    const fasit = qs(".section > .fasit");
    if (fasit) {
        fasit.parentNode.classList.add("fasit");
        fasit.parentNode.classList.remove("skjult");
        if (!fasit.classList.contains("synlig")) {
            fasit.parentNode.classList.add("skjult");
        }
    }

    // lift kolonner out to the section level
    const kolonner = qsa(".section > .kolonner");
    kolonner.forEach(k => k.parentNode.classList.add("kolonner"));






    // now figure out which views have changed

    oldRest = sections.slice();  // make copy


    maths.forEach(({ math, id, size, seg }) => {
        if (rerend || dirtyList.includes(seg))
            renderMath(id, math, size);
    });
    let segnum = {};  // have we reset giac for this segment?
    eqs.forEach(({ math, id, size, seg }) => {
        if (segnum[seg] === undefined) {
            segnum[seg] = 1;
            // @ts-ignore  First alg in this seg, reset giac
            UI.eval("restart");
        }
        if (rerend || dirtyList.includes(seg)) {
            const perc = renderEquation(id, math, size);
            const klass = perc > 0.6 ? "manycomments" : perc === 0 ? "nocomments" : "some";
            $(id).classList.remove("manycomments", "nocomments");
            $(id).classList.add(klass);
        }
    });
    eqsets.forEach(({ eq, id, size, seg }) => {
        if (segnum[seg] === undefined) {
            segnum[seg] = 1;
            // @ts-ignore  First alg in this seg, reset giac
            UI.eval("restart");
        }
        if (rerend || dirtyList.includes(seg)) {
            renderEqnSet(id, eq, size);
        }
    });
    algebra.forEach(({ math, id, size, seg }) => {
        if (segnum[seg] === undefined) {
            segnum[seg] = 1;
            // @ts-ignore  First alg in this seg, reset giac
            UI.eval("restart");
        }
        if (rerend || dirtyList.includes(seg)) {
            const perc = renderAlgebra(id, math, size);
            const klass = perc > 0.6 ? "manycomments" : perc === 0 ? "nocomments" : "some";
            $(id).classList.remove("manycomments", "nocomments");
            $(id).classList.add(klass);
        }
    });
    plots.forEach(({ plot, id, klass, seg }) => {
        if (rerend || dirtyList.includes(seg))
            renderPlot(id, plot, klass);
    });
    trigs.forEach(({ trig, id, klass, seg }) => {
        if (rerend || dirtyList.includes(seg))
            renderTrig(id, trig, klass);
    });
    setLocalJSON(sessionID, ed.value);
}


readFileButton("load", (file, text) => {
    ed.value = text;
    renderAll();
    web.filename = file.name;
});

saveFileButton("save", web.filename, (newName) => {
    setLocalJSON("filename", newName);
    web.filename = newName;
    const savedFiles = getLocalJSON("savedfiles") || [];
    savedFiles.push(newName);
    const uniq = new Set(savedFiles);
    setLocalJSON("savedfiles", Array.from(uniq));
    setLocalJSON("saved:" + newName, ed.value);
    return ed.value;
});


// some simple attempts to avoid rerender
let timestep = 0;
let oldtext = "";
ed.onkeyup = (e) => {
    const now = Date.now();
    const k = e.key;
    const render = k === "Enter" || k.includes("Arrow");
    if (render) {
        // remove hot edit markers
        qsa(".red").forEach(e => e.classList.remove("red"));
        const diff = oldtext !== ed.value;
        if (diff && now > timestep + 1000) {
            renderAll();
            timestep = Date.now();
            oldtext = ed.value;
        }
    }
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
