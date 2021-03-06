import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
 
import { ActivatedRoute } from '@angular/router';
import { TerminalsService} from './terminals.service';
import { TerminalObj} from './terminal-obj.model';
@Component({
  selector: 'midas-terminals',
  templateUrl: './terminals.component.html',
  styleUrls: ['./terminals.component.scss']
})
export class TerminalsComponent implements OnInit, AfterViewInit {
  //@ViewChild('showClosedTerminals', { static: true }) showClosedTerminals: MatCheckbox;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  viewTerminals = new FormControl('viewTerminals');
  displayedColumns =  ['terminalNo', 'terminalCode', 'terminalName', 'minFeeDefault', 'status', 'createdBy','createdDate','updatedDate'];
  

  dataSource = new MatTableDataSource<any>();
  dataSourceDefault:any;
  terminalsData: TerminalObj[] = [];
  terminalsDataActive: TerminalObj[] = [];
  terminalsDataInActive: TerminalObj[] = [];
  constructor(private terminalsService: TerminalsService) {}

  ngOnInit(): void {
     
    this.terminalsService.getTerminals().subscribe((data: any) => {
      data.result.listPos.forEach((i: any) =>{
          let terminalObj = new TerminalObj(
            i.terminalId,
            i.terminalCode,
            i.terminalName,
            i.status,
            i.createdBy,
            i.createdDate,
            i.updatedDate,
            i.minFeeDefault);
          this.terminalsData.push(terminalObj);
        });
      this.terminalsDataActive = this.terminalsData.filter(function(item) {
          return item.status == 'Active';
      })
      this.terminalsDataInActive = this.terminalsData.filter(function(item) {
        return item.status !== 'Active';
    })
      this.dataSource.data = this.terminalsDataActive;
      //this.dataSourceDefault = this.terminalsData;
    });

  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    //this.changeShowClosedTerminals(this.showClosedTerminals.checked);
  }
  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.dataSource.filter = filterValue;
  }
  changeShowClosedTerminals(isActive:boolean){
    
    if(isActive){
      this.dataSource.data = this.terminalsDataInActive;
    }else{
      this.dataSource.data = this.terminalsDataActive;
    }
     
  }
  
}
