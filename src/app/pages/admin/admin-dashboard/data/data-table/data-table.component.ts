import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ExcelService } from '../../../../../services/excel.service';
import { LoaderService } from '../../../../../services/loader/loader.service';

export class DataTableFormat {
    fields: {
        [key: string]: any;
    };
    expandable: {
        [key: string]: any;
    }[];
}

@Component({
    selector: 'app-data-table',
    templateUrl: './data-table.component.html',
    styleUrls: ['./data-table.component.scss'],
    animations: [
        trigger('detailExpand', [
            state('collapsed', style({ height: '0px', minHeight: '0' })),
            state('expanded', style({ height: '*' })),
            transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ]),
    ],
})
export class DataTableComponent implements OnInit, AfterViewInit {
    @ViewChild('paginator') paginator: MatPaginator;

    // clicking a row sets this variable to be the current data to be expanded (or resets to null)
    expandedElement: DataTableFormat | null;

    private _tableData: DataTableFormat[];
    dataSource: MatTableDataSource<DataTableFormat>;
    @Input() set tableData(jsonInput: DataTableFormat[]) {
        if (jsonInput) {
            this.dataSource.data = jsonInput;
            this._tableData = jsonInput;
        }
    }

    @Input() fileName: string = '';

    get tableData(): DataTableFormat[] {
        return this._tableData;
    }

    get columnsToDisplay(): string[] {
        if (this.isValid()) {
            return this.tableData[0] ? Object.keys(this.tableData[0].fields) : [];
        } else {
            return [];
        }
    }

    expandableColumnsToDisplay(expandable: { [key: string]: any }[]): string[] {
        if (expandable) {
            return expandable[0] ? Object.keys(expandable[0]) : [];
        } else {
            return [];
        }
    }

    download() {
        this.excelService.exportAsExcel(this.tableData, this.fileName);
    }

    isValid(): boolean {
        return !!this.tableData && this.tableData.length > 0;
    }

    constructor(private excelService: ExcelService, private loaderService: LoaderService) {}

    ngOnInit(): void {
        this.dataSource = new MatTableDataSource();
    }

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
    }
}
