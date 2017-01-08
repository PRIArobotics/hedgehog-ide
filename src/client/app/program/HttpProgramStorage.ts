
import 'rxjs/add/operator/toPromise';

import IProgramStorage from '../../../common/versioncontrol/ProgramStorage';
import Program from '../../../common/versioncontrol/Program';
import Blob from '../../../common/versioncontrol/Blob';
import Tree from '../../../common/versioncontrol/Tree';
import Version from '../../../common/versioncontrol/Version';
import WorkingTreeDirectory from '../../../common/versioncontrol/WorkingTreeDirectory';
import WorkingTreeFile from '../../../common/versioncontrol/WorkingTreeFile';
import {Http, Headers} from '@angular/http';
import {genericToBase64, genericFromBase64, basename} from "../../../common/utils";
import {WorkingTreeObjectType} from "../../../common/versioncontrol/WorkingTreeObject";

export default class HttpProgramStorage implements IProgramStorage {

    private headers = new Headers({'Content-Type': 'application/vnd.api+json'});

    public constructor(private http: Http) { }

    public createProgram(name: string): Promise<Program> {
        // create program data object
        let programData = {
            data: {
                type: "program",
                attributes: {
                    name
                }
            }
        };

        // send post request with headers (json) and the stringifyed data object
        return this.http
            .post('/api/programs',
                JSON.stringify(programData),
                {headers: this.headers})
            .toPromise()
            .then(response => {
                // parse json response
                let res = response.json().data;

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
                let programs = response.json().data;
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
                let res = response.json().data;

                // create new Program Instance
                return new Program(this, res.attributes.name,
                    res.attributes.latestVersionId, res.attributes.workingTreeClean);
            });
    }

    public renameProgram(oldName: string, newName: string): Promise<void> {
        return undefined;
    }

    public resetProgram(programName: string, versionId: string): Promise<void> {
        return undefined;
    }

    public getBlob(programName: string, blobId: string): Promise<Blob> {
        return undefined;
    }

    public getBlobContent(programName: string, blobId: string, encoding): Promise<string> {
        return undefined;
    }

    public getTree(programName: string, treeId: string): Promise<Tree> {
        return undefined;
    }

    public getVersionIds(programName: string): Promise<string[]> {
        return undefined;
    }

    public getVersion(programName: string, versionId: string): Promise<Version> {
        return undefined;
    }

    public createVersionFromWorkingTree(programName: string, message: string, tag?: string): Promise<string> {
        return undefined;
    }

    public getWorkingTreeDirectory(programName: string, path: string): Promise<WorkingTreeDirectory> {
        return this.http
            .get(`/api/directories/${genericToBase64(programName)}/${genericToBase64(path)}`)
            .toPromise()
            .then(response => {
                // parse json response
                let res = response.json().data;

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
                    if (item.type === "directory") {
                        types[name] = WorkingTreeObjectType.Directory;
                    } else if (item.type === "file") {
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
                let res = response.json().data;

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
            .then(response => response.text());
    }

    public createWorkingTreeDirectory(programName: string, path: string, mode?: number): Promise<void> {
        mode = mode || 0o40755;

        // create directory data object using the given parameters
        let directoryData = {
            data: {
                type: "directory",
                attributes: {
                    path,
                    mode
                }
            }
        };

        // send post request with headers (json) and the stringifyed data object
        return this.http
            .post(`/api/directories/${genericToBase64(programName)}`,
                JSON.stringify(directoryData),
                {headers: this.headers})
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
                type: "file",
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
                JSON.stringify(fileData),
                {headers: this.headers})
            .toPromise()
            .then(() => Promise.resolve());
    }

    public updateWorkingTreeObject(programName: string,
                                   currentPath: string,
                                   options: {mode?: number; newPath?: string}): Promise<void> {
        // create file data object using the given parameters
        let fileData = {
            data: {
                    id: genericToBase64(currentPath),
                    type: "file",
                    attributes: {
                        path: options.newPath,
                        mode: options.mode || 0o100644,
                        encoding: "utf-8"
                    }

            }
        };

        // send post request with headers (json) and the stringifyed data object
        return this.http
            .patch(`/api/files/${genericToBase64(programName)}/${genericToBase64(currentPath)}`,
                JSON.stringify(fileData),
                {headers: this.headers})
            .toPromise()
            .then(() => Promise.resolve());
    }

    public deleteWorkingTreeObject(programName: string, objectPath: string): Promise<void> {
        // send delete request
        return this.http
            .delete(`/api/files/${genericToBase64(programName)}/${genericToBase64(objectPath)}`)
            .toPromise()
            .then(response => Promise.resolve());
    }

    public resetWorkingTree(programName: string): Promise<void> {
        return undefined;
    }
}
