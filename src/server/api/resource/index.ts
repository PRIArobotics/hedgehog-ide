import ConfigurationResource from './ConfigurationResource';
import ProcessResource from "./ProcessResource";
import Api from '../Api';
import modelRegistry from "../../jsonapi/ModelSerializerRegistry";

import registerAuthenticationResources from './authentication';
import registerHedgehogIoResources from './hedgehog-io';
import registerVersioncontrolResources from './versioncontrol';

export default function registerResources(api: Api, {serverConfig, hedgehog, processManager, programStorage}) {
    registerAuthenticationResources(api, {serverConfig});
    registerHedgehogIoResources(api, {hedgehog});
    registerVersioncontrolResources(api, {programStorage});
    api.registerResource(new ConfigurationResource(serverConfig), false);
    api.registerResource(new ProcessResource(processManager, modelRegistry));
}
