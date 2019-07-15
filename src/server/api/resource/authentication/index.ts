import AuthenticationResource from './AuthenticationResource';
import Api from '../../Api';

export default function registerResources(api: Api, {serverConfig}) {
    api.registerResource(new AuthenticationResource(serverConfig.auth.jwtSecret), false);
}
