import NodeGit = require('nodegit');
import fs = require('fs');

import Blob from "../../common/versioncontrol/Blob";
import {default as Tree, TreeItem, TreeItemType} from "../../common/versioncontrol/Tree";
import Version from "../../common/versioncontrol/Version";
import WorkingTreeDirectory from "../../common/versioncontrol/WorkingTreeDirectory";
import WorkingTreeFile from "../../common/versioncontrol/WorkingTreeFile";
import {WorkingTreeObjectType} from "../../common/versioncontrol/WorkingTreeObject";

export function createBlob(storage, programName: string, gitBlob: NodeGit.Blob): Blob {
    return new Blob(storage, programName, gitBlob.id().tostrS(), gitBlob.rawsize());
}

export function createTree(storage, programName: string, gitTree: NodeGit.Tree): Tree {
    let items = new Map<string, TreeItem>();
    // cast to any is required as nodegit typing seem to have an error here
    for (const entry of gitTree.entries() as any[]) {
        items.set(entry.name(), new TreeItem(
            entry.isBlob() ? TreeItemType.Blob : TreeItemType.Tree,
            entry.id().tostrS(),
            entry.filemode()
        ));
    }
    return new Tree(storage, programName, gitTree.id().tostrS(), items);
}

export function createVersion(storage, programName: string, gitTag: NodeGit.Tag, gitCommit: NodeGit.Commit): Version {
    return new Version(
        storage,
        programName,
        gitCommit.id().tostrS(),
        gitTag ? gitTag.name() : null,
        gitCommit.message(),
        gitCommit.date(),
        gitCommit.parents(null).map(parent => parent.tostrS()),
        gitCommit.treeId().tostrS()
    );
}

export function createWorkingTreeDirectory(storage,
                                           programName: string,
                                           directoryPath: string,
                                           directoryStats: fs.Stats,
                                           items: string[],
                                           itemTypes: {[name: string]: WorkingTreeObjectType}): WorkingTreeDirectory {
    return new WorkingTreeDirectory(storage, programName, directoryPath, directoryStats.mode, items, itemTypes);
}

export function createWorkingTreeFile(storage, programName: string, path: string, stats: fs.Stats) {
    return new WorkingTreeFile(storage, programName, path, stats.mode, stats.size);
}
