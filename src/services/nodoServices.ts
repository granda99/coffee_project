import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class nodoServices {
    public url: string

    constructor(
        private _http: HttpClient
    ) {
        this.url = environment.firebaseConfig.databaseURL;
    }

    addNewDevice(data): Observable<any> {
        const user = JSON.parse(sessionStorage.getItem('user'));
        let uid = user.uid;
        let token = user.stsTokenManager.accessToken;

        const $URL = `${this.url}/dispositivos/${uid}.json`;

        return this._http.post<any>($URL, data);
    }

    getInformacion(): Observable<any> {
        const user = JSON.parse(sessionStorage.getItem('user'));
        let uid = user.uid;
        let token = user.stsTokenManager.accessToken;

        const $URL = `${this.url}/registro_nodos/${uid}.json?auth=${token}`;

        return this._http.get<any>($URL);
    }

    getDevicesStatus(): Observable<any> {
        const user = JSON.parse(sessionStorage.getItem('user'));
        let uid = user.uid;
        let token = user.stsTokenManager.accessToken;

        const $URL = `${this.url}/dispositivos/${uid}.json?auth=${token}`;

        return this._http.get<any>($URL);
    }

    changeStatusDevice(data, key): Observable<any> {
        const user = JSON.parse(sessionStorage.getItem('user'));
        let uid = user.uid;
        let token = user.stsTokenManager.accessToken;

        const $URL = `${this.url}/dispositivos/${uid}/${key}.json`;

        return this._http.patch<any>($URL, data);
    }
}

export interface Months {
    HT: number;
    PH: number;
    HA: number;
    TA: number;
    LA: number;
    PA: number
}