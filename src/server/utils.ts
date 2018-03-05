import {Request} from "hapi";

export function getLinkUrl(request: Request, linkPath) {
    // from http://stackoverflow.com/questions/31840286/how-to-get-the-full-url-for-a-request-in-hapi#31841704
    return `http://${request.info.host}${linkPath}`;
}

export function getRequestUrl(request: Request) {
    // from http://stackoverflow.com/questions/31840286/how-to-get-the-full-url-for-a-request-in-hapi
    return request.server.info.protocol
        + '://'
        + request.info.host
        + request.url.path;
}
