# Simulate pylab in brython
from browser import html,document,window, alert as message

parameters = window.bryson;

options = {
    "target"  :"#fu",
      "data"  : [
            { "points":[[1],[2]], 
              "fnType":'points',
              "graphType":'scatter'
            }, 
           ]
}

id = parameters.id
fu = "#" + id + "_fu"
bar = id + "_bar"
bas = id + "_bas"


def plot(xs,ys,target=fu):
   v = list(map(lambda x,y:[x,y],xs,ys))
   options["target"] = target
   options["data"][0]["points"] = v
   message(v)
   window.functionPlot(options)

def show():
   return

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
