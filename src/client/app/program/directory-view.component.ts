import {Component, OnInit, Pipe, PipeTransform} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {HttpProgramService} from "./http-program.service";
import Tree from "../../../common/versioncontrol/Tree";
import {TreeItemType} from "../../../common/versioncontrol/Tree";


@Component({
    selector: 'directory-view',
    template: require('./directory-view.component.html'),
    styles: [require('./directory-view.component.css')],
    providers: [
        HttpProgramService
    ]
})

export default class DirectoryViewComponent implements OnInit {
    public TreeItemType = TreeItemType;

    private programName: string;
    private treeId: string;

    private tree: Tree;

    public constructor (private route: ActivatedRoute, private storageService: HttpProgramService) {
        this.programName = route.snapshot.params['programName'];
        this.treeId = route.snapshot.params['treeId'];
    }

    public async ngOnInit() {
        // subscribe to the changes in the parameter to update the tree
        // since it is the same view
        this.route.params.subscribe(async params => {
            this.programName = params['programName'];
            this.treeId = params['treeId'];
            this.tree = await this.storageService.getStorage().getTree(this.programName, this.treeId);
        });

    }
}

@Pipe({name: 'keys'})
export class KeysPipe implements PipeTransform {
    public transform(value) {
        let keys: any = [];
        for (let key of value.keys()) {
            keys.push( {key, value: value.get(key)} );
        }
        return keys;
    }
}
