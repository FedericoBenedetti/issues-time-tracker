import { Issue } from "./issue";
import { Data } from "./data";

export class Project {
    public id?: number;
    public name?: string;
    public default_branch?: string;
    public pjIssues: Issue[];
    public nActive: number = 0;
    public nClosed: number = 0;
    public arrayTimeEstimated: number [] = [];
    public arrayTimeSpent: number[] = [];
    public totalTimeEstimated = 0;
    public totalTimeSpent = 0;
}
