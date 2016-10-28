
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
