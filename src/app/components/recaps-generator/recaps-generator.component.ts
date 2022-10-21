import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import readXlsxFile from 'read-excel-file';

@Component({
  selector: 'app-recaps-generator',
  templateUrl: './recaps-generator.component.html',
  styleUrls: ['./recaps-generator.component.scss'],
  providers: [MessageService],
})
export class RecapsGeneratorComponent implements OnInit {
  constructor(private messageService: MessageService) {}

  ngOnInit(): void {}

  title = 'BDR Recap Generator';
  canClick: boolean = false;
  hasErrors: boolean = false;
  isConverting: boolean = false;
  tableHeader: string[][] = [];

  throwError(message: string) {
    this.isConverting = false;
    this.hasErrors = true;
    this.messageService.add({
      severity: 'error',
      summary: 'Something went wrong!',
      detail: message,
    });
  }

  generateRecap() {
    this.hasErrors = false;

    let accountNameColumn: number;
    let prospectNameColumn: number;
    let prospectTitleColum: number;
    let subjectColum: number;
    let activityTypeColumn: number;
    let salesRepColum: number;
    let formattedRecap = {};

    let input: HTMLInputElement = <HTMLInputElement>(
      document.getElementById('recapFile')
    );
    if (!input) {
      this.throwError(
        'No recap file provided. Please make sure you select a valid recap file!'
      );
    }
    return null;

    readXlsxFile(input[0]).then((rows) => {
      rows.forEach((row: string[], rowIndex = 0) => {
        if (rowIndex === 0) {
          //identify columns of created date, account name,
          // prospect name (name), prospect title, comments, subject, rep name (account owner)
          //activity type
          row.forEach((cell: string, cellIndex) => {
            if (cell.toUpperCase() === 'COMPANY / ACCOUNT') {
              accountNameColumn = cellIndex;
            }

            if (cell.toUpperCase() === 'NAME') {
              prospectNameColumn = cellIndex;
            }

            if (cell.toUpperCase() === 'TITLE') {
              prospectTitleColum = cellIndex;
            }

            if (cell.toUpperCase() === 'SUBJECT') {
              subjectColum = cellIndex;
            }

            if (cell.toUpperCase() === 'ACTIVITY TYPE') {
              activityTypeColumn = cellIndex;
            }

            if (cell.toUpperCase() === 'ACCOUNT OWNER') {
              salesRepColum = cellIndex;
            }

            if (
              !accountNameColumn ||
              !prospectNameColumn ||
              !prospectTitleColum ||
              !subjectColum ||
              !activityTypeColumn ||
              !salesRepColum
            ) {
              this.throwError(
                'The provided file does not have the proper table headers.'
              );
            }
          });
        } else {
          //going thru the remainder of the cells
          //AFTER the first one containing headers
          //setup shape of recap object
        }
      });
    });
  }
}
