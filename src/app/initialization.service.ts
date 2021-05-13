import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../environments/environment';
import { HttpHeaders } from '@angular/common/http';
import {CookieService} from 'ngx-cookie-service';
import {AuthService} from './modules/auth';
import { Router } from '@angular/router';

// import { Headers } from '@angular/http';

@Injectable({
  providedIn: 'root'
})
export class InitializationService {
    public initData;
    public signInResponse;
    public user;
    public userResponse;
    private accessToken = this.cookieService.get('accessToken') ? this.cookieService.get('accessToken') : null;
    // private cookieService: any;

    constructor(
        private httpClient: HttpClient,
        private cookieService: CookieService,
        private authService: AuthService,
        private router: Router
    ) {
        this.initData = null;
        this.signInResponse = null;
        this.userResponse = null;
    }

    async getConfigResponse(): Promise<any> {
        if (this.initData === null) {
            this.initData = await (this.httpClient.get(environment.initialUrl).toPromise());
        }

        // console.log(this.initData);
        return this.initData;
    }
    async signIn(data): Promise<any> {
        const myHeader = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
        let body = new HttpParams();
        body = body.set('client_id', data.client_id);
        body = body.set('client_secret', data.client_secret);
        body = body.set('password', data.password);
        body = body.set('username', data.username);
        body = body.set('scope', data.scope);
        body = body.set('grant_type', data.grant_type);

        this.signInResponse = await this.httpClient.post(environment.signInUrl, body, {headers: myHeader}).toPromise();
        console.log(this.signInResponse);
        if (this.signInResponse.access_token) {
            localStorage.setItem( 't', JSON.stringify(this.signInResponse));
            await this.getResponseUser(this.signInResponse.access_token);
        } else {
            console.log('sign in failed');
            // this.cookieService.delete('accessToken');
        }
        return this.signInResponse;
    }
    async getResponseUser(accessToken): Promise<any> {
        const header = new HttpHeaders({
            Authorization: `Bearer ${accessToken}`
        });
        this.userResponse = await this.httpClient.get(environment.initialUrl,  {headers: header}).toPromise();
        if (this.userResponse && this.userResponse.user) {
            // return this.userResponse;
            console.log('valid // route-dashboard + user = ', this.userResponse.user); // route-dashboard
            // this.cookieService.set('us', this.userResponse.user)
            this.router.navigate(['/dashboard']);
            // this.authService.currentUserSubject = this.userResponse.user;
        } else {
            this.cookieService.delete('accessToken');
        }
        return this.userResponse;
    }
    deleteAccessToken() {
        this.cookieService.delete('accessToken');
    }

}
