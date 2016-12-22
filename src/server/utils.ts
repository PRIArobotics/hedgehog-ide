import Hapi = require('hapi');

export function getLinkUrl(request: Hapi.Request, linkPath) {
    // from http://stackoverflow.com/questions/31840286/how-to-get-the-full-url-for-a-request-in-hapi#31841704
    return `http://${request.info.host}${linkPath}`;
}

export function getRequestUrl(request: Hapi.Request) {
    // from http://stackoverflow.com/questions/31840286/how-to-get-the-full-url-for-a-request-in-hapi
    return request.connection.info.protocol
        + '://'
        + request.info.host
        + request.url.path;
}
