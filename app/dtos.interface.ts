export interface IProjectDTO {
    id: number;
    name: string;
}

export interface IIssueDTO {
    state: string;
    iid: number;
    title?: string;
}

export interface ITimeTrackingDTO {
    time_estimate?: number;
    total_time_spent?: number;
    human_time_estimate?: string;
    human_total_time_spent?: string;
}
