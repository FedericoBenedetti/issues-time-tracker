import { Issue } from "./issue";
import { Data } from "./data";

export class Project {
    public id?: number;
    public name?: string;
    public pjIssues?: Issue[] = [];
    public timeOutIssue?: Issue[] = [];
    public nCreated?: number = 0;
    public nClosed?: number = 0;
    public totalTimeEstimated?= 0;
    public totalTimeSpent?= 0;
    public timeEstimated: Data = new Data;
    public timeSpent: Data = new Data;
    public timeOut: number = 0;
    public created_at: Date;
    public last_activity_at: Date;
    public closedFilteredIssue?: Issue[] = [];
}
