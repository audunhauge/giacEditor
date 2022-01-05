## Prøve R1 fredag 10 desember 2021

@opp  
Løs likningssystemet
@math abc likningsett
x+2y=16
3x+4y=-22


@opp  forenkle
@math abc
2x+4x+(x+2)(x-2)-x**2+4
2x-2x
4(a+b+c)-2a+(b+c)(-1)

@opp løs likninger
@math likning abc
x**2-5x+4=0
2x**2-x=0
(x**2-16)/(x-4)=2/(x+4)+3


@opp Nullpunkt
$f(x)$ er en 2.grads polynom, $g(x)$ er en rett linje.
* Les av skjæring mellom $g(x)$ og $f(x)$
* Løs likningen $ f(x) \gt g(x) $
@plot 300
x**2-2x-2;3x-6,-3,5,-4,8


@fasit skriv synlig rett bak fasit: @fasit synlig, ellers skjult


Klargjør noen beregninger
@alg  
A=[[1,2],[3,4]]::venstreside
B=[16,-22]::høyreside


A og B brukes til å løse likningssystemet

@opp
@alg  
dot(inv(A),B)::løsning for likningssystemet

@opp  forenkle
@alg abc
2x+4x+(x+2)(x-2)-x**2+4
2x-2x
4(a+b+c)-2a+(b+c)(-1)

@opp løs likninger
@alg likning abc
roots(x**2-5x+4)
roots(2x**2-x)
roots((x+4)(x+4)-2-3(x+4))



@opp Nullpunkt
Les av skjæring mellom $g(x)$ og $f(x)$
@alg  
(x**2-2x-2-(3x-6))=0
