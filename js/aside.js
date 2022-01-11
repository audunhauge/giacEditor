// @ts-check

import {qs,qsa} from './util.js';


const ed = qs("#ed");
const mainEd = window.opener.document.querySelector("#ed");
const renderAll = window.opener.render;

let timestep = 0;
let oldtext = "";
ed.onkeyup = (e) => {
    const now = Date.now();
    const k = e.key;
    const render = k === "Enter" || k.includes("Arrow");
    if (render) {
        const diff = oldtext !== ed.value;
        if (diff && now > timestep + 1000) {
            mainEd.value = ed.value;
            renderAll();
            timestep = Date.now();
            oldtext = ed.value;
        }
    }
}

const event = new Event('asideReady');
window.opener.document.dispatchEvent(event);