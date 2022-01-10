// @ts-check

/**
 * This module provides replay functionality for the editor
 * The saved text is reentered line by line by pressing arrow keys
 * start ← ,next ↓,prev ↑,end →
 */

// import { Keys } from "./Minos.js";

const player = {
    lineBuffer: null,
    start: 0,
    last: 0,
    current: 0,
    renderer: null,
    editor: null,
}

export function startReplay(editor, renderer) {
    const text = editor.value || '';
    editor.value = '';
    renderer();
    player.lineBuffer = text.split('\n');
    player.last = player.lineBuffer.length;
    player.start = 0;
    player.current = 0;
    player.renderer = renderer;
    player.editor = editor;
    document.addEventListener("keydown", navigate);
}


function navigate(e) {
    const p = player;
    if (e.key === "ArrowDown") {
        if (p.current < p.last) {
            p.current++;
            while (p.lineBuffer[p.current] === '')
            p.current++;
        }
        p.editor.value = p.lineBuffer.slice(0, p.current).join('\n');
        p.renderer();
    }

    if (e.key === "ArrowUp") {
        if (p.current > 0) {
            p.current--;
            while (p.current && p.lineBuffer[p.current] === '')
            p.current--;
        }
        p.editor.value = p.lineBuffer.slice(0, p.current).join('\n');
        p.renderer();
    }
    if (e.key === "ArrowLeft") {
        p.current = 0;
        p.editor.value = "";
        p.renderer();
    }
    if (e.key === "ArrowRight") {
        p.current = p.last;
        p.editor.value = p.lineBuffer.slice(0, p.current).join('\n');
        p.renderer();
    }
    if (e.key === "Escape") {
        p.editor.value = p.lineBuffer.join("\n");
        document.removeEventListener("keydown", navigate);
        p.renderer();
    }

}
