# Simulate pylab in brython
from browser import html,document,window, alert as message
import array as _arr  ## someone might well use array as a name ...
import functools  ## no such risk - eh?
import random
from math import sqrt,sin,cos,tan,log,asin,acos,atan


def randint(a,b):
   return random.randint(a,b-1)

def _sub(a,p):
    q = random.random()
    s = p[0]
    i = 1
    while s < q and i < len(a):
        s += p[i]
        i += 1
    return a[i-1]

def choice(a,p=[],size=0,replace=True):
  if replace or size < 2:
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
            return _sub(a,p)
        else:
            ret = []
            for i in range(size):
                ret.append(_sub(a,p))
            return ret
  else:
    ## size > 1 and replace == False
    ## also ignore p as unlikely with replace
    b = a[:]  # copy
    ret = []
    for i in range(size):
      c = random.choice(b)
      ret.append(c)
      b.remove(c)
    return ret   

parameters = window.bryson;

targets = {
   "id":"",
   "fu":"",
   "bar":"",
   "bas":""
}


class array(list):
    def __init(self,list):
        self.ar = _arr.array('d',list)
    def __str__(self) -> str:
        return super().__str__()
    def __add__(self, other):
        return array([x+y for (x,y) in zip(self,array(other))])
    def __sub__(self, other):
        return array([x-y for (x,y) in zip(self,array(other))])
    def __rsub__(self, other):
        return array([y-x for (x,y) in zip(self,array(other))])




options = {
   "xAxis": { "label":"x"},
   "yAxis": { "label":"y"},
   "width":300,
   "height":300,
   "target"  :"#fu",
   "data"  : [
           ]
   }

def replot():
   id = parameters.id
   options["data"] = []
   options["xAxis"] = { "label":"x"}
   options["yAxis"] = { "label":"y"}
   options["target"] = "#" + id + "_fu"
   targets["id"] = id
   targets["fu"] = "#" + id + "_fu"
   targets["bar"] = id + "_bar"
   targets["bas"] = id + "_bas"

def xdomain(a,b):
   options["xAxis"]["domain"] = [a,b]

def ylim(a,b):
   ydomain(a,b)

def ydomain(a,b):
   options["yAxis"]["domain"] = [a,b] 

def yscale(l="linear"):
   options["yAxis"]["type"] = l

def xscale(l="linear"):
   options["xAxis"]["type"] = l

def title(l=""):
   options["title"] = l

def plotsize(w=200,h=200):
   options["width"] = w
   options["height"] = h

def grid(on=1):
   options["grid"] = (1 if on else 0)

def axhline(y=0,color="",*s):
   return 1

def axvline(x=0,color="",*s):
   return 1


def xlabel(l="x"):
   options["xAxis"]["label"] = l
   
def ylabel(l="x"):
   options["yAxis"]["label"] = l

def plot(xs,ys,color="",type="polyline"):
   if not "domain" in options["xAxis"]: 
      # domain not set - calc from xs
      ma = max(xs)
      mi = min(xs)
      options["xAxis"]["domain"]=[mi,ma]
   if not "domain" in options["yAxis"]:
      # domain not set - calc from xs
      ma = max(ys)
      mi = min(ys)
      options["yAxis"]["domain"]=[mi,ma]
   v = list(map(lambda x,y:[x,y],xs,ys))
   options["data"].append( {"points":v,"fnType":"points","graphType":type})
  

def show():
    window.functionPlot(options)

def read(filename):
   return window.readPython(filename)

def linspace(start,stop,amount):
   xs = []
   v = start
   d = (stop-start)/amount
   while v < stop:
      xs.append(v)
      v += d
   return array(xs)

def print(*args):
   t = targets["bar"]
   s = ""
   for e in args:
      s += str(e)
   document[t].attach(html.SPAN(s)).attach(html.BR())
