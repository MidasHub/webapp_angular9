/** Angular Imports */
import {Injectable} from '@angular/core';
import {environment} from 'environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';

/** rxjs Imports */
import {Observable} from 'rxjs';

/**
 * Transaction service.
 */
@Injectable({
  providedIn: 'root'
})
export class TransactionService {

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
    this.GatewayApiUrlPrefix = environment.GatewayApiUrlPrefix;
    this.environment = environment;
    console.log('accessToken', this.accessToken);
  }

  submitTransaction(
    transactionInfo: any
  ): Observable<any> {

    const httpParams = new HttpParams()
      .set('accountNumber', transactionInfo.identifyClientDto.accountNumber)
      .set('accountBankId', transactionInfo.identifyClientDto.accountBankId)
      .set('accountTypeId', transactionInfo.identifyClientDto.accountTypeId)
      .set('accountCash', transactionInfo.accountCash)
      .set('bNo', transactionInfo.traceNo)
      .set('tid', transactionInfo.batchNo)
      .set('terminalAmount', String(this.formatLong(transactionInfo.terminalAmount)))
      .set('feeRate', transactionInfo.rate)
      .set('toClientId', transactionInfo.clientId)
      .set('feeAmount', transactionInfo.feeAmount)
      .set('cogsRate', transactionInfo.cogsRate)
      .set('cogsAmount', transactionInfo.feeCogs)
      .set('pnlAmount', transactionInfo.feePNL)
      .set('invoiceAmount', String(this.formatLong(transactionInfo.txnAmount)))
      .set('requestAmount', String(this.formatLong(transactionInfo.requestAmount)))
      .set('transferAmount', String(this.formatLong(transactionInfo.txnAmount)))
      .set('bills', transactionInfo.invoiceMapping.listInvoice)
      .set('productId', transactionInfo.productId)
      .set('groupId', transactionInfo.clientDto.groupId)
      .set('customerName', transactionInfo.clientDto.displayName)
      .set('terminalId', transactionInfo.terminalId)
      .set('ext2', transactionInfo.type)
      .set('ext4', transactionInfo.identifierId)
      .set('officeId', this.accessToken.officeId)
      .set('createdBy', this.accessToken.userId)
      .set('accessToken', this.accessToken.base64EncodedAuthenticationKey);

    return this.http.post<any>(`${this.GatewayApiUrlPrefix}/transaction/create_cash_retail_transaction`, httpParams);
  }

  mappingInvoiceWithTransaction(accountTypeCode: string,
                                accountNumber: string,
                                identifierId: string,
                                amountTransaction: number,
                                terminalId: string): Observable<any> {

    const httpParams = new HttpParams()
      .set('accountNumber', accountNumber)
      .set('ext4', identifierId)
      .set('AmountMappingInvoice', String(this.formatLong(String(amountTransaction))))
      .set('accountTypeId', accountTypeCode)
      .set('terminalId', terminalId)
      .set('officeId', this.accessToken.officeId)
      .set('createdBy', this.accessToken.userId)
      .set('accessToken', this.accessToken.base64EncodedAuthenticationKey);

    return this.http.post<any>(`${this.GatewayApiUrlPrefix}/transaction/mapping_invoice_transaction`, httpParams);
  }

  getTransaction(payload: { fromDate: string, toDate: string }): Observable<any> {
    const {permissions, officeId} = this.accessToken;
    const permit = permissions.includes('TXN_CREATE');
    const httpParams = new HttpParams()
      .set('officeId', officeId)
      .set('permission', String(!permit))
      .set('fromDate', payload.fromDate)
      .set('toDate', payload.toDate)
      .set('createdBy', this.accessToken.userId)
      .set('accessToken', this.accessToken.base64EncodedAuthenticationKey);
    return this.http.post(`${this.GatewayApiUrlPrefix}/transaction/get_list_pos_transaction`, httpParams);
  }

  getFeeByTerminal(accountTypeCode: string, terminalId: string): Observable<any> {

    const httpParams = new HttpParams()
      .set('accountTypeId', accountTypeCode)
      .set('terminalId', terminalId)
      .set('officeId', this.accessToken.officeId)
      .set('createdBy', this.accessToken.userId)
      .set('accessToken', this.accessToken.base64EncodedAuthenticationKey);

    return this.http.post<any>(`${this.GatewayApiUrlPrefix}/pos/get_fee_by_terminal`, httpParams);
  }

  checkValidRetailCashTransaction(clientId: string): Observable<any> {

    const httpParams = new HttpParams()

      .set('clientId', clientId)
      .set('officeId', this.accessToken.officeId)
      .set('createdBy', this.accessToken.userId)
      .set('accessToken', this.accessToken.base64EncodedAuthenticationKey);

    return this.http.post<any>(`${this.GatewayApiUrlPrefix}/transaction/check_valid_for_retail_transaction`, httpParams);
  }

  checkExtraCardInfo(clientId: string, identifierId: string): Observable<any> {

    const httpParams = new HttpParams()
      .set('userIdentifyId', identifierId)
      .set('userId', clientId)
      .set('officeId', this.accessToken.officeId)
      .set('createdBy', this.accessToken.userId)
      .set('accessToken', this.accessToken.base64EncodedAuthenticationKey);

    return this.http.post<any>(`${this.GatewayApiUrlPrefix}/card/check_extra_card_info`, httpParams);
  }

  getListTerminalAvailable(amount: number): Observable<any> {

    const httpParams = new HttpParams()
      .set('id', this.accessToken.officeId)
      .set('amountTransaction', amount.toString())
      .set('createdBy', this.accessToken.userId)
      .set('accessToken', this.accessToken.base64EncodedAuthenticationKey);

    return this.http.post<any>(`${this.GatewayApiUrlPrefix}/pos/get_list_terminal_by_office`, httpParams);
  }

  getTransactionTemplate(clientId: string, identifierId: string): Observable<any> {

    const httpParams = new HttpParams()
      .set('identifyId', identifierId)
      .set('clientId', clientId)
      .set('officeId', this.accessToken.officeId)
      .set('createdBy', this.accessToken.userId)
      .set('accessToken', this.accessToken.base64EncodedAuthenticationKey);

    return this.http.post<any>(`${this.GatewayApiUrlPrefix}/transaction/get_retail_transaction_template`, httpParams);
  }

  formatLong(value: string) {
    value = String(value);
    const neg = value.startsWith('-');
    value = value.replace(/[^0-9]+/g, '');
    if (neg) {
      value = '-'.concat(value);
    }
    return Number(value);
  }

  downloadVoucher(transactionId: string) {
    const url = `${this.environment.GatewayApiUrl}${this.GatewayApiUrlPrefix}/export/download_voucher?id=${transactionId}&accessToken=${this.accessToken.base64EncodedAuthenticationKey}&createdBy=${this.accessToken.userId}`;
    let xhr = new XMLHttpRequest();
    xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      let a;
      if (xhr.readyState === 4 && xhr.status === 200) {
        a = document.createElement('a');
        a.href = window.URL.createObjectURL(xhr.response);
        a.download = `V_${transactionId}`;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
      }
    };

    xhr.open('GET', url);
    xhr.setRequestHeader('Gateway-TenantId', this.environment.GatewayTenantId);
    xhr.responseType = 'blob';
    xhr.send();

  }
}
