import {Injectable} from '@angular/core';
import HttpProgramStorage from "./HttpProgramStorage";
import IProgramStorage from "../../../common/versioncontrol/ProgramStorage";
import {HttpClient} from "@angular/common/http";

@Injectable()
export class HttpProgramService {
    private readonly storage: IProgramStorage;

    constructor(private http: HttpClient) {
        this.storage = new HttpProgramStorage(http);
    }

    public getStorage() {
        return this.storage;
    }
}
