// @ts-check

import {
    thingsWithId, updateMyProperties, qsa, qs,
    $, create, getLocalJSON, setLocalJSON, curry,
} from './Minos.js';

import {
    renderAlgebra, renderPoldiv, renderEqnSet, renderPy, giaEval,
    makeLatex, renderSigram, renderPiece,
    renderEquation, renderMath, renderPlot, renderHint, renderTrig, renderDist, renderTable
} from './render.js';

import { renderReg } from './regression.js';

import { lang, trangui, _translateAtCommands } from './translate.js';
import { autocom, helptxt, prep } from './autotags.js';

const { home, app, back, aktiv, help, info, newfile, gitter, conf,
    aside, editor, gistlist, gili, gisi, gust, gistfolder,
    menu, menuu, saved,
    mathView, ed, examples, savedFiles, gitlist, sp, fs, pm }
    = thingsWithId();


import {
    saveFileButton, readFileButton, updateGist,
    getGitFile, getGistFile, gitFiles, gistFiles, gistList, writeGist,
} from './filehandling.js';

import { startReplay } from './replay.js';
import { toast, bread, makeSelect, makeInput, group, unprefix } from './util.js';


// used by brython to "read" a @table
export const readTable = filename => {
    const [id] = filename.split(".");
    const table = $(id);
    if (table) {
        // @ts-ignore
        return table.innerText.replaceAll("\t", ";").replaceAll("\n", "€");
        //return table.innerText;
    }
    return 'NO DATA';
}


export var config = {};

const configBase = {
    language: { valg: "norwegian,english,italiano", t: "select", e: "Reload page for change to take effect" },
    trigmode: { valg: "grader,rad", t: "select", },
    git: { valg: "ja,nei", t: "checkbox", e: "Show gistfiles and github" },
    git_user: { ledetekst: "Git username", t: "text" },
    git_st: { ledetekst: "gist", valg: "ja,nei", t: "checkbox", e: "Gistfiles" },
    git_st_tutorial: { ledetekst: "Tutorial", valg: "ja,nei", t: "checkbox", e: "Tutorial mode (enable help files)" },
    git_st_folder: { ledetekst: "Gist folder", t: "text", e: "Selected folder" },
    git_st_token: { ledetekst: "OAuth token for saving gist", t: "text" },
    git_hub: { ledetekst: "github", valg: "ja,nei", t: "checkbox", e: "Files on github" },
    git_hub_repo: { ledetekst: "Git repo", t: "text" },
};


const enabled = () => {
    Array.from(qsa("#config input")).forEach(e => {
        e.parentNode.classList.remove("disabled")
        e.removeAttribute("disabled");
    });
    const turnedOff = Array.from(qsa("#config input:not(:checked)"));
    turnedOff.forEach(e => {
        const id = e.id;
        const lesser = Array.from(qsa(`#config input[id^="${id}_"]`));
        lesser.forEach(e => {
            config[e.id] = "nei";
            e.removeAttribute("checked");
            e.setAttribute("disabled", "true");
            e.parentNode.classList.add("disabled");
        })
    });
}


const makeConfig = () => {
    const divConfig = $("config");
    divConfig.innerHTML = "<h2>Settings</h2>";
    divConfig.classList.remove("hidden");
    const box = create("div");
    Object.keys(configBase).forEach(k => {
        const { ledetekst, valg, t, e = "" } = configBase[k];
        const valgt = config[k] || "";
        const inp = makeInput(k, t, { valg, valgt, ledetekst }, valgt);
        const explain = create("span");
        explain.innerHTML = e;
        inp.append(explain);
        box.append(inp);
    });
    const saveabort = create('div');
    saveabort.className = "flexit";
    const confirm = makeInput("configsave", "button", { ledetekst: "Lagre" });
    const abort = makeInput("abort", "button", { ledetekst: "Avbryt" });
    box.append(saveabort);
    saveabort.append(abort);
    saveabort.append(confirm);
    divConfig.append(box);
    enabled();
    divConfig.onchange = e => enabled();
    qs("#config div.flexit").addEventListener("click", (e) => {
        divConfig.classList.add("hidden");
        if (e.target.id === "abort") {
            divConfig.innerHTML = "";
            return
        }
        config = {};
        const konfig = Array.from(qsa("#config select"));
        konfig.forEach(elm => {
            const { id, value } = elm;
            config[id] = value;
        });
        const inps = Array.from(qsa("#config input:checked"));
        inps.forEach(elm => {
            const { id } = elm;
            config[id] = "ja";
        });
        const txt = Array.from(qsa('#config input[type="text"]:not(:disabled)'));
        txt.forEach(elm => {
            const { id, value } = elm;
            config[id] = value;
        });
        setLocalJSON("config", config);

        window.location.href = "/";
    })
}

let havConfig = getLocalJSON("config") || null;
if (!havConfig) {
    // alert("Set your config");
    makeConfig();
} else {
    config = havConfig;
    if (config["git"] !== "ja") {
        //gitter.classList.add("hidden");
    }
    if (config["git_hub"] !== "ja") {
        gili.classList.add("hidden");
    }
    if (config["git_st"] !== "ja") {
        //gisi.classList.add("hidden");
    }
}


const langlist = Object.keys(lang);
export var currentLanguage = config["language"] || "norwegian";
if (!langlist.includes(currentLanguage)) {
    currentLanguage = 'norwegian';
}
let translateAtCommands = curry(_translateAtCommands)(lang[currentLanguage]);

export let tg = curry(trangui)(lang[currentLanguage]);  // translate words used by gui


export const web = updateMyProperties({ langlist });
const sessionID = "mathEd";

// web.lang = 0;  // start with first lang in list
web.lang = config["language"];
//$("lang").setAttribute("max", String(langlist.length - 1))

//$("lang").onchange = () => setLang()

function setLang() {
    currentLanguage = config["language"];
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
    renderAll();
}

let oldSession;

const goEdit = () => {
    app.classList.remove("hidden");
    [...qsa("#app .hidden")].forEach(e => e.classList.remove("hidden"));
    home.classList.add("hidden");
    oldSession = getLocalJSON(sessionID);  // previous contents
    const filename = getLocalJSON("filename") || "test.mxy"; // filename
    // set starting font size to 50/50 rem
    web.fs = 50;    // math region font size
    web.efs = 50;   // editor font size
    web.sp = 50;    // spacing between questions
    ed.value = oldSession || "";
    if (filename !== web.filename) {
        // update cache (10 last files)
        console.log(web.filename, filename);
        fileCache(filename);
    }
    web.filename = filename;
    if (filename !== "") {
        const gist = existingFiles.find(e => e.name === filename);
        gust.innerHTML = gist ? "UpdateGist" : "SaveAsGist";

    }
    if (oldSession) {
        renderAll();
    }
}

const root = document.documentElement;
sp.oninput = () => {
    root.style.setProperty("--spacing", `${web.sp / 50}rem`);
}

fs.oninput = () => {
    root.style.setProperty("--svg", `${(250 * web.fs / 50) | 0}px`);
}

pm.onchange = () => {
    const show = web.pm ? "0px" : "fit-content";
    const important = show === "0px" ? "important" : "";
    root.style.setProperty("--gui", show, important);
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


conf.onclick = () => {
    makeConfig();
}


newfile.onclick = () => {
    const txt = `# Prøve @dato
@oppgave

Løs likninger
@matte abc
2x+4=5
`;
    setLocalJSON(sessionID, txt);
    setLocalJSON("filename", "newfile");
    goEdit();
    helptxt("hjelp", 5, 0, ed.getBoundingClientRect(), 0, 1);
}

const gist = {};
let existingFiles;
let gr = {};


async function setup() {
    web.moveme = "Låst";
    // check if we have query parameters
    const ques = window.location.search
    const urlParams = new URLSearchParams(ques);
    const keys = [...urlParams.keys()];
    // a=user,b=repo,c=file
    if (keys.includes('a') && keys.includes('c')) {
        // assume we want to load gist b 
        const username = urlParams.get("a");
        const file = urlParams.get("c");
        existingFiles = await gistList(username);
        const getgist = existingFiles.find(elm => elm.name === file);
        if (getgist) {
            // found specified gist - edit
            const url = getgist.url;
            const id = getgist.id;
            const txt = await getGistFile(url);
            setLocalJSON(sessionID, txt);
            setLocalJSON("filename", file);
            gist.name = file;
            gist.id = id;
            goEdit();
            [...qsa("#app .gui")].forEach(e => e.classList.add("hidden"));
            return;  // skip the rest
        }
    }
    [...qsa(".home")].forEach(e => e.classList.remove("hidden"));

    // must do this before await or else
    // localstorage will be overwritten by
    // renderAll
    const filename = getLocalJSON("filename");
    if (filename) {
        oldSession = getLocalJSON(sessionID).replace(/^#GO!/gm, '#GO !');  // previous contents
        aktiv.classList.remove("hidden");
        web.current = filename;
        ed.value = oldSession || "";
    }
    const url = "examples.json";
    const response = await fetch(url);
    const examples = await response.json();
    //web.examples.push(...examples);
    // saved files may be none
    const savedFiles = getLocalJSON("savedfiles") || [];
    //web.savedFiles.push(...savedFiles.slice(0, 10));
    const gitoken = config['git_st_token'];
    let advanced = false;
    if (gitoken && gitoken !== "") {
        // enable saving as gist
        gust.removeAttribute("disabled");
        advanced = true;
    }
    // show list of files to open
    const gistfilter = config['git_st_folder'] || '';
    if (config["git"] === 'ja') {
        const gitfiles = await gitFiles();
        web.gitlist.push(...gitfiles);
        existingFiles = await gistFiles();
    } else {
        existingFiles = [];
    }
    if (!advanced) {
        // filter out files not in gistfilter
        existingFiles = existingFiles.filter(f => f.name.startsWith('HELP') || f.name.startsWith(gistfilter));
    }
    // add in existing files with prefix Recent_
    savedFiles.forEach(f => {
        existingFiles.push({ id: "0", name: "Recent_" + f, url: "" });
    })
    examples.forEach(f => {
        existingFiles.push({ id: "1", name: "Examples_" + f, url: "/media/ex" + f + ".md" });
    });
    // If user checked Tutorial - parse any documentation files
    // and build up extended help
    if (config['git_st_tutorial'] === 'ja') {

    }
    // Make displayname for files, stripping of prefix
    existingFiles.forEach(e => e.nice = unprefix("_", e.name));
    gr = group(existingFiles, e => {
        const a = e.name.includes('_');
        return a ? e.name.split('_')[0] : "Docs";
    });
    web.gistfolder.push(...Object.keys(gr));
    if (gistfilter && gr[gistfilter]) {
        web.gistlist.push(...gr[gistfilter]);
        qs(`.fold[data-name="${gistfilter}"]`).classList.add("aktiv");
    } else {
        web.gistlist.push(...gr["Recent"]);
        qs(`.fold[data-name="Recent"]`).classList.add("aktiv");
    }
    let moveme = false;

    qs('[data-name="moveme"]').addEventListener("click", () => {
        moveme = !moveme;
        web.moveme = moveme ? "Flytt" : "Låst";
    })

    {
        // make the editor draggable
        // @ts-ignore
        interact("#editor").draggable({
            inertia: true, // enable inertial throwing
            autoScroll: true,
            //hold: 50, // must hold 100ms before dragging
            listeners: {
                move: dragMoveListener,
                end(event) { },
            },
        });
        function dragMoveListener(event) {
            if (!moveme) return;
            var target = event.target;
            var x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
            var y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;
            target.style.webkitTransform = target.style.transform =
                "translate(" + x + "px, " + y + "px)";
            target.setAttribute("data-x", x);
            target.setAttribute("data-y", y);
        }
    }

}

setup();


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

gistfolder.onclick = (e) => {
    const t = e.target;
    if (t.classList.contains("fold")) {
        qsa(".fold").forEach(e => e.classList.remove("aktiv"));
        t.classList.add("aktiv");
        const name = t.dataset.name;
        web.gistlist.length = 0;
        web.gistlist.push(...gr[name]);
    }
}


gistlist.onclick = async (e) => {
    const t = e.target;
    if (t.classList.contains("file")) {
        const name = t.dataset.name;
        const url = t.dataset.url;
        const id = t.dataset.id;
        if (id === "0") {
            const savedName = name.slice(7);
            const txt = getLocalJSON("saved:" + savedName);
            setLocalJSON(sessionID, txt);
            setLocalJSON("filename", savedName);
        } else if (id === "1") {
            //const url = '/media/' + name;
            const response = await fetch(url);
            const txt = (response.ok)
                ? await response.text()
                : "Missing example";
            setLocalJSON(sessionID, txt);
            setLocalJSON("filename", name);
        } else {
            const txt = await getGistFile(url);
            setLocalJSON(sessionID, txt);
            setLocalJSON("filename", name);
            gist.name = name;
            gist.id = id;
        }

        goEdit();
    }
}

gust.onclick = async (e) => {
    const name = web.filename;
    if (existingFiles) {
        const existing = existingFiles.find(e => e.name === name)
        if (existing) {
            const fileIsSaved = await updateGist(existing.id, name, ed.value);
            const message = fileIsSaved ? "File Updated" : "Failed updating file";
            toast(message);
            return;
        }
    }
    const fileIsSaved = await writeGist(ed.value, web.filename);
    const message = fileIsSaved ? "File saved" : "Failed saving file";
    toast(message);

}

let globalFunk = {};  // look for funcs while typing



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

export const mdLatex = txt => md.render(txt.replace(/\$([^$]+)\$/gm, (_, m) => makeLatex(m, { mode: false, klass: "" })));


export const renderAll = () => {
    const textWithSingleNewLineAtEnd = ed.value
        .replace(/\n*$/g, '\n').replace(/^@fasit/gm, '@question fasit')
        .replace(/@lang ([a-z]+)/gm, '')
        .replace(/&_/gm, ' ')  // &_   gives a thin space
        .replace(/^\.$/gm, '<div class="nl"></div>');
    let funks = {};      // f(x):=x+1 defined by @cas used by @sign and @fplot
    let regpoints = {};   // regression points stored here
    let source = "";
    const plots = [];
    const callouts = [];
    const maths = [];
    const algebra = [];
    const eqsets = [];
    const trigs = [];
    const piece = [];
    const python = [];
    const tables = [];
    const sigrams = [];         // sign diagrams
    const poldivs = [];
    const regress = [];
    const eqs = [];             // equations like 5x+5=2x-6 => transformed by |-5  |-2x |/3
    const distributions = [];   // hypergeometric binominal distributions
    let ofs = 1234; // uniq id for math,alg etc
    const splitter = lang[currentLanguage]?.splitter || '€€';
    const splitReg = new RegExp(`@${splitter}|@question`, "gm");
    const sections = textWithSingleNewLineAtEnd.split(splitReg).map(e => e.replace(/\s+$/, '\n'));
    const prepped = (textWithSingleNewLineAtEnd, seg) => {
        const international = translateAtCommands(textWithSingleNewLineAtEnd);
        return international
            .replace(/@callout( .*)?$([^€]+?)^:::/gm, (_, klass, txt) => {
                ofs++;
                callouts.push({ txt, id: `hint${seg}_${ofs}`, klass, seg });
                return `<div class="callout ${klass}" id="hint${seg}_${ofs}"></div>\n`;
            })
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
            .replace(/@ignore( .*)?$([^€]+?)^$^/gm, '')
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
            .replace(/@poldiv( .*)?$([^€]+?)^$^/gm, (_, klass, eq) => {
                ofs++;
                poldivs.push({ eq, id: `pold${seg}_${ofs}`, klass, seg });
                return `<div class="poldiv ${klass}" id="pold${seg}_${ofs}"></div>\n`;
            })
            .replace(/@reg( .*)?$([^€]+?)^$^/gm, (_, klass = "linear", eq) => {
                ofs++;
                regress.push({ eq, id: `reg${seg}_${ofs}`, klass, seg });
                return `<div class="regression ${klass}" id="reg${seg}_${ofs}"></div>\n`;
            })
            .replace(/^@distribution( normal)?( hyper)?( binom)?( .*)?$([^€]+?)^$^/gm, (_, normal, hyper, binom, params, lines) => {
                ofs++;
                const type = normal || hyper || binom || "unknown";
                distributions.push({ lines, id: `dist${seg}_${ofs}`, params, seg, type });
                return `<div class="fordeling ${type}" id="dist${seg}_${ofs}"></div>\n`;
            })
            .replace(/^@table( .*)?$([^€]+?)^$^/gm, (_, options = "", lines) => {
                ofs++;
                const [__, type = '', name = ''] = (options.match(/ ([a-z]+)? ?([a-zA-ZæøåÆØÅ]+)?/)) || [];
                tables.push({ name, seg, type, lines, id: `table${seg}_${ofs}` });
                return `<div class="table ${type}" id="table${seg}_${ofs}"></div>\n`;
            })
            .replace(/@sign( .*)?$([^€]+?)^$^/gm, (_, size, eq) => {
                ofs++;
                sigrams.push({ eq, id: `sig${seg}_${ofs}`, size, seg });
                return `<div class="sigram" id="sig${seg}_${ofs}"></div>\n`;
            })
            .replace(/@piecewise( .*)?$([^€]+?)^$^/gm, (_, size, eq) => {
                ofs++;
                piece.push({ eq, id: `piece${seg}_${ofs}`, size, seg });
                return `<div class="piecewise ${size}" id="piece${seg}_${ofs}"></div>\n`;
            })
            .replace(/^@math( .*)?$([^€]+?)^$^/gm, (_, size, math) => {
                ofs++;
                maths.push({ math, id: `ma${seg}_${ofs}`, size, seg });
                return `<div  class="math ${size}" id="ma${seg}_${ofs}"></div>\n`;
            })
            .replace(/^@cas( .*)?$([^€]+?)^$^/gm, (_, size, math) => {
                ofs++;
                algebra.push({ math, id: `alg${seg}_${ofs}`, size, seg });
                const outercss = size && size.includes("matte") ? size.replace("grid", "oger") : size;
                return `<div  class="algebra ${outercss}" id="alg${seg}_${ofs}"></div>\n`;
            })
            .replace(/^@eq( .*)?$([^€]+?)^$^/gm, (_, size, math) => {
                ofs++;
                eqs.push({ math, id: `eq${seg}_${ofs}`, size, seg });
                return `<div  class="equation ${size}" id="eq${seg}_${ofs}"></div>\n`;
            })
            .replace(/^@question( .*)?$/gm, (_, txt) => {
                txt = txt ? txt : '';
                return `<div class="oppgave ${txt}" title="${splitter}"></div>\n`;
            })
            /*
            .replace(/^@question( \d+)?( fasit)?( synlig)?( kolonner)?( \(\d+p?\))?( :.*)?( .*)?$/gm, (_, counter,fasit, synlig, kolonner, poeng, myown, txt) => {
                const hr = fasit ? '<hr>' : '';
                txt = txt ? txt : '';
                console.log(counter);
                const instead = myown ? myown.substr(2) + txt : '';
                txt = myown ? '' : txt;
                const points = poeng ? `data-poeng="${poeng.slice(2, -2)}"` : '';
                return `<div ${points} class="oppgave ${kolonner || ""} ${fasit || ""} ${synlig || ""}" title="${splitter}">${instead}${hr}</div>\n${txt}\n`;
            })*/
            .replace(/^@format( .*)?$/gm, (_, format) => {
                const [type, start] = (format || "").trimStart().trimEnd().split(" ");
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
            .replace(/^@source/gm, () => {
                source = ed.value;
                return `<div  class="source" id="source"></div>\n`;
            })
    }

    // @ts-ignore
    const uieval = txt => UI.eval(txt);

    const resetCAS = () => {
        // @ts-ignore
        uieval("restart");
        uieval("lg(x):=ln(x)/ln(10)");
        if (!config["trigmode"].startsWith("rad")) {
            uieval("angle_radian:=0");
        }
        funks = {};
        regpoints = {};
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
            section.classList.toggle("blush");
            if (seg === 0) {
                section.innerHTML = mdLatex(prepped(txt, seg));
            } else {
                section.innerHTML = mdLatex(prepped('@question' + txt, seg));
            }
            scrollit(section); //.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
        }
    }

    let buildFasit = null;

    // lift fasit out to the section level
    // expect only one fasit - strange to have more than one
    const fasit = qs(".section > .fasit");
    if (fasit) {
        fasit.parentNode.classList.add("fasit");
        fasit.parentNode.classList.remove("skjult");
        if (!fasit.classList.contains("synlig")) {
            fasit.parentNode.classList.add("skjult");
        }
        // check if we have nothing following (only #last)
        const after = qsa(".section.fasit ~ *");
        if (after.length === 1) {
            // fasit is empty
            buildFasit = fasit;
        }
    }

    // lift grid out to the section level
    const grids = qsa('.section > div.oppgave[class*="grid"');
    grids.forEach(k => {
        const grid = Array.from(k.classList).find(n => n.startsWith('grid'))
        // k.parentNode.classList.add(grid);
        k.parentNode.className = "section " + grid;
    });

    function interpolate(seg) {
        const div = $("seg" + seg);
        if (div) {
            const old = div.innerHTML;
            const txt = old.replace(/\$\{([a-z()0-9]+)\}/gm, (_, a) => {
                if (funks[a]) return funks[a];
                return _;
            });
            if (old !== txt) {
                div.innerHTML = txt;
            }
        }

    }


    // now figure out which views have changed

    oldRest = sections.slice();  // make copy


    maths.forEach(({ math, id, size, seg }) => {
        if (rerend || dirtyList.includes(seg))
            renderMath(id, math, funks, size);
    });
    let segnum = {};  // have we reset giac for this segment?
    // regression before cas so that we can use function p[a-z](x) in cas
    regress.forEach(({ eq, id, klass, seg }, i) => {
        if (segnum[seg] === undefined) {
            segnum[seg] = 1;
            resetCAS();
        }
        if (rerend || dirtyList.includes(seg)) {
            renderReg(id, eq, funks, regpoints, i, klass);
        }
    });
    algebra.forEach(({ math, id, size, seg }) => {
        if (segnum[seg] === undefined) {
            segnum[seg] = 1;
            resetCAS();
        }
        if (rerend || dirtyList.includes(seg)) {
            const perc = renderAlgebra(id, math, funks, size);
            commentMe(id, perc);
            Object.assign(globalFunk, funks);
            interpolate(seg);
        }
    });
    eqs.forEach(({ math, id, size, seg }) => {
        if (segnum[seg] === undefined) {
            segnum[seg] = 1;
            resetCAS();
        }
        if (rerend || dirtyList.includes(seg)) {
            const perc = renderEquation(id, math, size);
            commentMe(id, perc);
            //scrollit(id);
        }
    });
    eqsets.forEach(({ eq, id, klass, seg }) => {
        if (segnum[seg] === undefined) {
            segnum[seg] = 1;
            resetCAS();
        }
        if (rerend || dirtyList.includes(seg)) {
            renderEqnSet(id, eq, klass);
            //scrollit(id);
        }
    });
    poldivs.forEach(({ eq, id, size, seg }) => {
        if (segnum[seg] === undefined) {
            segnum[seg] = 1;
            resetCAS();
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
    distributions.forEach(({ lines, id, params, seg, type }) => {
        if (rerend || dirtyList.includes(seg)) {
            renderDist(id, lines, params, type);
        }
    });
    tables.forEach(({ name, type, lines, id, seg }) => {
        if (rerend || dirtyList.includes(seg)) {
            renderTable(id, lines, type, name, regpoints);
        }
    });
    sigrams.forEach(({ eq, id, size, seg }) => {
        if (segnum[seg] === undefined) {
            segnum[seg] = 1;
            resetCAS();
        }
        if (rerend || dirtyList.includes(seg)) {
            renderSigram(id, eq, funks, size);
        }
    });
    plots.forEach(({ plot, id, klass, seg }) => {
        if (rerend || dirtyList.includes(seg))
            renderPlot(id, plot, funks, regpoints, klass);
        //scrollit(id);
    });
    callouts.forEach(({ txt, id, klass, seg }) => {
        if (rerend || dirtyList.includes(seg))
            renderHint(id, txt, klass);
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

    if (buildFasit) {
        const doc = Array.from(qsa(".section")).slice(0, -1);
        const mm = [];
        maths.forEach(({ math, id, size, seg }) => {
            mm[seg] = { math, size };
        });
        ed.value = ed.value + doc.map((e, i) => {
            if (mm[i]) {
                const { math, size } = mm[i];
                if (size && size.match(/li[kg]nings+et+/)) {
                    uieval('restart');
                    const lines = math.split("\n").filter(e => e);
                    const n = lines.length;
                    const txt = lines.map((e, i) => `u${i}:=${e}`).join("\n");
                    // pick out variables used in the equations- gives "[x,y][y,z][x,y,z]"
                    const mwr = lines.reduce((s, v) => { const q = giaEval(`lname(${v})`); return s + q }, "");
                    // replace any "[]" and split on ,  => Set => Array to remove duplicates
                    const wars = Array.from(new Set(mwr.replaceAll('[', ',').replaceAll(']', ',').split(",").filter(e => e)));
                    const us = "012345".split("").slice(0, n).map(e => 'u' + e);
                    return '\n@question\n@cas ' + size + '\n' + txt + `\nsolve([${us}],[${wars}])\n`;
                } else if ((size && size.includes("likning")) || math.includes("=")) {
                    const lines = math.split("\n");
                    const txt = lines.filter(e => e).map(e => `solve(${e})`).join("\n");
                    return '\n@question\n@cas ' + size + '\n' + txt + '\n';
                } else {
                    return '\n@question\n@cas ' + size + math;
                }
            } else {
                return '\n@question\n';
            }
        }).join("");
    }



    if (source) {
        $("source").innerHTML = source.split("\n").map(line => `<span>${line}</span><br>`).join("");
    }
    setLocalJSON(sessionID, ed.value);
}


readFileButton("load", (file, text) => {
    setLocalJSON(sessionID, text);
    web.filename = file.name;
    goEdit();
});

const fileCache = newName => {
    setLocalJSON("filename", newName);
    web.filename = newName;
    const savedFiles = getLocalJSON("savedfiles") || [];
    savedFiles.unshift(newName);
    const uniq = new Set(savedFiles.slice(0, 10));
    setLocalJSON("savedfiles", Array.from(uniq));
    setLocalJSON("saved:" + newName, ed.value);
    return ed.value;
}

saveFileButton("save", web.filename, fileCache);

document.addEventListener('selectionchange', () => {
    const word = document.getSelection();
    if (word !== null) {
        const wtxt = word.toString();
        const pos = ed.selectionStart;
        const lines = ed.value.slice(0, pos).split('\n');
        const line = lines.length;
        const ofs = lines.slice(-1).length;
        // helptxt(word);
        helptxt(wtxt, line, ofs, ed.getBoundingClientRect(), ed.scrollTop, Number(web.efs) / 50);
    }
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
            if (hit && k === "Enter" && word.length < hit.word.length) {
                // user pressed enter on single suggestion
                // also user has not written the whole word
                const nutext = hit.expand ? hit.expand : hit.word;
                const adjusted = sofar.slice(0, at + 1) + nutext + ed.value.slice(pos);
                ed.value = adjusted;
                ed.selectionEnd = pos + nutext.length - word.length;
                auton = 0;
            }
        }
        auton--;
    }
    if (k === '£') {
        // see if we have a named funk
        const p = ed.selectionStart;
        const sofar = ed.value.slice(0, p);
        const at = sofar.lastIndexOf('\n');
        const trailing = sofar.slice(at + 1);
        const parts = trailing.split(/[^a-z()]/g);
        const word = parts.pop();
        const hit = globalFunk[word];
        if (hit) {
            const after = ed.value.slice(p);
            const before = trailing.slice(0, -word.length);
            const adjusted = sofar.slice(0, at + 1) + before + hit + after;
            ed.value = adjusted;
            ed.selectionEnd = at + before.length + hit.length + 1;
            e.preventDefault();
        }
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
    if (k === 'Escape') {
        bread();   // close any toast
    }
    const render = k === "Enter" || k.includes("Arrow");
    if (render) {
        // remove hot edit markers
        qsa(".blush").forEach(e => e.classList.remove("blush"));
        const diff = oldtext !== ed.value;
        if (diff && now > timestep + 1000) {
            renderAll();
            timestep = Date.now();
            oldtext = ed.value;
        }
    }
}

setLang();