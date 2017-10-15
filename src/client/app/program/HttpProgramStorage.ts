
import 'rxjs/add/operator/toPromise';

import IProgramStorage from '../../../common/versioncontrol/ProgramStorage';
import Program from '../../../common/versioncontrol/Program';
import Blob from '../../../common/versioncontrol/Blob';
import Version from '../../../common/versioncontrol/Version';
import WorkingTreeDirectory from '../../../common/versioncontrol/WorkingTreeDirectory';
import WorkingTreeFile from '../../../common/versioncontrol/WorkingTreeFile';
import {genericToBase64, genericFromBase64, basename} from "../../../common/utils";
import {WorkingTreeObjectType} from "../../../common/versioncontrol/WorkingTreeObject";
import {default as Tree, TreeItem, TreeItemType} from "../../../common/versioncontrol/Tree";
import {HttpClient} from "@angular/common/http";

export default class HttpProgramStorage implements IProgramStorage {

    public constructor(private http: HttpClient) { }

    public createProgram(name: string, copyFrom?: string): Promise<Program> {
        // create program data object
        let programData = {
            data: {
                type: 'program',
                attributes: {
                    name,
                    copyFrom
                }
            }
        };

        // send post request with the stringifyed data object
        return this.http
            .post('/api/programs',
                JSON.stringify(programData))
            .toPromise()
            .then(response => {
                // parse json response
                let res = response['data'];

                // return new Program with the json data
                return new Program(this, res.attributes.name,
                    res.attributes.latestVersionId, res.attributes.workingTreeClean);
            });
    }

    public deleteProgram(name: string): Promise<void> {
        // send delete request for a specific program
        return this.http
            .delete(`/api/programs/${genericToBase64(name)}`)
            .toPromise()
            .then(() => Promise.resolve());
    }

    public getProgramNames(): Promise<string[]> {
        // send get request for all programs
        return this.http
            .get('/api/programs')
            .toPromise()
            .then(response => {
                // save programs from response
                let programs = response['data'];
                let programNames: string[] = [];

                // add the name of all programs to programNames
                for (let program of programs) {
                    programNames.push(program.attributes.name);
                }

                // return the program names
                return programNames;
            });
    }

    public getProgram(name: string): Promise<Program> {
        // send get request for a specific program
        return this.http
            .get(`/api/programs/${genericToBase64(name)}`)
            .toPromise()
            .then(response => {
                // parse json response
                let res = response['data'];

                // create new Program Instance
                return new Program(this, res.attributes.name,
                    res.attributes.latestVersionId, res.attributes.workingTreeClean);
            });
    }

    public renameProgram(oldName: string, newName: string): Promise<void> {
        let currentId = genericToBase64(oldName);

        // create file data object using the given parameters
        let programData = {
            data: {
                id: `/api/programs/${currentId}`,
                type: 'program',
                attributes: {
                    name: newName
                }
            }
        };

        // send patch request with the stringifyed data object
        return this.http
            .patch(`/api/programs/${currentId}`,
                JSON.stringify(programData))
            .toPromise()
            .then(() => Promise.resolve());
    }

    public resetProgram(programName: string, versionId: string): Promise<void> {
        let programId = genericToBase64(programName);

        // create file data object using the given parameters
        let programData = {
            data: {
                id: `/api/programs/${programId}`,
                type: 'program',
                attributes: {
                    latestVersionId: versionId
                }
            }
        };

        // send patch request with headers (json) and the stringifyed data object
        return this.http
            .patch(`/api/programs/${programId}`,
                JSON.stringify(programData))
            .toPromise()
            .then(() => Promise.resolve());
    }

    public getBlob(programName: string, blobId: string): Promise<Blob> {
        // send get request for a specific program for the blob
        return this.http
            .get(`/api/blobs/${genericToBase64(programName)}/${blobId}`)
            .toPromise()
            .then(response => {
                // parse json response
                let res = response['data'];

                // create new Blob Instance
                return new Blob(this, programName, blobId, res.attributes.size);
            });
    }

    public getBlobContent(programName: string, blobId: string, encoding): Promise<string> {
        // send get request for a specific program for the blob
        return this.http
            .get(`/api/blobs/${genericToBase64(programName)}/${blobId}`)
            .toPromise()
            .then(response => {
                // parse json response
                let res = response['data'];

                // retrieve the content from the attributes
                return res.attributes.content;
            });
    }

    public getTree(programName: string, treeId: string): Promise<Tree> {
        // send get request for a specific program for the tree
        return this.http
            .get(`/api/trees/${genericToBase64(programName)}/${treeId}`)
            .toPromise()
            .then(response => {
                // parse json response
                let res = response['data'];

                let items: Map<string, TreeItem> = new Map<string, TreeItem>();

                // loop through all items
                for (let item of res.data.relationships.items.data) {
                    for (let includedItem of res.included) {
                        // check if included id and the data item id match up
                        if (includedItem.id === item.id) {
                            // check if the type of the item is a blob (file) or tree (directory)
                            // and save it to the types map accordingly
                            if (includedItem.attributes.type === 'blob') {
                                items.set(includedItem.attributes.path,
                                    new TreeItem(TreeItemType.Blob, includedItem.id, includedItem.attributes.mode));
                            } else if (includedItem.attributes.type === 'tree') {
                                items.set(includedItem.attributes.path,
                                    new TreeItem(TreeItemType.Tree, includedItem.id, includedItem.attributes.mode));
                            }
                        }
                    }
                }

                // create new Tree Instance
                return new Tree(this, programName, treeId, items);
            });
    }

    public getVersionIds(programName: string): Promise<string[]> {
        // send get request for the version ids
        return this.http
            .get(`/api/versions/${genericToBase64(programName)}`)
            .toPromise()
            .then(response => {
                // parse json response
                let res = response['data'];

                let versionIds: string[] = [];
                for (let item of res) {

                    // add name to the versionIds array
                    versionIds.push(item.id);
                }

                // create new Tree Instance
                return versionIds;
            });
    }

    public getVersion(programName: string, versionId: string): Promise<Version> {
        // send get request for the version of a program
        return this.http
            .get(`/api/versions/${genericToBase64(programName)}/${versionId}`)
            .toPromise()
            .then(response => {
                // parse json response
                let res = response['data'];

                // create new Version Instance
                return new Version(this, programName, res.id, res.attributes.tag, res.attributes.message,
                    res.creationDate, res.parentIds, res.attributes.treeId);
            });
    }

    public createVersionFromWorkingTree(programName: string, message: string, tag?: string): Promise<string> {
        let programId = genericToBase64(programName);

        // create version data object using the given parameters
        let versionData = {
            data: {
                id: programId,
                type: 'version',
                attributes: {
                    tag,
                    message
                }
            }
        };

        // send post request with headers (json) and the stringifyed data object
        return this.http
            .post(`/api/versions/${programId}`,
                JSON.stringify(versionData))
            .toPromise()
            .then(response => {
                return response['data'].relationships.tree.id;
            });
    }

    public getWorkingTreeDirectory(programName: string, path: string): Promise<WorkingTreeDirectory> {
        return this.http
            .get(`/api/directories/${genericToBase64(programName)}/${genericToBase64(path)}`)
            .toPromise()
            .then(response => {
                // parse json response
                let res = response['data'];

                // create empty items and types array
                let items: string[] = [];
                let types: WorkingTreeObjectType[] = [];

                // loop through all items
                for (let item of res.relationships.items.data) {
                    // save the basename of an item
                    let name = basename(genericFromBase64(item.id));

                    // add name to the items array
                    items.push(name);

                    // check if the type of the item is a directory or file
                    // and save it to the types map accordingly
                    if (item.type === 'directory') {
                        types[name] = WorkingTreeObjectType.Directory;
                    } else if (item.type === 'file') {
                        types[name] = WorkingTreeObjectType.File;
                    }
                }

                // create new WorkingTreeDirectory instance with the given data
                return new WorkingTreeDirectory(this, programName,
                    res.attributes.path, res.attributes.mode, items, types);
            });
    }

    public getWorkingTreeFile(programName: string, path: string): Promise<WorkingTreeFile> {
        // send get request for a specific file
        return this.http
            .get(`/api/files/${genericToBase64(programName)}/${genericToBase64(path)}`)
            .toPromise()
            .then(response => {
                // parse json response
                let res = response['data'];

                // create new WorkingTreeFile instance with the given data
                return new WorkingTreeFile(this, programName,
                    res.attributes.path, res.attributes.mode, res.attributes.size);
            });
    }

    public getWorkingTreeFileContent(programName: string, path: string, encoding: string = 'utf-8'): Promise<string> {
        // send get request for the content of a file and return the returned text
        return this.http
            .get(`/api/files/${genericToBase64(programName)}/${genericToBase64(path)}/content`)
            .toPromise()
            .then(response => response['data']);
    }

    public createWorkingTreeDirectory(programName: string, path: string, mode?: number): Promise<void> {
        mode = mode || 0o40755;

        // create directory data object using the given parameters
        let directoryData = {
            data: {
                type: 'directory',
                attributes: {
                    path,
                    mode
                }
            }
        };

        // send post request with headers (json) and the stringifyed data object
        return this.http
            .post(`/api/directories/${genericToBase64(programName)}`,
                JSON.stringify(directoryData))
            .toPromise()
            .then(() => Promise.resolve());
    }

    public createOrUpdateWorkingTreeFile(programName: string,
                                         path: string,
                                         content: string,
                                         mode?: number): Promise<void> {
        mode = mode || 0o100644;

        // create file data object using the given parameters
        let fileData = {
            data: {
                type: 'file',
                attributes: {
                    path,
                    mode,
                    content,
                    encoding: 'utf-8'
                }
            }
        };

        // send post request with headers (json) and the stringifyed data object
        return this.http
            .post(`/api/files/${genericToBase64(programName)}`,
                JSON.stringify(fileData))
            .toPromise()
            .then(() => Promise.resolve());
    }

    public updateWorkingTreeObject(programName: string,
                                   currentPath: string,
                                   options: {mode?: number; newPath?: string; directory: boolean}): Promise<void> {
        let pathId = genericToBase64(currentPath);

        // create file data object using the given parameters
        let fileData = {
            data: {
                    id: pathId,
                    type: options.directory ? 'directories' : 'files',
                    attributes: {
                        path: options.newPath,
                        mode: options.mode || 0o100644,
                        encoding: 'utf-8'
                    }

            }
        };

        // send post request with headers (json) and the stringifyed data object
        return this.http
            .patch(`/api/${options.directory ? 'directories' : 'files'}/
                    ${genericToBase64(programName)}/${pathId}`,
                JSON.stringify(fileData))
            .toPromise()
            .then(() => Promise.resolve());
    }

    public deleteWorkingTreeObject(programName: string, objectPath: string, directory?: boolean): Promise<void> {
        // send delete request
        return this.http
            .delete(
            `/api/${directory? 'directories' : 'files'}/${genericToBase64(programName)}/${genericToBase64(objectPath)}`)
            .toPromise()
            .then(response => Promise.resolve());
    }

    public resetWorkingTree(programName: string): Promise<void> {
        let programId = genericToBase64(programName);
        // create file data object using the given parameters
        let programData = {
            data: {
                id: `/api/programs/${programId}`,
                type: 'program',
                attributes: {
                    workingTreeClean: true
                }
            }
        };

        // send post request with headers (json) and the stringifyed data object
        return this.http
            .patch(`/api/programs/${programId}`,
                JSON.stringify(programData))
            .toPromise()
            .then(() => Promise.resolve());
    }
}
