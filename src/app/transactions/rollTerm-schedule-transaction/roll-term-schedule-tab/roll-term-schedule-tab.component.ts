import { animate, state, style, transition, trigger } from "@angular/animations";
import { DatePipe } from "@angular/common";
import { Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { CentersService } from "app/centers/centers.service";
import { AlertService } from "app/core/alert/alert.service";
import { AuthenticationService } from "app/core/authentication/authentication.service";
import { SettingsService } from "app/settings/settings.service";
import { ConfirmDialogComponent } from "app/transactions/dialog/coifrm-dialog/confirm-dialog.component";
import { TransactionService } from "app/transactions/transaction.service";
import { merge } from "rxjs";
import { tap } from "rxjs/operators";
import { CreateRollTermScheduleDialogComponent } from "../dialog/create-roll-term-schedule/create-roll-term-schedule-dialog.component";
import { ExecuteLoanDialogComponent } from "../dialog/execute-loan-dialog/execute-loan-dialog.component";
import { RollTermScheduleDialogComponent } from "../dialog/roll-term-schedule/roll-term-schedule-dialog.component";

@Component({
  selector: "midas-roll-term-schedule-tab",
  templateUrl: "./roll-term-schedule-tab.component.html",
  styleUrls: ["./roll-term-schedule-tab.component.scss"],
  animations: [
    trigger("detailExpand", [
      state("collapsed", style({ height: "0px", minHeight: "0" })),
      state("expanded", style({ height: "*" })),
      transition("expanded <=> collapsed", animate("225ms cubic-bezier(0.4, 0.0, 0.2, 1)")),
    ]),
  ],
})
export class RollTermScheduleTabComponent implements OnInit {
  isLoading: boolean = false;
  expandedElement: any;
  displayedColumns: string[] = [
    "panHolderName",
    "feeAmount",
    "createdDate",
    "cardNumber",
    "officeName",
    // "agencyName",
    "requestAmount",
    "paidAmount",
    "remainAmount",
    "txnAmount",
    "waitGetAmount",
    "actions",
  ];
  formDate: FormGroup;
  formFilter: FormGroup;
  dataSource: any[];
  transactionsData: any;
  currentUser: any;
  transactionType: any[] = [
    {
      label: "All",
      value: "",
    },
    {
      label: "Giao dịch RTM",
      value: "CA01",
    },
    {
      label: "Giao dịch ĐHT",
      value: "AL01",
    },
    {
      label: "Giao dịch test thẻ",
      value: "TEST",
    },
    {
      label: "Giao dịch lô lẻ",
      value: "CA02",
    },
  ];
  statusOption: any[] = [
    {
      label: "ALL",
      value: "",
    },
    {
      label: "Thành công",
      value: "C",
    },
    {
      label: "Chờ đợi",
      value: "P",
    },
    // {
    //   label: 'F',
    //   value: 'F'
    // },
    {
      label: "Hủy",
      value: "V",
    },
  ];
  partners: any[];
  staffs: any[];
  offices: any[];
  totalTerminalAmount = 0;
  totalFeeAmount = 0;
  totalCogsAmount = 0;
  totalPnlAmount = 0;
  panelOpenState = false;
  filterData: any[];
  today = new Date();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private formBuilder: FormBuilder,
    private transactionService: TransactionService,
    private datePipe: DatePipe,
    private settingsService: SettingsService,
    private authenticationService: AuthenticationService,
    private alertService: AlertService,
    public dialog: MatDialog
  ) {
    this.formDate = this.formBuilder.group({
      fromDate: [new Date(new Date().setMonth(new Date().getMonth() - 1))],
      toDate: [new Date()],
    });
    this.formFilter = this.formBuilder.group({
      panHolderName: [""],
      terminalAmount: [""],
      staffId: [""],
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authenticationService.getCredentials();
    this.getRollTermScheduleAndCardDueDayInfo();
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngAfterViewInit() {

    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(tap(() => this.getRollTermScheduleAndCardDueDayInfo()))
      .subscribe();
  }

  getRollTermScheduleAndCardDueDayInfo() {
    const dateFormat = this.settingsService.dateFormat;
    let fromDate = this.formDate.get("fromDate").value;
    let toDate = this.formDate.get("toDate").value;
    let clientName = this.formFilter.get("panHolderName").value;
    let cardNumber = this.formFilter.get("panHolderName").value;
    let terminalAmount = this.formFilter.get("terminalAmount").value;
    let staffId = this.formFilter.get("staffId").value;

    const limit = this.paginator.pageSize ? this.paginator.pageSize : 10;
    const offset = this.paginator.pageIndex * limit ? this.paginator.pageSize * limit : 0;
    if (fromDate) {
      fromDate = this.datePipe.transform(fromDate, dateFormat);
    }
    if (toDate) {
      toDate = this.datePipe.transform(toDate, dateFormat);
    }
    this.isLoading = true;
    this.dataSource = [];
    this.transactionService
      .getListRollTermTransactionOpenByUserId({ fromDate, toDate, clientName, cardNumber, limit, terminalAmount, offset })
      .subscribe((result) => {
        this.isLoading = false;
        this.transactionsData = result?.result;
        this.dataSource = result?.result.listPosTransaction;
      });
  }

  get fromDateAndToDate() {
    const fromDate = this.formDate.get("fromDate").value;
    const toDate = this.formDate.get("toDate").value;
    if (fromDate && toDate) {
      return true;
    }
    return false;
  }

  showRollTermScheduleDialog(rollTermId: string) {
    const data = {
      rollTermId: rollTermId,
    };
    const dialog = this.dialog.open(RollTermScheduleDialogComponent, { height: "auto", width: "80%", data });
    dialog.afterClosed().subscribe((response: any) => {
      console.log(response);
      if (response.data) {
        const value = response.data.value;

      }
    });
  }

  executeLoanManualDialog(refId: string) {
    const data = {
      refId: refId,
    };
    const dialog = this.dialog.open(ExecuteLoanDialogComponent, { height: "auto", width: "50%", data });
    dialog.afterClosed().subscribe((response: any) => {
      console.log(response);
      if (response.data) {
        const value = response.data.value;

      }
      this.getRollTermScheduleAndCardDueDayInfo();
    });
  }

  undoRollTermTransaction(transactionId: string, amountPaid: string) {
    const dialog = this.dialog.open(ConfirmDialogComponent, {
      data: {
        message: 'Bạn chắc chắn muốn hủy khoản đáo hạn ' + transactionId,
        title: 'Hủy giao dịch'
      },
    });
    dialog.afterClosed().subscribe(data => {
      if (data) {
        this.transactionService.RepaymentRolltermManualTransactionCloseLoan(transactionId, amountPaid).subscribe(result => {
          if (result.status === '200') {

            const message = 'Hủy giao dịch ' + transactionId + ' thành công';
            this.alertService.alert({
              msgClass: 'cssInfo',
              message: message
            });
            this.getRollTermScheduleAndCardDueDayInfo();
          }else{
            const message = result.error;
            this.alertService.alert({
              msgClass: 'cssDanger',
              message: message
            });
          }
        });
      }
    });
  }
}
