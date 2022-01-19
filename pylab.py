# Simulate pylab in brython
from browser import html,document,window, alert as message
import array as _arr  ## someone might well use array as a name ...
import functools  ## no such risk - eh?
from random import *

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

parameters = window.bryson;

id = parameters.id
fu = "#" + id + "_fu"
bar = id + "_bar"
bas = id + "_bas"


def array(xs):
   return _arr.array('d',xs)


options = {
    "target"  :"#fu",
      "data"  : [
           ]
   }

def replot():
   options["data"] = []

def xdomain(a,b):
   options["xAxis"] = { "domain":[a,b] }


def ydomain(a,b):
   options["yAxis"] = { "domain":[a,b] }

def xlabel(l="x"):
   if "xAxis" in options:
      options["xAxis"]["label"] = l
   else:
      options["xAxis"] = { "label":l }
   
def ylabel(l="x"):
   if "yAxis" in options:
      options["yAxis"]["label"] = l
   else:
      options["yAxis"] = { "label":l }



def plot(xs,ys,target=fu,color="",type="polyline"):
   v = list(map(lambda x,y:[x,y],xs,ys))
   options["target"] = target
   options["data"].append( {"points":v,"fnType":"points","graphType":type})
  

def show():
    window.functionPlot(options)

def linspace(start,stop,amount):
   xs = []
   v = start
   d = (stop-start)/amount
   while v < stop:
      xs.append(v)
      v += d
   return xs

def print(*args):
   s = ""
   for e in args:
      s += str(e)
   document[bar].attach(html.SPAN(s)).attach(html.BR())
