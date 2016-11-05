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

    private filetree = [
        {
            name: 'root1',
            children: [
                { id: 1, name: 'child1' },
                { id: 2, name: 'child2' },
                { name: 'childfolder', children:
                    [
                        { id: 3, name: 'child3', content: "asdf"},
                        { id: 4, name: 'child4' },
                    ]
                }
            ]
        }
    ];

    private files = [];

    private lastId: any = 0;

    private editorContent: string = '';

    public ngAfterContentInit(): void {

        this.iterateTree(this.filetree[0]);

        console.log(this.files);

        (<any>$("div.tabs")).tabs();
    }

    public onTabSelect(id: number): void {
        this.setContent(this.lastId);
        this.editorContent = this.files[id].content;
        this.lastId = id;
    }

    public changeEditorContent (editorContent) {
        this.editorContent = editorContent;
    }

    private setContent(fileId) {
        console.log(this.lastId);

        this.files[fileId].content = this.editorContent;
    }



    private iterateTree(tree): void {
        if(tree.children) {
            for(let child of tree.children)
                this.iterateTree(child);
        } else {
            this.files.push(tree);
        }
    }
}
