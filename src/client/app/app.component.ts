import {Component, AfterViewInit, ViewChild} from '@angular/core';
import {ContextMenuComponent} from "angular2-contextmenu";

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

export class AppComponent implements AfterViewInit {
    @ViewChild(ContextMenuComponent) public basicMenu: ContextMenuComponent;

    constructor() {
        this.iterateTree(this.filetree[0]);
    }

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

    public ngAfterViewInit(): void {

        $('.indicator').first().css(
            {
                right: 0
            }
        );
    }

    public onTabSelect(id: number): void {
        this.files[this.lastId].content = this.editorContent;
        this.editorContent = this.files[id].content;
        this.lastId = id;
    }

    public changeEditorContent (editorContent) {
        this.editorContent = editorContent;
    }

    public fileTreeEvent(event) {
        function updateIndicator(tabToIndicate) {
            let indicatorDiv = $('.indicator').first();
            indicatorDiv.css(
                {
                    left: $(tabToIndicate).position().left,
                    right: $(tabToIndicate).parent().width() - ($(tabToIndicate).position().left + $(tabToIndicate).width())
                }
            );
        }

        if(event.node.children == null) {

            this.onTabSelect(event.node.data.id - 1);

            let tab = $('#tab' + event.node.data.id);

            if (tab.length > 0) {
                updateIndicator(tab);
                return;
            }

            let newTab = document.createElement("li");
            newTab.className = "tab";
            newTab.id = "tab" + event.node.data.id;
            newTab.setAttribute('draggable', '');

            let linkToEditor = document.createElement("a");
            linkToEditor.className =  "green-text lighten-3 waves-effect";
            linkToEditor.appendChild(document.createTextNode(event.node.data.name));

            newTab.appendChild(linkToEditor);

            let fileId = event.node.data.id - 1;
            newTab.addEventListener('click', () => this.onTabSelect(fileId));

            document.getElementById('sortable-tabs').appendChild(newTab);

            updateIndicator(newTab);

            (<any>$("div.tabs")).tabs();


        }
    }

    private newFile(file) {
        console.log(file);
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
