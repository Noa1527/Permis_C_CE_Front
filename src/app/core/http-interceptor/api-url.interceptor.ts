import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

export const apiUrlInterceptor = (
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
    let editReq = req.clone();
    if (req.url.includes('/api/')) {
        editReq = req.clone({
            url: `${environment.apiUrl}${req.url.replace('/api/', '/')}`,
        });
    }
    return next(editReq).pipe(
        catchError((error) => {
            return throwError(() => error);
        })
    );
};
