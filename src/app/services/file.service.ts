import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { DataTableFormat } from '../pages/admin/admin-dashboard/data/data-table/data-table.component';
import { SnackbarService } from './snackbar/snackbar.service';

@Injectable({
    providedIn: 'root',
})
export class FileService {
    constructor(private snackbarService: SnackbarService) {}

    // private EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    private JSON_TYPE = 'text/plain;charset=UTF-8';
    // private EXCEL_EXTENSION = '.xlsx';
    private JSON_EXTENSION = '.json';
    private CSV_EXTENSION = '.csv';

    // exportAsExcel(tableData: DataTableFormat[], excelFileName: string): void {
    //     const excelFormattedTableData = tableData.reduce((acc, curVal) => {
    //         return acc.concat([{ ...curVal.fields }, ...curVal.expandable]);
    //     }, []);

    //     const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelFormattedTableData);

    //     const workbook: XLSX.WorkBook = {
    //         Sheets: { data: worksheet },
    //         SheetNames: ['data'],
    //     };

    //     const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    //     this._saveAsExcelFile(excelBuffer, excelFileName);
    // }

    exportAsCSV(tableData: DataTableFormat[], csvFileName: string): void {
        const sheetFormattedTableData = tableData.reduce((acc, curVal) => {
            return acc.concat([{ ...curVal.fields }, ...curVal.expandable]);
        }, []);

        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(sheetFormattedTableData);
        const workbook: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet);
        XLSX.writeFile(workbook, `${csvFileName}${this.CSV_EXTENSION}`, { bookType: 'csv' });
    }

    exportAsJSONFile(json: { [key: string]: any }, fileName: string) {
        try {
            const stringifiedJSON = JSON.stringify(json);
            const blob = new Blob([stringifiedJSON], { type: this.JSON_TYPE });
            FileSaver.saveAs(blob, fileName + this.JSON_EXTENSION);
        } catch (e) {
            this.snackbarService.openErrorSnackbar('there was an issue downloading the JSON file');
        }
    }

    // private _saveAsExcelFile(buffer: any, fileName: string): void {
    //     const data: Blob = new Blob([buffer], { type: this.EXCEL_TYPE });
    //     FileSaver.saveAs(data, fileName + this.EXCEL_EXTENSION);
    // }
}
