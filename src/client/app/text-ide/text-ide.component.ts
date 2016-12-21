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
declare var Materialize: any;

export class File {
    public name: string;
    public content: string;
    public storageFile: WorkingTreeFile;
    public parentArray: Object[];
    public parentDirectory: WorkingTreeDirectory;
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
    private newFileOrDirectoryModalActions = new EventEmitter<string|MaterializeAction>();

    // modal action for deleting file
    private deleteModalActions = new EventEmitter<string|MaterializeAction>();

    // filetree array containing TreeComponent compatible Objects
    private filetree: Object[] = [];

    // indexed files from the filetree
    private files: File[] = [];

    // last id of the file changed used for saving the file
    private openId: number = -1;

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


    // delete file name
    private newData: any = {
        name: '',
        arrayToAddFileTo: [],
        storageDirectory: WorkingTreeDirectory,
        file: true
    };

    // delete file name
    private deleteFileData: any= {
        name: '',
        parentArray: [],
        parentDirectory: WorkingTreeDirectory
    };

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
            children: childArray,
            storageDirectory: rootdir
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
                let tab = $(ui.item);

                this.updateIndicator(tab);
                this.openFile(+tab.attr('id').substr(3, 4));
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
                        name: itemName,
                    }
                );

                // also index the file
                this.files.push(
                    {
                        name: itemName,
                        content: await file.readContent(),
                        storageFile: file,
                        parentArray: childArray,
                        parentDirectory: directory
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
                            storageDirectory: newDirectory,
                            parentArray: childArray,
                            parentDirectory: directory
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
            closeButton.addEventListener('click', () => this.closeTab($(newTab)));

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

    public setNewData(data) {
        // check if it is a directory
        if (data.children) {
            // if it is add children and storageDirectory to newData
            this.newData.arrayToAddFileTo = data.children;
            this.newData.storageDirectory = data.storageDirectory;
        } else {
            // if it isn't add the files parent directory and array to newData
            this.newData.arrayToAddFileTo = this.files[data.fileId].parentArray;
            this.newData.storageDirectory = this.files[data.fileId].parentDirectory;
        }
    }

    /**
     * Event binding for tree context menu "new file"
     * This opens the new file modal
     *
     * @param event TreeNode object with the file tree object data
     */
    public openNewFileOrDirectoryModal(event) {
        // pass data (either file or directory) to the setNewData method
        this.setNewData(event.item.data);

        // open modal
        this.newFileOrDirectoryModalActions.emit({action:"modal", params:['open']});
        this.fixModalOverlay();
    }

    /**
     * Close the new file modal
     */
    public closeNewFileOrDirectoryModal() {
        this.newFileOrDirectoryModalActions.emit({action:"modal", params:['close']});
    }

    public async newFileOrDirectory() {
        // save new filename and Working Tree Directory to save it to
        let name: string = this.newData.name;
        let directory: WorkingTreeDirectory = this.newData.storageDirectory;

        if (this.newData.file) {
            // add file to parent child array
            this.newData.arrayToAddFileTo.push({
                fileId: this.nextFileId,
                name,
            });

            this.nextFileId++;

            // add file with no content to the Working Tree Directory
            await directory.addFile(name, '');
            let newFile: WorkingTreeFile = await directory.getFile(name);

            // save file in the indexed files array
            this.files.push(
                {
                    name,
                    content: '',
                    storageFile: newFile,
                    parentArray: this.newData.arrayToAddFileTo,
                    parentDirectory: directory
                }
            );
        } else {
            // add directory to the Working Tree Directory
            await directory.addDirectory(name);
            let newDirectory: WorkingTreeDirectory = await directory.getDirectory(name);

            // add directory to parent child array
            this.newData.arrayToAddFileTo.push({
                name,
                children: [],
                storageDirectory: newDirectory,
                parentArray: this.newData.arrayToAddFileTo,
                parentDirectory: directory
            });
        }


        // show toast that file was successfully created
        Materialize.toast('<i class="material-icons">done</i> Successfully created file ' + this.newData.name, 3000);

        // update the tree model after file has been added
        this.tree.treeModel.update();

        // reset newData
        this.newData = {};
    }

    /**
     * Event binding for tree context menu "delete" (directory or file)
     * This checks if it is the root directory and if not opens the modal
     *
     * @param event TreeNode object with the file tree object data
     */
    public openDeleteModal(event) {
        // save data (either file or directory) to deleteFileData
        this.deleteFileData = event.item.data;

        // check if there is no parentArray and if the type of fileId is undefined
        // this means it is the root directory and therefore cannot be deleted
        if (!this.deleteFileData.parentArray && typeof this.deleteFileData.fileId === 'undefined') {
            Materialize.toast('<i class="material-icons">close</i>Cannot delete root directory', 3000);
            return;
        }

        // open modal
        this.deleteModalActions.emit({action:"modal", params:['open']});
        this.fixModalOverlay();
    }

    /**
     * Close the delete file modal
     */
    public closeDeleteModal() {
        this.deleteModalActions.emit({action:"modal", params:['close']});
    }

    /**
     * Delete a file or directory using the data given from the modal
     */
    public async deleteAction() {
        // since both the file and directory use the parentArray
        // but both have different ways of getting to it, declare it here
        let parentArray;

        // check if it is a directory or file
        if (this.deleteFileData.children) {
            // TODO currently throws error
            // await this.deleteFileData.storageDirectory.deleteDirectory(this.deleteFileData.name);

            // since it is a file use the parentArray from it
            parentArray = this.deleteFileData.parentArray;
        } else {
            // retrieve file from files using it's fileId
            let file: File = this.files[this.deleteFileData.fileId];

            // get tab using the it's id
            let fileTab: JQuery = $('#tab' + this.deleteFileData.fileId);
            // check if element exists
            // JQuery Object [0] is the item description which only exists if the element exists
            if (fileTab[0]) {
                // close the tab if the element exists
                this.closeTab(fileTab);
            }

            // use the parentArray form the file
            parentArray = file.parentArray;

            // delete the file from the files array
            delete this.files[this.deleteFileData.fileId];

            // delete file in Working Directory
            await file.parentDirectory.deleteFile(this.deleteFileData.name);
        }

        // get index of the directory or file in the file tree
        let index = parentArray.indexOf(this.deleteFileData);

        if (index > -1) {
            // remove the element from the file tree
            parentArray.splice(index, 1);
        }

        // update the tree model after directory has been deleted
        this.tree.treeModel.update();

        // show toast that file or directory was successfully deleted
        if (this.deleteFileData.children) {
            Materialize.toast(
                '<i class="material-icons">done</i> Successfully deleted directory ' + this.deleteFileData.name, 3000);
        } else {
            Materialize.toast(
                '<i class="material-icons">done</i> Successfully deleted file ' + this.deleteFileData.name, 3000);
        }

        // reset deleteFileData
        this.deleteFileData = {};
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
        // if no file has been opened or all have been closed the id is -1
        // and you cannot save a file that is does not exist
        if (this.openId > -1) {
            // save file from the last tab in local content
            this.files[this.openId].content = this.currentFileContent;
            // save file in storage
            let wtFile: WorkingTreeFile = this.files[this.openId].storageFile;
            await wtFile.writeContent(this.currentFileContent);
        }


        // update editorContent, currentFileContent to current files content and openId to this id
        this.editorContent = this.files[id].content;
        this.currentFileContent = this.files[id].content;
        this.openId = id;
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

    /**
     * this method represents the behaviour when you close a tab.
     * follows the same behaviour as most IDE's.
     * WebStorm's tab management was taken as the guideline
     *
     * @param tabToClose the tab to close as a JQuery Object
     */
    private closeTab(tabToClose: JQuery) {


        let id = +tabToClose.attr('id').substr(3);

        // check if the current openId (open tab)
        if (this.openId === id) {
            // if it is first check what comes before
            let prevId = tabToClose.prev().attr('id');

            // check if there is something before
            if (prevId) {
                // if there is, open the file and update the indicator to the previous tab
                this.updateIndicator($('#' + prevId));
                // cut "tab"  from the id leaving only a number and converting it into a number using the + operator
                this.openFile(+prevId.substr(3));
            } else if (!prevId) {
                // if there is no previous ( the open tab is first or most left ) check what comes after
                let nextId = tabToClose.next().attr('id');

                // check if there is something after
                if (nextId) {
                    // if there is, open the file and update the indicator to the next tab
                    this.updateIndicator(tabToClose);
                    // cut "tab"  from the id leaving only a number and converting it into a number using the + operator
                    this.openFile(+nextId.substr(3));
                } else {
                    // if not reset the indicator and reset editorContent and openId
                    this.resetIndicator();
                    this.editorContent = '';
                    this.openId = -1;
                }
            }
        }

        // save file from the last tab in local content
        this.files[id].content = this.currentFileContent;

        // finally remove tab
        tabToClose.remove();

        // get the openId tab
        let updateTabToIndicate: JQuery = $('#tab' + this.openId);
        // check if element exists
        // JQuery Object [0] is the item description which only exists if the element exists
        if (updateTabToIndicate[0]) {
            // update the Indicator if it exists
            this.updateIndicator(updateTabToIndicate);
        }
    }
}
