/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { TransactionService } from './transaction.service';
/** Custom Services */
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { ChangePasswordDialogComponent } from 'app/shared/change-password-dialog/change-password-dialog.component';
import { UserService } from 'app/self-service/users/user.service';
import { formatCurrency } from '@angular/common';
/** Custom Models */
import { Alert } from '../core/alert/alert.model';

/** Custom Services */
import { AlertService } from '../core/alert/alert.service';
/**
 * transaction Component.
 */
@Component({
  selector: 'mifosx-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.scss']
})
export class TransactionComponent implements OnInit {

  transactionInfo: any = {};
  terminalFee: any = {};

  /**
   * @param {AuthenticationService} authenticationService Authentication Service
   * @param {UserService} userService Users Service
   * @param {Router} router Router
   * @param {MatDialog} dialog Mat Dialog
   */
  constructor(private authenticationService: AuthenticationService,
              private userService: UserService,
              private router: Router,
              private transactionService: TransactionService,
              public dialog: MatDialog,
              private alertService: AlertService,
              ) {

  }

  ngOnInit() {

    this.transactionService.getTransactionTemplate('148','249' ).subscribe((data: any) =>{
     this.transactionInfo = data.result;
     this.transactionInfo.productId = 'CA01';
     this.transactionInfo.type = 'cash';
     this.transactionInfo.clientId = '148';
     this.transactionInfo.identifierId = '249';
     this.transactionInfo.accountCash = data.result.listAccAccount[0].documentKey;
     });
  }
  clearInfoTransaction(){
    this.transactionInfo.listTerminal = [];
    this.transactionInfo.txnAmount = "";
    this.transactionInfo.terminalAmount = "";
    this.transactionInfo.terminalId = "";
    this.transactionInfo.feeAmount = "";
    this.transactionInfo.txnAmountAfterFee = "";
    if (this.transactionInfo.requestAmount && this.transactionService.formatLong(this.transactionInfo.requestAmount) > 0){
    this.getTerminalListEnoughBalance(this.transactionInfo.requestAmount);
    }
  }
  changeAmountTransaction() {
    this.clearInfoTransaction();
  }

  getTerminalListEnoughBalance(amountTransaction: string){
    let amount =   this.transactionService.formatLong(amountTransaction);
    this.transactionService.getListTerminalAvailable(amount).subscribe((data: any) =>{
      this.transactionInfo.listTerminal = data.result.listTerminal;
    });
  }

  calculateFeeTransaction(){
    if (this.transactionInfo.terminalAmount != 0 && this.transactionInfo.rate != 0) {

      let amount_value = this.transactionInfo.terminalAmount;
      var rate = this.transactionInfo.rate;
      this.transactionInfo.cogsRate = this.terminalFee.cogsRate ;
      this.transactionInfo.feeAmount = (this.transactionService.formatLong(amount_value) * (Number(rate) / 100)).toFixed(0);
      this.transactionInfo.feeGet = (this.transactionService.formatLong(amount_value) * (Number(rate) / 100)).toFixed(0)

      if (
        this.transactionInfo.productId == 'CA01' &&
        this.transactionService.formatLong(this.transactionInfo.feeAmount) < this.terminalFee.minFeeDefault)
        {
        this.transactionInfo.feeAmount = this.terminalFee.minFeeDefault;
        this.transactionInfo.feeGet = this.terminalFee.minFeeDefault;
        }
      this.transactionInfo.feeCogs = (this.transactionService.formatLong(amount_value) * Number(this.transactionInfo.cogsRate) / 100).toFixed(0);
      this.transactionInfo.feePNL = this.transactionService.formatLong(this.transactionInfo.feeAmount) - this.transactionService.formatLong(this.transactionInfo.feeCogs);
      this.transactionInfo.txnAmountAfterFee = this.transactionService.formatLong(amount_value) - this.transactionInfo.feeAmount;
    }
  }

  mappingBillForTransaction(){
    this.transactionInfo.identifyClientDto.identifyId = "249";
    this.transactionService.mappingInvoiceWithTransaction(
      this.transactionInfo.identifyClientDto.accountTypeId,
      this.transactionInfo.identifyClientDto.accountNumber,
      this.transactionInfo.identifyClientDto.identifyId,
      this.transactionInfo.requestAmount,
      this.transactionInfo.terminalId
       )
       .subscribe((data: any) =>{
      this.transactionInfo.invoiceMapping = data.result;
      this.transactionInfo.txnAmount = this.formatCurrency(data.result.amountTransaction);
      this.transactionInfo.terminalAmount = this.formatCurrency(data.result.amountTransaction);
      this.calculateFeeTransaction();
    });
  }

  getFeeByTerminal(){
    this.transactionService.getFeeByTerminal(this.transactionInfo.identifyClientDto.accountTypeId, this.transactionInfo.terminalId).subscribe((data: any) =>{
      this.terminalFee = data.result.feeTerminalDto;
      // call mapping bill for this transaction
      this.mappingBillForTransaction();

    });
  }

  submitTransaction(){
    this.transactionService.submitTransaction(this.transactionInfo).subscribe((data: any) =>{
      this.transactionInfo.transactionId = data.result.id;
      this.transactionInfo.transactionRefNo = data.result.tranRefNo;
      if (this.transactionInfo.type != "rollTerm") {
        // $("#downloadVoucher").css("display", "inline");
        // $("#uploadBill").css("display", "inline");
      }
      this.alertService.alert({ type: 'Create Transaction Success', message: `Tạo giao dịch ${this.transactionInfo.transactionRefNo} thành công!` });
      this.transactionInfo.requestAmount = "";
      this.transactionInfo.batchNo = "";
      this.transactionInfo.traceNo = "";
      this.clearInfoTransaction();
    });
  }

  formatCurrency(value: string){
      value = String(value) ;
      const neg = value.startsWith('-');
      value = value.replace(/[-\D]/g,'');
      value = value.replace(/(\d{3})$/, ',$1');
      value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
      value = value != ''?''+value:'';
      if(neg) value = '-'.concat(value);

      return value;
  }
}
