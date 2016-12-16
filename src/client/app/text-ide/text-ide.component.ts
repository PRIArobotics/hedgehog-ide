import {Component, ViewChild, OnInit} from '@angular/core';
import {ContextMenuComponent} from 'angular2-contextmenu';
import {ActivatedRoute} from "@angular/router";
import {DummyProgramService} from "../program/dummy-program.service";
import DummyProgramStorage from "../../../common/versioncontrol/DummyProgramStorage";
import {WorkingTreeObjectType} from "../../../common/versioncontrol/WorkingTreeObject";
import WorkingTreeDirectory from "../../../common/versioncontrol/WorkingTreeDirectory";
import {TreeComponent} from "angular2-tree-component";

declare var $: JQueryStatic;

export class File {
    public id: number;
    public name: string;
    public content: string;
}

@Component({
    selector: 'hedgehog-ide',
    templateUrl: 'app/text-ide/text-ide.component.html',
    providers: [
        DummyProgramService
    ]
})
export class TextIdeComponent implements OnInit {
    @ViewChild(ContextMenuComponent) public basicMenu: ContextMenuComponent;


    @ViewChild(TreeComponent)
    private tree: TreeComponent;

    private filetree: Object[] = [];

    private files = [];

    private lastId: any = 0;
    private nextFileId: number = 1;

    private editorContent: string = '';
    private programName: string;
    private storage: DummyProgramStorage;

    constructor(route: ActivatedRoute, storageService: DummyProgramService) {
        this.programName = route.snapshot.params['programName'];

        this.storage = storageService.getStorage();

    }

    public async ngOnInit() {
        this.storage.createProgram('program 1');
        let program1 = await this.storage.getProgram('program 1');
        let rootdir = await program1.getWorkingTree().getRootDirectory();


        rootdir.addFile('file1.py', 'testfile1');
        rootdir.addFile('file2.py', 'testfile2');

        await rootdir.addDirectory('dir');
        let dir = await rootdir.getDirectory('dir');
        dir.addFile('file3.py', 'testfile3');



        let childArray = [];
        this.filetree[0] = {
            name: program1.name,
            children: childArray
        };

        console.log(program1);

        await this.populateFiletree(rootdir, childArray);

        console.log(rootdir.items);

        console.log(this.filetree);
        this.iterateTree(this.filetree[0]);

        this.tree.treeModel.update();
        this.resetIndicator();
    }

    public async populateFiletree (directory: WorkingTreeDirectory, childArray: Object[]) {
        for(let itemName of directory.items) {

            let type = directory.getType(itemName);

            if (type === WorkingTreeObjectType.File) {
                let file = await directory.getFile(itemName);
                childArray.push(
                    {
                        id: this.nextFileId,
                        name: itemName,
                        content: await file.readContent()
                    }
                );

                this.nextFileId++;
            } else if (type === WorkingTreeObjectType.Directory) {
                if (itemName !== '.') {
                    let newDirectory = await directory.getDirectory(itemName);
                    let newChildArray = [];

                    childArray.push(
                        {
                            name: itemName,
                            children: newChildArray
                        }
                    );

                    await this.populateFiletree(newDirectory, newChildArray);
                }
            }
        }
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
                    right: $(tabToIndicate).parent().width() -
                    ($(tabToIndicate).position().left + $(tabToIndicate).width())
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

            let newTab = document.createElement('li');
            newTab.className = 'tab';
            newTab.id = 'tab' + event.node.data.id;
            newTab.setAttribute('draggable', '');

            let linkToEditor = document.createElement('a');
            linkToEditor.className =  'green-text lighten-3 waves-effect';

            let closeButton = document.createElement('i');
            closeButton.className = 'material-icons';
            closeButton.appendChild(document.createTextNode('close'));
            closeButton.addEventListener('click', () => {
                $(newTab).remove();
                this.resetIndicator();
            });

            linkToEditor.appendChild(document.createTextNode(event.node.data.name));
            linkToEditor.appendChild(closeButton);
            newTab.appendChild(linkToEditor);

            let fileId = event.node.data.id - 1;
            newTab.addEventListener('click', () => this.onTabSelect(fileId));

            document.getElementById('sortable-tabs').appendChild(newTab);

            updateIndicator(newTab);

            (<any>$('div.tabs')).tabs();
        }
    }

    public resetIndicator () {
        let indicator = $('.indicator').first();
        indicator.css(
            {
                left: 0,
                right: indicator.parent().width()
            }
        );
    }

    public newFile(event) {
        console.log(event);
    }

    public onTabSelect(id: number): void {
        this.files[this.lastId].content = this.editorContent;
        this.editorContent = this.files[id].content;
        this.lastId = id;
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
