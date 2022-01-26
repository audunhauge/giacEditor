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
circle(q,2)`,
eq: "Dispaly an equation, step by step solution",
eqset: "Step by step solution of equationsets",
format: "page for new page,br for newline",
ans: "Draws two lines under following text",
dato: "dato 1  show date for tomorrow",
}

const commands = {
triangle: `trig : triangle() 
triangle(p,3,4,5)
Draws a triangle (p,a,b,c)
p is point, a,b,c are side lengths.

triangle(p,q,r)
Draws triangle given 3 points.

Check bigtri for advanced triangle`,
bigtri:`trig : triangle example
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
square:`trig : square(p,w,h)
Draws a square given point p
and w,h. Use negative w,h to
flip the square.`,
circle:`trig : circle(p,r)
Draws circle given senter point and radius`,
text:`trig : text(p,"tekst")
Renders tekst at point p

text(p,q,"tekst")

Renders tekst along line
from p to q.  p,q are points`,
dot:`trig : dot(1,1)
plots a point at (x,y)
dot(1,2) 
  or 
p = (1,2)
dot(p)`,
dots:`trig : dots(p,q,..)
Draws multiple dots at given points
The points must be defined as
p = (1,2) 
q = (x,y) x,y are numbers`,
line:`trig : line(p,q)
Draws a line from point p
to point q`,
linspace: `python : linspace(start,stop,num)
creates array [start, ..., stop]
with num elements evenly spaced.
Typically used to create x-values
for plotting with plot.`,
show:`python : show() 
Puts the graph on the page.
You can have many plot() commands,
they are shown in the same graph by show().
Use grid(1) to turn grid on, grid(0) turns it off`,
plot:`python : plot(xs,ys)
xs is array of x-values
ys is array of y-values
Typical use case:
xs = linspace(-5,5,100)
ys = f(xs)
plot(xs,ys)`,
grid:`python : grid(1) 
turns grid on in a plot.
grid(0) turns the grid off
Used together with plot() and show()`,
}

export const autocom = (word, line, rect, ems) => {
    if (aulist.includes(word)) {
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

export const helptxt = (word, line, ofs, rect, ems) => {
    if (help[word]) {
        const top = line * ems * 16 + rect.top;
        const left = rect.left + 16 * (ofs + 2);
        toast(help[word],
            { delay: 25, close: true, boxshadow: "blue", top, left });
    }
}