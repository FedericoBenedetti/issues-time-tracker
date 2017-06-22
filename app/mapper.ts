import { Component, OnInit } from "@angular/core";

import { Project } from "./project";
import { Issue } from "./issue";
import { Group } from "./group";

import * as DTO from "./dtos.interface";

export class Mapper {

    static grpDROtoGrp(groupDTOs: any): Group[] {
        let GroupArray: Group[] = [];

        groupDTOs.forEach(item => {
            let newGroup: Group = new Group();
            newGroup.name = item.name;
            GroupArray.push(newGroup);
        });

        return GroupArray;
    }

    static pjDTOtoPj(ProjectDTOs: any): Project[] {
        let ProjectArray: Project[] = [];

        ProjectDTOs.forEach(item => {
            let newProject: Project = new Project();
            newProject.name = item.name;
            newProject.id = item.id;
            newProject.created_at = new Date(item.created_at);
            newProject.last_activity_at = new Date(item.last_activity_at);
            ProjectArray.push(newProject);
        });

        return ProjectArray;
    }

    static isDTOtoIs(IssueDTOs: DTO.IIssueDTO[]): Issue[] {
        let issueArray: Issue[] = [];

        IssueDTOs.forEach(item => {
            let newIssue: Issue = new Issue();
            newIssue.state = item.state;
            newIssue.iid = item.iid;
            newIssue.title = item.title;
            newIssue.created_at = new Date(item.created_at);
            newIssue.updated_at = new Date(item.updated_at);
            issueArray.push(newIssue);
        });

        return issueArray;

    }

    static addTimeTracking(issue: Issue, ITimeTrackingDTO: DTO.ITimeTrackingDTO): void {

        issue.time_estimate = ITimeTrackingDTO.time_estimate;
        issue.total_time_spent = ITimeTrackingDTO.total_time_spent;
        return;
    }
}
