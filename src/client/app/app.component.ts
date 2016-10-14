import {Component, AfterContentInit} from '@angular/core';
import {isUndefined} from "util";
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
        }
    ];


    lastId:number = 0;
    editorContent:string = this.files[this.lastId].content;

    onTabSelect(fileContent:string, id:number): void {

        this.files[this.lastId].content = this.editorContent;

        this.editorContent = fileContent;

        this.lastId = id;
    }

    changeEditorContent (editorContent){
        this.editorContent = editorContent;
    }

    ngAfterContentInit(): void {
        (<any>$("div.tabs")).tabs();
    }
}
