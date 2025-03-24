import { StudyUser } from 'src/app/models/StudyUser';
import { DataTableFormat } from '../data-table/data-table.component';
import { DateTime } from 'luxon';
import { CrowdsourcedUser } from 'src/app/models/User';
import { ParticipantData } from 'src/app/models/ParticipantData';
import { TaskType } from 'src/app/models/enums';

// golang sets this as its default value for null dates.
export const NULL_DATE = '0001-01-01T00:00:00Z';

// returns the dateTime or null if invalid
// checks regex, we expect dates of the form: 2020-12-30T03:13:235Z
export function isExpectedDateFormat(date: string): boolean {
    if (!date || typeof date !== 'string') return false;
    const regex = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d/;
    return regex.test(date);
}

// pass by reference, so the object will be updated - no need to return anything
export function formatDateForDataRow(row: { [key: string]: any }) {
    for (let [key, value] of Object.entries(row)) {
        if (key === 'dueDate') {
            // TODO: make a more extensible check in the future rather than just
            // hard coding the value. If we change dueDate to due_date for example, we will
            // have to change this hard coded string
            row[key] = row[key].time;
        }

        if (value === NULL_DATE) {
            // for null date values, golang maps it as 0001-01-01T00:00:00Z from the backend. We
            // want to translate this to NONE so it's more user friendly
            row[key] = 'NONE';
        } else if (isExpectedDateFormat(value)) {
            const dt: DateTime = DateTime.fromISO(value as string);
            row[key] = dt.toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS);
        }
    }
}

// takes json and checks if it is a valid date. If so, it will replace the given UTC date
// with a human readable local date
export function formatDates(dataRows: DataTableFormat[]): DataTableFormat[] {
    dataRows.forEach((data) => {
        formatDateForDataRow(data.fields);
        data.expandable.forEach((expandableRow) => {
            formatDateForDataRow(expandableRow);
        });
    });
    return dataRows;
}

export function formatDate(dateTime: string): string {
    if (isExpectedDateFormat(dateTime)) {
        const dt: DateTime = DateTime.fromISO(dateTime as string);
        return dt.toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS);
    } else {
        return dateTime;
    }
}

export function getStudyUserDataAsDataTableFormat(studyUsers: StudyUser[]): DataTableFormat[] {
    return studyUsers.map((studyUser) => {
        const consentInputs = { ...(studyUser.data || {}) };

        return {
            fields: {
                userId: studyUser.userId,
                studyId: studyUser.studyId,
                completionCode: studyUser.completionCode,
                registerDate: formatDate(studyUser.registerDate),
                dueDate: studyUser.dueDate.Valid ? formatDate(studyUser.dueDate.Time) : 'NONE',
                currentTaskIndex: studyUser.currentTaskIndex,
                hasAcceptedConsent: studyUser.hasAcceptedConsent,
                lang: studyUser.lang,
                ...consentInputs,
            },
            expandable: [],
        };
    });
}

export function getCrowdsourcedUserDataAsDataTableFormat(crowdsourcedUsers: CrowdsourcedUser[]): DataTableFormat[] {
    let crowdsourcedUsersDataTable: DataTableFormat[] = crowdsourcedUsers.map((data) => {
        return {
            fields: {
                ...data,
            },
            expandable: [],
        };
    });
    crowdsourcedUsersDataTable = formatDates(crowdsourcedUsersDataTable);
    return crowdsourcedUsersDataTable;
}

export function getParticipantDataAsDataTableFormat(
    participantData: ParticipantData[],
    taskType: TaskType
): DataTableFormat[] {
    let dataTableFormat: DataTableFormat[] = [];

    if (taskType === TaskType.QUESTIONNAIRE) {
        dataTableFormat = participantData.map((data) => {
            // if it's a questionnaire, only the first element in the array is populated
            // so grab the keys
            return {
                fields: {
                    userId: data.userId,
                    studyId: data.studyId,
                    taskOrder: data.taskOrder,
                    submittedAt: data.submittedAt,
                    participantType: data.participantType,
                    ...data.data[0],
                },
                expandable: [],
            };
        });
    } else {
        dataTableFormat = participantData.map((data) => {
            return {
                fields: {
                    userId: data.userId,
                    studyId: data.studyId,
                    taskOrder: data.taskOrder,
                    submittedAt: data.submittedAt,
                    participantType: data.participantType,
                    ...data.metadata,
                },
                expandable: [...data.data],
            };
        });
    }

    dataTableFormat = formatDates(dataTableFormat);
    return dataTableFormat;
}
