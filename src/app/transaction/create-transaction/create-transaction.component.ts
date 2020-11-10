/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute,  Router } from '@angular/router';
import { AlertService } from 'app/core/alert/alert.service';
import { TransactionService } from '../transaction.service';


/**
 * transaction Component.
 */
@Component({
  selector: 'midas-create-transaction',
  templateUrl: './create-transaction.component.html',
  styleUrls: ['./create-transaction.component.scss']
})
export class CreateTransactionComponent implements OnInit {


  transactionInfo: any = {};
  terminalFee: any = {};
  isLoading = false;
  /**
   * @param {AuthenticationService} authenticationService Authentication Service
   * @param {UserService} userService Users Service
   * @param {Router} router Router
   * @param {MatDialog} dialog Mat Dialog
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private transactionService: TransactionService,
    public dialog: MatDialog,
    private alertService: AlertService,
  ) {

  }

  ngOnInit() {

    this.route.queryParamMap
    .subscribe((params: any) => {
      const clientId = params.get("clientId");
      const identifierId = params.get("identifierId");
      const type = params.get("type");
      this.isLoading = true;
      this.transactionService.getTransactionTemplate(clientId, identifierId).subscribe((data: any) => {
        this.isLoading = false;
        this.transactionInfo = data.result;
        this.transactionInfo.isDone = false;
        this.transactionInfo.productId = (type == 'cash'? 'CA01':'AL01');
        this.transactionInfo.type = type;
        this.transactionInfo.identifierId = identifierId;
        this.transactionInfo.clientId = clientId;
        this.transactionInfo.accountCash = data.result.listAccAccount[0].documentKey;
      });
    });
  }

  clearInfoTransaction() {
    this.transactionInfo.listTerminal = [];
    this.transactionInfo.txnAmount = '';
    this.transactionInfo.terminalAmount = '';
    this.transactionInfo.terminalId = '';
    this.transactionInfo.feeAmount = '';
    this.transactionInfo.txnAmountAfterFee = '';
    if (this.transactionInfo.requestAmount
      && this.transactionService.formatLong(this.transactionInfo.requestAmount) > 0)
      {
      this.getTerminalListEnoughBalance(this.transactionInfo.requestAmount);
      }
  }

  changeAmountTransaction() {
    this.clearInfoTransaction();
  }

  getTerminalListEnoughBalance(amountTransaction: string) {
    const amount = this.transactionService.formatLong(amountTransaction);
    this.transactionService.getListTerminalAvailable(amount).subscribe((data: any) => {
      this.transactionInfo.listTerminal = data.result.listTerminal;
    });
  }

  calculateFeeTransaction() {
    if (this.transactionInfo.terminalAmount !== 0 && this.transactionInfo.rate !== 0) {

      const amount_value = this.transactionInfo.terminalAmount;
      const rate = this.transactionInfo.rate;
      this.transactionInfo.cogsRate = this.terminalFee.cogsRate;
      this.transactionInfo.feeAmount = (this.transactionService.formatLong(amount_value) * (Number(rate) / 100)).toFixed(0);
      this.transactionInfo.feeGet = (this.transactionService.formatLong(amount_value) * (Number(rate) / 100)).toFixed(0);

      if (
        this.transactionInfo.productId === 'CA01' &&
        this.transactionService.formatLong(this.transactionInfo.feeAmount) < this.terminalFee.minFeeDefault) {
        this.transactionInfo.feeAmount = this.terminalFee.minFeeDefault;
        this.transactionInfo.feeGet = this.terminalFee.minFeeDefault;
      }
      this.transactionInfo.feeCogs = (this.transactionService.formatLong(amount_value) * Number(this.transactionInfo.cogsRate) / 100).toFixed(0);
      this.transactionInfo.feePNL = this.transactionService.formatLong(this.transactionInfo.feeAmount) - this.transactionService.formatLong(this.transactionInfo.feeCogs);
      this.transactionInfo.txnAmountAfterFee = this.transactionService.formatLong(amount_value) - this.transactionInfo.feeAmount;
    }
  }

  mappingBillForTransaction() {
    this.transactionInfo.identifyClientDto.identifyId = '249';
    this.transactionService.mappingInvoiceWithTransaction(
      this.transactionInfo.identifyClientDto.accountTypeId,
      this.transactionInfo.identifyClientDto.accountNumber,
      this.transactionInfo.identifyClientDto.identifyId,
      this.transactionInfo.requestAmount,
      this.transactionInfo.terminalId
    )
      .subscribe((data: any) => {
        if (data.status != 200) {
          debugger;

          if (data.statusCode == 401) {
            if (data.error == 'Unauthorize with Midas') {
              this.alertService.alert({
                message: 'Phiên làm việc hết hạn vui lòng đăng nhập lại để tiếp tục',
                msgClass: 'cssDanger',
                hPosition: 'center'
              });
            }
          }

          if (data.statusCode == 666) {
            if (typeof data.error !== 'undefined' && data.error !== '') {

              this.alertService.alert({
                message: `Chú Ý: Giao dịch không vượt hạn mức : ${this.formatCurrency(data.error)} VNĐ`,
                msgClass: 'cssDanger',
                hPosition: 'center'
              });
            }
          } else {
            this.alertService.alert({
              message: `Lỗi xảy ra : Vui lòng liên hệ ITSupport. ERROR: ${data}`,
              msgClass: 'cssDanger',
              hPosition: 'center'
            });
          }
          return;
        }
        if (typeof data.result.caution != 'undefined' && data.result.caution != 'NaN') {
          this.alertService.alert({message: data.result.caution, msgClass: 'cssDanger', hPosition: 'center'});
        }
        this.transactionInfo.invoiceMapping = data.result;
        this.transactionInfo.txnAmount = this.formatCurrency(data.result.amountTransaction);
        this.transactionInfo.terminalAmount = this.formatCurrency(data.result.amountTransaction);
        this.calculateFeeTransaction();
      });
  }

  onchangeRateAndCheckValidRate() {
    if (this.transactionInfo.rate == null || String(this.transactionInfo.rate).length === 0) {
      return;
    }

    if (parseFloat(this.transactionInfo.rate) < parseFloat(this.terminalFee.minRate) ||
      parseFloat(this.transactionInfo.rate) > parseFloat(this.terminalFee.maxRate)) {
      this.transactionInfo.rate = this.terminalFee.maxRate;
      this.calculateFeeTransaction();
      this.alertService.alert({
        message: `Tỉ lệ phí không được thấp hơn ${this.terminalFee.maxRate} và cao hơn ${this.terminalFee.minRate} !`,
        msgClass: 'cssDanger',
        hPosition: 'center'
      });
    } else {

      this.calculateFeeTransaction();
    }
  }

  getFeeByTerminal(): any {
    this.transactionService.getFeeByTerminal(this.transactionInfo.identifyClientDto.accountTypeId, this.transactionInfo.terminalId).subscribe((data: any) => {
      this.terminalFee = data.result.feeTerminalDto;
      this.onchangeRateAndCheckValidRate();
      // call mapping bill for this transaction
      this.mappingBillForTransaction();

    });
  }

  downloadVoucherTransaction() {
    this.transactionService.downloadVoucher(this.transactionInfo.transactionId);
  }

  submitTransaction() {
    this.transactionService.submitTransaction(this.transactionInfo).subscribe((data: any) => {
      this.transactionInfo.transactionId = data.result.id;
      this.transactionInfo.transactionRefNo = data.result.tranRefNo;
      this.transactionInfo.isDone = true;
      this.alertService.alert({
        message: `Tạo giao dịch ${this.transactionInfo.transactionRefNo} thành công!`,
        msgClass: 'cssSuccess',
        hPosition: 'center'
      });
      this.transactionInfo.requestAmount = '';
      this.transactionInfo.batchNo = '';
      this.transactionInfo.traceNo = '';
      this.clearInfoTransaction();
    });
  }

  formatCurrency(value: string) {
    value = String(value);
    const neg = value.startsWith('-');
    value = value.replace(/[-\D]/g, '');
    value = value.replace(/(\d{3})$/, ',$1');
    value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    value = value !== '' ? '' + value : '';
    if (neg) {
      value = '-'.concat(value);
    }

    return value;
  }

}