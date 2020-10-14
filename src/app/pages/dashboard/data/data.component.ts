import { Component, OnInit } from '@angular/core';
import { DownloadDataService } from '../../../services/downloadData.service';
import { Observable } from 'rxjs';
import { SessionStorageService } from '../../../services/sessionStorage.service';
import { ExcelService } from 'src/app/services/excel.service';

@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.scss']
})
export class DataComponent implements OnInit {
  selectedTableName: string = ""
  tableNames: Observable<string[]>;

  constructor(
    private _downloadDataService: DownloadDataService, 
    private _sessionStorage: SessionStorageService,
    private excelService: ExcelService
  ) { }

  ngOnInit(): void {
    this.tableNames = this._downloadDataService.tableNames
    this._downloadDataService.updateTableNames()
  }

  downloadFile() {
    const splitSelectedTable = this.selectedTableName.split("_")
    if(splitSelectedTable.length == 4) {
      const experimentCode = splitSelectedTable[1]
      const taskName = splitSelectedTable[3]
      this._downloadDataService.getTableData(experimentCode, taskName).subscribe(data => {
        console.log(data);
        
        this.excelService.exportAsExcel(data, this.selectedTableName)
      })
    }
  }
}
