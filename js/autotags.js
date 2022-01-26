// @ts-check

import { toast } from "./util.js";

// in editor: writing @ as first char on a line should trigger autocomplete
// assumed triggered by eventlistener in editor

const aulist = "sign,question,poldiv,plot,cas,math,python,trig,eq,eqset,format,ans,dato";
const auwords = aulist.split(",");

const explain = {
sign: `Draws sign table for expressions
(x+2)(x-1)(x-4)    ------+++++----+++++
'(x+2)(x-1)(x-4)   +++++++++----+++++++
''(x+2)(x-1)(x-4)  -----------+++++++++`,
question: `Creates a numbered question heading
@question            =>  Question 1.
@question (4p)       =>  Question 2. (4p)
@question :My Own    =>  My own`,
poldiv: "Polynomial division with remainder",
plot: "Plots graph for one or more functions",
cas: "Computer Algebra System, same as in GeoGebra",
math: `Write flat math - get nice rendered math
@math abc
x/(x+2)=3
2x-4=0
Gives
a) x/(x+2) = 3
b)   2x -4 = 0
Nicely printed with latex
`,
python: `Starts a python script inline
def f(x):
  return x*x-3*x
xs = linspace(-5,5,100)
ys = f(xs)
plot(xs,ys)
grid()
show()
#GO!`,
trig: "Create a trig drawing, triangles etc",
eq: "Dispaly an equation, step by step solution",
eqset: "Step by step solution of equationsets",
format: "page for new page,br for newline",
ans: "Draws two lines under following text",
dato: "dato 1  show date for tomorrow",
linspace:`linspace(start,stop,num)
creates array [start, ..., stop]
with num elements evenly spaced.`
}

const commands = {
    trekant: `@trig 
    triangle(p,3,4,5)
    
    Draws a triangle (p,a,b,c)
    p is point, a,b,c are side lengths.
    `
}

export const autocom = (word, line, rect, ems) => {
    if (aulist.includes(word)) {
        console.log(line, rect, ems);
        const top = line * ems * 16 + rect.top;
        const left = rect.left + 16 * (word.length + 2);
        const hits = auwords.filter(w => w.startsWith(word));
        let exp = '';
        if (hits.length === 1) {
            exp = '<br>' + explain[hits[0]];
        }
        toast(hits.map(w => w + '<br>').join('') + exp,
            { delay: 1, left, top });
        return hits.length === 1 ? hits[0] : null;
    }
    return null;
}

const help = Object.assign({}, explain, commands);

export const helptxt = word => {
    if (help[word]) {
        toast(help[word],
            { delay: 25, close: true, boxshadow: "blue" });
    }
}