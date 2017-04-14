import {Component, ViewChild, OnInit, AfterViewInit, EventEmitter, HostListener, OnDestroy} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {WorkingTreeObjectType} from '../../../common/versioncontrol/WorkingTreeObject';
import WorkingTreeDirectory from '../../../common/versioncontrol/WorkingTreeDirectory';
import {TreeComponent} from 'angular2-tree-component';
import {AceEditorComponent} from './ace-editor.component';
import WorkingTreeFile from '../../../common/versioncontrol/WorkingTreeFile';
import IProgramStorage from '../../../common/versioncontrol/ProgramStorage';
import {MaterializeAction} from 'angular2-materialize';
import Program from '../../../common/versioncontrol/Program';
import {HttpProgramService} from '../program/http-program.service';
import {ProgramExecutionComponent} from '../program-execution/program-execution.component';
import {genericFromBase64IdSafe, genericToBase64IdSafe} from '../../../common/utils';
import {AppComponent} from "../app.component";
import {ShareDbClientService} from "./sharedb.service";
import {isUndefined} from "util";

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
    selector: 'hedgehog-ide',
    template: require('./text-ide.component.html'),
    styles: [require('./text-ide.component.css')],
    providers: [
        HttpProgramService,
        ShareDbClientService
    ]
})

export class TextIdeComponent implements OnInit, AfterViewInit, OnDestroy {
    public fileTreeOptions = {
        allowDrag: true,
        allowDrop: (element, to) => {
            if (element) {
                if (to.parent.children) {
                    // check if the item would be a duplicate
                    return (to.parent.children) && !this.checkDuplicate(element.data.name, to.parent.children);
                } else if (to.children) {
                    // check if the item would be a duplicate
                    return !this.checkDuplicate(element.data.name, to.children);
                }
            }

            // return false by default
            return false;
        },
        // action mapping for CTRL - C, CTRL - V, DEL
        actionMapping: {
            keys: {
                [67]: (tree, node, $event) => {
                    if ($event.ctrlKey || $event.metaKey) {
                        this.copyData = node.data;
                    }
                },
                [86]: (tree, node, $event) => {
                    if ($event.ctrlKey || $event.metaKey) {
                        if (this.copyData) {
                            this.paste(node.data, this.copyData);
                        }
                    }
                },
                [46]: (tree, node, $event) => {
                    this.openDeleteModal({item: node});
                }
            }
        }
    };

    @ViewChild('editor')
    private editor: AceEditorComponent;

    // TreeComponent for updating the file tree
    @ViewChild(TreeComponent)
    private tree: TreeComponent;

    // ProgramExecutionComponent for running programs
    @ViewChild(ProgramExecutionComponent)
    private programExecution: ProgramExecutionComponent;

    private programIsRunning: boolean = false;
    private executionPanelVisible: boolean = false;

    // modal action for creating a new file
    private newFileOrDirectoryModalActions = new EventEmitter<string|MaterializeAction>();

    // modal action for deleting file
    private deleteModalActions = new EventEmitter<string|MaterializeAction>();

    // modal action for deleting file
    private renameModalActions = new EventEmitter<string|MaterializeAction>();

    private saveVersionModalActions = new EventEmitter<string|MaterializeAction>();

    private settingsModalActions = new EventEmitter<string|MaterializeAction>();

    // fileTree array containing TreeComponent compatible Objects
    private fileTree: Object[] = [];

    // local storage Object as programName: string[]
    private openFiles: {[programName: string]: string[]} = {};

    // local storage Object as programName: string
    private openFileId: {[programName: string]: string} = {};

    // local storage Object as programName: string
    private localStorageOpenFileIds: {[programName: string]: string} = {};

    // indexed files from the file tree
    private files: Map<string, File>;

    // the file content which is received before the files are indexed
    private shareDbfileContents: Map<string, string>;

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
        file: true,
        template: ''

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

    private saveVersionData = {
        tag: '',
        message: ''
    };

    private copyData: any = {};

    private editorOptions = {
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        fontFamily: "Roboto Mono",
        fontSize: 12,
        wrap: false
    };

    private realtimeSync;

    private templateOptions: Array<{name: string, value: string}> = [
        {
            name: 'None',
            value: ''
        },
        {
            name: 'Python Hello World',
            value: 'from time import sleep\n' +
            'from hedgehog.client import connect\n\n' +
            'with connect(emergency=15) as hedgehog:\n' +
            '\tprint("Hello World")\n'
        }

    ];

    /**
     * Constructor that sets the programName from the router
     * and storage from the given storageService
     *
     * @param route for messages sent from another view
     * @param storageService service that controls the ProgramStorage
     * @param sharedbService service for the shareDB real time synchronisation
     */
    constructor(route: ActivatedRoute,
                storageService: HttpProgramService,
                private sharedbService: ShareDbClientService) {
        this.programName = route.snapshot.params['programName'];
        this.files = new Map<string, File>();
        this.shareDbfileContents = new Map<string, string>();

        // init openFiles at program name if it is not initialized
        if (!this.openFiles[this.programName]) {
            this.openFiles[this.programName] = [];
        }

        // init localStorageOpenFileIds at program name if it is not initialized
        if (!this.localStorageOpenFileIds[this.programName]) {
            this.localStorageOpenFileIds[this.programName] = null;
        }

        this.storage = storageService.getStorage();

        // add root node as program name and set it to be expanded
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

        this.localStorageOpenFileIds = JSON.parse(localStorage.getItem('openFileIds'));
        this.openFiles = JSON.parse(localStorage.getItem('openFiles'));
        this.editorOptions = JSON.parse(localStorage.getItem('editorOptions'));

        let rootDir = await this.program.getWorkingTreeRoot();

        let childArray = [];

        // set root element of the file tree and set it to be expanded by default
        this.fileTree[0]['children'] = childArray;
        this.fileTree[0]['storageObject'] = rootDir;

        this.openFileId = JSON.parse(localStorage.getItem('openFileId'));
        this.openFiles = JSON.parse(localStorage.getItem('openFiles'));

        if (!this.openFiles) {
            this.openFiles = {};
        }

        if (!this.openFiles[this.programName]) {
            // if not create a new Map with the program name
            this.openFiles[this.programName] = [];
        }

        if (!this.localStorageOpenFileIds) {
            this.localStorageOpenFileIds = {};
        } else if (this.localStorageOpenFileIds[this.programName]) {
            this.openId = this.localStorageOpenFileIds[this.programName];
        }

        // create connection for this program
        await this.sharedbService.createConnection(this.programName);
        this.sharedbService.on('firstData', data => {
            for (let key in data) {
                if (data.hasOwnProperty(key)) {
                    this.shareDbfileContents.set(key, data[key]);

                    if (this.files.get(key)) {
                        this.files.get(key).content = data[key];
                    }
                }
            }
        });

        // populate file tree and give it the root directory and it's childArray
        await this.populateFiletree(rootDir, childArray);

        // open all previously opened files
        for (let fileId of this.openFiles[this.programName]) {
            if (this.files.get(fileId)) {
                await this.openFileTab(fileId, false);
            }
        }

        // focus on the most previously opened file if it exists
        if (this.localStorageOpenFileIds[this.programName] !== null) {
            if (this.files.get(this.localStorageOpenFileIds[this.programName])) {
                await this.openFile(this.openId, false);
                this.updateIndicator($('#tab' + this.localStorageOpenFileIds[this.programName]));
            }
        }

        this.sharedbService.on('operations', op => {
            if (!op.source && this.realtimeSync) {
                for (let operation of op.operations) {
                    let changedFileId = operation.p[0];

                    if (this.files.get(changedFileId)) {
                        this.files.get(changedFileId).content = op.data[changedFileId];

                        // check whether the file is currently opened
                        if (this.openId === changedFileId) {
                            let delta = {
                                action: "",
                                lines: [],
                                start: {
                                    column: 0,
                                    row: 0
                                },
                                end: {
                                    column: 0,
                                    row: 0
                                }
                            };

                            let lines: string;
                            let deltaRow: number = -1;

                            if (operation.si) {
                                delta.action = "insert";
                                lines = operation.si;
                            } else if (operation.sd) {
                                delta.action = "remove";
                                lines = operation.sd;
                            }

                            for (let line of lines.split(/\r\n|\r|\n/)) {
                                delta.lines.push(line);
                                deltaRow += 1;
                            }

                            let stringTillOffset =
                                this.currentFileContent.substr(0, operation.p[1]).split(/\r\n|\r|\n/);

                            let rowsLength = stringTillOffset.length - 1;

                            delta.start.row = rowsLength;
                            delta.end.row = rowsLength + deltaRow;

                            delta.start.column = stringTillOffset[rowsLength].length;

                            if (delta.lines.length > 1) {
                                delta.end.column = delta.lines[delta.lines.length - 1].length;
                            } else {
                                delta.end.column = stringTillOffset[rowsLength].length +
                                    delta.lines[delta.lines.length - 1].length;
                            }

                            // update editorContent, currentFileContent to current files content and openId to this id
                            this.editor.getEditor().getSession().getDocument().applyDeltas([delta]);
                        }
                    }
                }
            }
        });

        let hedgehogLibraryAutocomplete = {
            getCompletions: (editor, session, pos, prefix, callback) => {
                let autocompletionList = [
                    'set_input_state(port, pullup)',
                    'get_analog(port)',
                    'get_digital(port)',
                    'set_digital_output(port, level)',
                    'set_motor(port, state)',
                    'set_motor(port, state, amount=0, reached_state=0,' +
                    'relative=None, absolute=None, on_reached=None)',
                    'move(port, amount, state=0)',
                    'move(port, value)',
                    'move_relative_position(port, amount, relative, state=0, on_reached=None)',
                    'move_relative_position(port, amount, relative)',
                    'move_absolute_position(port, amount, absolute, state=0, on_reached=None)',
                    'move_absolute_position(port, amount, relative)',
                    'get_motor(port)',
                    'get_motor_velocity(port)',
                    'get_motor_position(port)',
                    'set_motor_position(port, position)',
                    'set_servo(port, active, position)',

                ];
                callback(null, autocompletionList.map(addition => {
                    return {
                        caption: addition,
                        value: 'hedgehog.' + addition,
                        meta: 'hedgehog'
                    };
                }));
            }
        };

        // add autocompletions for hedgehog
        this.editor.getEditor().completers.unshift(hedgehogLibraryAutocomplete);

        // update the tree model after file tree has been populated
        this.tree.treeModel.update();
    }

    /**
     * This method is called after the view is initialized so it can access frontend items
     */
    public async ngAfterViewInit(): Promise<void> {
        // This tweaks jQuery in order to avoid the tabs being initialized with the ready() event
        $.isReady = true;

        // Now initialize them manually
        const tabs = $('#sortable-tabs') as any;
        tabs.tabs();

        // reset indicator from the tabs
        this.resetIndicator();

        // remove the tab empty tab that prevents the indicator error
        $('.tab').first().remove();

        // allow the tabs to be draggable
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

        ($('select') as any).material_select();

        this.realtimeSync = localStorage.getItem('realtimeSync');
        if (typeof this.realtimeSync === 'undefined') {
            this.realtimeSync = true;
            localStorage.setItem('realtimeSync', this.realtimeSync ? 'true' : 'false');
        } else {
            this.realtimeSync = this.realtimeSync === 'true';
        }

        this.updateEditorSettings();
    }

    public updateEditorSettings() {
        localStorage.setItem('realtimeSync', this.realtimeSync ? 'true' : 'false');
        localStorage.setItem('editorOptions', JSON.stringify(this.editorOptions));
        this.editor.getEditor().setOptions(this.editorOptions);
    }

    public async ngOnDestroy(): Promise<void> {
        // stop the program if it is running
        if (this.programIsRunning) {
            await this.programExecution.stop();
        }
    }

    /**
     * Populate the file tree is first called with the root directory
     * and then called recursively for each directory found
     *
     * @param directory directory to add to the file tree
     * @param childArray child array to add the sub-files and directories too
     */
    public async populateFiletree(directory: WorkingTreeDirectory, childArray: Object[]) {
        // loop through all items of the directory
        for (let itemName of directory.items) {
            // get type of the item
            let type = directory.getItemType(itemName);

            // check whether it is a file or directory
            if (type === WorkingTreeObjectType.File) {
                // generate file id as Hex code form the file path
                let fileId = genericToBase64IdSafe(directory.getItemPath(itemName));

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
                    storageObject: null,
                    parentArray: childArray,
                    parentDirectory: directory,
                    changed: false
                };

                if (this.shareDbfileContents.get(fileId)) {
                    indexedFile.content = this.shareDbfileContents.get(fileId);
                }

                // add file to Map using the id
                this.files.set(fileId, indexedFile);
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

    public async saveOpenFile() {
        // get the currently opened file
        let file = this.files.get(this.openId);

        // check if it has changed
        if (file.changed) {
            // though this should never happen load the file before saving it's if not defined
            if (!file.storageObject) {
                file.storageObject = await file.parentDirectory.getFile(file.name);
            }

            // write the content and set changed to false
            await file.storageObject.writeContent(file.content);
            file.changed = false;
        }
    }

    public async paste(itemToAddTo, copyData) {
        // new parentArray/Directory
        let parentArray: Object[];
        let parentDirectory: WorkingTreeDirectory;

        // save the new name
        let newName: string = copyData.name;

        // check if the paste is on a directory or a file
        if (itemToAddTo.children) {
            // if it is a directory use it's children and storage Object
            parentArray = itemToAddTo.children;
            parentDirectory = itemToAddTo.storageObject;
        } else {
            // if it is a file use the indexed file for the parentArray/Directory
            parentArray = this.files.get(itemToAddTo.fileId).parentArray;
            parentDirectory = this.files.get(itemToAddTo.fileId).parentDirectory;
        }

        // increase the file iterator name based on the new parentArray
        newName = this.increaseFileIterator(newName, parentArray);

        // check whether to copy a file or directory
        if (copyData.children) {
            // if it is a directory create the directory on the disk
            await parentDirectory.addDirectory(newName);

            // create new item for the file tree and further pasting
            let newDirectoryItem = {
                name: newName,
                children: [],
                storageObject: await parentDirectory.getDirectory(newName),
                parentArray,
                parentDirectory
            };

            // push the item into the filetree
            parentArray.push(newDirectoryItem);

            // iterate through each each children of the copy
            for (let item of copyData.children) {
                // check if the item is the current directory to prevent infinite recursion
                if (newDirectoryItem !== item) {
                    // paste every directory item into the newly created directory
                    this.paste(newDirectoryItem, item);
                }
            }

        } else {
            // receive the file to copy from the indexed file array
            let copyFile: File = this.files.get(copyData.fileId);

            // create the file on the diesk
            await parentDirectory.addFile(newName, copyFile.content);

            // update the fileId
            let newFileId = genericToBase64IdSafe(parentDirectory.getItemPath(newName));

            // add file to file tree
            parentArray.push({
                fileId: newFileId,
                name: newName,
            });

            // add newly indexed file
            this.files.set(newFileId, {
                name: newName,
                content: copyFile.content,
                storageObject: await parentDirectory.getFile(newName),
                parentArray,
                parentDirectory,
                changed: false
            });
        }

        // update the file tree
        this.tree.treeModel.update();
    }

    /**
     * Increase the given filename's indicator if it exists based on all other files in the directory
     * so file.py if another one exists will be file-0.py and file-1.py and so on
     *
     * @param fileName given file name
     * @param parentArray items array with all other directory and file names to check against
     * @returns {string} the new file name
     */
    public increaseFileIterator(fileName: string, parentArray: any[]) {
        // check if filename is a duplicate
        if (this.checkDuplicate(fileName, parentArray)) {
            // split the filename so it doesn't create file.py-0
            let splitFileName: string[] = fileName.split(".");

            // find iterator in the file
            let iterator = splitFileName[0].match(/\d+$/);

            // check if there is an iterator in the file name
            if (iterator) {
                // if there is add 1 to the iterator and replace it
                splitFileName[0] = splitFileName[0].replace(iterator[0], String(+iterator[0] + 1));
            } else {
                // if not add -0 to the file name
                splitFileName[0] = splitFileName[0] + '-0';
            }

            // join the file name from the split file name array
            let newName: string = splitFileName.join('.');

            // check if the new file name is a duplicate
            if (this.checkDuplicate(newName, parentArray)) {
                // and if it is recursively increase the file iterator again
                newName = this.increaseFileIterator(newName, parentArray);
            }

            return newName;
        } else {
            // if not the given file name can be used
            return fileName;
        }
    }

    @HostListener('window:keydown', ['$event'])
    public async keyDownEvent(e) {
        // check if the user pressed CTRL - S to save the open file
        if ((e.keyCode === 115 || e.keyCode === 83 ) && (e.ctrlKey || e.metaKey) && this.openId) {
            e.preventDefault();

            await this.saveOpenFile();

            Materialize.toast('<i class="material-icons">done</i>' +
                'Successfully saved ' + this.files.get(this.openId).name, 3000);
        }
    }

    @HostListener('window:resize')
    public onResize() {
        this.updateIndicator('#tab' + this.openId);
    }

    /**
     * Event binding when character is input in the ace editor
     *
     * @param editorContent string that is the whole editor content
     */
    public async onEditorContentChange(editorContent) {
        // save editorContent to the local file and currentFileContent
        this.currentFileContent = editorContent;

        // if no file has been opened or all have been closed the id is null
        // and you cannot save a file that is does not exist
        if (this.openId) {
            let file = this.files.get(this.openId);

            if (file.content !== editorContent) {
                file.changed = true;
                file.content = this.currentFileContent;
            }
        }
    }

    /**
     * Event binding when character is input in the ace editor and a delta object is sent
     *
     * @param delta object which contains the information what has been inserted or removed
     */
    public async onEditorDelta(delta) {
        if (this.realtimeSync) {
            let editorLineSplit: string[] = this.currentFileContent.split(/\r\n|\r|\n/);

            let startPosition: number = 0;
            let stringToOperate: string = '';


            for (let i = 0; i < delta.start.row; i++) {
                // +1 because of the break at the end
                startPosition += editorLineSplit[i].length + 1;
            }
            startPosition += delta.start.column;

            let operation: any = {
                p: [this.openId, startPosition]
            };

            for (let line of delta.lines) {
                stringToOperate += line+'\n';
            }

            // remove last break
            stringToOperate = stringToOperate.substring(0, stringToOperate.length - 1);

            if (delta.action === 'insert') {
                operation.si = stringToOperate;
            } else if (delta.action === 'remove') {
                operation.sd = stringToOperate;
            }

            this.sharedbService.operation(operation);
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
            await this.openFileTab(event.node.data.fileId);

            setTimeout(() => {
                // update the indicator to this new tab
                this.updateIndicator($('#tab' + event.node.data.fileId));
            }, 0);
        }
    }

    /**
     * Event binding when an element in the file tree is moved
     *
     * @param event data sent from the event that includes the file/directory
     */
    public async onMoveNode(event) {
        let node = event.node;
        let to = event.to.parent;

        // if it a file update the indexed file
        if (!node.children) {
            node = this.files.get(node.fileId);

            if (!node.storageObject) {
                node.storageObject = await node.parentDirectory.getFile(node.name);
            }
        }

        // set new parent objects
        node.parentArray = to.children;
        node.parentDirectory = to.storageObject;

        let newItemPath = node.parentDirectory.getItemPath(node.name);

        // move storage Object to other directory
        node.storageObject.rename(newItemPath, true);

        if (!node.children) {
            // update the indexed file map id
            this.files.delete(node.fileId);
            this.files.set(genericToBase64IdSafe(newItemPath), node);
        }
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
        this.newFileOrDirectoryModalActions.emit({action: "modal", params: ['open']});
        AppComponent.fixModalOverlay();
    }

    /**
     * Close the new file modal
     */
    public closeNewFileOrDirectoryModal() {
        this.newFileOrDirectoryModalActions.emit({action: "modal", params: ['close']});
    }


    public async newFileOrDirectory() {
        // save new filename and Working Tree Directory to save it to
        let name: string = this.newData.name;
        let directory: WorkingTreeDirectory = this.newData.storageObject;

        if (this.checkDuplicate(name, this.newData.arrayToAddFileTo)) {
            Materialize.toast(
                '<i class="material-icons">close</i> Duplicate entry: "' + this.newData.name + '"', 3000, 'red');
            return;
        }

        if (this.newData.file) {
            // add file with no content to the Working Tree Directory
            await directory.addFile(name, this.newData.template);
            let newFile: WorkingTreeFile = await directory.getFile(name);
            let fileId = genericToBase64IdSafe(directory.getItemPath(name));

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


            // show toast that file was successfully created
            Materialize.toast(
                '<i class="material-icons">done</i> Successfully created file "' + this.newData.name + '"', 3000);
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


            // show toast that file was successfully created
            Materialize.toast(
                '<i class="material-icons">done</i> Successfully created directory "' + this.newData.name + '"', 3000);
        }


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
            Materialize.toast('<i class="material-icons">close</i>Cannot delete root directory', 3000, 'red');
            return;
        }

        // open modal
        this.deleteModalActions.emit({action: "modal", params: ['open']});
        AppComponent.fixModalOverlay();
    }

    /**
     * Close the delete file modal
     */
    public closeDeleteModal() {
        this.deleteModalActions.emit({action: "modal", params: ['close']});
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
                this.closeTab(this.deleteFileData.fileId);
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
                '<i class="material-icons">done</i> Successfully deleted directory "' + this.deleteFileData.name + '"',
                3000);
        } else {
            Materialize.toast(
                '<i class="material-icons">done</i> Successfully deleted file "' + this.deleteFileData.name + '"',
                3000);
        }

        // reset deleteFileData
        this.deleteFileData = {};
    }

    /**
     * Event binding for tree context menu "rename" (directory or file)
     * This checks if it is the root directory and if not opens the modal
     *
     * @param event TreeNode object with the file tree object data
     */
    public openRenameModal(event) {
        // save data (either file or directory) to the currentItem of renameFileData
        this.renameFileData.currentItem = event.item.data;

        // check if there is no parentArray and if the type of fileId is undefined
        // this means it is the root directory and therefore cannot be renamed here
        if (!this.renameFileData.currentItem.parentArray && !this.renameFileData.currentItem.fileId) {
            Materialize.toast('<i class="material-icons">close</i>Cannot rename project here', 3000, 'red');
            return;
        }

        // open modal
        this.renameModalActions.emit({action: "modal", params: ['open']});
        AppComponent.fixModalOverlay();
    }

    /**
     * Close the rename file modal
     */
    public closeRenameModal() {
        this.renameModalActions.emit({action: "modal", params: ['close']});
    }

    /**
     * Rename a file or directory using the data given from the modal
     */
    public async renameAction() {
        let fileId = this.renameFileData.currentItem.fileId;
        let newName = this.renameFileData.newName;

        if (fileId) {
            // receive indexed file
            let file = this.files.get(fileId);

            if (this.checkDuplicate(newName, file.parentArray)) {
                Materialize.toast(
                    '<i class="material-icons">close</i>Duplicate entry for "' + newName + '"', 3000, 'red');
                return;
            }

            // close the tab if it exists
            let tab: JQuery = $('#tab' + fileId);
            if (tab.length > 0) {
                this.closeTab(fileId);
            }

            // check if the storage object exists and receive it if it doesn't exist
            if (!file.storageObject) {
                file.storageObject = await file.parentDirectory.getFile(file.name);
            }
            this.renameFileData.currentItem.name = newName;

            // update the fileId
            let newFileId = genericToBase64IdSafe(file.parentDirectory.getItemPath(newName));
            this.renameFileData.currentItem.fileId = newFileId;

            // update the indexed file
            this.files.delete(fileId);
            this.files.set(newFileId, file);

            // rename the file on the disk
            file.storageObject.rename(newName);
        } else {
            if (this.checkDuplicate(newName, this.renameFileData.currentItem.parentArray)) {
                Materialize.toast(
                    '<i class="material-icons">close</i>Duplicate entry for "' + newName + '"', 3000, 'red');
                return;
            }

            // update the directory name
            this.renameFileData.currentItem.name = newName;

            // rename the directory on the disk
            this.renameFileData.currentItem.storageObject.rename(newName);
        }

        // reset renameFileData
        this.renameFileData = {
            currentItem: {}
        };
    }

    public openSaveVersionModal() {
        this.saveVersionModalActions.emit({action: "modal", params: ['open']});
        AppComponent.fixModalOverlay();
    }

    public closeSaveVersionModal() {
        this.saveVersionModalActions.emit({action: "modal", params: ['close']});
    }

    public openSettingsModal() {
        this.settingsModalActions.emit({action: "modal", params: ['open']});
        AppComponent.fixModalOverlay();
    }

    public closeSettingsModal() {
        this.updateEditorSettings();
        this.settingsModalActions.emit({action: "modal", params: ['close']});
    }

    public async run() {
        await this.saveOpenFile();
        await this.programExecution.run(this.programName, genericFromBase64IdSafe(this.openId));
        this.programIsRunning = true;
    }

    public async saveVersionAction() {
        await this.saveAllFiles(false);
        await this.program.createVersionFromWorkingTree(this.saveVersionData.message, this.saveVersionData.tag);
        this.saveVersionData.message = '';
        this.saveVersionData.tag = '';
        Materialize.toast('<i class="material-icons">done</i> Successfully created a new version', 3000);
    }

    /**
     * reset indicator by setting it's left and right coordinate to the same point
     */
    private resetIndicator() {
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
    private async saveAllFiles(showMessage: boolean) {
        // loop through all indexed files
        for (let fileId of this.files.keys()) {
            // receive file
            let file = this.files.get(fileId);

            // check if it has changed
            if (file.changed) {
                // check if the storage object is undefined and receive it if it is
                if (!file.storageObject) {
                    file.storageObject = await file.parentDirectory.getFile(fileId);
                }

                // write the content of the files and set changed to false
                await file.storageObject.writeContent(file.content);
                file.changed = false;
            }
        }

        if (showMessage) {
            Materialize.toast('<i class="material-icons">done</i>' +
                'Successfully saved all changed files ' + this.deleteFileData.name, 3000);
        }
    }

    /**
     * Save the last opened file and set current editorContent file with given id
     *
     * @param id of the file in the files array
     * @param updateOpenId whether to update the openId. Not done at the beginning
     */
    private async openFile(id: string, updateOpenId: boolean = true) {
        let file = this.files.get(id);

        if (updateOpenId) {
            // update the localStorageOpenFileIds for the local storage
            this.localStorageOpenFileIds[this.programName] = id;
            localStorage.setItem('openFileIds', JSON.stringify(this.localStorageOpenFileIds));
            this.openId = id;
        }

        if (!file.storageObject) {
            // get the storage file
            file.storageObject = await file.parentDirectory.getFile(file.name);
        }

        if (!file.content) {
            file.content = await file.storageObject.readContent();
        }

        // update editorContent, currentFileContent to current files content and openId to this id
        this.editorContent = file.content;
        this.currentFileContent = file.content;

        if (!this.sharedbService.fileExists(this.openId)) {
            this.sharedbService.operation({p: [this.openId], oi: this.currentFileContent});
        }
    }

    private async openFileTab(fileId: string, updateOpenId: boolean = true) {
        let index = this.openFiles[this.programName].indexOf(fileId);

        if (index < 0) {
            this.openFiles[this.programName].push(fileId);
        }

        localStorage.setItem('openFiles', JSON.stringify(this.openFiles));
        localStorage.setItem('openFileIds', JSON.stringify(this.localStorageOpenFileIds));

        // update the editor content
        await this.openFile(fileId, updateOpenId);

        // search for tab
        let tab = $('#tab' + fileId);

        // check if tab was found
        if (tab.length > 0) {
            // update the indicator to be under the tab
            this.updateIndicator(tab);

            // end method here
            return;
        }

        if (index < 0) {
            this.openFiles[this.programName].push(fileId);
        }

        localStorage.setItem('openFiles', JSON.stringify(this.openFiles));
        localStorage.setItem('openFileId', JSON.stringify(this.openFileId));

        // load new li as tab
        ($('div.tabs') as any).tabs();
    }

    /**
     * Update the indicator div to position under a tab
     *
     * @param tabToIndicate new tab or existing tab to indicate
     */
    private updateIndicator(tabToIndicate) {
        // get indicator array
        let indicatorDiv = $('.indicator').first();
        let tabToIndicateJquery = $(tabToIndicate);

        // check if the tabToIndicate exists
        if (tabToIndicateJquery.length > 0) {
            // update css left and right position
            indicatorDiv.css(
                {
                    left: tabToIndicateJquery.position().left,
                    right: tabToIndicateJquery.parent().width() -
                    (tabToIndicateJquery.position().left + tabToIndicateJquery.width())
                }
            );
        } else {
            this.resetIndicator();
        }
    }

    /**
     * this method represents the behaviour when you close a tab.
     * follows the same behaviour as most IDE's.
     * WebStorm's tab management was taken as the guideline
     *
     * @param id the file id of the tab to close
     */
    private closeTab(id: string) {
        let  tabToClose = $('#tab' + id);

        let index = this.openFiles[this.programName].indexOf(id);

        if (index > -1) {
            this.openFiles[this.programName].splice(index, 1);
        }

        localStorage.setItem('openFiles', JSON.stringify(this.openFiles));
        localStorage.setItem('openFileIds', JSON.stringify(this.localStorageOpenFileIds));

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
                    this.openId = null;
                    this.editorContent = '';
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

    private executionPanelVisibleChanged (visible) {
        this.executionPanelVisible = visible;
        setTimeout(() => {
            this.editor.getEditor().resize();
        }, 0);
    }
}
