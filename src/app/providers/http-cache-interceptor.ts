import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor
} from '@angular/common/http';

import { Observable } from 'rxjs';

@Injectable()
export class HttpCacheInterceptor implements HttpInterceptor {
    constructor() { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // do not cache get request responses
        if (request.method === 'GET') {
            request = request.clone({
                setHeaders: {
                    'Cache-Control': 'no-cache',
                    'Expires': '0'
                }
            });
        }

        return next.handle(request);
    }
}
