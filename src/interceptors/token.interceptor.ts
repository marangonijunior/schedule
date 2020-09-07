import { Injectable, Injector } from '@angular/core';

import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HttpResponse,
    HttpErrorResponse
  } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
    Router
  } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { LoadingProvider } from '../app/service/loading.service';


@Injectable()
export class TokenInterceptor implements HttpInterceptor {

    loadingProvider;

    constructor(
        loadingProvider: LoadingProvider,
        private router: Router,
        public toastController: ToastController) {
          this.loadingProvider = loadingProvider;
        }

        intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

            const token = localStorage.getItem('token');
            this.loadingProvider.present();

            if (token) {
              request = request.clone({
                setHeaders: {
                  Authorization: token
                }
              });
            }

            if (!request.headers.has('Content-Type')) {
              request = request.clone({
                setHeaders: {
                  'content-type': 'application/json'
                }
              });
            }

            request = request.clone({
              headers: request.headers.set('Accept', 'application/json')
            });

            return next.handle(request).pipe(
              map((event: HttpEvent<any>) => {
                this.loadingProvider.dismiss();

                if (event instanceof HttpResponse) {
                  console.log('event--->>>', event);
                }
                return event;
              }),
              catchError( response => {
                this.loadingProvider.dismiss();
                return throwError(response);
              })
            );
        }

}
