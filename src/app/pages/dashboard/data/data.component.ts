import { Component, OnInit } from '@angular/core';
import { DownloadDataService } from '../../../services/downloadData.service';
import { Observable } from 'rxjs';
import { SessionStorageService } from '../../../services/sessionStorage.service';
import { ExcelService } from 'src/app/services/excel.service';
import { SnackbarService } from '../../../services/snackbar.service';

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
    private excelService: ExcelService,
    private snackbarService: SnackbarService
  ) { }

  ngOnInit(): void {
    this.tableNames = this._downloadDataService.tableNames;
    this._downloadDataService.updateTableNames();
  }

  downloadFile() {
    const splitSelectedTable = this.selectedTableName.split("_")
    // passed as first argument of url in GET request
    let firstPart = ""
    // passed as a second argument of url in GET request
    let secondPart = ""
    if(splitSelectedTable.length == 2) {
      // in the case of tables like "experiment_user"
      firstPart = splitSelectedTable[0]
      secondPart = splitSelectedTable[1]
    } else if(splitSelectedTable.length == 3) {
      // TODO: refactor this
      // in the case of tables like "mturk_questionnaire_responses"
      firstPart = splitSelectedTable[0]
      secondPart = splitSelectedTable[1]
    } else if(splitSelectedTable.length == 4) {
      // for normal data tables of the form "experiment_<code>_task_<taskname>"
      firstPart = splitSelectedTable[1]
      secondPart =  splitSelectedTable[3]
    }
    this._downloadDataService.getTableData(firstPart, secondPart).subscribe(data => {
      if(!data) {
        this.snackbarService.openErrorSnackbar("Could not get data")
      } else {
        this.excelService.exportAsExcel(data, this.selectedTableName)
      }
    }, err => {
      console.error(err)
      this.snackbarService.openErrorSnackbar("Could not get data")
    })
  }
}
