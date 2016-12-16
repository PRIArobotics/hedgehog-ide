import ApiResource from "./ApiResource";

export default function ApiEndpoint(method: string, path: string = '') {
    return (resource: ApiResource, handler: string) => {
        resource.addEndpoint(
            path,
            method,
            resource[handler]
        );
    };
}
