/** Angular Imports */
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";

/** rxjs Imports */
import { Observable } from "rxjs";
import { CommonHttpParams } from "app/shared/CommonHttpParams";

/**
 * Transaction service.
 */
@Injectable({
  providedIn: "root",
})
export class TransactionService {
  private credentialsStorageKey = "midasCredentials";
  private accessToken: any;
  private GatewayApiUrlPrefix: any;
  private environment: any;

  /**
   * @param {HttpClient} http Http Client to send requests.
   */
  constructor(private http: HttpClient, private commonHttpParams: CommonHttpParams) {
    this.accessToken = JSON.parse(
      sessionStorage.getItem(this.credentialsStorageKey) || localStorage.getItem(this.credentialsStorageKey)
    );
    this.GatewayApiUrlPrefix = environment.GatewayApiUrlPrefix;
    this.environment = environment;
  }

  ExecuteRollTermTransactionByTrnRefNo(form: any): Observable<any> {
    let httpParams = this.commonHttpParams.getCommonHttpParams();

    const keys = Object.keys(form);
    for (const key of keys) {
      if (key.includes("amount")) {
        httpParams = httpParams.set(key, String(Number(form[key])));
      } else {
        httpParams = httpParams.set(key, form[key]);
      }
    }
    return this.http.post<any>(
      `${this.GatewayApiUrlPrefix}/transaction/repayment_rollterm_manual_transaction`,
      httpParams
    );
  }

  getExecuteRollTermTransactionByTrnRefNo(refId: number): Observable<any> {
    let httpParams = this.commonHttpParams.getCommonHttpParams();
    httpParams = httpParams.set("refId", String(refId));

    return this.http.post<any>(
      `${this.GatewayApiUrlPrefix}/transaction/get_execute_loan_transaction_template`,
      httpParams
    );
  }

  getTransactionHistoryByClientId(clientId: string): Observable<any> {
    let httpParams = this.commonHttpParams.getCommonHttpParams();

    httpParams = httpParams.set("clientId", clientId);

    return this.http.post<any>(`${this.GatewayApiUrlPrefix}/transaction/get_list_transaction_by_client`, httpParams);
  }

  updateCardTrackingState(updateData: any): Observable<any> {
    const expiredDateString = `${updateData.dueDay}/${updateData.expiredDateString?.substring(
      0,
      2
    )}/${updateData.expiredDateString?.substring(2, 4)}`;
    let httpParams = this.commonHttpParams.getCommonHttpParams();
    httpParams = httpParams.set("expiredDate", expiredDateString ? expiredDateString : "");
    httpParams = httpParams.set("refId", updateData.refId);
    httpParams = httpParams.set("note", updateData.note ? updateData.note : "");
    httpParams = httpParams.set("state", updateData.trackingState ? updateData.trackingState : "A");
    httpParams = httpParams.set("dueDay", updateData.dueDay ? updateData.dueDay : "1");
    httpParams = httpParams.set("limit", updateData.limitCard ? updateData.limitCard : "");
    httpParams = httpParams.set("classCard", updateData.classCard ? updateData.classCard : "");
    httpParams = httpParams.set("isHold", updateData.isHold ? "1" : "0");

    return this.http.put<any>(`${this.GatewayApiUrlPrefix}/card/update_card_on_due_day`, httpParams);
  }

  submitTransactionCash(transactionInfo: any): Observable<any> {
    let httpParams = this.commonHttpParams.getCommonHttpParams();
    httpParams = httpParams.set("accountNumber", transactionInfo.identifyClientDto.accountNumber);
    httpParams = httpParams.set("accountBankId", transactionInfo.identifyClientDto.accountBankId);
    httpParams = httpParams.set("accountTypeId", transactionInfo.identifyClientDto.accountTypeId);
    httpParams = httpParams.set("accountCash", transactionInfo.accountCash);
    httpParams = httpParams.set("bNo", transactionInfo.batchNo);
    httpParams = httpParams.set("tid", transactionInfo.traceNo);
    httpParams = httpParams.set("terminalAmount", String(this.formatLong(transactionInfo.terminalAmount)));
    httpParams = httpParams.set("feeRate", transactionInfo.rate);
    httpParams = httpParams.set("toClientId", transactionInfo.clientId);
    httpParams = httpParams.set("feeAmount", transactionInfo.feeAmount);
    httpParams = httpParams.set("cogsRate", transactionInfo.cogsRate);
    httpParams = httpParams.set("cogsAmount", transactionInfo.feeCogs);
    httpParams = httpParams.set("pnlAmount", transactionInfo.feePNL);
    httpParams = httpParams.set("invoiceAmount", String(this.formatLong(transactionInfo.txnAmount)));
    httpParams = httpParams.set("requestAmount", String(this.formatLong(transactionInfo.requestAmount)));
    httpParams = httpParams.set("transferAmount", String(this.formatLong(transactionInfo.txnAmount)));
    httpParams = httpParams.set("bills", transactionInfo.invoiceMapping.listInvoice);
    httpParams = httpParams.set("productId", transactionInfo.productId);
    httpParams = httpParams.set("groupId", transactionInfo.clientDto.groupId);
    httpParams = httpParams.set("customerName", transactionInfo.clientDto.displayName);
    httpParams = httpParams.set("terminalId", transactionInfo.terminalId);
    httpParams = httpParams.set("ext2", transactionInfo.type);
    httpParams = httpParams.set("ext4", transactionInfo.identifierId);

    return this.http.post<any>(`${this.GatewayApiUrlPrefix}/transaction/create_cash_retail_transaction`, httpParams);
  }

  submitTransactionCashFromRollTermTransaction(transactionInfo: any): Observable<any> {
    let httpParams = this.commonHttpParams.getCommonHttpParams();
    httpParams = httpParams.set("accountNumber", transactionInfo.identifyClientDto.accountNumber);
    httpParams = httpParams.set("accountBankId", transactionInfo.identifyClientDto.accountBankId);
    httpParams = httpParams.set("accountTypeId", transactionInfo.identifyClientDto.accountTypeId);
    httpParams = httpParams.set("refid", transactionInfo.refId);
    httpParams = httpParams.set("bNo", transactionInfo.batchNo);
    httpParams = httpParams.set("tid", transactionInfo.traceNo);
    httpParams = httpParams.set("terminalAmount", String(this.formatLong(transactionInfo.terminalAmount)));
    httpParams = httpParams.set("feeRate", transactionInfo.rate);
    httpParams = httpParams.set("feeAmount", transactionInfo.feeAmount);
    httpParams = httpParams.set("cogsRate", transactionInfo.cogsRate);
    httpParams = httpParams.set("cogsAmount", transactionInfo.feeCogs);
    httpParams = httpParams.set("pnlAmount", transactionInfo.feePNL);
    httpParams = httpParams.set("bookingId", transactionInfo.bookingId);
    httpParams = httpParams.set("invoiceAmount", String(this.formatLong(transactionInfo.txnAmount)));
    httpParams = httpParams.set("requestAmount", String(this.formatLong(transactionInfo.requestAmount)));
    httpParams = httpParams.set("transferAmount", String(this.formatLong(transactionInfo.txnAmount)));
    httpParams = httpParams.set("bills", transactionInfo.invoiceMapping.listInvoice);
    httpParams = httpParams.set("productId", transactionInfo.productId);
    httpParams = httpParams.set("customerName", transactionInfo.clientDto.displayName);
    httpParams = httpParams.set("terminalId", transactionInfo.terminalId);

    return this.http.post<any>(
      `${this.GatewayApiUrlPrefix}/transaction/create_retail_cash_from_rollTerm_transaction`,
      httpParams
    );
  }

  submitTransactionRollTerm(transactionInfo: any): Observable<any> {
    let httpParams = this.commonHttpParams.getCommonHttpParams();
    httpParams = httpParams.set("accountNumber", transactionInfo.identifyClientDto.accountNumber);
    httpParams = httpParams.set("accountBankId", transactionInfo.identifyClientDto.accountBankId);
    httpParams = httpParams.set("accountTypeId", transactionInfo.identifyClientDto.accountTypeId);
    httpParams = httpParams.set("accountCash", transactionInfo.accountCash ? transactionInfo.accountCash : "");
    httpParams = httpParams.set("feeRate", transactionInfo.rate);
    httpParams = httpParams.set("toClientId", transactionInfo.clientId);
    httpParams = httpParams.set("requestAmount", String(this.formatLong(transactionInfo.requestAmount)));
    httpParams = httpParams.set("productId", transactionInfo.productId);
    httpParams = httpParams.set("groupId", transactionInfo.clientDto.groupId);
    httpParams = httpParams.set("customerName", transactionInfo.clientDto.displayName);
    httpParams = httpParams.set("ext2", transactionInfo.type);
    httpParams = httpParams.set("BookingInternalDtoListString", transactionInfo.BookingInternalDtoListString);
    httpParams = httpParams.set("ext4", transactionInfo.identifierId);

    if (transactionInfo.accountCash) {
      httpParams = httpParams.set("accountCash", transactionInfo.accountCash);
    }
    return this.http.post<any>(
      `${this.GatewayApiUrlPrefix}/transaction/create_rollTerm_retail_transaction`,
      httpParams
    );
  }

  submitTransactionRollTermOnDialog(transactionInfo: any): Observable<any> {
    let httpParams = this.commonHttpParams.getCommonHttpParams();

    httpParams = httpParams.set("bookingId", transactionInfo.bookingId);
    httpParams = httpParams.set("accountNumber", transactionInfo.panNumber);
    httpParams = httpParams.set("accountBankId", transactionInfo.bankCode);
    httpParams = httpParams.set("accountTypeId", transactionInfo.cardType);
    httpParams = httpParams.set("feeRate", transactionInfo.rate);
    httpParams = httpParams.set("toClientId", transactionInfo.clientId);
    httpParams = httpParams.set("requestAmount", transactionInfo.requestAmount);
    httpParams = httpParams.set("productId", transactionInfo.productId);
    httpParams = httpParams.set("groupId", transactionInfo.groupId);
    httpParams = httpParams.set("customerName", transactionInfo.clientName);
    httpParams = httpParams.set("ext2", transactionInfo.type);
    httpParams = httpParams.set("BookingInternalDtoListString", transactionInfo.BookingInternalDtoListString);
    httpParams = httpParams.set("ext4", transactionInfo.identifierId);

    return this.http.post<any>(
      `${this.GatewayApiUrlPrefix}/transaction/create_rollTerm_retail_transaction`,
      httpParams
    );
  }

  mappingInvoiceWithTransaction(
    accountTypeCode: string,
    accountNumber: string,
    identifierId: string,
    amountTransaction: number,
    terminalId: string
  ): Observable<any> {
    let httpParams = this.commonHttpParams.getCommonHttpParams();
    httpParams = httpParams.set("accountNumber", accountNumber);
    httpParams = httpParams.set("ext4", identifierId);
    httpParams = httpParams.set("AmountMappingInvoice", String(this.formatLong(String(amountTransaction))));
    httpParams = httpParams.set("accountTypeId", accountTypeCode);
    httpParams = httpParams.set("terminalId", terminalId);

    return this.http.post<any>(`${this.GatewayApiUrlPrefix}/transaction/mapping_invoice_transaction`, httpParams);
  }

  getTransaction(payload: { fromDate: string; toDate: string }): Observable<any> {
    let httpParams = this.commonHttpParams.getCommonHttpParams();

    httpParams = httpParams.set("fromDate", payload.fromDate);
    httpParams = httpParams.set("toDate", payload.toDate);

    return this.http.post(`${this.GatewayApiUrlPrefix}/transaction/get_list_pos_transaction`, httpParams);
  }

  getListRollTermTransactionOpenByUserId(payload: {
    fromDate: string;
    toDate: string;
    query: string;
    bankFilter: string;
    createdByFilter: string;
    limit: number;
    offset: number;
  }): Observable<any> {
    let httpParams = this.commonHttpParams.getCommonHttpParams();
    httpParams = httpParams.set("bankFilter", payload.bankFilter == 'ALL' ? "%%" : payload.bankFilter);
    httpParams = httpParams.set("createdByFilter", payload.createdByFilter == 'ALL' ? "%%" : payload.createdByFilter);
    httpParams = httpParams.set("customerSearch", !payload.query ? "%%" : `%${payload.query}%`);
    httpParams = httpParams.set("limit", String(payload.limit));
    httpParams = httpParams.set("offset", String(payload.offset));
    httpParams = httpParams.set("fromDate", payload.fromDate);
    httpParams = httpParams.set("toDate", payload.toDate);

    return this.http.post(`${this.GatewayApiUrlPrefix}/transaction/get_list_pos_transaction_rollterm`, httpParams);
  }

  getListCardOnDueDayByUserId(payload: {
    fromDate: string;
    toDate: string;
    limit: number;
    offset: number;
    statusFilter: string;
    bankName: string;
    query: string;
  }): Observable<any> {
    let httpParams = this.commonHttpParams.getCommonHttpParams();
    httpParams = httpParams.set("query", !payload.query ? `%%` : `%${payload.query}%`);
    httpParams = httpParams.set("agencyName", "%%");
    httpParams = httpParams.set("limit", String(payload.limit));
    httpParams = httpParams.set("offset", String(payload.offset));
    httpParams = httpParams.set("amountTransaction", "%%");
    httpParams = httpParams.set("trackingState", payload.statusFilter === "" ? `%%` : `%${payload.statusFilter}%`);
    httpParams = httpParams.set("createdUser", "%%");
    httpParams = httpParams.set("bankName", payload.bankName === "ALL" ? `%%` : `${payload.bankName}`);
    httpParams = httpParams.set("fromDate", payload.fromDate);
    httpParams = httpParams.set("toDate", payload.toDate);

    return this.http.post(`${this.GatewayApiUrlPrefix}/card/get_list_card_on_due_day`, httpParams);
  }

  getFeeByTerminal(accountTypeCode: string, terminalId: string): Observable<any> {
    let httpParams = this.commonHttpParams.getCommonHttpParams();
    httpParams = httpParams.set("accountTypeId", accountTypeCode);
    httpParams = httpParams.set("terminalId", terminalId);

    return this.http.post<any>(`${this.GatewayApiUrlPrefix}/pos/get_fee_by_terminal`, httpParams);
  }

  checkValidRetailCashTransaction(clientId: string): Observable<any> {
    let httpParams = this.commonHttpParams.getCommonHttpParams();

    httpParams = httpParams.set("clientId", clientId);

    return this.http.post<any>(
      `${this.GatewayApiUrlPrefix}/transaction/check_valid_for_retail_transaction`,
      httpParams
    );
  }

  checkExtraCardInfo(clientId: string, identifierId: string): Observable<any> {
    let httpParams = this.commonHttpParams.getCommonHttpParams();
    httpParams = httpParams.set("userIdentifyId", identifierId);
    httpParams = httpParams.set("userId", clientId);

    return this.http.post<any>(`${this.GatewayApiUrlPrefix}/card/check_extra_card_info`, httpParams);
  }

  checkValidCreateRollTermTransaction(identifierId: string): Observable<any> {
    let httpParams = this.commonHttpParams.getCommonHttpParams();
    httpParams = httpParams.set("documentId", identifierId);

    return this.http.post<any>(`${this.GatewayApiUrlPrefix}/transaction/check_valid_rollTerm_transaction`, httpParams);
  }

  getListTerminalAvailable(amount: number): Observable<any> {
    let httpParams = this.commonHttpParams.getCommonHttpParams();
    httpParams = httpParams.set("amountTransaction", amount.toString());

    return this.http.post<any>(`${this.GatewayApiUrlPrefix}/pos/get_list_terminal_by_office`, httpParams);
  }

  getTransactionTemplate(clientId: string, identifierId: string, transactionId?: string): Observable<any> {
    let httpParams = this.commonHttpParams.getCommonHttpParams();
    httpParams = httpParams.set("identifyId", identifierId);
    httpParams = httpParams.set("clientId", clientId);
    httpParams = httpParams.set("transactionId", !transactionId ? "" : transactionId);

    return this.http.post<any>(`${this.GatewayApiUrlPrefix}/transaction/get_retail_transaction_template`, httpParams);
  }

  getTransactionDetail(transactionId: string): Observable<any> {
    let httpParams = this.commonHttpParams.getCommonHttpParams();
    httpParams = httpParams.set("transactionId", transactionId);

    return this.http.post<any>(`${this.GatewayApiUrlPrefix}/transaction/get_transaction`, httpParams);
  }

  formatLong(value: string) {
    value = String(value);
    const neg = value.startsWith("-");
    value = value.replace(/[^0-9]+/g, "");
    if (neg) {
      value = "-".concat(value);
    }
    return Number(value);
  }

  downloadVoucher(transactionId: string) {
    this.accessToken = JSON.parse(
      sessionStorage.getItem(this.credentialsStorageKey) || localStorage.getItem(this.credentialsStorageKey)
    );
    const url = `${this.environment.GatewayApiUrl}${this.GatewayApiUrlPrefix}/export/download_voucher?id=${transactionId}&accessToken=${this.accessToken.base64EncodedAuthenticationKey}&createdBy=${this.accessToken.userId}`;
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      let a;
      if (xhr.readyState === 4 && xhr.status === 200) {
        a = document.createElement("a");
        a.href = window.URL.createObjectURL(xhr.response);
        a.download = `V_${transactionId}`;
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
      }
    };

    xhr.open("GET", url);
    if (this.environment.isNewBillPos) {
      xhr.setRequestHeader("Gateway-TenantId", this.environment.GatewayTenantId);
    }
    xhr.responseType = "blob";
    xhr.send();
  }

  downloadBill(clientId: string, documentId: string) {
    this.accessToken = JSON.parse(
      sessionStorage.getItem(this.credentialsStorageKey) || localStorage.getItem(this.credentialsStorageKey)
    );
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      let a;
      if (xhttp.readyState === 4 && xhttp.status === 200) {
        a = document.createElement("a");
        a.href = window.URL.createObjectURL(xhttp.response);
        a.download = "bill_" + clientId + "_" + documentId;
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
      }
    };
    const fileUrl =
      this.environment.GatewayApiUrl +
      `${this.environment.apiProvider}${this.environment.apiVersion}/clients/` +
      clientId +
      "/documents/" +
      documentId +
      `/attachment?tenantIdentifier=${this.environment.fineractPlatformTenantId}`;
    xhttp.open("GET", fileUrl);
    xhttp.setRequestHeader("Authorization", "Bearer " + this.accessToken.base64EncodedAuthenticationKey);
    xhttp.responseType = "blob";
    xhttp.send();
  }

  revertTransaction(transactionId: string): Observable<any> {
    let httpParams = this.commonHttpParams.getCommonHttpParams();
    httpParams = httpParams.set("transactionId", transactionId);

    return this.http.post<any>(`${this.GatewayApiUrlPrefix}/transaction/revert_transaction`, httpParams);
  }

  RepaymentRolltermManualTransactionCloseLoan(refId: string, amountPaid: string): Observable<any> {
    let httpParams = this.commonHttpParams.getCommonHttpParams();
    httpParams = httpParams.set("txnCode", refId);
    httpParams = httpParams.set("amountPaid", amountPaid);

    return this.http.post<any>(
      `${this.GatewayApiUrlPrefix}/transaction/repayment_rollterm_manual_transaction_close_loan`,
      httpParams
    );
  }

  undoRevertTransaction(transactionId: string): Observable<any> {
    let httpParams = this.commonHttpParams.getCommonHttpParams();
    httpParams = httpParams.set("transactionId", transactionId);

    return this.http.post<any>(`${this.GatewayApiUrlPrefix}/transaction/undo_revert_transaction`, httpParams);
  }

  uploadBosInformation(transId: string, payload: { traceNo: string; batchNo: string }): Observable<any> {
    let httpParams = this.commonHttpParams.getCommonHttpParams();
    httpParams = httpParams.set("traceNo", payload.traceNo);
    httpParams = httpParams.set("batchNo", payload.batchNo);
    httpParams = httpParams.set("transId", transId);

    return this.http.post<any>(`${this.GatewayApiUrlPrefix}/transaction/update_pending_transaction`, httpParams);
  }

  getExportExcelFile(url: string) {
    const httpOptions = {
      responseType: "blob" as "json",
      headers: new HttpHeaders({
        "Gateway-TenantId": this.environment.GatewayTenantId,
      }),
    };

    return this.http.get(url, httpOptions);
  }

  exportTransactionForPartner(query: string) {
    this.accessToken = JSON.parse(
      sessionStorage.getItem(this.credentialsStorageKey) || localStorage.getItem(this.credentialsStorageKey)
    );
    // tslint:disable-next-line:max-line-length
    const fileUrl = `${this.environment.GatewayApiUrl}${this.environment.GatewayApiUrlPrefix}/export/export_transaction_partner?ext5=ALL&typeExport=transaction&accessToken=${this.accessToken.base64EncodedAuthenticationKey}&createdBy=${this.accessToken.userId}&${query}`;
    this.getExportExcelFile(fileUrl).subscribe((data: any) => {
      const downloadURL = window.URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = downloadURL;
      link.download = "V_transaction_partner.xlsx";
      link.click();
    });
  }

  exportTransaction(query: string) {
    this.accessToken = JSON.parse(
      sessionStorage.getItem(this.credentialsStorageKey) || localStorage.getItem(this.credentialsStorageKey)
    );
    // tslint:disable-next-line:max-line-length
    const fileUrl = `${this.environment.GatewayApiUrl}${this.environment.GatewayApiUrlPrefix}/export/export_transaction?ext5=ALL&typeExport=transaction&accessToken=${this.accessToken.base64EncodedAuthenticationKey}&createdBy=${this.accessToken.userId}&${query}`;
    this.getExportExcelFile(fileUrl).subscribe((data: any) => {
      const downloadURL = window.URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = downloadURL;
      link.download = "V_transaction.xlsx";
      link.click();
    });
  }
  exportTransactionBatch(batchNo: string) {
    // tslint:disable-next-line:max-line-length
    const fileUrl = `${this.environment.GatewayApiUrl}${this.environment.GatewayApiUrlPrefix}/export/pre_export_batch_transaction?ext5=ALL&typeExport=transaction&accessToken=${this.accessToken.base64EncodedAuthenticationKey}&createdBy=${this.accessToken.userId}&batchNo=${batchNo}`;
    this.getExportExcelFile(fileUrl).subscribe((data: any) => {
      const downloadURL = window.URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = downloadURL;
      link.download = `batch_${batchNo}_transactions_.xlsx`;
      link.click();
    });
  }
  getFeePaidTransactions(fromDate: string, toDate: string): Observable<any> {
    let httpParams = this.commonHttpParams.getCommonHttpParams();

    httpParams = httpParams.set("fromDate", fromDate);
    httpParams = httpParams.set("toDate", toDate);

    return this.http.post<any>(
      `${this.GatewayApiUrlPrefix}/transaction/get_list_fee_transaction_on_range_date`,
      httpParams
    );
  }

  getPaymentTypes(): Observable<any> {
    let httpParams = this.commonHttpParams.getCommonHttpParams();

    return this.http.post<any>(`${this.GatewayApiUrlPrefix}/common/get_list_payment`, httpParams);
  }

  getFeePaidTransactionByTnRefNo(trnRefNo: string): Observable<any> {
    let httpParams = this.commonHttpParams.getCommonHttpParams();

    httpParams = httpParams.set("trnRefNo", trnRefNo);

    return this.http.post<any>(
      `${this.GatewayApiUrlPrefix}/savingTransaction/get_list_fee_transaction_by_trn_ref_no`,
      httpParams
    );
  }

  paidFeeForTransaction(form: any): Observable<any> {
    let httpParams = this.commonHttpParams.getCommonHttpParams();

    const keys = Object.keys(form);
    for (const key of keys) {
      if (key.includes("amount")) {
        httpParams = httpParams.set(key, String(Number(form[key])));
      } else {
        httpParams = httpParams.set(key, form[key]);
      }
    }
    return this.http.post<any>(`${this.GatewayApiUrlPrefix}/savingTransaction/paid_fee_for_transaction`, httpParams);
  }

  exportTransactionFeePaid(transactions: string) {
    this.accessToken = JSON.parse(
      sessionStorage.getItem(this.credentialsStorageKey) || localStorage.getItem(this.credentialsStorageKey)
    );
    const { permissions, officeId } = this.accessToken;
    const permit = permissions.includes("TXN_CREATE");

    // tslint:disable-next-line:max-line-length
    const fileUrl = `${this.environment.GatewayApiUrl}${
      this.environment.GatewayApiUrlPrefix
    }/export/download_export_transaction_fee_paid?
    accessToken=${this.accessToken.base64EncodedAuthenticationKey}
    &permission=${!permit}
    &createdBy=${this.accessToken.userId}&transactionList=${transactions}`;

    this.getExportExcelFile(fileUrl).subscribe((data: any) => {
      const downloadURL = window.URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = downloadURL;
      link.download = "F_transaction.xlsx";
      link.click();
    });
  }

  getListFeeSavingTransaction(txnCode: string): Observable<any> {
    let httpParams = this.commonHttpParams.getCommonHttpParams();
    httpParams = httpParams.set("tranRefNo", txnCode);

    return this.http.post<any>(
      `${this.GatewayApiUrlPrefix}/savingTransaction/get_list_fee_saving_transaction`,
      httpParams
    );
  }

  revertFeeByResourceId(txnSavingResource: string): Observable<any> {
    let httpParams = this.commonHttpParams.getCommonHttpParams();
    httpParams = httpParams.set("resourceId", txnSavingResource);

    return this.http.post<any>(`${this.GatewayApiUrlPrefix}/savingTransaction/revert_fee_transaction`, httpParams);
  }

  getBatchTransactions(batchTxnName: string): Observable<any> {
    let httpParams = this.commonHttpParams.getCommonHttpParams();
    httpParams = httpParams.set("batchTxnName", batchTxnName);

    return this.http.post<any>(`${this.GatewayApiUrlPrefix}/transaction/get_list_batch_transaction`, httpParams);
  }

  getMembersInGroup(groupId: string): Observable<any> {
    let httpParams = this.commonHttpParams.getCommonHttpParams();
    httpParams = httpParams.set("groupId", groupId);

    return this.http.post<any>(`${this.GatewayApiUrlPrefix}/groups/get_list_member_group`, httpParams);
  }

  getMembersAvailableGroup(groupId: string): Observable<any> {
    let httpParams = this.commonHttpParams.getCommonHttpParams();
    httpParams = httpParams.set("groupId", groupId);

    return this.http.post<any>(`${this.GatewayApiUrlPrefix}/groups/get_list_member_group_with_identifier`, httpParams);
  }

  checkValidTransactionBtach(clientId: string): Observable<any> {
    let httpParams = this.commonHttpParams.getCommonHttpParams();
    httpParams = httpParams.set("clientId", clientId);

    return this.http.post<any>(`${this.GatewayApiUrlPrefix}/transaction/check_valid_for_batch_transaction`, httpParams);
  }

  checkExtraCardTransactionBatch(userId: string, userIdentifyId: string): Observable<any> {
    let httpParams = this.commonHttpParams.getCommonHttpParams();
    httpParams = httpParams.set("userId", userId);
    httpParams = httpParams.set("userIdentifyId", userIdentifyId);

    return this.http.post<any>(`${this.GatewayApiUrlPrefix}/card/check_extra_card_info`, httpParams);
  }

  getTransactionGroupFee(groupId: string): Observable<any> {
    let httpParams = this.commonHttpParams.getCommonHttpParams();
    httpParams = httpParams.set("groupId", groupId);

    return this.http.post<any>(
      `${this.GatewayApiUrlPrefix}/savingTransaction/get_fee_transaction_by_Group`,
      httpParams
    );
  }

  onSaveTransactionBatch(form: any): Observable<any> {
    let httpParams = this.commonHttpParams.getCommonHttpParams();

    const keys = Object.keys(form);
    for (const key of keys) {
      httpParams = httpParams.set(key, form[key]);
    }
    return this.http.post<any>(
      `${this.GatewayApiUrlPrefix}/transaction/store_single_batch_pos_transaction`,
      httpParams
    );
  }
  makeFeeOnAdvanceExecute(form: any): Observable<any> {
    let httpParams = this.commonHttpParams.getCommonHttpParams();

    const keys = Object.keys(form);
    for (const key of keys) {
      httpParams = httpParams.set(key, form[key]);
    }
    return this.http.post<any>(
      `${this.GatewayApiUrlPrefix}/savingTransaction/paid_fee_advance_transaction`,
      httpParams
    );
  }
  getListTransExistingOfBatch(batchTxnName: string): Observable<any> {
    let httpParams = this.commonHttpParams.getCommonHttpParams();

    httpParams = httpParams.set("batchTxnName", batchTxnName);

    return this.http.post<any>(`${this.GatewayApiUrlPrefix}/transaction/get_list_batch_transaction`, httpParams);
  }

  getDocumentTemplate(): Observable<any> {
    let httpParams = this.commonHttpParams.getCommonHttpParams();

    return this.http.post<any>(`${this.GatewayApiUrlPrefix}/common/get_document_templates`, httpParams);
  }

  addIdentifierBatch(clientId: string, listIdentifier: string): Observable<any> {
    let httpParams = this.commonHttpParams.getCommonHttpParams();

    httpParams = httpParams.set("clientId", clientId);
    httpParams = httpParams.set("listIdentifier", listIdentifier);
    return this.http.post<any>(`${this.GatewayApiUrlPrefix}/client/add_identifier`, httpParams);
  }

  getIdentifierTypeCC(clientId: string): Observable<any> {
    let httpParams = this.commonHttpParams.getCommonHttpParams();
      httpParams = httpParams.set("clientId", clientId);

    return this.http.post<any>(`${this.GatewayApiUrlPrefix}/client/get_identifier_midas_by_client_group`, httpParams);
  }
}
