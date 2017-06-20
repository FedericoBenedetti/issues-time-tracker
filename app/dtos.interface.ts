export interface IProjectDTO {
    id: number;
    name: string;
    created_at: string;
    last_activity_at: string;
}

export interface IGroupDTO {
    name: string;
}

export interface IIssueDTO {
    state: string;
    iid: number;
    title?: string;
    created_at?: Date;
}

export interface ITimeTrackingDTO {
    time_estimate?: number;
    total_time_spent?: number;
    human_time_estimate?: Date;
    human_total_time_spent?: string;
}
