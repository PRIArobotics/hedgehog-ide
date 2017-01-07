
import 'rxjs/add/operator/toPromise';

import IProgramStorage from './ProgramStorage';
import Program from './Program';
import Blob from './Blob';
import Tree from './Tree';
import Version from './Version';
import WorkingTreeDirectory from './WorkingTreeDirectory';
import WorkingTreeFile from './WorkingTreeFile';
import {Http, Headers} from '@angular/http';
import {genericToBase64, genericFromBase64, basename} from "../utils";
import {WorkingTreeObjectType} from "./WorkingTreeObject";

export default class HttpProgramStorage implements IProgramStorage {

    private headers = new Headers({'Content-Type': 'application/vnd.api+json'});

    public constructor(private http: Http) { }

    public createProgram(name: string): Promise<Program> {
        let programData = {
            data: {
                type: "program",
                attributes: {
                    name
                }
            }
        };

        return this.http
            .post('/api/programs',
                JSON.stringify(programData),
                {headers: this.headers})
            .toPromise()
            .then(response => {
                let res = response.json().data;

                let program: Program = new Program(this, res.attributes.name,
                    res.attributes.latestVersionId, res.attributes.workingTreeClean);

                return program;
            });
    }

    public deleteProgram(name: string): Promise<void> {
        return this.http
            .delete(`/api/programs/${genericToBase64(name)}`)
            .toPromise()
            .then(() => {
                return Promise.resolve();
            });
    }

    public getProgramNames(): Promise<string[]> {
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

                return programNames;
            });
    }

    public getProgram(name: string): Promise<Program> {
        return this.http
            .get(`/api/programs/${genericToBase64(name)}`)
            .toPromise()
            .then(response => {
                // get response data
                let res = response.json().data;

                // create new Program Instance
                let newProgram: Program = new Program(this, res.attributes.name,
                    res.attributes.latestVersionId, res.attributes.workingTreeClean);

                return newProgram;
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
                // get response data
                let res = response.json().data;

                let items: string[] = [];
                let types: WorkingTreeObjectType[] = [];

                for (let item of res.relationships.items.data) {
                    let name = basename(genericFromBase64(item.id));

                    items.push(name);

                    if (item.type === "directory") {
                        types[name] = WorkingTreeObjectType.Directory;
                    } else if (item.type === "file") {
                        types[name] = WorkingTreeObjectType.File;
                    }
                }

                // create new Program Instance
                let directory: WorkingTreeDirectory = new WorkingTreeDirectory(this, programName,
                    res.attributes.path, res.attributes.mode, items, types);

                return directory;
            });
    }

    public getWorkingTreeFile(programName: string, path: string): Promise<WorkingTreeFile> {
        return this.http
            .get(`/api/files/${genericToBase64(programName)}/${genericToBase64(path)}`)
            .toPromise()
            .then(response => {
                // get response data
                let res = response.json().data;

                // create new Program Instance
                let file: WorkingTreeFile = new WorkingTreeFile(this, programName,
                    res.attributes.path, res.attributes.mode, res.attributes.size);

                return file;
            });
    }

    public getWorkingTreeFileContent(programName: string, path: string, encoding: string = 'utf-8'): Promise<string> {
        return undefined;
    }

    public createWorkingTreeDirectory(programName: string, path: string, mode?: number): Promise<void> {

        mode = mode || 0o40755;

        let directoryData = {
            data: {
                type: "directory",
                attributes: {
                    path,
                    mode
                }
            }
        };

        return this.http
            .post(`/api/directories/${genericToBase64(programName)}`,
                JSON.stringify(directoryData),
                {headers: this.headers})
            .toPromise()
            .then(() => {
                return Promise.resolve();
            });
    }

    public createOrUpdateWorkingTreeFile(programName: string, path: string,
                                         content: string, mode?: number): Promise<void> {
        mode = mode || 0o100644;

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

        return this.http
            .post(`/api/files/${genericToBase64(programName)}`,
                JSON.stringify(fileData),
                {headers: this.headers})
            .toPromise()
            .then(() => {
                return Promise.resolve();
            });
    }

    public updateWorkingTreeObject(programName: string, currentPath: string,
                                   options: {mode?: number; newPath?: string}): Promise<void> {
        return undefined;
    }

    public deleteWorkingTreeObject(programName: string, objectPath: string): Promise<void> {
        return undefined;
    }

    public resetWorkingTree(programName: string): Promise<void> {
        return undefined;
    }
}
