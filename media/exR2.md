# Prøve s1

@opp Forenkle (3p)

@math abc
ln(abc)-ln(c)-ln(a/b) - ln(b^2)
log(100)-log(4)-log(25)
(x^2-16)/(x+4) - (x-4)

@opp (1p)
Les av skjæring
@plot
1/2x-1;x^2-2x-3

@opp Løs likninger (3p)
@math abc likning
x+2=4
(ln(x))^2+2ln(x)=3
e^x-3=e^(-x)

@opp Rette linjer (2p)

Finn likningen for linja gjennom (2,3),(4,7)

@plot 200
[[0,0],[2,3],[4,7],[8,8]]

@opp Indre sirkel
I figuren ser du en trekant med inskrevet sirkel, hva er radius i sirkelen?

Bare demo - oppgavene har mangler/feil pensum osv.

@trig senter 300 8
p = (1,1)
t = tri({p,a:6,b:6 ,c:6,ABC:"A,B,C",abc:"c,$,b" }) 
s = t.center
r = t.radius
trekant(t)
circle(s,r)
dot(s)
text(s,"S")