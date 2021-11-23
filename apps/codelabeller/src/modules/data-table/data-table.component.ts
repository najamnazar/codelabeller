import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { InputText } from 'primeng/inputtext';
import { Table } from 'primeng/table';
import { DataTransformPipe } from './data-transform.pipe';
import { NestedFieldPipe } from './nested-field.pipe';
import { TableColumn } from './table-column.interface';

type DataTableRecord = {
  [key in number | string]: any;
}

@Component({
  selector: 'codelabeller-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent {
  @ViewChild(InputText) inputText!: InputText; // Search box element

  private _columns: TableColumn[] = [];
  private _data: DataTableRecord[] = [];
  private _originalData: DataTableRecord[] = [];

  @Input() title!: string;
  @Input() isLoading = false;
  @Input() emptyMessage = 'No data.';
  @Input() enableDataDownload = true;
  @Input() downloadFileName = 'My_CodeLabeller_Responses';
  @Input() enableActionButton = true;
  @Input() actionButtonIcon = "fa fa-external-link-alt";
  @Input() actionButtonColumnLabel = "Action";
  @Input() dataName = 'records';
  @Input()
  set columns(newColumns: TableColumn[]) {
    this._columns = newColumns;
    this.updateTableData(this._data);
  }

  get columns() {
    return this._columns;
  }

  @Input()
  set data(newData: DataTableRecord[]) {
    this.updateTableData(newData);
  }

  get data() {
    return this._data;
  }


  @Output() clickedRow = new EventEmitter<any>();

  constructor(private nestedFieldPipe: NestedFieldPipe, private dataTransformPipe: DataTransformPipe) { }

  onActionButtonClicked(dataRow: DataTableRecord) {
    const index = this._data.indexOf(dataRow);
    this.clickedRow.emit(this._data[index]);
  }

  clear(datatable: Table) {
    datatable.reset();

    this.inputText.el.nativeElement.value = '';
    datatable.filterGlobal('', 'contains');
  }

  private updateTableData(newData: DataTableRecord[]) {
    // Nothing to do if there are either no columns or no data.
    if (!this.columns || !newData || newData.length === 0) {
      this._data = newData;
      return;
    }

    // Maps a column name to a transformation function.
    const transformColumns: { [key: string]: (dtp: DataTransformPipe, nfp: NestedFieldPipe, data: DataTableRecord) => string } = {};

    // Go through each column.
    for (const col of this.columns) {
      transformColumns[col.field] = function (dtp: DataTransformPipe, nfp: NestedFieldPipe, data: DataTableRecord) {
        return dtp.transform(nfp.transform(data, col), col.dataTransformer);
      };
    }

    // Go through each data row
    const transformedData = [];
    for (const row of newData) {
      const transformedRow: DataTableRecord = {};
      for (const key of Array.from(new Set([...Object.keys(row), ...Object.keys(transformColumns)]))) {
        const transformFunction = transformColumns[key];

        if (transformFunction instanceof Function) {
          transformedRow[key] = (transformFunction(this.dataTransformPipe, this.nestedFieldPipe, row));
        } else {
          transformedRow[key] = row[key];
        }
      }
      transformedData.push(transformedRow);
    }

    this._data = transformedData;
    this._originalData = newData;
  }
}
