import NodeGit = require('nodegit');
import Blob from "../../versioncontrol/Blob";
import Tree from "../../versioncontrol/Tree";
import {TreeItem} from "../../versioncontrol/Tree";
import {TreeItemType} from "../../versioncontrol/Tree";

export function createBlob(programName: string, gitBlob: NodeGit.Blob): Blob {
    return new Blob(programName, gitBlob.id().tostrS(), gitBlob.rawsize());
}

export function createTree(programName: string, gitTree: NodeGit.Tree): Tree {
    let items = new Map<string, TreeItem>();
    // cast to any is required as nodegit typing seem to have an error here
    for (const entry of <any[]>gitTree.entries()) {
        items.set(entry.name(), new TreeItem(
            entry.isBlob() ? TreeItemType.Blob : TreeItemType.Tree,
            entry.id().tostrS(),
            entry.filemode()
        ));
    }
    return new Tree(programName, gitTree.id().tostrS(), items);
}
