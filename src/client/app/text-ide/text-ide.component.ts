import {Component, ViewChild, OnInit, AfterViewInit} from '@angular/core';
import {ContextMenuComponent} from 'angular2-contextmenu';
import {ActivatedRoute} from "@angular/router";
import {DummyProgramService} from "../program/dummy-program.service";
import {WorkingTreeObjectType} from "../../../common/versioncontrol/WorkingTreeObject";
import WorkingTreeDirectory from "../../../common/versioncontrol/WorkingTreeDirectory";
import {TreeComponent} from "angular2-tree-component";
import WorkingTreeFile from "../../../common/versioncontrol/WorkingTreeFile";
import IProgramStorage from "../../../common/versioncontrol/ProgramStorage";

declare var $: JQueryStatic;

export class File {
    public id: number;
    public name: string;
    public content: string;
    public storageFile: WorkingTreeFile;
}


@Component({
    selector: 'hedgehog-ide',
    templateUrl: 'app/text-ide/text-ide.component.html',
    providers: [
        DummyProgramService
    ]
})

export class TextIdeComponent implements OnInit, AfterViewInit {
    @ViewChild(ContextMenuComponent) public basicMenu: ContextMenuComponent;

    // TreeComponent for updating the file tree
    @ViewChild(TreeComponent)
    private tree: TreeComponent;

    // filetree array containing TreeComponent compatible Objects
    private filetree: Object[] = [];

    // indexed files from the filetree
    private files: File[] = [];

    // last id of the file changed used for saving the file
    private lastId: any = 0;

    // iterator for file objects
    private nextFileId: number = 1;

    // editor content bind
    private editorContent: string = '';

    // current file content that is similar to editorContent
    private currentFileContent: string = '';

    // The Program name that is passed to this class by the router
    private programName: string;

    // storage object for interacting with a ProgramStorage
    // can be any ProgramStorage depending on what getStorage returns
    private storage: IProgramStorage;

    /**
     * Constructor that sets the programName from the router
     * and storage from the given storageService
     *
     * @param route for messages sent from another view
     * @param storageService service that controls the ProgramStorage
     */
    constructor(route: ActivatedRoute, storageService: DummyProgramService) {
        this.programName = route.snapshot.params['programName'];

        this.storage = storageService.getStorage();

    }

    /**
     * ngOnInit is called after the constructor at the beginning of the lifetime
     * it can be async (the constructor cannot) and therefore allows interaction with the ProgramStorage
     */
    public async ngOnInit() {
        // for test purposes
        this.storage.createProgram(this.programName);
        // no longer test

        let program1 = await this.storage.getProgram(this.programName);
        let rootdir = await program1.getWorkingTree().getRootDirectory();

        // for test purposes
        rootdir.addFile('file1.py', 'testfile1');
        rootdir.addFile('file2.py', 'testfile2');

        await rootdir.addDirectory('dir');
        let dir = await rootdir.getDirectory('dir');
        dir.addFile('file3.py', 'testfile3');
        // no longer test

        let childArray = [];

        // set root element of the file tree
        this.filetree[0] = {
            name: program1.name,
            children: childArray
        };

        // populate file tree and give it the root directory and it's childArray
        await this.populateFiletree(rootdir, childArray);
    }

    /**
     * This method is called after the view is initialized so it can access frontend items
     */
    public ngAfterViewInit(): void {
        // update the visible file tree from the frontend
        this.tree.treeModel.update();

        // reset indicator from the tabs
        this.resetIndicator();

        // remove the tab that creates the indicator error
        $('.tab').first().remove();
    }

    /**
     * Populate the file tree is first called with the root directory
     * and then called recursively for each directory found
     *
     * @param directory directory to add to the file tree
     * @param childArray child array to add the sub-files and directories too
     */
    public async populateFiletree (directory: WorkingTreeDirectory, childArray: Object[]) {
        // loop through all items of the directory
        for(let itemName of directory.items) {
            // get type of the item
            let type = directory.getType(itemName);

            // check whether it is a file or directory
            if (type === WorkingTreeObjectType.File) {
                // get the file
                let file = await directory.getFile(itemName);

                // add file to children of the directory
                childArray.push(
                    {
                        id: this.nextFileId,
                        name: itemName
                    }
                );

                // also index the file
                this.files.push(
                    {
                        id: this.nextFileId,
                        name: itemName,
                        content: await file.readContent(),
                        storageFile: file
                    }
                );

                this.nextFileId++;
            } else if (type === WorkingTreeObjectType.Directory) {
                if (itemName !== '.') {
                    // get the directory
                    let newDirectory = await directory.getDirectory(itemName);

                    // create children's array
                    let newChildArray = [];

                    // add directory to children of the directory
                    childArray.push(
                        {
                            name: itemName,
                            children: newChildArray,
                            storageDirectory: newDirectory
                        }
                    );

                    // recurse over the directory and give it the children array
                    await this.populateFiletree(newDirectory, newChildArray);
                }
            }
        }
    }

    /**
     * Event binding when character is input in the ace editor
     *
     * @param editorContent string that is the whole editor content
     */
    public changeEditorContent (editorContent) {
        // save editorContent to the local file and currentFileContent
        this.editorContent = editorContent;
        this.currentFileContent = editorContent;
    }

    /**
     * Event binding when an element in the file tree is clicked
     *
     * @param event data sent from the event that includes the file
     */
    public async fileTreeEvent(event) {

        /**
         * Update the indicator div to position under a tab
         *
         * @param tabToIndicate new tab or existing tab to indicate
         */
        function updateIndicator(tabToIndicate) {
            // get indicator array
            let indicatorDiv = $('.indicator').first();

            // update css left and right position
            indicatorDiv.css(
                {
                    left: $(tabToIndicate).position().left,
                    right: $(tabToIndicate).parent().width() -
                    ($(tabToIndicate).position().left + $(tabToIndicate).width())
                }
            );
        }

        // check if the node is a directory and do nothing if it is
        if(event.node.children == null) {

            // set file to the data from the event
            let file = event.node.data;

            // update the editor content
            await this.openFile(file.id - 1);

            // search for tab
            let tab = $('#tab' + file.id);

            // check if tab was found
            if (tab.length > 0) {
                // update the indicator to be under the tab
                updateIndicator(tab);

                // end method there
                return;
            }

            // create new tab element if the file was not found as
            // <li class='tab' id='tab{id}' draggable> ... <li>
            let newTab = document.createElement('li');
            newTab.className = 'tab';
            newTab.id = 'tab' + file.id;
            newTab.setAttribute('draggable', '');

            // create new a element that has the filename as
            // <a class='green-text lighten-3 waves-effect'> {filename} ... </a>
            let linkToEditor = document.createElement('a');
            linkToEditor.className =  'green-text lighten-3 waves-effect';

            // create close button as
            // <i class='material-icons' onclick="..."> close </i>
            let closeButton = document.createElement('i');
            closeButton.className = 'material-icons';
            closeButton.addEventListener('click', () => {
                $(newTab).remove();
                // this.editorContent = '';
                this.resetIndicator();
            });

            // add close icon to close button
            closeButton.appendChild(document.createTextNode('close'));

            // add filename and close button to the tab content
            linkToEditor.appendChild(document.createTextNode(file.name));
            linkToEditor.appendChild(closeButton);

            // add tab content to the tab ( <a> into <li>
            newTab.appendChild(linkToEditor);

            // create click event for the tab to open the file with this id
            let fileId = file.id - 1;
            newTab.addEventListener('click', async () => await this.openFile(fileId));

            // add element to the sortable-tabs div
            document.getElementById('sortable-tabs').appendChild(newTab);

            // update the indicator to this new tab
            updateIndicator(newTab);

            // load new li as tab
            (<any>$('div.tabs')).tabs();
        }
    }

    /**
     * Event binding for context menu new file
     *
     * @param event TreeNode object with the file tree object data
     */
    public newFile(event) {
        console.log(event);
    }

    /**
     * reset indicator by setting it's left and right coordinate to the same point
     */
    private resetIndicator () {
        let indicator = $('.indicator').first();
        indicator.css(
            {
                left: 0,
                right: indicator.parent().width()
            }
        );
    }

    /**
     * Save the last opened file and set current editorContent file with given id
     *
     * @param id
     */
    private async openFile(id: number) {
        // save file from the last tab in local content
        this.files[this.lastId].content = this.currentFileContent;

        // save file in storage
        let wtFile: WorkingTreeFile = this.files[this.lastId].storageFile;
        await wtFile.writeContent(this.currentFileContent);

        // update editorContent, currentFileContent to current files content and lastId to this id
        this.editorContent = this.files[id].content;
        this.currentFileContent = this.files[id].content;
        this.lastId = id;
    }
}
