
export function wrapCallbackAsPromise(func: (...args: any[]) => any, ...args: any[]): Promise<any> {
    return new Promise<any>((resolve, reject) => {
        args.push((err, ...returnArgs: any[]) => {
            if(err) {
                reject(err);
            } else if(returnArgs.length === 0) {
                resolve();
            } else if(returnArgs.length === 1) {
                resolve(returnArgs[0]);
            } else {
                resolve(returnArgs);
            }
        });

        func.apply(this, args);
    });
}

export function basename(path: string): string {
    let splitPath: string[] = path.split('/');
    if(splitPath.length > 1) {
        return splitPath[splitPath.length - 1];
    } else {
        return path;
    }
}

export function dirname(path: string): string {
    let splitPath: string[] = path.split('/');
    if(splitPath.length > 1) {
        splitPath.pop();
        return splitPath.join('/');
    } else {
        return '.';
    }
}

export function join(...paths: string[]): string {

    if(paths[0].endsWith('/')){
        paths[0] = paths[0].slice(0, paths[0].length - 1);
    }

    for(let i = 1; i < paths.length; i++){
        if(paths[i].startsWith('/')) {
            paths[i] = paths[i].slice(1, paths[i].length);
        }

        if(paths[i].endsWith('/')){
            paths[i] = paths[i].slice(0, paths[i].length - 1);
        }
    }

    return paths.join('/')
}