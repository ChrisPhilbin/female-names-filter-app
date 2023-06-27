/*
salesReps: {
  "carmen morrow": {
    activities: [

    ]
  },
  "gil gruwer": {
    activities: [

    ]
  }
}
*/

export interface IRecap {
  [salesRepName: string]: {
    allActivities: IActivity[];
  };
}

interface IActivity {
  activityId: number;
  accountId: string;
  contactId: string;
  accountName: string;
  prospectName: string;
  prospectTitle: string;
  activitySubject: string;
  activityType: string;
  activityNotes: string;
  salesRepName: string;
}

/*
recap = {
  salesReps: [
    {
      salesRepName: "Carmen Morrow",
      allActivities: [
        {
          "accountId": 1,
          "accountName": "ABC Company",
          "prospectName": "Samantha Smith",
          "prospectTitle": "Director of HR",
          "activitySubject" "[Spoke No Interest]",
          "activityType": "[Cold Call]",
          "salesRepName": "Carmen Morrow"
        }
      ]
    }
  ]
}


formattedRecap = {
  "carmen morrow": {
    allActivities: [
      {
        
      }
    ]
  }
}

*/
