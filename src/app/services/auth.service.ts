import { Injectable } from '@angular/core';
import { PathFactoryService } from './path-factory.service';
import { firstValueFrom } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private static readonly TOKEN_FILE = "token.txt";
  private token: Promise<string>;

  constructor(private pathFactory: PathFactoryService, private http: HttpClient) {
    const tokenURL = pathFactory.getAssetURL(AuthService.TOKEN_FILE);
    this.token = firstValueFrom(this.http.get(tokenURL, {responseType: "text"}));
  }

  async getAPIHeaders(headerData?: {[headerField: string]: string}) {
    const token = await this.token;
    let headers = new HttpHeaders()
    .set("Authorization", "Bearer " + token);
    if(headerData) {
      for(let key in headerData) {
        headers.set(key, headerData[key]);
      }
    }
    return headers;
  }
}
