import {Injectable, Injector} from "@angular/core";
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {Observable} from "rxjs/Observable";
import {AuthProvider} from "./auth-provider.service";

@Injectable()
export class HeaderInterceptor implements HttpInterceptor {


    private authProvider: AuthProvider;

    constructor (private injector: Injector) { }

    public intercept (req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Lazily load AuthProvider here in order to fix issues with cyclic dependency
        // (As AuthProvider uses HttpClient itself)
        if (!this.authProvider)
            this.authProvider = this.injector.get(AuthProvider);

        const token = this.authProvider.token;
        const headers = req.headers
            .set('Authorization', token)
            .set('Content-Type', 'application/vnd.api+json');

        const authReq = token ? req.clone({headers}) : req;
        return next.handle(authReq).do(null, (err: HttpErrorResponse) => {
            if (err.status === 401) {
                this.authProvider.invalidateToken();
            }
            throw err;
        });
    }
}
