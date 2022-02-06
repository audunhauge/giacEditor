// @ts-check

import {
    thingsWithId, updateMyProperties, qsa, qs,
    $, create, getLocalJSON, setLocalJSON, curry,
} from './Minos.js';

import {
    renderAlgebra, renderPoldiv, renderEqnSet, renderPy,
    makeLatex, renderSigram, renderPiece,
    renderEquation, renderMath, renderPlot, renderTrig
} from './render.js';

import { lang, _translateAtCommands } from './translate.js';
import { autocom, helptxt, prep } from './autotags.js';

const { home, app, back, aktiv, help, info, newfile, aside, editor, gistlist, gistit,
     mathView, ed, examples, savedFiles, gitlist, sp }
    = thingsWithId();


import { saveFileButton, readFileButton, gitFiles, gistify,
        getGitFile, getGistFile, gistFiles } from './filehandling.js';

import { startReplay } from './replay.js';
import { toast } from './util.js';


const langlist = Object.keys(lang);
let currentLanguage = getLocalJSON("lang") || "english";
let translateAtCommands = curry(_translateAtCommands)(lang[currentLanguage]);


export const web = updateMyProperties({ langlist });
const sessionID = "mathEd";

// web.lang = 0;  // start with first lang in list
web.lang = langlist.indexOf(currentLanguage);
$("lang").setAttribute("max", String(langlist.length - 1))

$("lang").onchange = () => setLang()

function setLang() {
    currentLanguage = web.chosen;
    translateAtCommands = curry(_translateAtCommands)(lang[currentLanguage]);
    renderAll();
    setLocalJSON("lang", currentLanguage);
}

prep(lang[currentLanguage]);

let replayActive = false;

$("replay").onclick = () => {
    if (replayActive) {
        replayActive = false;
        const event = new Event('killReplay');
        document.dispatchEvent(event);
        return;
    }
    replayActive = true;
    toast("Starting replay - use arrow keys to controll<p>'Esc' to end.", { delay: 0.8 });
    startReplay(ed, renderAll);
}



document.addEventListener("replayOver", (e) => {
    replayActive = false;
    toast("Ending replay", { delay: 0.2 });
})


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
        document.addEventListener("asideReady", (e) => {
            const aed = asideEd.document.querySelector("#ed");
            aed.value = ed.value;
            if (!editor.classList.contains("hidden")) {
                asideEd.focus();
            };
        });
    } else {
        const aed = asideEd.document.querySelector("#ed");
        aed.value = ed.value;
        if (!editor.classList.contains("hidden")) {
            asideEd.focus();
        };
    }

    editor.classList.toggle("hidden");
}



newfile.onclick = () => {
    const txt = `# Prøve
Dobbeltklikk på ordet på neste linje for å få hjelp

help
    
Deretter kan du dobbeltklikke på ord markert med blå skrift.`;
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
    const gitfiles = await gitFiles();
    web.gitlist.push(...gitfiles);
    const gistfiles = await gistFiles();
    web.gistlist.push(...gistfiles);
}

setup();

examples.onclick = async (e) => {
    const t = e.target;
    if (t.classList.contains("file")) {
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
    if (t.classList.contains("file")) {
        const name = t.dataset.name;
        const txt = getLocalJSON("saved:" + name);
        setLocalJSON(sessionID, txt);
        setLocalJSON("filename", name);
        goEdit();
    }
}

gitlist.onclick = async (e) => {
    const t = e.target;
    if (t.classList.contains("file")) {
        const name = t.dataset.name;
        const txt = await getGitFile(name);
        setLocalJSON(sessionID, txt);
        setLocalJSON("filename", name);
        goEdit();
    }
}

const gist = {

}

gistlist.onclick = async (e) => {
    const t = e.target;
    if (t.classList.contains("file")) {
        const name = t.dataset.name;
        const url = t.dataset.url;
        const id = t.dataset.id;
        const txt = await getGistFile(url);
        setLocalJSON(sessionID, txt);
        setLocalJSON("filename", name);
        gist.name = name;
        gist.id = id;
        goEdit();
    }
}

gistit.onclick = async () => {
    const {name,id} = gist;
    const content = ed.value;
    gistify(id,name,content);
}



// @ts-ignore
const md = new remarkable.Remarkable("full", { html: true });

let oldRest = [];

const scrollit = (target) => {
    if (!replayActive) target.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
}

const commentMe = (id, perc) => {
    const target = $(id);
    const klass = perc > 0.6 ? "manycomments" : perc === 0 ? "nocomments" : "some";
    target.classList.remove("manycomments", "nocomments");
    target.classList.add(klass);
}

export const renderAll = () => {
    const textWithSingleNewLineAtEnd = ed.value
        .replace(/\n*$/, '\n').replace(/^@fasit/gm, '@question fasit')
        .replace(/@lang ([a-z]+)/gm, '');
    const [_, mylang] = (ed.value.match(/@lang ([a-z]+)/)) || [];
    if (langlist.includes(mylang)) {
        if (web.chosen !== mylang) {
            web.lang = langlist.indexOf(mylang);
            setLang();
        }
    }
    let funks = {};      // f(x):=x+1 defined by @cas used by @sign and @fplot
    const plots = [];
    const maths = [];
    const algebra = [];
    const eqsets = [];
    const trigs = [];
    const piece = [];
    const python = [];
    const sigrams = [];  // sign diagrams
    const poldivs = [];
    const eqs = [];         // equations like 5x+5=2x-6 => transformed by |-5  |-2x |/3
    let ofs = 1234; // uniq id for math,alg etc
    const splitter = lang[currentLanguage]?.splitter || '€€';
    const splitReg = new RegExp(`@${splitter}|@question`, "gm");
    const sections = textWithSingleNewLineAtEnd.split(splitReg).map(e => e.replace(/\s+$/, '\n'));
    const mdLatex = txt => md.render(txt).replace(/\$([^$]+)\$/gm, (_, m) => makeLatex(m, { mode: false, klass: "" }));
    const prepped = (textWithSingleNewLineAtEnd, seg) => {
        const international = translateAtCommands(textWithSingleNewLineAtEnd);
        return international
            .replace(/@fplot( .*)?$([^€]+?)^$^/gm, (_, klass, plot) => {
                ofs++;
                plots.push({ plot, id: `graf${seg}_${ofs}`, klass, seg });
                return `<div class="plots ${klass}" id="graf${seg}_${ofs}"></div>\n`;
            })
            .replace(/@python( .*)?$([^€]+?)^$^/gm, (_, klass, pyt) => {
                ofs++;
                python.push({ pyt, id: `py${seg}_${ofs}`, klass, seg });
                return `<div class="plots ${klass}" id="py${seg}_${ofs}"></div>\n`;
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
            .replace(/@piecewise( .*)?$([^€]+?)^$^/gm, (_, klass, eq) => {
                ofs++;
                piece.push({ eq, id: `piece${seg}_${ofs}`, klass, seg });
                return `<div class="piecewise ${klass}" id="piece${seg}_${ofs}"></div>\n`;
            })
            .replace(/@poldiv( .*)?$([^€]+?)^$^/gm, (_, klass, eq) => {
                ofs++;
                poldivs.push({ eq, id: `pold${seg}_${ofs}`, klass, seg });
                return `<div class="poldiv ${klass}" id="pold${seg}_${ofs}"></div>\n`;
            })
            .replace(/@sign( .*)?$([^€]+?)^$^/gm, (_, size, eq) => {
                ofs++;
                sigrams.push({ eq, id: `sig${seg}_${ofs}`, size, seg });
                return `<div class="sigram" id="sig${seg}_${ofs}"></div>\n`;
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
            .replace(/^@question( fasit)?( synlig)?( kolonner)?( \(\d+p?\))?( :.*)?( .*)?$/gm, (_, fasit, synlig, kolonner, poeng, myown, txt) => {
                const hr = fasit ? '<hr>' : '';
                txt = txt ? txt : '';
                const instead = myown ? myown.substr(2) + txt : '';
                txt = myown ? '' : txt;
                const points = poeng ? `data-poeng="${poeng.slice(2, -2)}"` : '';
                return `<div ${points} class="oppgave ${kolonner || ""} ${fasit || ""} ${synlig || ""}" title="${splitter}">${instead}${hr}</div>\n${txt}\n`;
            })
            .replace(/^@format( .*)?$/gm, (_, format) => {
                const [type,start] = (format || "").trimStart().trimEnd().split(" ") ;
                const reset = Number.isInteger(+start) ? Number(start) : 0;
                return `<div data-start="${reset}" class="format ${format}"></div>\n`;
            })
            .replace(/^@ans( .*)?$/gm, (_, ans) => {
                return `<div><span class="answer"><span>${ans}</span></span></div>\n`;
            })
            .replace(/@dato( \d+)?/gm, (_, ofs) => {
                const theDay = new Date();
                theDay.setDate(theDay.getDate() + Number(ofs || 0));
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
        mathView.innerHTML = mdLatex(preludeMath + restMath) + '<div id="last" class="gui"></div>';
        rerend = true;
    } else if (dirtyList.length === 1 && dirtyList[0] === oldRest.length) {
        // just append a new section
        const seg = dirtyList[0];
        const newSection = sections[seg];  // the new @question
        const div = create('div');
        const plain = `<div class="section" id="seg${seg}">\n` + prepped('@question' + newSection, seg) + '\n</div>';
        div.innerHTML = mdLatex(plain);
        mathView.append(div);
        scrollit(div);
        //.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
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
            scrollit(section); //.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
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
        //scrollit(id);
    });
    let segnum = {};  // have we reset giac for this segment?
    algebra.forEach(({ math, id, size, seg }) => {
        if (segnum[seg] === undefined) {
            segnum[seg] = 1;
            // @ts-ignore  First alg in this seg, reset giac
            UI.eval("restart");
            funks = {};  // named funks cannot leave segment
        }
        if (rerend || dirtyList.includes(seg)) {
            const perc = renderAlgebra(id, math, funks, size);
            commentMe(id, perc);
            //scrollit(id);
        }
    });
    eqs.forEach(({ math, id, size, seg }) => {
        if (segnum[seg] === undefined) {
            segnum[seg] = 1;
            // @ts-ignore  First alg in this seg, reset giac
            UI.eval("restart");
        }
        if (rerend || dirtyList.includes(seg)) {
            const perc = renderEquation(id, math, size);
            commentMe(id, perc);
            //scrollit(id);
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
            //scrollit(id);
        }
    });
    poldivs.forEach(({ eq, id, size, seg }) => {
        if (segnum[seg] === undefined) {
            segnum[seg] = 1;
            // @ts-ignore  First alg in this seg, reset giac
            UI.eval("restart");
        }
        if (rerend || dirtyList.includes(seg)) {
            renderPoldiv(id, eq, size);
            //scrollit(id);
        }
    });
    piece.forEach(({ eq, id, size, seg }) => {
        if (rerend || dirtyList.includes(seg)) {
            renderPiece(id, eq, size);
        }
    });
    sigrams.forEach(({ eq, id, size, seg }) => {
        if (segnum[seg] === undefined) {
            segnum[seg] = 1;
            // @ts-ignore  First alg in this seg, reset giac
            UI.eval("restart");
        }
        if (rerend || dirtyList.includes(seg)) {
            renderSigram(id, eq, funks, size);
        }
    });
    plots.forEach(({ plot, id, klass, seg }) => {
        if (rerend || dirtyList.includes(seg))
            renderPlot(id, plot, funks, klass);
        //scrollit(id);
    });
    python.forEach(({ pyt, id, klass, seg }) => {
        if (rerend || dirtyList.includes(seg))
            renderPy(id, pyt, klass);
    });
    trigs.forEach(({ trig, id, klass, seg }) => {
        if (rerend || dirtyList.includes(seg))
            renderTrig(id, trig, klass);
        //scrollit(id);
    });
    setLocalJSON(sessionID, ed.value);
}


readFileButton("load", (file, text) => {
    setLocalJSON(sessionID, text);
    web.filename = file.name;
    goEdit();
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

document.addEventListener('selectionchange', () => {
    const word = document.getSelection().toString();
    const pos = ed.selectionStart;
    const lines = ed.value.slice(0, pos).split('\n');
    const line = lines.length;
    const ofs = lines.slice(-1).length;
    // helptxt(word);
    helptxt(word, line, ofs, ed.getBoundingClientRect(), ed.scrollTop, Number(web.efs) / 50);
});

// some simple attempts to avoid rerender
let auton = 0;      // autocomplete
let timestep = 0;
let oldtext = "";
ed.onkeypress = (e) => {
    if (replayActive) {
        replayActive = false;
        const event = new Event('killReplay');
        document.dispatchEvent(event);
        toast("Ending replay", { delay: 0.2 });
    }
    const k = e.key;
    if (auton > 0) {
        const pos = ed.selectionStart;
        const sofar = ed.value.slice(0, pos);
        const at = sofar.lastIndexOf("@");
        const word = sofar.slice(at + 1) + ((k === "Enter") ? '' : k);
        // attach the pressed key to word if key != enter
        if (word.length < 7) {
            const line = sofar.split('\n').length;
            const hit = autocom(word, line, ed.getBoundingClientRect(), ed.scrollTop, Number(web.efs) / 50);
            if (hit && k === "Enter" && word.length < hit.length) {
                // user pressed enter on single suggestion
                // also user has not written the whole word
                const adjusted = sofar.slice(0, at + 1) + hit + ed.value.slice(pos);
                ed.value = adjusted;
                ed.selectionEnd = pos + hit.length - word.length;
                auton = 0;
            }
        }
        auton--;
    }
    if (k === '@') {
        const p = ed.selectionStart;
        const q = ed.value.slice(0, p - 1);
        if (q.endsWith("\n")) {
            auton = 7;  // check n next chars
        }
    }
}


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

setLang();