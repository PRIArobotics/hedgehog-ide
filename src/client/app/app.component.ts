import {Component, AfterContentInit} from '@angular/core';
declare var $:JQueryStatic;


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
    private files: File[] = [
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


    public lastId:number = 0;
    public editorContent:string = this.files[this.lastId].content;

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
