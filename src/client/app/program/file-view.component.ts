import {OnInit, Component} from "@angular/core";
import {HttpProgramService} from "./http-program.service";
import {ActivatedRoute} from "@angular/router";

@Component({
    selector: 'file-view',
    template: require('./file-view.component.html'),
    //styles: [require('./directory-view.component.css')],
    providers: [
        HttpProgramService
    ]
})

export default class FileViewComponent implements OnInit {
    private programName: string;
    private blobId: string;

    private blobContent: string;

    public constructor (private route: ActivatedRoute, private storageService: HttpProgramService) {
        this.programName = route.snapshot.params['programName'];
        this.blobId = route.snapshot.params['treeId'];
    }

    public async ngOnInit() {
        // subscribe to the changes in the parameter to update the tree
        // since it is the same view
        this.route.params.subscribe(async params => {
            this.programName = params['programName'];
            this.blobId = params['blobId'];
            this.blobContent = await this.storageService.getStorage().getBlobContent(this.programName, this.blobId);
        });
    }
}
