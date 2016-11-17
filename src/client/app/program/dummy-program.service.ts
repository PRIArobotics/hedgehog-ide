import { Injectable } from '@angular/core';
import DummyProgramStorage from "../../../versioncontrol/DummyProgramStorage";

@Injectable()
export class DummyProgramService {
    private readonly storage = new DummyProgramStorage();

    public getStorage() {
        return this.storage;
    }
}
