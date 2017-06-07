import { Component, OnInit } from "@angular/core";
import { HttpModule } from "@angular/http";

import { HttpService } from "./http.service";

import { Project } from "./project";
import { Issue } from "./issue";

@Component({
  selector: "my-app",
  templateUrl: "./app/app.component.html",
  providers: [
        HttpService
    ]
})

export class AppComponent implements OnInit {

    public projectArray: Project[];
    public issueArray: Issue[];

    constructor(
        private _restService: HttpService) { }

    ngOnInit(): void {
        this._restService.retrieveProjects()
        .subscribe((projectArray:Project[]) => {
            this.projectArray = projectArray;
            console.log("Fetch of Projects DONE");
        });
    }

    selectProject(prjName: number): void {
        this._restService.retrieveIssues(prjName)
        .subscribe((issueArray:Issue[]) => {
            this.issueArray = issueArray;
            console.log("Fetch of Issues DONE");
        });
    }
}
