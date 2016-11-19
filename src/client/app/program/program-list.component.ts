import {Component, OnInit} from '@angular/core';
import {DummyProgramService} from "./dummy-program.service";
import IProgramStorage from "../../../versioncontrol/ProgramStorage";

@Component({
    moduleId: module.id,
    selector: 'program-list',
    templateUrl: 'program-list.component.html',
    providers: [
        DummyProgramService
    ]
})
export class ProgramListComponent implements OnInit {
    private storage: IProgramStorage;
    private programs: string[];

    public constructor(storageService: DummyProgramService) {
        this.storage = storageService.getStorage();
    }

    public async ngOnInit() {
        // add programs for testing
        this.storage.createProgram('program 1');

        this.programs = await this.storage.getProgramNames();
    }
}
