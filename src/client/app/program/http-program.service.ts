import {Injectable} from '@angular/core';
import {Http} from "@angular/http";
import HttpProgramStorage from "./HttpProgramStorage";

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
