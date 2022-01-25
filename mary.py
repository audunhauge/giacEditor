
import array as _arr

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


a = array([1,2,3])
b = array([4,5,6])
c = a[1:]
print(a,c)
print(a-c)
def f(x):
    return x*x

x = array(map(f,a))
print(x)