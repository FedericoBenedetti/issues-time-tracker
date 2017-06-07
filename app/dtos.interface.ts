export interface IProjectDTO {
    id: number;
    name: string;
    default_branch: string;
}

export interface IIssueDTO {
    state: string;
    iid: number;
}

export interface ITimeTrackingDTO {
    time_estimate?: number;
    total_time_spent?: number;
}
