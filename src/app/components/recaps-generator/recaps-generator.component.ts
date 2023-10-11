import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import readXlsxFile from 'read-excel-file';
import { RecapService } from 'src/app/services/recap/recap.service';

@Component({
  selector: 'app-recaps-generator',
  templateUrl: './recaps-generator.component.html',
  styleUrls: ['./recaps-generator.component.scss'],
  providers: [MessageService],
})
export class RecapsGeneratorComponent implements OnInit {
  constructor(
    private messageService: MessageService,
    public recapService: RecapService
  ) {}

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
  hasUnassignedActivity: boolean = false;
  formattedRecap = [];
  columns = {
    accountNameColumn: null,
    prospectFirstNameColumn: null,
    prospectLastNameColumn: null,
    prospectTitleColum: null,
    commentsColumn: null,
    subjectColumn: null,
    activityTypeColumn: null,
    salesRepColumn: null,
    coOwnerColumn: null,
    activityIdColumn: null,
    accountIdColumn: null,
    contactIdColumn: null,
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
    for (let fileCount = 0; fileCount < input.files.length; fileCount++) {
      readXlsxFile(input.files[fileCount])
        .then((rows) => {
          rows.forEach((row: string[], rowIndex = 0) => {
            if (rowIndex === 0) {
              row.forEach((cell: string, cellIndex: number) => {
                this.setupHeaders(cell, cellIndex);
              });
            } else {
              if (
                !this.columns.accountNameColumn ||
                !this.columns.prospectFirstNameColumn ||
                !this.columns.prospectLastNameColumn ||
                !this.columns.prospectTitleColum ||
                !this.columns.subjectColumn ||
                !this.columns.activityTypeColumn ||
                !this.columns.commentsColumn ||
                !this.columns.salesRepColumn ||
                !this.columns.coOwnerColumn ||
                !this.columns.accountIdColumn ||
                !this.columns.contactIdColumn ||
                !this.columns.activityIdColumn
              ) {
                this.throwError(
                  'The provided file does not have the proper table headers.'
                );
                return;
              }

              let repIndex = this.formattedRecap.findIndex((recap) => {
                //this.columns.salesRepColumn - need to determine when to reference salesRepColumn vs coOwner column
                if (!row[this.columns.coOwnerColumn]) {
                  return recap.salesRep === row[this.columns.salesRepColumn];
                } else {
                  return recap.salesRep === row[this.columns.coOwnerColumn];
                }
              });
              if (repIndex === -1) {
                this.formattedRecap.push({
                  id: `recap-id-${rowIndex}`,
                  salesRep:
                    row[this.columns.coOwnerColumn] !== null
                      ? row[this.columns.coOwnerColumn]
                      : row[this.columns.salesRepColumn],
                  allActivities: {
                    meetings:
                      this.recapService.isActivityAMeeting(
                        row[this.columns.activityTypeColumn]
                      ) ||
                      this.recapService.isActivityAMeeting(
                        row[this.columns.subjectColumn]
                      )
                        ? [this.createActivityObject(row)]
                        : [],
                    spokes:
                      this.recapService.isActivityASpoke(
                        row[this.columns.subjectColumn]
                      ) ||
                      (this.recapService.isActivityASpoke(
                        row[this.columns.subjectColumn]
                      ) &&
                        (this.recapService.isActivityASpoke(
                          row[this.columns.activityTypeColumn]
                        ) ||
                          this.recapService.isActivityASpoke(
                            row[this.columns.activityTypeColumn]
                          )))
                        ? [this.createActivityObject(row)]
                        : [],
                    emailResponses: this.recapService.isActivityAEmail(
                      row[this.columns.subjectColumn]
                    )
                      ? [this.createActivityObject(row)]
                      : [],
                    profiling: this.recapService.isActivityAProfile(
                      row[this.columns.subjectColumn]
                    )
                      ? [this.createActivityObject(row)]
                      : [],
                    rsvps: this.recapService.isActivityARsvp(
                      row[this.columns.subjectColumn]
                    )
                      ? [this.createActivityObject(row)]
                      : [],
                    other: [],
                  },
                });
              } else {
                if (
                  this.recapService.isActivityAMeeting(
                    row[this.columns.subjectColumn]
                  ) ||
                  this.recapService.isActivityAMeeting(
                    row[this.columns.activityTypeColumn]
                  )
                ) {
                  this.formattedRecap[repIndex].allActivities.meetings.push(
                    this.createActivityObject(row)
                  );
                } else if (
                  //update
                  this.recapService.isActivityASpoke(
                    row[this.columns.subjectColumn]
                  ) ||
                  (this.recapService.isActivityASpoke(
                    row[this.columns.subjectColumn]
                  ) &&
                    (this.recapService.isActivityASpoke(
                      row[this.columns.activityTypeColumn]
                    ) ||
                      this.recapService.isActivityASpoke(
                        row[this.columns.activityTypeColumn]
                      )))
                  // row[this.columns.subjectColumn].toLowerCase().includes('spoke')
                ) {
                  this.formattedRecap[repIndex].allActivities.spokes.push(
                    this.createActivityObject(row)
                  );
                } else if (
                  this.recapService.isActivityAEmail(
                    row[this.columns.subjectColumn]
                  )
                ) {
                  this.formattedRecap[
                    repIndex
                  ].allActivities.emailResponses.push(
                    this.createActivityObject(row)
                  );
                } else if (
                  this.recapService.isActivityAProfile(
                    row[this.columns.subjectColumn]
                  )
                ) {
                  this.formattedRecap[repIndex].allActivities.profiling.push(
                    this.createActivityObject(row)
                  );
                } else if (
                  this.recapService.isActivityARsvp(
                    row[this.columns.subjectColumn]
                  )
                ) {
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
          const unassignedActivity = this.formattedRecap.findIndex((recap) => {
            return recap.salesRep === 'New Logo Accounts';
          });
          if (unassignedActivity !== -1) {
            this.hasUnassignedActivity = true;
            this.showSuccess();
          }
          this.hasFormattedRecap = true;
        })
        .catch((error) => {
          console.log(error, 'Something went wrong.');
          this.throwError('Something unexpected happened. Please try again.');
        });
    }
  }

  setupHeaders(cell: string, cellIndex: number): void {
    cell = cell.toUpperCase();
    if (cell === 'ACCOUNT NAME' || cell === 'ASSOCIATED COMPANY') {
      this.columns.accountNameColumn = cellIndex;
    }

    if (cell === 'FIRST NAME') {
      this.columns.prospectFirstNameColumn = cellIndex;
    }

    if (cell === 'LAST NAME') {
      this.columns.prospectLastNameColumn = cellIndex;
    }

    if (cell === 'JOB TITLE') {
      this.columns.prospectTitleColum = cellIndex;
    }

    if (cell === 'FULL COMMENTS') {
      this.columns.commentsColumn = cellIndex;
    }

    if (cell === 'SUBJECT') {
      this.columns.subjectColumn = cellIndex;
    }

    if (cell === 'UKG ACTIVITY TYPE') {
      this.columns.activityTypeColumn = cellIndex;
    }

    if (cell === 'ACCOUNT OWNER' || cell === 'SALES REP') {
      this.columns.salesRepColumn = cellIndex;
    }

    if (cell === 'CO-OWNER' || cell === 'DEFAULT ACCOUNT OWNER') {
      this.columns.coOwnerColumn = cellIndex;
    }

    if (cell === 'ACTIVITY ID') {
      this.columns.activityIdColumn = cellIndex;
    }

    if (cell === 'ACCOUNT ID' || cell === 'ASSOCIATED ACCOUNT ID') {
      this.columns.accountIdColumn = cellIndex;
    }

    if (cell === 'CONTACT ID' || cell === 'LEAD ID') {
      this.columns.contactIdColumn = cellIndex;
    }
  }

  createActivityObject(activityRow) {
    return {
      accountName: activityRow[this.columns.accountNameColumn],
      prospectName:
        activityRow[this.columns.prospectFirstNameColumn] +
        ' ' +
        activityRow[this.columns.prospectLastNameColumn],
      prospectTitle: activityRow[this.columns.prospectTitleColum],
      activitySubject: activityRow[this.columns.subjectColumn],
      activityComments: activityRow[this.columns.commentsColumn],
      activityType: activityRow[this.columns.activityTypeColumn],
      activityId: activityRow[this.columns.activityIdColumn],
      accountId: activityRow[this.columns.accountIdColumn],
      contactId: activityRow[this.columns.contactIdColumn],
      salesRep: activityRow[this.columns.salesRepColumn],
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
      emailBody +
      `.... <a href="${this.recapService.sfdcBaseUrl}/Lead/${activityId}/view" target="_blank"><b>Link to full email</b></a>`
    );
  }

  showSuccess() {
    this.isConverting = false;
    this.messageService.add({
      severity: 'success',
      summary: 'Successfully generated recap!',
      detail:
        'It looks like you have some activities that need to be manually assigned!',
    });
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
