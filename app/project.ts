import { Issue } from "./issue";

export class Project {
    public id?: number;
    public name?: string;
    public default_branch?: string;
    public pjIssues: Issue[];
    public nActive: number = 0;
    public nClosed: number = 0;
}
