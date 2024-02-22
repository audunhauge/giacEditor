// @ts-check

import { toast } from "./util.js";

// in editor: writing @ as first char on a line should trigger autocomplete
// assumed triggered by eventlistener in editor



const explain = {
    sign: `Draws sign table for expressions
(x+2)(x-1)(x-4)    ------+++++----+++++
'(x+2)(x-1)(x-4)   +++++++++----+++++++
''(x+2)(x-1)(x-4)  -----------+++++++++
help`,
    reg: `Regression fit, reg pol 2, reg lin
@reg exp
xs:1,2,3,4
ys:2,4,8,16
name:f
table:vekst
.
show

Funksjonen heter f, tabellen heter vekst.  
Linja med punktum lager vertikal avstand
name: setter navn på funksjonen
table: setter navn og viser tabellen
show viser funksjonen
Denne kan være skjult dersom du lager en prøve ...

@cas
f::regresjonsfunksjonen


@fplot
vekst;f

Navngitte funksjoner/tabeller kan brukes i fplot
`,
    question: `Creates a numbered question heading
@question            =>  Question 1.
@question (4p)       =>  Question 2. (4p)
@question :My Own    =>  My own
help`,
    poldiv: `Polynomial division with remainder
help`,
    fplot: `Plots graph for one or more functions

@fplot abc 200
sin(x);cos(x)
x^2-4,-2,5,-6,12

Plots with size=200x200
sin and cos in same graph, x^2-4 in second graph
abc names them a) and b)
The last plot has x=[-2..5] and y=[-6..12]
help`,
    cas: `Computer Algebra System, same as in GeoGebra

write "expression::comment"

f(x):=x^2+2x :: defines a function
f'(x):: derivative
g:=x+2::functions defined in cas 
::can be used by fplot or sign
solve(f'(x) = 0):: solves equation |x=| in geogebra
fsolve(f(x) = 0):: numerical solution |x≈| geogebra
int(f(x),x):: ∫f(x)dx
 factor(x^2-9)::must have leading 
::space or CAS will simplify back again
2*pi:: 2*𝜋
help`,
    piecewise: `Function definition in parts

f(x)                       /  x-2 for x<1
x-2:x<1        f(x) {  
x^2:x>=1             \\  x^2 for x>=1
help`,
    math: `Write flat math - get nice rendered math
@math abc
x/(x+2)=3
2x-4=0
Gives
a) x/(x+2) = 3
b)   2x -4 = 0
Nicely printed with latex
help`,
    python: `Starts a python script inline
def f(x):
  return x*x-3*x
xs = linspace(-5,5,100)
ys = f(xs)
plot(xs,ys)
grid()
show()
#GO!
help`,
    trig: `Create a trig drawing
triangle,square,circle etc
(try the code below)
## Draw some figures:
200 is width/height  
7 sets scale for x and y  
so that y=7 is at top of drawing  
0 is bottom.  
@trig 200 7
p=(1,2)
q=(3,2)
r=(2,3)
dot(p)
dot(7,7)
square(p,3,4)
text(r,q,"abba")
triangle(p,q,r)
circle(q,2)
help`,
    eq: `Dispaly an equation, step by step solution
help`,
normal:`Normal distribution`,
binom:`Binomial distribution`,
hist:`Histogram`,
callout:`Callout block with frame
@callout hint pre Example
The last word will be used as Title.
Default color is blue.
pre - respects space and newline
markdown - allows markdown and $x+y$
float - floats to right edge
hint - green
merk - red
gui - not shown on printout
:::
Must end with :::`,
bar:`Barchart`,
pie:`Piechart`,
hyper:`Hypergeometric distribution`,
eqset: `Step by step solution of equationsets

## Solving an equationset
Note by default commands work on eq1 or previous eq.

* *2 means multiply eq1 by 2  
* 2+1  adds eq1 to eq2  
* 2:/11  2: selects eq2, divide it by eleven  
* 1:|x=2   1: select eq1 again, subst x=2  
* -12   still eq1 - subtract 12  
* /8    still eq1 - divide by 8  

@eqset  
3x+4y=26  
5x-8y=-30  
*2  
2+1  
2:/11  
1:|x=2  
-12  
/8
help`,
    format: "page for new page,br for newline",
    ans: "Draws two lines under following text",
    dato: "dato 1  show date for tomorrow",
    help: `AVAILABLE COMMANDS
@question
@callout
@cas
@math
@fplot
@sign
@eq
@eqset
@poldiv
@piecewise
@python
@trig
@format
@ans
@dato
`,
}

const commands = {
    triangle: `trig : triangle() 
triangle(p,3,4,5)
Draws a triangle (p,a,b,c)
p is point, a,b,c are side lengths.

triangle(p,q,r)
Draws triangle given 3 points.

Check bigtri for advanced triangle`,
    bigtri: `trig : triangle example
## The code below renders a tri with extras.
* abc : tekst on sides, csv
* ABC : tekst on vertices, csv
* vABC : toggle show angle "a" shows only one  
  "abc" shows angles in all verts
* vert : as vABC - toggle draw dot on vert

@trig 300 7
p=(1,1)
q=(5,2)
t = tri({p,q,a:3,b:4,c:5,abc:"a,b,$",vABC:"abc",ABC:"A,B,C",vert:"abc"})
triangle(t)`,
    square: `trig : square(p,w,h)
Draws a square given point p
and w,h. Use negative w,h to
flip the square.`,
    circle: `trig : circle(p,r)
Draws circle given senter point and radius`,
    text: `trig : text(p,"tekst")
Renders tekst at point p

text(p,q,"tekst")

Renders tekst along line
from p to q.  p,q are points`,
    dot: `trig : dot(1,1)
plots a point at (x,y)
dot(1,2) 
  or 
p = (1,2)
dot(p)`,
    dots: `trig : dots(p,q,..)
Draws multiple dots at given points
The points must be defined as
p = (1,2) 
q = (x,y) x,y are numbers`,
    line: `trig : line(p,q)
Draws a line from point p
to point q`,
    linspace: `python : linspace(start,stop,num)
creates array [start, ..., stop]
with num elements evenly spaced.
Typically used to create x-values
for plotting with plot.`,
    show: `python : show() 
Puts the graph on the page.
You can have many plot() commands,
they are shown in the same graph by show().
Use grid(1) to turn grid on, grid(0) turns it off`,
    plot: `python : plot(xs,ys)
xs is array of x-values
ys is array of y-values
Typical use case:
xs = linspace(-5,5,100)
ys = f(xs)
plot(xs,ys)`,
    grid: `python : grid(1) 
turns grid on in a plot.
grid(0) turns the grid off
Used together with plot() and show()`,
}


let aulist = "sign,question,poldiv,plot,cas,math,callout,piecewise,python,reg,pie,hist,trig,eq,eqset,format,ans,dato";
let auwords = aulist.split(",");
let help;
let expand = {};

export const autocom = (word, line, rect, scy, ems) => {
    if (aulist.includes(word)) {
        const top = line * ems * 16 + rect.top + window.scrollY - scy;
        const left = rect.left + 16 * (word.length + 2);
        const hits = auwords.filter(w => w.startsWith(word));
        let exp = '';
        if (hits.length === 1) {
            exp = '<br>' + help[hits[0]];
        }
        toast(hits.map(w => w + '<br>').join('') + exp,
            { delay: 1, left, top });
        return hits.length === 1 ? { word: hits[0], expand: expand[hits[0]] } : null;
    }
    return null;
}

export const prep = lang => {
    auwords = Object.keys(lang.atcommands);
    const ua = {};  // reverse lookup
    auwords.forEach(k => {
        ua[lang.atcommands[k]] = k;
    })
    aulist = auwords.join(",");
    const myexplain = {};
    Object.keys(explain).forEach(k => {
        const tran = ua[k];
        myexplain[tran] = lang.explain[tran] || explain[k];
    });
    help = Object.assign({}, myexplain, commands);
    expand = Object.assign({}, lang.expand || {});
}

const marked = (word) => {
    const txt = help[word] || explain[word];
    return txt.replace(/([a-zøæå]+)/gm, (_, w) => {
        if (help[w] && w !== word) {
            return '<span class="marked">' + w + '</span>';
        }
        if (explain[w] && w !== word) {
            return '<span class="marked">' + w + '</span>';
        }
        return w;
    })

}


export const helptxt = (word, line, ofs, rect, scy, ems) => {
    if (help[word]) {
        const top = line * ems * 16 + rect.top + window.scrollY - scy;
        const left = rect.left + 16 * (ofs + 2);
        toast(marked(word),
            { delay: 25, close: true, boxshadow: "blue", top, left });
    } else if (explain[word]) {
        const top = line * ems * 16 + rect.top + window.scrollY - scy;
        const left = rect.left + 16 * (ofs + 2);
        toast(marked(word),
            { delay: 25, close: true, boxshadow: "blue", top, left });
    }
}