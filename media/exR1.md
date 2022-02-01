# Terminprøve R1

## Del I - uten hjelpemidler
---

@oppgave

Bestem grenseverdiene

@matte abc senter
lim((x^2-1)/(x-1),x,1)
lim((e^x-1)/x,x,0)

@oppgave
Forenkle

@matte abc 
3*lg(a)-lg(a^2)
lg(5*b)+lg((2*a)/b)-lg(a)

@oppgave
Ada har skrevet koden:
```python
def f(x):
  return 1/x
def fart(x,h):
  return (f(x+h)-f(x))/h
print(round(fart(2,1E-6),2))
```

@format abc
* Hva øsnker ada å finne ut?
* Hva blir resultatet?

@oppgave
En funk gitt ved

@delt
f(a,b)
2x+a:x<=1
x^2+bx:x>1

@format abc
* Bestem a og b slik at f er deriverbar i 1.
* Avgjør om grafen til f har et vendepunkt.


@oppgave
I figurene nedenfor ser du i øverste rad graf til funk f,g,h.  
I nederste rad ser du 5 andre grafer.  
Bestem hvilke av disse som svarer til f' g' og h'

@fplot abc 200
-x^3+2x
1/x
x+3


@fplot nummer 150
-3x^2+2
-1/(x^2)
0x+1
x
x^3-2x


@format page


## Del 2 - med hjelpemidler
___

@oppgave
En funksjon er gitt ved $f(x)=ln(x)+ln(4-x)$
@format abc
* Finn nullpunkt til f.
* Bestem def og verd mengdene til f.  
En annen funksjon h er gitt $h(x)=ln(x)+ln(a-x)$ a>0
* Bestem a slik at verdimengden h er 
$ V_h = \big \langle \leftarrow , 0 \big \] $


@oppgave
Bestem f når du får vite
* f er en resjonal funk
* nullpunkt {-2,1}
* y=2x+6 er skrå asymptote
* x = 2 er vert asympt



@oppgave
En generell logaritme kan skrives som $log_a(b) $, der a er grunntallet for logaritmen.  
Verdien av denne logaritmen er løsningen på likningen $ a^x=b$
@format abc
* Beskriv en algoritme som bestemmer verdien av  $log_a(b) $  
Algoritmen skal bruke Newtosn metod til å løse likningen $ a^x=b$$ a^x=b$.  
Starverdien for metoden skal alltid være 0.
* Skriv kode basert på algoritmen fra a).  
Input skal være helatt $a$ og desimaltall $b$  
Output skal være verdien av $log_a(b) $.

@oppgave
En 3.gradfunk er gitt ved $ f(x)=ax^3 +bx^2+cx+d $  
Jonas har følgende i CAS
@cas
f(x):=a*x^3 +b*x^2+c*x+d
x0:=solve(f(x)'' =0)
g:=f'(x)
g|x=x0-k
g|x=x0+k

@oppgave

@delt
f(x)
x^2:-3 <= x <= 1
3x-p: 1 < x <= 2

@format abc
* bestem alle verier for p slik at f er kontinuerlig i 1
* er det noen verdier for p som gjør f deriverbar i 1?


@fasit

@oppgave
@cas abc senter
limit((x^2-1)/(x-1),x,1)
limit((e^x-1)/x,x,0)

@oppgave
@cas abc 
3*log(a)-log(a^2)
log(5*b)+log((2*a)/b)-log(a)::for ln les log svaret er 1



@oppgave

Resultatet av koden:
@python code
def f(x):
  return 1/x
def fart(x,h):
  return (f(x+h)-f(x))/h
print(round(fart(2,1E-6),2))
#GO!

Hva ada finner ut:

@cas
f(x):=1/x::s = f(x)
g(x):=f'(x):: v = s'
evalf(g(2))::fart når x=2
(1E-6)

Hun har approksimert farten (s') med $(f(x+h)-f(x))/h$
for h = 0.000001.


@oppgave

@cas
f(x):=2x+a
g(x):=x^2+b*x
f'(1)
g'(1)
b:=0
f(x)
g(x)
f(1)
g(1)
solve(f(1)=g(1)
a:=-1
f(x)
g(x)

@fplot
2x-1;x^2


@oppgave
@oppgave
@oppgave
@oppgave

@python code
from math import *
#a=int(input("a="))
#b=float(input("b="))
a=2
b=3.4
print("a=",a," b=",b)
x = 0
e = 0.0000001
i = 0    ## ikke loop for lenge
def f(x):
  return a**x-b
while abs(f(x)) > e and i < 100:
  y = f(x)
  df = (f(x+e)-y)/e
  x = x -  y/df
  i = i+1
print("Løsning i=",i," x=",x," y=",f(x))
#GO!

@cas
log(3.4)/log(2)





