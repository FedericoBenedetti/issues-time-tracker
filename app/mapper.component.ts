import { Component, OnInit } from "@angular/core";

import { Project } from "./project";
import { Issue } from "./issue";

@Component({
  selector: "mapper-component",
  templateUrl: "./app/mapper.component.html"
})

export class MapperComponent {



    static pjDTOtoPj(ProjectDTOs: any): Project[] {
        let ProjectArray: Project[] = [];
        let i: number = 0;

        ProjectDTOs.forEach(item => {
            ProjectArray[i] = new Project();
            ProjectArray[i].name = item.name;
            ProjectArray[i].default_branch = item.default_branch;
            ProjectArray[i].id = item.id;
            i ++;
        });

        return ProjectArray;
    }

    static isDTOtoIs(IssueDTOs: any): Issue[] {
        let issueArray: Issue[] = [];
        let i: number = 0;

         IssueDTOs.forEach(item => {
            issueArray[i] = new Project();
            issueArray[i].state = item.state;
            i ++;
        });

        return issueArray;

    }
}
