import ApiResource from "./ApiResource";

export default function ApiEndpoint(path: string, method: string) {
    return (resource: ApiResource, handler: string) => {
        resource.addEndpoint(
            path,
            method,
            resource[handler].bind(resource)
        );
    };
}
