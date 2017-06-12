import { Component, OnInit } from "@angular/core";
import { HttpModule } from "@angular/http";

import { HttpService } from "./http.service";
import { SortDescriptor, orderBy } from "@progress/kendo-data-query";
import { Project } from "./project";
import { GridDataResult } from "@progress/kendo-angular-grid";
import { Issue } from "./issue";

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

    private sort: SortDescriptor[] = [];
    private gridView: GridDataResult;

    constructor(
        private restService: HttpService) { }

    ngOnInit(): void {
        this.refresh();
    }

    calcData(project: Project): void {
        project.pjIssues.forEach(issue => {
            project.totalTimeEstimated += issue.time_estimate;
            project.totalTimeSpent += issue.total_time_spent;
        });
        this.timeSpent(project);
        project.pjIssues.forEach(issue => {
            if (issue.state === "opened") {
                project.nActive += 1;
            } else {
                project.nClosed += 1;
            }
        });
    }

    checkIssueOutOfTime(project: Project): void {
        project.pjIssues.forEach(issue => {
           if (issue.time_estimate < ((issue.total_time_spent * 0.9) - 3600)) {
                project.timeOut += 1;
                project.timeOutIssue.push(issue);
            }
        });
    }


    refresh(): void {
        this.restService.retrieveProjects()
            .subscribe((projectArray: Project[]) => {
                this.projectArray = projectArray;
                console.log("Fetch of Projects DONE");
                console.log("Projects Dimension: ", this.projectArray.length);
                this.loadProducts();
                projectArray.forEach(item => {
                    this.restService.retrieveIssues(item.id)
                        .subscribe(((issues: Issue[]) => {
                            item.pjIssues = issues;
                            this.checkIssueOutOfTime(item);
                            this.calcData(item);
                        }));
                });
                console.log("Fetch of Issues DONE");
            });
    }

    timeSpent(project: Project): void {
        project.timeEstimated.h = Math.floor(project.totalTimeEstimated / 3600);
        project.timeSpent.h = Math.floor(project.totalTimeSpent / 3600);
    }

    checkLength(dataItem: Project): boolean {
        return dataItem.timeOutIssue.length > 0;
    }

    protected sortChange(sort: SortDescriptor[]): void {
        this.sort = sort;
        this.loadProducts();
    }

    private loadProducts(): void {
        this.gridView = {
            data: orderBy(this.projectArray, this.sort),
            total: this.projectArray.length
        };
    }

}
