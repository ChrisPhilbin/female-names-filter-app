import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RecapService {
  constructor() {}

  sfdcBaseUrl = 'https://ukgsf.lightning.force.com/lightning/r';

  private keyWords = {
    meeting: ['meeting'],
    spoke: ['spoke', 'call'],
    email: ['email', 'linkedin'],
    profiling: ['profiling'],
    rsvp: ['rsvp'],
    other: [],
  };

  isActivityAMeeting(activity: string): boolean {
    return this.keyWords.meeting.some((word) => {
      return activity.toLowerCase().includes(word);
    });
  }

  isActivityASpoke(activity: string): boolean {
    return this.keyWords.spoke.some((word) => {
      return activity.toLowerCase().includes(word);
    });
  }

  isActivityAEmail(activity: string): boolean {
    return this.keyWords.email.some((word) => {
      return activity.toLowerCase().includes(word);
    });
  }

  isActivityAProfile(activity: string): boolean {
    return this.keyWords.profiling.some((word) => {
      return activity.toLowerCase().includes(word);
    });
  }

  isActivityARsvp(activity: string): boolean {
    return this.keyWords.rsvp.some((word) => {
      return activity.toLowerCase().includes(word);
    });
  }
}
