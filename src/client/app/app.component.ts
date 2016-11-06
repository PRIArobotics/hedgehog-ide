import {Component, AfterContentInit, ElementRef} from '@angular/core';

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
                        { id: 3, name: 'child3', content: "asdfasdf"},
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

        (<any>$("div.tabs")).tabs();
    }

    public onTabSelect(id: number): void {
        this.files[this.lastId].content = this.editorContent;
        this.editorContent = this.files[id].content;
        this.lastId = id;
    }

    public changeEditorContent (editorContent) {
        this.editorContent = editorContent;
    }

    public fileTreeEvent(event){
        if(event.node.children == null){
            var newTab = document.createElement("li");
            newTab.className = "tab";
            newTab.setAttribute('draggable', '');


            var linkToEditor = document.createElement("a");
            linkToEditor.className =  "green-text lighten-3";
            linkToEditor.appendChild(document.createTextNode(event.node.data.name));

            newTab.appendChild(linkToEditor);

            var fileId = event.node.data.id - 1;

            newTab.addEventListener('click', (event) => this.onTabSelect(fileId));


            document.getElementById('sortable-tabs').appendChild(newTab);
            (<any>$("div.tabs")).tabs();
        }

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
