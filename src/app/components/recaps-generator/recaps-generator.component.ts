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

  ngOnInit(): void {
    document.title = this.title;
    document.body.style.backgroundColor = '#F8F8F8';
    this.displayModal = true;
  }

  displayModal: boolean = false;
  title = 'BDR Recap Generator';
  canClick: boolean = false;
  hasErrors: boolean = false;
  isConverting: boolean = false;
  tableHeader: string[][] = [];
  hasFormattedRecap: boolean = false;
  formattedRecap = [];
  columns = {
    accountNameColumn: null,
    prospectNameColumn: null,
    prospectTitleColum: null,
    commentsColumn: null,
    subjectColumn: null,
    activityTypeColumn: null,
    salesRepColum: null,
    activityIdColumn: null,
  };

  generateRecap() {
    this.hasErrors = false;

    let input: HTMLInputElement = <HTMLInputElement>(
      document.getElementById('recapFile')
    );
    if (!input) {
      this.throwError(
        'No recap file provided. Please make sure you select a valid recap file!'
      );
    }

    readXlsxFile(input.files[0])
      .then((rows) => {
        rows.forEach((row: string[], rowIndex = 0) => {
          if (rowIndex === 0) {
            row.forEach((cell: string, cellIndex: number) => {
              this.setupHeaders(cell, cellIndex);
            });
          } else {
            if (
              !this.columns.accountNameColumn ||
              !this.columns.prospectNameColumn ||
              !this.columns.prospectTitleColum ||
              !this.columns.subjectColumn ||
              !this.columns.activityTypeColumn ||
              !this.columns.commentsColumn ||
              !this.columns.salesRepColum ||
              !this.columns.activityIdColumn
            ) {
              this.throwError(
                'The provided file does not have the proper table headers.'
              );
              return;
            }

            let repIndex = this.formattedRecap.findIndex((recap) => {
              return recap.salesRep === row[this.columns.salesRepColum];
            });
            if (repIndex === -1) {
              this.formattedRecap.push({
                id: `recap-id-${rowIndex}`,
                salesRep: row[this.columns.salesRepColum],
                allActivities: {
                  meetings: row[this.columns.subjectColumn].includes('Meeting')
                    ? [this.createActivityObject(row)]
                    : [],
                  spokes:
                    row[this.columns.subjectColumn].includes(
                      '[Spoke No Interest]'
                    ) ||
                    row[this.columns.subjectColumn].includes('Other') ||
                    row[this.columns.subjectColumn].includes('Call Back')
                      ? [this.createActivityObject(row)]
                      : [],
                  emailResponses: row[this.columns.subjectColumn].includes(
                    '[In]'
                  )
                    ? [this.createActivityObject(row)]
                    : [],
                  profiling: row[this.columns.subjectColumn].includes(
                    '[Profiling]'
                  )
                    ? [this.createActivityObject(row)]
                    : [],
                  rsvps: row[this.columns.subjectColumn].includes('RSVP')
                    ? [this.createActivityObject(row)]
                    : [],
                  other: [],
                },
              });
            } else {
              if (row[this.columns.subjectColumn].includes('Meeting')) {
                this.formattedRecap[repIndex].allActivities.meetings.push(
                  this.createActivityObject(row)
                );
              } else if (
                row[this.columns.subjectColumn].includes(
                  '[Spoke No Interest]'
                ) ||
                row[this.columns.subjectColumn].includes('Other') ||
                row[this.columns.subjectColumn].includes('Call Back')
              ) {
                this.formattedRecap[repIndex].allActivities.spokes.push(
                  this.createActivityObject(row)
                );
              } else if (row[this.columns.subjectColumn].includes('[In]')) {
                this.formattedRecap[repIndex].allActivities.emailResponses.push(
                  this.createActivityObject(row)
                );
              } else if (
                row[this.columns.subjectColumn].includes('[Profiling]')
              ) {
                this.formattedRecap[repIndex].allActivities.profiling.push(
                  this.createActivityObject(row)
                );
              } else if (row[this.columns.subjectColumn].includes('RSVP')) {
                this.formattedRecap[repIndex].allActivities.rsvps.push(
                  this.createActivityObject(row)
                );
              } else {
                this.formattedRecap[repIndex].allActivities.other.push(
                  this.createActivityObject(row)
                );
              }
            }
          }
        });
      })
      .then(() => {
        console.log(this.formattedRecap, 'formatted recap.');
        this.hasFormattedRecap = true;
      })
      .catch((error) => {
        console.log(error, 'Something went wrong.');
        this.throwError('Something unexpected happened. Please try again.');
      });
  }

  setupHeaders(cell: string, cellIndex: number): void {
    if (cell.toUpperCase() === 'COMPANY / ACCOUNT') {
      this.columns.accountNameColumn = cellIndex;
    }

    if (cell.toUpperCase() === 'NAME') {
      this.columns.prospectNameColumn = cellIndex;
    }

    if (cell.toUpperCase() === 'TITLE') {
      this.columns.prospectTitleColum = cellIndex;
    }

    if (cell.toUpperCase() === 'COMMENTS') {
      this.columns.commentsColumn = cellIndex;
    }

    if (cell.toUpperCase() === 'SUBJECT') {
      this.columns.subjectColumn = cellIndex;
    }

    if (cell.toUpperCase() === 'ACTIVITY TYPE') {
      this.columns.activityTypeColumn = cellIndex;
    }

    if (cell.toUpperCase() === 'ACCOUNT OWNER') {
      this.columns.salesRepColum = cellIndex;
    }

    if (cell.toUpperCase() === 'ACTIVITY ID') {
      this.columns.activityIdColumn = cellIndex;
    }
  }

  createActivityObject(activityRow) {
    return {
      accountName: activityRow[this.columns.accountNameColumn],
      prospectName: activityRow[this.columns.prospectNameColumn],
      prospectTitle: activityRow[this.columns.prospectTitleColum],
      activitySubject: activityRow[this.columns.subjectColumn],
      activityComments: activityRow[this.columns.commentsColumn],
      activityType: activityRow[this.columns.activityTypeColumn],
      activityId: activityRow[this.columns.activityIdColumn],
      salesRep: activityRow[this.columns.salesRepColum],
    };
  }

  copyRecapToClipboard(recapId: string, repName: string): void {
    const recapToCopy = document.getElementById(recapId).innerHTML;
    const listener = (e) => {
      e.clipboardData.setData('text/html', recapToCopy);
      e.clipboardData.setData('text/plain', recapToCopy);
      e.preventDefault();
    };

    document.addEventListener('copy', listener);
    document.execCommand('copy');
    document.removeEventListener('copy', listener);

    this.messageService.add({
      severity: 'success',
      summary: 'Success!',
      detail: `Copied recap for ${repName} to the clipboard!`,
    });
  }

  formatEmailResponse(emailBody: string, activityId: string): string {
    emailBody = emailBody.slice(0, 200) + ``;
    return (
      emailBody + `.... <a href="${activityId}"><b>Link to full email</b></a>`
    );
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
}
