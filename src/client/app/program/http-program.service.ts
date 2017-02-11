import {Injectable} from '@angular/core';
import {Http} from "@angular/http";
import HttpProgramStorage from "./HttpProgramStorage";
import IProgramStorage from "../../../common/versioncontrol/ProgramStorage";

@Injectable()
export class HttpProgramService {
    private readonly storage: IProgramStorage;

    constructor(private http: Http) {
        this.storage = new HttpProgramStorage(http);
    }

    public getStorage() {
        return this.storage;
    }
}
