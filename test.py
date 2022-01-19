import array as _arr  ## someone might well use array as a name ...
import functools  ## no such risk - eh?
import random

def _subchoice(a,p):
    q = random.random()
    s = p[0]
    i = 1
    while s < q and i<len(a):
        s += p[i]
        i += 1
    return a[i-1]

def choice(a,p=[],size=0):
    if len(p)==0:
        if size == 0:
            return random.choice(a)
        else:
            ret = []
            for i in range(size):
                ret.append(random.choice(a))
            return ret
    else:
        if size == 0:
            return _subchoice(a,p)
        else:
            ret = []
            for i in range(size):
                ret.append(_subchoice(a,p))
            return ret




print(choice([1,2,3],size=5))