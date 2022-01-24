
import array as _arr

class array(list):
    def __init(self,list):
        self.ar = _arr.array('f',list)
    def __str__(self) -> str:
        return super().__str__()
    def __add__(self, other):
        return array([x+y for (x,y) in zip(self,other)])
    def __sub__(self, other):
        return array([x-y for (x,y) in zip(self,other)])


a = array([1,2,3])
b = array([4,5,6])
c = a + b
print(a,b,c,a-b)
print(sum(a))