import {Component, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import Version from "../../../common/versioncontrol/Version";
import {HttpProgramService} from "./http-program.service";

@Component({
    selector: 'version-list',
    template: require('./version-list.component.html'),
    styles: [require('./version-list.component.css')],
    providers: [
        HttpProgramService
    ]
})
export default class VersionListComponent implements OnInit {
    private programName: string;
    private versions: Version[] = [];

    public constructor (route: ActivatedRoute, private storageService: HttpProgramService) {
        this.programName = route.snapshot.params['programName'];
    }

    public async ngOnInit() {
        for (const versionId of await this.storageService.getStorage().getVersionIds(this.programName)) {
            this.versions.push(await this.storageService.getStorage().getVersion(this.programName, versionId));
        }
    }
}
