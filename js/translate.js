// @ts-check

const english = {
    cas: {
        solve: "solve",          // solve(x+2=4) => x=2
        division: "quorem",      // quorem(x^2-3x-2,x-2,x) => (x+1,0)
        factor: "factor",        // factor(x^2-3x-2) => (x-2)(x+1)
        poldiv: "propfrac",      // propfrac((5*x+3)*(x-1)/(x+2)) = 5x-12+21/(x+2)
        plotinequation:"plotinequation",
    },
    splitter: "question",
    atcommands: {
        hyper:"hyper",
        binom:"binom",
        help:"help",
        fplot: "fplot",
        sign: "sign",
        piecewise: "piecewise",
        poldiv: "poldiv",
        python: "python",
        eqset: "eqset",
        trig: "trig",
        math: "math",
        cas: "cas",
        eq: "eq",
        question: "question",
        format: "format",
        ans: "ans",
        date: "dato",
    },
    explain: {  // override explanation in autotags

    },
}

const norwegian = {
    cas: {
        løs: "solve",                    // solve(x+2=4) => x=2
        divisjon: "quorem",              // quorem(x^2-3x-2,x-2,x) => (x+1,0)
        faktor: "factor",                // factor(x^2-3x-2) => (x-2)(x+1)
        poldiv: "propfrac",              // propfrac((5*x+3)*(x-1)/(x+2)) = 5x-12+21/(x+2)
        plotulikhet: "plotinequation",
    },
    expand : {
        binom:"distribution binom n=20 p=0.5\n6 eller mer\n7 eller mindre\n8\n",
        hyper:"distribution hyper n=60 m=10 r=20\n2 eller mer\n3 eller mindre\n4\n",
    },
    splitter: "oppgave",
    atcommands: {
        hyper:"hyper",
        binom:"binom",
        hjelp:"help",
        fplot: "fplot",
        delt:"piecewise",
        fortegn: "sign",
        poldiv: "poldiv",
        python: "python",
        trig: "trig",
        likninger: "eqset",
        matte: "math",
        cas: "cas",
        likning: "eq",
        oppgave: "question",
        //question:"oppgave",  // inverse
        format: "format",
        svar: "ans",
        dato: "dato",
    },
    explain: {
        hjelp:`TILGJENGELIGE KOMMANDOER
@oppgave
@cas
@matte
@fplot
@fortegn
@likning
@likninger
@poldiv
@delt
@python
@trig
@format
@svar
@dato
Skriv "hjelp" og dobbeltklikk på ordet
for å få fram denne infoboksen.
Dobbeltklikk på blå ord i hjelpetekst
for å slå opp info om en kommando.
`,
        fortegn: `Tegner fortegsskjema
x+2  => fortegnslinje
'(x+2) => fortegnslinje til derivert
''(x+2) => fortegn dobbeltderivert
f:(x+2)(x-1) => viser  f +++---+++
Du kan navngi ved å skrive 
navn:uttrykk
Viser navn + fortegnslinje

(x+2)(x-1)(x-4)    ------+++++----+++++
'(x+2)(x-1)(x-4)   +++++++++----+++++++
''(x+2)(x-1)(x-4)  -----------+++++++++`,
delt:`Delt forskrift

f(x)                       /  x-2 for x<1
x-2:x<1        f()  {  
x^2:x>=1             \\  x^2 for x>=1`,
    },

}

const italiano = {
    cas: {
        risolvere: "solve",                    // solve(x+2=4) => x=2
        divisione: "quorem",              // quorem(x^2-3x-2,x-2,x) => (x+1,0)
        fattore: "factor",                // factor(x^2-3x-2) => (x-2)(x+1)
        poldiv: "propfrac",              // propfrac((5*x+3)*(x-1)/(x+2)) = 5x-12+21/(x+2)
        plotdisuguaglianza: "plotinequation",
    },
    splitter: "domanda",
    atcommands: {
        tracciare: "fplot",
        segno: "sign",
        poldiv: "poldiv",
        python: "python",
        tratti:"piecewise",
        trig: "trig",
        qinsieme: "qset",
        matematica: "math",
        cas: "cas",
        eq: "eq",
        domanda: "question",
        //question:"domanda", // inverse
        formato: "format",
        riposta: "ans",
        data: "date",
    },
    explain: {  // override explanation in autotags

    },

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
    return text.replace(/@([^ \n]+)/g, (_, command) => {
        return '@' + s(lang, command);
    });
}
