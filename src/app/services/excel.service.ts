import { Injectable } from "@angular/core";
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

@Injectable({
    providedIn: "root"
})
export class ExcelService {

    private EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    private EXCEL_EXTENSION = ".xlsx";
    private NULL_DATE = "0001-01-01T00:00:00Z";

    exportAsExcel(json: any[], excelFileName: string): void {
        this._cleanUpDate(json);
        
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json)
        const workbook: XLSX.WorkBook = {
            Sheets: {"data": worksheet},
            SheetNames: ['data']
        }

        const excelBuffer: any = XLSX.write(workbook, {bookType: 'xlsx', type: 'array'})

        this._saveAsExcelFile(excelBuffer, excelFileName)
    }

    private _saveAsExcelFile(buffer: any, fileName: string): void {
        const data: Blob = new Blob([buffer], {type: this.EXCEL_TYPE})
        FileSaver.saveAs(data, fileName + this.EXCEL_EXTENSION)
    }

    // For null date values, we get 0001-01-01T00:00:00Z from the backend. We want to translate
    // this to "NONE".
    private _cleanUpDate(json: any[]) {
        json.forEach(obj => {
            for(let [key, value] of Object.entries(obj)) {
                if(value === this.NULL_DATE) obj[key] = "NONE";
            }
        })
    }
}