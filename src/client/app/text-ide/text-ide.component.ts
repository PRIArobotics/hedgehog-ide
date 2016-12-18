import {Component, ViewChild, OnInit, AfterViewInit, EventEmitter} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {DummyProgramService} from "../program/dummy-program.service";
import {WorkingTreeObjectType} from "../../../common/versioncontrol/WorkingTreeObject";
import WorkingTreeDirectory from "../../../common/versioncontrol/WorkingTreeDirectory";
import {TreeComponent} from "angular2-tree-component";
import WorkingTreeFile from "../../../common/versioncontrol/WorkingTreeFile";
import IProgramStorage from "../../../common/versioncontrol/ProgramStorage";
import {MaterializeAction} from "angular2-materialize";

declare var $: JQueryStatic;

export class File {
    public name: string;
    public content: string;
    public storageFile: WorkingTreeFile;
}


@Component({
    moduleId: module.id,
    selector: 'hedgehog-ide',
    templateUrl: 'text-ide.component.html',
    styleUrls: ['text-ide.component.css'],
    providers: [
        DummyProgramService
    ]
})

export class TextIdeComponent implements OnInit, AfterViewInit {
    // TreeComponent for updating the file tree
    @ViewChild(TreeComponent)
    private tree: TreeComponent;

    // modal action for creating a new file
    private newFileModalActions = new EventEmitter<string|MaterializeAction>();


    // modal action for deleting file
    private deleteFileModalActions = new EventEmitter<string|MaterializeAction>();

    // filetree array containing TreeComponent compatible Objects
    private filetree: Object[] = [];

    // indexed files from the filetree
    private files: File[] = [];

    // last id of the file changed used for saving the file
    private lastId: number = -1;

    // iterator for file objects
    private nextFileId: number = 0;

    // editor content bind
    private editorContent: string;

    // current file content that is similar to editorContent
    private currentFileContent: string = '';

    // The Program name that is passed to this class by the router
    private programName: string;

    // storage object for interacting with a ProgramStorage
    // can be any ProgramStorage depending on what getStorage returns
    private storage: IProgramStorage;

    // new file name
    private newFileName: string;

    // new file name
    private deleteFileData: any;

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

        // update the tree model after file tree has been populated
        this.tree.treeModel.update();
    }

    /**
     * This method is called after the view is initialized so it can access frontend items
     */
    public ngAfterViewInit(): void {
        // reset indicator from the tabs
        this.resetIndicator();

        // remove the tab empty tab that prevents the indicator error
        $('.tab').first().remove();

        let tabs = <any>$("#sortable-tabs");
        tabs.sortable({
            items: "li",
            axis: "x",
            stop: (event, ui) => {
                this.updateIndicator($(ui.item));
            }
        });
        tabs.disableSelection();
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
                        fileId: this.nextFileId,
                        name: itemName
                    }
                );

                // also index the file
                this.files.push(
                    {
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
    public onEditorContentChange (editorContent) {
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
        // check if the node is a directory and do nothing if it is
        if (event.node.children == null) {

            // set file to the data from the event
            let file = event.node.data;

            // update the editor content
            await this.openFile(file.fileId);

            // search for tab
            let tab = $('#tab' + file.fileId);

            // check if tab was found
            if (tab.length > 0) {
                // update the indicator to be under the tab
                this.updateIndicator(tab);

                // end method here
                return;
            }

            // create new tab element if the file was not found as
            // <li class='tab' id='tab{id}' draggable> ... <li>
            let newTab = document.createElement('li');
            newTab.className = 'tab';
            newTab.id = 'tab' + file.fileId;
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

                if (this.lastId === file.fileId) {
                    let prevId = $(newTab).prev().attr('id');

                    if (prevId) {
                        this.updateIndicator($('#' + prevId));
                        this.openFile(Number(prevId.substr(3, 4)));
                    } else if (!prevId) {
                        let nextId = $(newTab).next().attr('id');

                        if (nextId) {
                            this.updateIndicator($(newTab));
                            this.openFile(Number(nextId.substr(3, 4)));
                        } else {
                            this.resetIndicator();
                            this.editorContent = '';
                            this.lastId = -1;
                        }
                    }

                }

                $(newTab).remove();
                if (this.lastId !== -1) {
                    console.log("Yo dud " + this.lastId);

                    this.updateIndicator($('#tab' + this.lastId));
                }
            });

            // add close icon to close button
            closeButton.appendChild(document.createTextNode('close'));

            // create file name text
            let fileNameElement = document.createTextNode(file.name);

            // add filename and close button to the tab content
            linkToEditor.appendChild(fileNameElement);
            linkToEditor.appendChild(closeButton);

            // add tab content to the tab ( <a> into <li>
            newTab.appendChild(linkToEditor);

            // create click event for text node to open the file with it's id
            newTab.addEventListener('click', async (clickEvent) => {
                // check whether the target was <i> meaning the close button
                if (!$(clickEvent.target).is('i')) {
                    // if it wasn't it opens the file
                    await this.openFile(file.fileId);
                }
            });

            // add element to the sortable-tabs div
            document.getElementById('sortable-tabs').appendChild(newTab);

            // update the indicator to this new tab
            this.updateIndicator(newTab);

            // load new li as tab
            (<any>$('div.tabs')).tabs();
        }
    }

    /**
     * Event binding for tree context menu "new file"
     * This opens the new file modal
     *
     * @param event TreeNode object with the file tree object data
     */
    public openNewFileModal(event) {
        this.newFileModalActions.emit({action:"modal", params:['open']});
        this.fixModalOverlay();
    }

    /**
     * Close the new file modal
     */
    public closeNewFileModal() {
        this.newFileModalActions.emit({action:"modal", params:['close']});
    }

    public newFile(event) {
        console.log(this.newFileName);
        console.log(event);
    }

    /**
     * Event binding for tree context menu "new file"
     * This opens the new file modal
     *
     * @param event TreeNode object with the file tree object data
     */
    public openDeleteFileModal(event) {
        console.log(event);
        this.deleteFileData = event.node.data;

        this.deleteFileModalActions.emit({action:"modal", params:['open']});
        this.fixModalOverlay();
    }

    /**
     * Close the new file modal
     */
    public closeDeleteFileModal() {
        this.deleteFileModalActions.emit({action:"modal", params:['close']});
    }

    public deleteFile() {
        console.log(this.deleteFileData);
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
     * @param id of the file in the files array
     */
    private async openFile(id: number) {

        try {
            // save file from the last tab in local content
            this.files[this.lastId].content = this.currentFileContent;
            // save file in storage
            let wtFile: WorkingTreeFile = this.files[this.lastId].storageFile;
            await wtFile.writeContent(this.currentFileContent);
        }  catch (e) {
            // this has to be done since when resetting editorContent it also resets currentFileContent
            // and therefore the lastId is set to -1 which creates a TypeError
            if (!(e instanceof TypeError)) {
                console.log(e.stack);
            }
        }

        // update editorContent, currentFileContent to current files content and lastId to this id
        this.editorContent = this.files[id].content;
        this.currentFileContent = this.files[id].content;
        this.lastId = id;
    }

    private fixModalOverlay() {
        // This is extremely hacky but apparently, there is no other solution.
        // Move modal to right location as it should fill the whole screen otherwise
        // See https://github.com/Dogfalo/materialize/issues/1532
        // grab the dark overlay
        let overlay = $('.modal-overlay');
        // remove it
        overlay.detach();
        // attach it to the thing you want darkened
        $('router-outlet').after(overlay);
    };
    /**
     * Update the indicator div to position under a tab
     *
     * @param tabToIndicate new tab or existing tab to indicate
     */
    private updateIndicator(tabToIndicate) {
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
}
