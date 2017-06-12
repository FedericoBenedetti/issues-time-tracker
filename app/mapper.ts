import { Component, OnInit } from "@angular/core";

import { Project } from "./project";
import { Issue } from "./issue";
import { Group } from "./group";

import * as DTO from "./dtos.interface";

export class Mapper {

    static grpDROtoGrp(groupDTOs: any): Group[] {
        let GroupArray: Group[] = [];
        let i: number = 0;
        groupDTOs.forEach(item => {
            GroupArray[i] = new Group();
            GroupArray[i].name = item.name;
            i++;
        });

        return GroupArray;
    }

    static pjDTOtoPj(ProjectDTOs: any): Project[] {
        let ProjectArray: Project[] = [];
        let i: number = 0;

        ProjectDTOs.forEach(item => {
            ProjectArray[i] = new Project();
            ProjectArray[i].name = item.name;
            ProjectArray[i].id = item.id;
            i++;
        });

        return ProjectArray;
    }

    static isDTOtoIs(IssueDTOs: DTO.IIssueDTO[]): Issue[] {
        let issueArray: Issue[] = [];
        let i: number = 0;

        IssueDTOs.forEach(item => {
            issueArray[i] = new Issue();
            issueArray[i].state = item.state;
            issueArray[i].iid = item.iid;
            issueArray[i].title = item.title;
            i++;
        });

        return issueArray;

    }

    static addTimeTracking(issue: Issue, ITimeTrackingDTO: DTO.ITimeTrackingDTO): void {

        issue.time_estimate = ITimeTrackingDTO.time_estimate;
        issue.total_time_spent = ITimeTrackingDTO.total_time_spent;
        return;
    }
}
