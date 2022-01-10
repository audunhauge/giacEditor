# Prøve 1T 10. desember 2021

### Del I - uten hjelpemidler
---
@question Løs likninger
@math abc likning
2x-3=5x+3
(x-2)/2+5x/6=(2x+1)/4
x^2+x=12


@question Polynomet P er gitt ved 
$P(x)$ = $x^3 -2x^2-5x + 6$ 

@format abc
* Regn ut $P(-2)$
* Faktoriser $P(x)$

@question Skriv så enkelt som mulig
@math abc
(x^3-2x^2-5x+6)/(x^2+x-12)
sqrt(75)-sqrt(48)
x+2
3+x


@question Skjæring
Funksjonene $f$ og $g$ er gitt ved 
$f(x) = 2x^2 +x -2$ og $g(x)=x+1$  
Finn eventuelle skjæringspunkter mellom grafene til $f$ og $g$.
sdfsdf




@question Marthe har laga følgende program:
```python
from math import sqrt
a = float(input("a = "))
b = float(input("b = "))
c = float(input("c = "))
d = b**2-4*a*c
x1 = (-b + sqrt(d) ) / (2*a)
x2 = (-b - sqrt(d) ) / (2*a)
print(a," (x - ",x1,")(x - ",x2,")"
```
@format abc
* Hva gjør programmet, forklar linje for linje
* For noen verdier av a,b,c krasjer programmet - forklar
problemet og hva som må gjøres (kan bruke ord eller kode).


@format page

### Del II - med hjelpemidler
---

@question Skriv på standardform med 3 desimaler
@math
(3.29-2*sqrt(5^3))/4^(-8)


@question Gitt 
@format number
* $f(x)=3x^2-2x+5$  
* $g(x)=4x+2$

Bruk CAS og løs likningen $g(x) = f(x)$


@question Funksjonen $f$ er gitt ved $f(x) = x^2+6x-5$
@format abc
* skriv $f$ hved hjelp av et fullstendig kvadrat
* forklar at $(-3,-14)$ er et bunnpunkt for $f$


@question Under ser du tre 2.gradsfunksjoner $f$, $g$ og $h$.

@plot 200
x^2+4x+5;x^2-2x-1;x^2-4x+4,-5,5,-3,4

$b^2-4ac$ kalles en diskriminant for en likning på formen $ax^2+bx+c$.  
Koble sammen diskriminanter og grafer: (f,g eller h). Begrunn svaret.
@format abc
* $b^2-4ac=4$
* $b^2-4ac=0$
* $b^2-4ac=-3$

@question Bestem a, b og c slik at sammenhengen blir en identitet
@math likning
4x^2-a=(bx-3)(cx+3)

@question
Rammen rundt et bilde har bredde x. Bildet i
rammen har høyde x + 4 cm og lengde 8 cm.  
Vi får vite at bildet og rammen til sammen har
et areal på 120 $cm^2$  
Hvor stort er arealet av bildet?


@format page
---

@fasit
@question Løs likninger
@cas abc likning
2x-3=5x+3
(x-2)/2+5x/6=(2x+1)/4
x^2+x=12

@question Polynomet P er gitt ved 
$P(x)$ = $x^3 -2x^2-5x + 6$ 

@cas
p=x^3 -2x^2-5x + 6
eval(p,x,-2)
w=quotient(p,x+2)
roots(w)
(x-1)(x-3)(x+2)

@question Skriv så enkelt som mulig
@cas abc
(x-3)(x-1)(x+2)
(x-3)(x+4)
sqrt(75)-sqrt(48)


@question Skjæring
@cas
2x^2 +x -2=x+1  



