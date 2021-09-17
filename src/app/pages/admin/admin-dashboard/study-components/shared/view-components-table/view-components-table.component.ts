import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

export interface ViewComponentsTableModel<T> {
    tableConfig: {
        columnHeader: string;
        columnKey: string;
    }[];
    tableData: T[];
    msgOnEmpty: string;
    tableTitle: string;
}

@Component({
    selector: 'app-view-components-table',
    templateUrl: './view-components-table.component.html',
    styleUrls: ['./view-components-table.component.scss'],
})
export class ViewComponentsTableComponent<T> implements OnInit {
    @Input()
    data: ViewComponentsTableModel<T>;

    @Output()
    rowRun: EventEmitter<T> = new EventEmitter();

    get rowData(): T[] {
        return this.data?.tableData || [];
    }

    get tableTitle(): string {
        return this.data?.tableTitle;
    }

    get displayedColumns(): string[] {
        const columnHeaders = this.data.tableConfig.map((x) => x.columnHeader);
        return [...columnHeaders, 'actions'];
    }

    get tableconfig(): { columnHeader: string; columnKey: string }[] {
        return this.data?.tableConfig || [];
    }

    get msgOnEmpty(): string {
        return this.data?.msgOnEmpty || 'No data';
    }

    onSelect(arg: T) {
        this.rowRun.emit(arg);
    }

    constructor() {}

    ngOnInit(): void {}
}
