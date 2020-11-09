/** Angular Imports */
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';

/** rxjs Imports */
import { Observable } from 'rxjs';
/**
 * midas client service.
 */
@Injectable({
  providedIn: 'root'
})
export class MidasClientService {

  private credentialsStorageKey = 'mifosXCredentials';
  private accessToken: any;
  private GatewayApiUrlPrefix: any;
  private environment: any;
  /**
   * @param {HttpClient} http Http Client to send requests.
   */
  constructor(private http: HttpClient) {

    this.accessToken = JSON.parse(
      sessionStorage.getItem(this.credentialsStorageKey)
      || localStorage.getItem(this.credentialsStorageKey)
    );
    this.GatewayApiUrlPrefix = environment.GatewayApiUrlPrefix ;
    this.environment = environment ;
   }

  searchClientByNameAndExternalIdAndPhoneAndDocumentKey(query: string): Observable<any> {

    let httpParams = new HttpParams()
    .set('query', query)
    .set('createdBy', this.accessToken.userId)
    .set('accessToken', this.accessToken.base64EncodedAuthenticationKey);

    return this.http.post<any>(`${this.GatewayApiUrlPrefix}/client/get_list_client_by_query`, httpParams);
  }

  formatLong(value: string){
    value = String(value) ;
    const neg = value.startsWith('-');
    value = value.replace(/[^0-9]+/g, "");
    if(neg) value = '-'.concat(value);
    return parseInt(value);
  }


}
