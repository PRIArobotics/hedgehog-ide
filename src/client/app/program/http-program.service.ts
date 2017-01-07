import { Injectable } from '@angular/core';
import HttpProgramStorage from "../../../common/versioncontrol/HttpProgramStorage";
import {Http} from "@angular/http";

@Injectable()
export class HttpProgramService {
    private readonly storage;

    constructor(private http: Http) {
        this.storage = new HttpProgramStorage(http);
    }

    public getStorage() {
        return this.storage;
    }
}
