import HapiApi from "../HapiApi";

export default function createStorageApi(api: HapiApi, programStoragePath: string) {
    class ProgramStorageApi {
        constructor(private storagePath: string) { }

        @api.apiEndpoint('/programs', 'POST')
        // tslint:disable
        public createProgram(req) {

        }
        // tslint:enable
    }

    return new ProgramStorageApi(programStoragePath);
}
