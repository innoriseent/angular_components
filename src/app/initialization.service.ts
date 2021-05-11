import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {environment} from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InitializationService {
    public initData;

    constructor(private httpClient: HttpClient) {
        this.initData = null;
    }

    async getConfigResponse(): Promise<any> {
        if (this.initData === null) {
            this.initData = await (this.httpClient.get(environment.initialUrl).toPromise());
        }

        return this.initData;
    }

}
