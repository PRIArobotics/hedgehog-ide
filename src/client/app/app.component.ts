import {Component, AfterContentInit} from '@angular/core';
declare var $:JQueryStatic;


export class File {
    id: number;
    name: string;
    content: string;
}

@Component({
    selector: 'hedgehog-ide',
    templateUrl: 'app/app.component.html'
})

export class AppComponent implements AfterContentInit{


    files: File[] = [
        {
            id: 0,
            name: 'main.py',
            content: 'main'
        },
        {
            id: 1,
            name: 'test.py',
            content: 'test'
        },
        {
            id: 2,
            name: 'test.py',
            content: 'test'
        },
        {
            id: 3,
            name: 'test.py',
            content: 'test'
        }
    ];

    ngAfterContentInit(): void {
        (<any>$("div.tabs")).tabs();
    }
}
