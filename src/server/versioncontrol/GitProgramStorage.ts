import fs = require('fs');
import path = require('path');
import rimraf = require('rimraf');
import NodeGit = require('nodegit');

import Program from './Program';
import {wrapCallbackAsPromise} from "../../utils";

export default class GitProgramStorage {
    public storagePath: string;

    constructor(storagePath: string) {
        this.storagePath = storagePath;
    }

    public createProgram(name: string): Promise<Program> {
        return NodeGit.Repository.init(this.getProgramPath(name), 0)
            .then((repository: NodeGit.Repository) => {
                let signature = NodeGit.Signature.now('Hedgehog', 'info@hedgehog.pria.at');
                return repository.createCommitOnHead(
                    [],
                    signature,
                    signature,
                    'initial commit');
            })
            .then(() => {
                return new Program(name);
            });
    }

    public deleteProgram(program: Program): Promise<Error> {
        return wrapCallbackAsPromise(fs.readdir, this.getProgramPath(program.name))
            .then(() => {
                return wrapCallbackAsPromise(rimraf, this.getProgramPath(program.name));
            });
    }

    private getProgramPath(name: string) {
        return path.join(this.storagePath, name);
    }
}
