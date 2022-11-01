import { Component, OnInit } from '@angular/core';
import readXlsxFile from 'read-excel-file';
import writeXlsxFile from 'write-excel-file';
import { femaleNames, maleNames } from '../../util/names';
import { getFormattedDate } from '../../util/dateGenerator';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-prospect-names-filter',
  templateUrl: './prospect-names-filter.component.html',
  styleUrls: ['./prospect-names-filter.component.scss'],
  providers: [MessageService],
})
export class ProspectNamesFilterComponent implements OnInit {
  title = 'Filter Prospect Names';
  hasErrors: boolean = false;
  isConverting: boolean = false;
  tableHeader: string[][] = [];
  canClick: boolean = false;
  displayModal: boolean = false;
  selectedSex: string = '';

  constructor(private messageService: MessageService) {}

  ngOnInit(): void {
    this.displayModal = true;
    document.title = 'Prospect Names Filter';
  }

  throwError(message: string) {
    this.isConverting = false;
    this.hasErrors = true;
    this.messageService.add({
      severity: 'error',
      summary: 'Something went wrong!',
      detail: message,
    });
  }

  generateTableHeader(tableHeader): string[] {
    let headerRow = [];
    tableHeader.forEach((row) => {
      row.forEach((cell) => {
        let tempCell = {
          value: cell,
          fontWeight: 'bold',
        };
        headerRow.push(tempCell);
      });
    });
    return headerRow;
  }

  generateTableRows(row): string[] {
    let tempRow = [];
    row.forEach((cell) => {
      let tempCell = {
        value: cell,
      };
      tempRow.push(tempCell);
    });
    return tempRow;
  }

  handleClick() {
    this.isConverting = true;
    this.hasErrors = false;
    let input: HTMLInputElement = <HTMLInputElement>(
      document.getElementById('prospectFile')
    );
    let namesArr = [];
    let firstNameColumn: number;
    let contactIdColumn: number;
    let emailColumn: number;
    let newArr = [];
    let filter;

    if (!this.selectedSex) {
      this.throwError('Please selected male or female');
      throw new Error('Sex was not selected from dropdown element');
    }

    this.selectedSex === 'female'
      ? (filter = femaleNames)
      : (filter = maleNames);

    if (!input.files[0]) {
      this.throwError('Must include file to convert!');
    }

    readXlsxFile(input.files[0])
      .then((rows) => {
        rows.forEach((row: string[], rowIndex = 0) => {
          if (rowIndex === 0) {
            this.tableHeader.push(row);
            row.forEach((cell: string, cellIndex) => {
              if (cell.toUpperCase() === 'FIRST NAME') {
                firstNameColumn = cellIndex;
              }

              if (cell.toUpperCase() === 'CONTACT ID') {
                contactIdColumn = cellIndex;
              }

              if (cell.toUpperCase() === 'EMAIL') {
                emailColumn = cellIndex;
              }
            });

            if (!firstNameColumn) {
              this.throwError('Unable to detect First Name column.');
            }

            if (!contactIdColumn && !emailColumn) {
              this.throwError('Missing either Contact ID or Email column');
            }
          } else {
            if (
              row[firstNameColumn] &&
              filter.includes(row[firstNameColumn].toUpperCase())
            ) {
              namesArr.push(row);
            }
          }
        });
      })
      .then(() => {
        if (!this.hasErrors) {
          newArr.push(this.generateTableHeader(this.tableHeader));
          namesArr.forEach((row) => {
            let tempRow = this.generateTableRows(row);
            newArr.push(tempRow);
          });
          //@ts-ignore
          writeXlsxFile(newArr, {
            fileName: `filtered_list_${
              this.selectedSex
            }_names_${getFormattedDate()}.xlsx`,
            dateFormat: 'mm/dd/yyyy',
          });
          this.isConverting = false;
        } else {
          this.throwError('Something went wrong!');
        }
      })
      .catch((error) => {
        this.throwError('Something unexpected went wrong!');
        throw new Error(error);
      });
  }
}
