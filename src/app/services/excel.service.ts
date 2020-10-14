import { Injectable } from "@angular/core";
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

@Injectable({
    providedIn: "root"
})
export class ExcelService {

    private EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    private EXCEL_EXTENSION = ".xlsx";

    exportAsExcel(json: any, excelFileName: string): void {
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
}