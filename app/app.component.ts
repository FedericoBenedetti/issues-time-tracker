import { Component, OnInit } from "@angular/core";
import { HttpModule } from "@angular/http";

import { HttpService } from "./http.service";

import { Project } from "./project";
import { Issue } from "./issue";
import { Data } from "./data";

@Component({
    selector: "my-app",
    templateUrl: "./app/app.component.html",
    styleUrls: ["./app/app.component.css"],

    providers: [
        HttpService
    ]
})

export class AppComponent implements OnInit {

    public projectArray: Project[] = [];

    constructor(
        private restService: HttpService) { }

    ngOnInit(): void {
        this.restService.retrieveProjects()
            .subscribe((projectArray: Project[]) => {
                this.projectArray = projectArray;
                console.log("Fetch of Projects DONE");
                projectArray.forEach(item => {
                    this.restService.retrieveIssues(item.id)
                        .subscribe(((issues: Issue[]) => {
                            item.pjIssues = issues;
                            this.calcData(item);
                        }));
                });
                console.log("Fetch of Issues DONE");
            });
    }

    calcData(project: Project): void {
        project.pjIssues.forEach(issue => {
           project.arrayTimeEstimated.push(issue.time_estimate);
           project.arrayTimeSpent.push(issue.total_time_spent);
           project.totalTimeEstimated += issue.time_estimate;
           project.totalTimeSpent += issue.total_time_spent;
        });
        console.log("I am inside 'numberOfIssue'");
            project.pjIssues.forEach(issue => {
                if (issue.state === "opened") {
                    project.nActive += 1;
                } else {
                    project.nClosed += 1;
                }
            });
    }
}
