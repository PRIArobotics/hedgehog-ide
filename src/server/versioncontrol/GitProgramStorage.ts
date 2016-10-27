import path = require('path');
import NodeGit = require('nodegit');

import {Program} from './Program';

export default class GitProgramStorage {
    public storagePath: string;

    constructor(storagePath: string) {
        this.storagePath = storagePath;
    }

    public createProgram(name: string): Promise<Program> {
        return new Promise((resolve, reject) => {
            NodeGit.Repository.init(path.join(this.storagePath, name), 0)
                .then((repository: NodeGit.Repository) => {
                    resolve(new Program(name, repository));
                })
                .catch(reject);
        });
    }
}
