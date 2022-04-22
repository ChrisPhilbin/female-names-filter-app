import { Component, OnInit } from '@angular/core';
import readXlsxFile from 'read-excel-file';
import writeXlsxFile from 'write-excel-file';
import { femaleNames } from './util/names';
import { getFormattedDate } from './util/dateGenerator';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [MessageService],
})
export class AppComponent implements OnInit {
  title = 'Identify Female Names';
  hasErrors: boolean = false;
  isConverting: boolean = false;
  tableHeader: string[][] = [];
  canClick: boolean = false;
  displayModal: boolean = false;

  constructor(private messageService: MessageService) {}

  ngOnInit(): void {
    this.displayModal = true;
  }

  throwError(message: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Something went wrong!',
      detail: message,
    });
  }

  enableButton() {
    this.canClick = true;
  }

  handleClick() {
    this.isConverting = true;
    this.hasErrors = false;
    let input: HTMLInputElement = <HTMLInputElement>(
      document.getElementById('prospectFile')
    );
    let femaleNamesArr = [];
    let firstNameColumn: number;
    let contactIdColumn: number;
    let emailColumn: number;
    let newArr = [];

    if (!input.files[0]) {
      this.throwError('Must include file to convert!');
      this.isConverting = false;
      this.hasErrors = true;
      throw new Error('No file provided.');
    }

    readXlsxFile(input.files[0])
      .then((rows) => {
        rows.forEach((row: string[], rowIndex = 0) => {
          if (rowIndex === 0) {
            this.tableHeader.push(row);
            row.forEach((cell: string, cellIndex) => {
              console.log(cell, 'current header cell');
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
              this.hasErrors = true;
              this.isConverting = false;
              this.throwError('Unable to detect First Name column.');
              throw new Error('First Name column not found!');
            }

            if (!contactIdColumn && !emailColumn) {
              this.hasErrors = true;
              this.isConverting = false;
              this.throwError('Missing either Contact ID or Email column');
              throw new Error(
                'Spreadsheet must either have contactId or prospect email field!'
              );
            }
          } else {
            if (
              row[firstNameColumn] &&
              femaleNames.includes(row[firstNameColumn].toUpperCase())
            ) {
              femaleNamesArr.push(row);
            }
          }
        });
      })
      .then(() => {
        if (!this.hasErrors) {
          let headerRow = [];
          this.tableHeader.forEach((row) => {
            row.forEach((cell) => {
              let tempCell = {
                value: cell,
                fontWeight: 'bold',
              };
              headerRow.push(tempCell);
            });
          });
          newArr.push(headerRow);
          femaleNamesArr.forEach((row) => {
            let tempRow = [];
            row.forEach((cell) => {
              let tempCell = {
                value: cell,
              };
              tempRow.push(tempCell);
            });
            newArr.push(tempRow);
          });
          //@ts-ignore
          writeXlsxFile(newArr, {
            fileName: `WIB_Filtered_List_${getFormattedDate()}.xlsx`,
            dateFormat: 'mm/dd/yyyy',
          });
          this.isConverting = false;
        } else {
          this.hasErrors = true;
          this.isConverting = false;
          this.throwError('Something went wrong!');
          throw new Error('Something unexpected went wrong!');
        }
      })
      .catch((error) => {
        this.hasErrors = true;
        this.isConverting = false;
        this.throwError('Something unexpected went wrong!');
        throw new Error(error);
      });
  }
}
