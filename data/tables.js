// These are all the columns to be anonymized

export default {
    AB_AccountingApp_Account: {
        json: [
            {
                column: "translations",
                property: "Description",
                length: "sentence"
            }
        ]
    },

    AB_AccountingApp_Batch: {
        text: [
            { column: "Note", words: "sentence" }
        ],
    },

    AB_AccountingApp_GLSegment: {
        // has columns to be updated by triggers
    },

    AB_AccountingApp_JEArchive: {
        text: [
            { column: "Description", length: "sentence" }
        ],
    },

    AB_AccountingApp_JournalEntry: {
        text: [
            { column: "Memo", length: "sentence" }
        ],
    },

    AB_AccountingApp_MCC: {
        text: [
            { column: "MCC Name", length: 2 }
        ]
    },

    AB_MyTeamFinance_ResponsibilityCenter: {
        text: [
            { column: "Description", length: 4 }
        ],
        hash: [
            { column: "RC Name", length: 8 },
            { column: "Subaccount Code", length: 8 },
        ],
    },

    AB_Profile_Address: {
        text: [
            { column: "Country", length: 2 },
            { column: "Street Address", length: 4 },
        ]
    },

    AB_Profile_Assignments: {
        // has columns to be updated by triggers
    },

    AB_Profile_City: {
        text: [
            { column: "City Name", length: 3 }
        ]
    },

    AB_Profile_Contact: {
        numbers: [
            { column: "Country Code", length: 2 },
            { column: "Phone Number", length: 10 },
        ]
    },

    AB_Profile_Email: {
        email: [
            { column: "Email" }
        ]
    },

    AB_Profile_EmergencyContact: {
        numbers: [
            { column: "Phone Number", length: 10 },
            { column: "Alt Phone Number", length: 10 },
        ],
        email: [
            { column: "Email" }
        ],
        text: [
            { column: "Address", length: "sentence" },
            { column: "Special Instructions", length: "sentence" },
            { column: "Languages", length: 2 },
        ]
    },

    AB_Profile_Family: {
        date: [
            { column: "Wedding Anniversary" },
        ]
    },

    AB_Profile_InsuranceInformation: {
        name: [
            { column: "Contact Name" },
        ],
        text: [
            { column: "Provider Name", length: 2 },
        ],
        numbers: [
            { column: "Provider Phone", length: 10 },
            { column: "Contact Phone", length: 10 },
        ],
        hash: [
            { column: "Policy Number", length: 10 },
        ],
    },

    AB_Profile_MinistryTeam: {
        text: [
            { column: "Name", length: 3 },
            { column: "Type", length: 1 },
        ]
    },

    AB_Profile_Operations: {
        text: [
            { column: "Ops Title", length: 2 },
        ]
    },

    AB_Profile_Person: {
        name: [
            { column: "Given Name", type: "first" },
            { column: "Surname", type: "last" },
            { column: "Preferred Name", type: "first" },
        ],
        date: [
            { column: "Birth Date" },
            { column: "Death Date" },
        ],
    },

    AB_Profile_SocialMedia: {
        hash: [
            { column: "Handle", length: 7 },
        ]
    },

    AB_Profile_WorkerInformation: {
        date: [
            { column: "Date Joined Staff" },
            { column: "Date Joined Ministry" },
        ],
        hash: [
            { column: "Government ID Number", length: 12 },
            { column: "Hukou", length: 8 },
        ],
        text: [
            { column: "Vocation", length: 3 },
        ]
    },

    SITE_USER: {
        username: [
            { column: "username", skip: ["admin"] },
            { column: "authname", skip: ["admin"] },
        ],
        email: [
            { column: "email" },
        ]
    },

    AB_Course: {
        text: [
            { column: "Course Name", length: 5 },
            { column: "Location", length: 2 }
        ],
        name: [
            { column: "Teacher" }
        ]
    },

    AB_DonationTracking_Advance: {
        text: [
            { column: "Description", length: "sentence" },
            { column: "Reason", length: "sentence" },
        ],
        username: [
            { column: "Approver Request" }, // should be a foreign key
        ]
    },

    AB_DonationTracking_CashAccount: {
        text: [
            { column: "Name", length: 3 }, // should be a trigger
        ]
    },

    AB_DonationTracking_Donations: {
        text: [
            { column: "Description", length: "sentence" },

        ]
    },

    AB_DonationTracking_Donor: {
        name: [
            { column: "First Name", type: "first" },
            { column: "Spouse Name", type: "first" },
        ],
        email: [
            { column: "Email" },
            { column: "WeChat" },
        ],
        numbers: [
            { column: "Phone", length: 10 },
        ],
        text: [
            { column: "Address", length: 6 },
            { column: "City", length: 2 },
            { column: "Province", length: 2 },
            { column: "Countries", length: 2 },
        ],
        json: [
            { column: "translations", property: "Content", length: "sentence" },
        ]
    },

    AB_DonationTracking_ExpenseReport: {
        text: [
            { column: "Title", length: 5 },
            { column: "Rejection Note", length: "sentence" },
        ],
        username: [
            { column: "Approver Request" }, // should be a foreign key
        ]
    },

    AB_DonationTracking_IECategory: {
        text: [
            { column: "Description", length: "sentence" },
        ]
    },

    AB_DonationTracking_ReportItem: {
        text: [
            { column: "Description", length: "sentence" },
            { column: "Note", length: "sentence" },
        ]
    },

    AB_ExpenseSource: {
        text: [
            { column: "Expense Source", length: 6 },
        ]
    },

    AB_Feedback: {
        truncate: true
    },

    AB_IncomeSource: {
        text: [
            { column: "Income Type", length: 3 },
        ]
    },

    AB_LeaveRequest: {
        text: [
            { column: "Reason", length: 5 },
            { column: "TL Rejected Note", length: "sentence" },
            { column: "HR Rejected Note", length: "sentence" },
        ],
        username: [
            { column: "TLApprover" }, // deprecated?
            { column: "HRApprover" }, // deprecated?
        ]
    },

    AB_Moderator: {
        username: [
            { column: "Nickname" }, // should be a trigger?
        ]
    },

    AB_ProjectItems: {
        json: [
            { column: "translations", property: "Why", length: "sentence" },
        ],
        text: [
            { column: "Why", length: "sentence" },
            { column: "Calculation", length: 5 },
        ]
    },

    AB_Projectw: {
        json: [
            { column: "translations", property: "Purpose", length: "sentence" },
        ],
        text: [
            { column: "Date", length: 2 },
            { column: "Project Name", length: 4 },
            { column: "Purpose", length: "sentence" },
        ],
        username: [
            { column: "Approver CAS" }, // should be a foreign key
        ]
    },

    SITE_RELAY_USER: {
        truncate: true
    },

    SITE_RELAY_APPUSER: {
        truncate: true
    },

    SITE_RELAY_REQUEST_QUEUE: {
        truncate: true
    }

}
