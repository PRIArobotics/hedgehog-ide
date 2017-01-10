import {Component, ViewChild, OnInit, AfterViewInit, EventEmitter, HostListener} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {DummyProgramService} from "../program/dummy-program.service";
import {WorkingTreeObjectType} from "../../../common/versioncontrol/WorkingTreeObject";
import WorkingTreeDirectory from "../../../common/versioncontrol/WorkingTreeDirectory";
import {TreeComponent} from "angular2-tree-component";
import WorkingTreeFile from "../../../common/versioncontrol/WorkingTreeFile";
import IProgramStorage from "../../../common/versioncontrol/ProgramStorage";
import {MaterializeAction} from "angular2-materialize";
import Program from "../../../common/versioncontrol/Program";
import {LocalStorageService} from "angular2-localstorage";
import {HttpProgramService} from "../program/http-program.service";
import {ProgramExecutionComponent} from "../program-execution/program-execution.component";
import {genericToHex} from "../../../common/utils";
import {LocalStorage} from "angular2-localstorage";

declare var $: JQueryStatic;
declare var Materialize: any;

export class File {
    public name: string;
    public content: string;
    public storageObject: WorkingTreeFile;
    public parentArray: Object[];
    public parentDirectory: WorkingTreeDirectory;
    public changed: boolean;
}


@Component({
    moduleId: module.id,
    selector: 'hedgehog-ide',
    templateUrl: 'text-ide.component.html',
    styleUrls: ['text-ide.component.css'],
    providers: [
        DummyProgramService,
        LocalStorageService,
        HttpProgramService
    ]
})

export class TextIdeComponent implements OnInit, AfterViewInit {
    public fileTreeOptions = {
        allowDrag: true,
        allowDrop: (element, to) => {
            if(to.parent.children && element.data.name) {
                // check if it would be a duplicate
                return to.parent.children && !this.checkDuplicate(element.data.name, to.parent.children);
            }

            // return false by default
            return false;
        }
    };

    // TreeComponent for updating the file tree
    @ViewChild(TreeComponent)
    private tree: TreeComponent;

    // TreeComponent for updating the file tree
    @ViewChild(ProgramExecutionComponent)
    private programExecution: ProgramExecutionComponent;

    // modal action for creating a new file
    private newFileOrDirectoryModalActions = new EventEmitter<string|MaterializeAction>();

    // modal action for deleting file
    private deleteModalActions = new EventEmitter<string|MaterializeAction>();

    // modal action for deleting file
    private renameModalActions = new EventEmitter<string|MaterializeAction>();

    // fileTree array containing TreeComponent compatible Objects
    private fileTree: Object[] = [];

    // local storage Object as programName: { }
    @LocalStorage() private localStorageFiles: {[programName: string]: {[fileId: string]: string}};

    // indexed files from the file tree
    private files: Map<string, File>;

    // last id of the file changed used for saving the file
    private openId: string;

    // editor content bind
    private editorContent: string;

    // current file content that is similar to editorContent
    private currentFileContent: string = '';

    // The Program name that is passed to this class by the router
    private programName: string;

    private program: Program;

    // storage object for interacting with a ProgramStorage
    // can be any ProgramStorage depending on what getStorage returns
    private storage: IProgramStorage;

    // new directory or file data
    private newData: any = {
        name: '',
        arrayToAddFileTo: [],
        storageObject: WorkingTreeDirectory,
        file: true
    };

    // delete file name
    private deleteFileData: any = {
        name: '',
        parentArray: [],
        parentDirectory: WorkingTreeDirectory
    };

    // rename file name
    private renameFileData: any = {
        currentItem: {},
        newName: ''
    };

    /**
     * Constructor that sets the programName from the router
     * and storage from the given storageService
     *
     * @param route for messages sent from another view
     * @param storageService service that controls the ProgramStorage
     */
    constructor(route: ActivatedRoute, storageService: HttpProgramService) {
        this.programName = route.snapshot.params['programName'];
        this.files = new Map<string, File>();
        this.localStorageFiles = {};
        this.storage = storageService.getStorage();
        this.fileTree[0] = {
            name: this.programName,
            isExpanded: true
        };

    }

    /**
     * ngOnInit is called after the constructor at the beginning of the lifetime
     * it can be async (the constructor cannot) and therefore allows interaction with the ProgramStorage
     */
    public async ngOnInit() {
        this.programExecution.isRunning = false;

        this.program = await this.storage.getProgram(this.programName);

        let rootDir = await this.program.getWorkingTreeRoot();

        let childArray = [];

        // set root element of the file tree and set it to be expanded by default
        this.fileTree[0]['children'] = childArray;
        this.fileTree[0]['storageObject'] = rootDir;

        // check if the local storage already has this program stored
        if (!this.localStorageFiles[this.programName]) {
            // if not create a new Map with the program name
            this.localStorageFiles[this.programName] = {};
        }

        // populate file tree and give it the root directory and it's childArray
        await this.populateFiletree(rootDir, childArray);

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

        // allow the tabs to be draggable
        let tabs = <any>$("#sortable-tabs");
        tabs.sortable({
            items: "li",
            axis: "x",
            stop: (event, ui) => {
                // get tab from ui
                let tab = $(ui.item);

                // update indicator to the tab and open it's file
                this.updateIndicator(tab);
                this.openFile(tab.attr('id').substr(3));
            }
        });

        // hide the editor since no files are open
        $('#ace-editor').hide();
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
            let type = directory.getItemType(itemName);

            // check whether it is a file or directory
            if (type === WorkingTreeObjectType.File) {
                // get the file
                let file = await directory.getFile(itemName);

                // generate file id as Hex code form the file path
                let fileId = genericToHex(directory.getItemPath(itemName));

                // add file to children of the directory
                childArray.push(
                    {
                        fileId,
                        name: itemName,
                    }
                );

                // create the file to index
                let indexedFile = {
                    name: itemName,
                    content: null,
                    storageObject: file,
                    parentArray: childArray,
                    parentDirectory: directory,
                    changed: false
                };

                // add file to Map using the id
                this.files.set(fileId, indexedFile);

                if (this.localStorageFiles[this.programName][fileId]) {
                    // if file is in the local storage  take the content from the local storage
                    indexedFile.content = this.localStorageFiles[this.programName][fileId];
                }
            } else if (type === WorkingTreeObjectType.Directory && !itemName.startsWith('.')) {
                // get the directory
                let newDirectory = await directory.getDirectory(itemName);

                // create children's array
                let newChildArray = [];

                // add directory to children of the directory
                childArray.push(
                    {
                        name: itemName,
                        children: newChildArray,
                        storageObject: newDirectory,
                        parentArray: childArray,
                        parentDirectory: directory
                    }
                );

                // recurse over the directory and give it the children array
                await this.populateFiletree(newDirectory, newChildArray);
            }
        }
    }

    @HostListener('window:keydown', ['$event'])
    public keyPressed(event) {
        // check if the user pressed CTRL - S to save all files
        if (event.keyCode === 83 && event.ctrlKey) {
            this.saveAllFiles();
            event.preventDefault();
        }
    }

    /**
     * Event binding when character is input in the ace editor
     *
     * @param editorContent string that is the whole editor content
     */
    public async onEditorContentChange (editorContent) {
        // save editorContent to the local file and currentFileContent
        this.editorContent = editorContent;
        this.currentFileContent = editorContent;

        // if no file has been opened or all have been closed the id is null
        // and you cannot save a file that is does not exist
        if (this.openId) {
            // save file from the last tab in local content
            this.files.get(this.openId).content = this.currentFileContent;
            this.localStorageFiles[this.programName][this.openId] = this.currentFileContent;
            this.files.get(this.openId).changed = true;
        }
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
            } else if ($('#sortable-tabs').children().length === 1) {
                // if no files are opened show the editor
                $('#ace-editor').show();
            }

            // create new tab element if the file was not found as
            // <li class='tab' id='tab{id}' draggable> ... <li>
            let newTab = document.createElement('li');
            newTab.className = 'tab';
            newTab.id = 'tab' + file.fileId;

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

    /**
     * Event binding when an element in the file tree is moved
     *
     * @param event data sent from the event that includes the file/directory
     */
    public onMoveNode(event) {
        let node = event.node;
        let to = event.to.parent;

        // if it a file update the indexed file
        if (!node.children) {
            node = this.files.get(node.fileId);
        }

        // set new parent objects
        node.parentArray = to.children;
        node.parentDirectory = to.storageObject;

        // move storage Object to other directory
        node.storageObject.rename(node.parentDirectory.path + '/' + node.storageObject.getName(), true);
    }

    /**
     * set the data for the new file/directory array
     * meaning the arrayToAddFileTo and WorkingTreeObject
     *
     * @param data to set the newData array to
     */
    public setNewData(data) {
        // check if it is a directory
        if (data.children) {
            // if it is add children and storageDirectory to newData
            this.newData.arrayToAddFileTo = data.children;
            this.newData.storageObject = data.storageObject;
        } else {
            // if it isn't add the files parent directory and array to newData
            this.newData.arrayToAddFileTo = this.files.get(data.fileId).parentArray;
            this.newData.storageObject = this.files.get(data.fileId).parentDirectory;
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
        let directory: WorkingTreeDirectory = this.newData.storageObject;

        if (this.checkDuplicate(name, this.newData.arrayToAddFileTo)) {
            Materialize.toast('<i class="material-icons">close</i> Duplicate entry: ' + this.newData.name, 3000);
            return;
        }

        if (this.newData.file) {
            // add file with no content to the Working Tree Directory
            await directory.addFile(name, '');
            let newFile: WorkingTreeFile = await directory.getFile(name);
            let fileId = genericToHex(directory.getItemPath(name));

            // add file to parent child array
            this.newData.arrayToAddFileTo.push({
                fileId,
                name
            });

            // save file in the indexed files array
            this.files.set(fileId, {
                name,
                content: null,
                storageObject: newFile,
                parentArray: this.newData.arrayToAddFileTo,
                parentDirectory: directory,
                changed: false
            });
        } else {
            // add directory to the Working Tree Directory
            await directory.addDirectory(name);
            let newDirectory: WorkingTreeDirectory = await directory.getDirectory(name);

            // add directory to parent child array
            this.newData.arrayToAddFileTo.push({
                name,
                children: [],
                storageObject: newDirectory,
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
        if (!this.deleteFileData.parentArray && !this.deleteFileData.fileId) {
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
            // delete directory from working tree
            await this.deleteFileData.parentDirectory.deleteDirectory(this.deleteFileData.name);

            // since it is a file use the parentArray from it
            parentArray = this.deleteFileData.parentArray;
        } else {
            // retrieve file from files using it's fileId
            let file: File = this.files.get(this.deleteFileData.fileId);

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
            this.files.delete(this.deleteFileData.fileId);

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
     * Event binding for tree context menu "delete" (directory or file)
     * This checks if it is the root directory and if not opens the modal
     *
     * @param event TreeNode object with the file tree object data
     */
    public openRenameModal(event) {
        // save data (either file or directory) to deleteFileData
        this.renameFileData.currentItem = event.item.data;

        // check if there is no parentArray and if the type of fileId is undefined
        // this means it is the root directory and therefore cannot be deleted
        if (!this.renameFileData.currentItem.parentArray && !this.renameFileData.currentItem.fileId) {
            Materialize.toast('<i class="material-icons">close</i>Cannot rename project here', 3000);
            return;
        }

        // open modal
        this.renameModalActions.emit({action:"modal", params:['open']});
        this.fixModalOverlay();
    }

    /**
     * Close the delete file modal
     */
    public closeRenameModal() {
        this.renameModalActions.emit({action:"modal", params:['close']});
    }

    /**
     * Delete a file or directory using the data given from the modal
     */
    public async renameAction() {
        let newName = this.renameFileData.newName;

        this.renameFileData.currentItem.name = newName;

        let fileId = this.renameFileData.currentItem.fileId;

        if (fileId) {
            this.files.get(fileId).storageObject.rename(newName);
        } else {
            this.renameFileData.currentItem.storageObject.rename(newName);
        }

        // reset deleteFileData
        this.renameFileData = {
            currentItem: {},
            newName: ''
        };
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
     * Save all files that have changed and are in the current project
     */
    private saveAllFiles () {
        for (let fileName of this.files.keys()) {
            let file = this.files.get(fileName);

            if(file.changed) {
                file.storageObject.writeContent(file.content);
                file.changed = false;
            }
        }

        Materialize.toast('<i class="material-icons">done</i>' +
            'Successfully saved all changed files ' + this.deleteFileData.name, 3000);
    }

    /**
     * Save the last opened file and set current editorContent file with given id
     *
     * @param id of the file in the files array
     */
    private async openFile(id: string) {
        let file = this.files.get(id);

        if (!file.content) {
            // read content of the file form the backend
            file.content = await file.storageObject.readContent();
        }

        // update editorContent, currentFileContent to current files content and openId to this id
        this.editorContent = file.content;
        this.currentFileContent = file.content;
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
        let id: string = tabToClose.attr('id').substr(3);

        // check if the current openId (open tab)
        if (this.openId === id) {
            // if it is first check what comes before
            let prevId = tabToClose.prev().attr('id');

            // check if there is something before
            if (prevId) {
                // if there is, open the file and update the indicator to the previous tab
                this.updateIndicator($('#' + prevId));
                // cut "tab"  from the id leaving only a number and converting it into a number using the + operator
                this.openFile(prevId.substr(3));
            } else if (!prevId) {
                // if there is no previous ( the open tab is first or most left ) check what comes after
                let nextId = tabToClose.next().attr('id');

                // check if there is something after
                if (nextId) {
                    // if there is, open the file and update the indicator to the next tab
                    this.updateIndicator(tabToClose);
                    // cut "tab"  from the id leaving only a number and converting it into a number using the + operator
                    this.openFile(nextId.substr(3));
                } else {
                    // if not reset the indicator and reset editorContent and openId
                    this.resetIndicator();
                    this.editorContent = '';
                    this.openId = null;
                    $('#ace-editor').hide();
                }
            }
        }

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

    /**
     * Compare every item's name of an given array with the given name
     * to check if a file would be a duplicate
     *
     * @param name to compare with
     * @param array with items to compare name to
     * @returns {boolean} true if it is a duplicate false if it is not
     */
    private checkDuplicate(name: string, array: any[]) {
        // iterate through given array
        for (let item of array) {
            // check whether it is a file and set item to indexed file if it is
            let fileId = item.fileId;
            if (fileId) {
                item = this.files.get(fileId);
            }

            // if an item from the array has the same name as the given, it returns true
            if (item.name === name) {
                return true;
            }
        }
        // return false if no item's names match the given
        return false;
    }
}
