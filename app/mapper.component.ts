import { Component, OnInit } from "@angular/core";

import { Project } from "./project";

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
            i ++;
        });

        return ProjectArray;
    }
}
