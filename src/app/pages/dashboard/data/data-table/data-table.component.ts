import { Component, Input, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ExcelService } from '../../../../services/excel.service';
import { LoaderService } from '../../../../services/loader.service';

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent implements OnInit, AfterViewInit {

  @ViewChild("paginator") paginator: MatPaginator;

  private _json: any = [];
  dataSource: MatTableDataSource<any[]>;
  touched: boolean = false;
  @Input() set json(jsonInput: any) {    
    if(jsonInput) {
      this.dataSource.data = jsonInput
      // this.dataSource = new MatTableDataSource(jsonInput)
      this.touched = true;
      this._json = jsonInput    
    }
  }

  @Input() fileName: string = "";

  get json(): any {
    return this._json
  }

  get columnTitles(): string[] {
    if(this.isValid()) {
      const obj = this.json[0];
      
      return Object.keys(obj);
    }
    return [];
  }

  download() {
    this.excelService.exportAsExcel(this.json, this.fileName)
  }

  isValid(): boolean {    
    return this.json && Array.isArray(this.json) && this.json.length > 0
  }
  
  constructor(private excelService: ExcelService, private loaderService: LoaderService) { }

  ngOnInit(): void {   
    this.dataSource = new MatTableDataSource();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator; 
  }

}
