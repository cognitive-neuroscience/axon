import { Injectable } from "@angular/core";
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { DateTime } from 'luxon';

@Injectable({
    providedIn: "root"
})
export class ExcelService {

    private EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    private EXCEL_EXTENSION = ".xlsx";
    private NULL_DATE = "0001-01-01T00:00:00Z";

    exportAsExcel(json: any[], excelFileName: string): void {
        this._formatDates(json);
        
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

    // takes json and checks if it is a valid date. If so, it will replace the given UTC date
    // with a human readable local date
    private _formatDates(json: any[]) {
        json.forEach(obj => {
            for(let [key, value] of Object.entries(obj)) {

                if(value === this.NULL_DATE) {
                    // for null date values, gorm maps it as 0001-01-01T00:00:00Z from the backend. We
                    // want to translate this to NONE so it's more user friendly
                    obj[key] = "NONE";
                } else if(this.isString(value) && this.isDate(value)) {
                    // we want to transform the stored UTC date to our local and make it user friendly
                    const dt: DateTime = DateTime.fromISO(value as string);
                    obj[key] = dt.toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS)
                }
            }
        })
    }

    private isString(value: any): boolean {
        return typeof value === "string";
    }

    // returns the dateTime or null if invalid
    private isDate(date: any): boolean {
        if(!date) return false;
        let x = DateTime.fromISO(date);
        return x.isValid;
    }
}