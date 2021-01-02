import { Component, Input, OnInit } from '@angular/core';
import { ExcelService } from '../../../../services/excel.service';

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent implements OnInit {

  private _json: any = [];
  touched: boolean = false;
  @Input() set json(jsonInput: any) {
    if(jsonInput) {
      this.touched = true;
      this._json = jsonInput
    }
  }

  @Input() fileName: string = "";

  get json(): any {
    return this._json
  }

  get columnTitles(): string[] {
    if(this.json && Array.isArray(this.json) && this.json.length > 0) {
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
  
  constructor(private excelService: ExcelService) { }

  ngOnInit(): void {    
  }

}
