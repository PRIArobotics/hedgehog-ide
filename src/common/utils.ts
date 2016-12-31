
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

    if(paths[0].endsWith('/')) {
        paths[0] = paths[0].slice(0, paths[0].length - 1);
    }

    for(let i = 1; i < paths.length; i++) {
        if(paths[i].startsWith('/')) {
            paths[i] = paths[i].slice(1, paths[i].length);
        }

        if(paths[i].endsWith('/')) {
            paths[i] = paths[i].slice(0, paths[i].length - 1);
        }
    }

    return paths.join('/');
}

// from: https://www.typescriptlang.org/docs/handbook/mixins.html
export function applyMixins(derivedCtor: any, baseCtors: any[]) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            derivedCtor.prototype[name] = baseCtor.prototype[name];
        });
    });
}

export function genericFromBase64(encoded: string): string {
    if(typeof(atob) === 'function') {
        return atob(encoded);
    } else {
        return new Buffer(encoded, 'base64').toString();
    }
}

export function genericToBase64(decoded: string): string {
    if(typeof(btoa) === 'function') {
        return btoa(decoded);
    } else {
        return new Buffer(decoded).toString('base64');
    }
}


