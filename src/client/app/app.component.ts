import { Component, AfterContentInit } from '@angular/core';
declare var $: JQueryStatic;


export class File {
    public id: number;
    public name: string;
    public content: string;
}


@Component({
    selector: 'hedgehog-ide',
    templateUrl: 'app/app.component.html'
})

export class AppComponent implements AfterContentInit {
    public files: File[] = [
        {
            id: 0,
            name: 'main.py',
            content: `class Bruch:
    def __init__(self, zaehler, nenner=1):
        if type(zaehler) is Bruch:
            self.zaehler = zaehler.zaehler
            self.nenner = zaehler.nenner
        else:
            if type(zaehler) is not int or type(nenner) is not int:
                raise TypeError

            if nenner == 0:
                raise ZeroDivisionError

            self.zaehler = zaehler
            self.nenner = nenner

    def __eq__(self, other):
        return self.zaehler == other.zaehler and self.nenner == other.nenner

    def __abs__(self):
        return Bruch(abs(self.zaehler), abs(self.nenner))

    def __float__(self):
        return self.zaehler / self.nenner

    def __int__(self):
        return round(float(self))

    def __str__(self):
        return '({0})'.format(int(self))

    def __invert__(self):
        return Bruch(self.nenner, self.zaehler)

    def __neg__(self):
        return Bruch(-self.zaehler, self.nenner)

    def __pow__(self, power, modulo=None):
        if type(power) is float:
            raise TypeError

        return Bruch(self.nenner ** power, self.zaehler ** power)

    def _Bruch__makeBruch(value):
        if type(value) is not int:
            raise TypeError

        return Bruch(value, 1)


    def __add__(self, other):

        if type(other) is not Bruch:
            if type(other) is int:
                other = Bruch(other, 1)
            else:
                raise TypeError

        z1 = self.zaehler * other.nenner
        z2 = other.zaehler * self.nenner
        n = self.nenner * other.nenner

        return Bruch(z1 + z2, n)

    def __radd__(self, other):
        return self + other

    def __iadd__(self, other):
        return self + other

    def __mul__(self, other):
        if type(other) is int:
            other = Bruch(other)

        return Bruch(self.zaehler * other.zaehler, self.nenner * other.nenner)

    def __rmul__(self, other):
        return self * other

    def __imul__(self, other):
        return self * other

    def __truediv__(self, other):
        return self * ~other

    def __rtruediv__(self, other):
        return self * ~other

    def __itruediv__(self, other):
        return self * ~other


b = Bruch(3, 2)
b2 = Bruch(b)
b3 = Bruch(4, 2)

b *= 2
print(b)`
        },
        {
            id: 1,
            name: 'test.py',
            content: 'test'
        }
    ];


    public lastId: number = 0;
    public editorContent: string = this.files[this.lastId].content;

    public onTabSelect(fileContent: string, id: number): void {

        this.files[this.lastId].content = this.editorContent;

        this.editorContent = fileContent;

        this.lastId = id;
    }

    public changeEditorContent (editorContent) {
        this.editorContent = editorContent;
    }

    public ngAfterContentInit(): void {
        (<any>$("div.tabs")).tabs();
    }
}
