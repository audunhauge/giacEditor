// @ts-check

const english = {
    cas: {
        solve: "solve",          // solve(x+2=4) => x=2
        division: "quorem",      // quorem(x^2-3x-2,x-2,x) => (x+1,0)
        factor: "factor",        // factor(x^2-3x-2) => (x-2)(x+1)
        poldiv: "propfrac",      // propfrac((5*x+3)*(x-1)/(x+2)) = 5x-12+21/(x+2)
    },
    splitter:"question",
    atcommands: {
        plot: "plot",
        trig: "trig",
        qset: "qset",
        math: "math",
        cas: "cas",
        eq: "eq",
        question: "question",
        format: "format",
        ans: "ans",
        date: "date",
    }
}

const norwegian = {
    cas: {
        løs: "solve",                    // solve(x+2=4) => x=2
        divisjon: "quorem",              // quorem(x^2-3x-2,x-2,x) => (x+1,0)
        faktor: "factor",                // factor(x^2-3x-2) => (x-2)(x+1)
        poldiv: "propfrac",              // propfrac((5*x+3)*(x-1)/(x+2)) = 5x-12+21/(x+2)
        plotulikhet: "plotinequation",
    },
    splitter:"oppgave",
    atcommands: {
        plot: "plot",
        trig: "trig",
        likninger: "qset",
        matte: "math",
        cas: "cas",
        likning: "eq",
        oppgave:"question",
        //question:"oppgave",  // inverse
        format: "format",
        svar: "ans",
        date: "dato",
    }
}

const italiano = {
    cas: {
        risolvere: "solve",                    // solve(x+2=4) => x=2
        divisione: "quorem",              // quorem(x^2-3x-2,x-2,x) => (x+1,0)
        fattore: "factor",                // factor(x^2-3x-2) => (x-2)(x+1)
        poldiv: "propfrac",              // propfrac((5*x+3)*(x-1)/(x+2)) = 5x-12+21/(x+2)
        plotdisuguaglianza: "plotinequation",
    },
    splitter:"domanda",
    atcommands: {
        tracciare: "plot",
        trig: "trig",
        qinsieme: "qset",
        matematica: "math",
        cas: "cas",
        eq: "eq",
        domanda:"question",
        //question:"domanda", // inverse
        formato: "format",
        riposta: "ans",
        data: "date",
    }
}

export const lang = { english, norwegian, italiano }

// curry this to selected language

// translates for cas
export const trans = (lang, text) => {
    return text.replace(/([^-+*/() [\]{}.0-9|"'#%&?<>!]+)/g, (_, w) => {
        if (w.length < 2) return w;
        return lang.cas[w] || w;
    })
}

const s = (lang, word) => lang?.atcommands[word] || word;

export const _translateAtCommands = (lang, text) => {
    return text.replace(/@([^ \n]+)/g, (_,command) => {
       return '@'+ s(lang,command);
    });
}
