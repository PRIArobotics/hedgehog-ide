import NodeGit = require('nodegit');

export class Program {
    public name: string;

    private repository: NodeGit.Repository;

    constructor(name, repository) {
        this.name = name;
        this.repository = repository;
    }
}
