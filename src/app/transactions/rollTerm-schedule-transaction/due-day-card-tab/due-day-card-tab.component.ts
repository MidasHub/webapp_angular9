import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MatPaginator} from '@angular/material/paginator';
import {DatePipe} from '@angular/common';
import {MatSort} from '@angular/material/sort';
import {merge} from 'rxjs';
import {tap} from 'rxjs/operators';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {MatDialog} from '@angular/material/dialog';
import {TransactionService} from 'app/transactions/transaction.service';
import {SettingsService} from 'app/settings/settings.service';
import {AuthenticationService} from 'app/core/authentication/authentication.service';
import {CentersService} from 'app/centers/centers.service';
import {AlertService} from 'app/core/alert/alert.service';
import {RollTermScheduleDialogComponent} from '../dialog/roll-term-schedule/roll-term-schedule-dialog.component';
import {CreateRollTermScheduleDialogComponent} from '../dialog/create-roll-term-schedule/create-roll-term-schedule-dialog.component';
import {MatTableDataSource} from '@angular/material/table';

@Component({
  selector: 'midas-due-day-card-transaction',
  templateUrl: './due-day-card-tab.component.html',
  styleUrls: ['./due-day-card-tab.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class DueDayCardTabComponent implements OnInit {
  expandedElement: any;
  displayedColumns: string[] = [
    'panHolderName',
    'phone',
    'cardNumber',
    'bankName',
    'isHold',
    'expiredDate',
    'dueDay',
    'status',
    'actions',
  ];
  isLoading: boolean = false;
  formDate: FormGroup;
  formFilter: FormGroup;
  dataSource: any[];
  transactionsData: any;
  currentUser: any;

  statusOption: any[] = [
    {
      label: 'Khởi tạo',
      value: 'A',
    },
    {
      label: 'Chờ phí',
      value: 'P',
    },
    {
      label: 'Từ chối',
      value: 'R',
    },
    {
      label: 'Đã thu phí',
      value: 'C',
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
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  constructor(
    private formBuilder: FormBuilder,
    private transactionService: TransactionService,
    private datePipe: DatePipe,
    private settingsService: SettingsService,
    private authenticationService: AuthenticationService,
    private centersService: CentersService,
    private alertService: AlertService,
    public dialog: MatDialog
  ) {
    this.formDate = this.formBuilder.group({
      fromDate: [new Date(new Date().setMonth(new Date().getMonth() - 1))],
      toDate: [new Date()],
    });
    this.formFilter = this.formBuilder.group({
      productId: [''],
      status: [''],
      partnerCode: [''],
      officeId: [''],
      panHolderName: [''],
      terminalId: [''],
      traceNo: [''],
      batchNo: [''],
      terminalAmount: [''],
      staffId: [''],
      trnRefNo: [''],
      RetailsChoose: [true],
      wholesaleChoose: [true],
      agencyName: [''],
    });
    this.formFilter.get('officeId').valueChanges.subscribe((value) => {
      // const office = this.offices.find(v => v.name === value);
      this.centersService.getStaff(value).subscribe((staffs: any) => {
        this.staffs = staffs?.staffOptions;
      });
    });
    this.formFilter.valueChanges.subscribe((value) => {
      this.getRollTermScheduleAndCardDueDayInfo();
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authenticationService.getCredentials();
    //this.dataSource = this.transactionsData;
    this.getRollTermScheduleAndCardDueDayInfo();
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(tap(() => this.getRollTermScheduleAndCardDueDayInfo()))
      .subscribe();
  }

  displayCardStatusId(type: string) {
    return this.statusOption.find(v => v.value === type)?.label || 'N/A';
  }

  getRollTermScheduleAndCardDueDayInfo() {

    const dateFormat = this.settingsService.dateFormat;
    let fromDate = this.formDate.get('fromDate').value;
    let toDate = this.formDate.get('toDate').value;
    let clientName = null;
    let cardNumber = null;
    const limit = this.paginator.pageSize ? this.paginator.pageSize : 10;
    const offset = this.paginator.pageIndex * limit;
    if (fromDate) {
      fromDate = this.datePipe.transform(fromDate, dateFormat);
    }
    if (toDate) {
      toDate = this.datePipe.transform(toDate, dateFormat);
    }
    this.dataSource = [];
    this.isLoading = true;
    this.transactionService
      .getListCardOnDueDayByUserId({fromDate, toDate, clientName, cardNumber, limit, offset})
      .subscribe((result) => {
        this.isLoading = false;
        this.transactionsData = result?.result;
        this.dataSource = result?.result.lisCardTransactionTracking;
      });
  }

  get fromDateAndToDate() {
    const fromDate = this.formDate.get('fromDate').value;
    const toDate = this.formDate.get('toDate').value;
    if (fromDate && toDate) {
      return true;
    }
    return false;
  }

  menuOpened() {
    console.log('menuOpened');
  }

  menuClosed() {
    console.log('menuClosed');
  }

  showRollTermScheduleDialog(rollTermId: string) {
    const data = {
      rollTermId: rollTermId,
    };
    const dialog = this.dialog.open(RollTermScheduleDialogComponent, {height: 'auto', width: '80%', data});
    dialog.afterClosed().subscribe((response: any) => {
      console.log(response);
      if (response.data) {
        const value = response.data.value;

      }
    });
  }

  showCreateRollTermScheduleDialog(clientId: string, panHolderName: string, identifierId: string, panNumber: string) {
    const data = {
      clientId: clientId,
      panHolderName: panHolderName,
      panNumber: panNumber,
      identifierId: identifierId,
    };
    const dialog = this.dialog.open(CreateRollTermScheduleDialogComponent, {height: 'auto', width: '80%', data});
    dialog.afterClosed().subscribe((response: any) => {
      console.log(response);
      if (response.data) {
        const value = response.data.value;

      }
    });
  }
}
