import { Component, OnInit } from "@angular/core";
import { HttpModule } from "@angular/http";
import { HttpService } from "./http.service";

import { SortDescriptor, orderBy } from "@progress/kendo-data-query";
import { GridDataResult, PageChangeEvent } from "@progress/kendo-angular-grid";

import * as Rx from "rxjs/Rx";

import { Project } from "./project";
import { Issue } from "./issue";
import { Group } from "./group";

@Component({
    selector: "my-app",
    templateUrl: "./app/app.component.html",
    styleUrls: ["./app/app.component.css"],

    providers: [
        HttpService
    ]
})

export class AppComponent implements OnInit {

    // DialogBox
    private isError: boolean = false;
    private errNumber: number = 0;

    public close() {
        this.isError = false;
    }
    // End DialogBox

    // Kendo GridView
    private gridView: GridDataResult;

    // Kendo Paging
    private pageSize: number = 10;
    private skip: number = 0;

    protected pageChange(event: PageChangeEvent): void {
        this.skip = event.skip;
        this.loadItems();
    }

    private loadItems(): void {
        this.gridView = {
            data: this.projectArray.slice(this.skip, this.skip + this.pageSize),
            total: this.projectArray.length
        };
    }
    // End  of Kendo Paging

    // Kendo Sorting
    private sort: SortDescriptor[] = [];

    protected sortChange(sort: SortDescriptor[]): void {
        this.sort = sort;
        this.loadProducts();
    }

    private loadProducts(): void {
        this.gridView = {
            data: orderBy(this.projectArray, this.sort),
            total: this.projectArray.length
        };
        this.loadItems();
    }
    // End of Kendo Sorting

    // Array of Projects, empty now
    public projectArray: Project[] = [];

    // Busy
    busy: Rx.Subscription;

    // Initializing both the array of Group, and the Array of string
    // containing the name of each group. Needed by kendo-combobox
    public projectGroups: Group[] = [];
    public comboBoxGroup: Array<string> = new Array<string>();
    // End

    constructor(
        private restService: HttpService) { }

    ngOnInit(): void {
        this.getGroups();
    }

    // Retrieving all groups, putting them in an array
    // of strings.
    getGroups(): void {
        this.busy = this.restService.retrieveGroups()
            .subscribe((groupArray: Group[]) => {
                this.projectGroups = groupArray;
                console.log("Fetch of Groups DONE");
                let i = 0;
                this.projectGroups.forEach(group => {
                    this.comboBoxGroup[i] = group.name;
                    i += 1;
                })
            });
    }

    // Catching the "valueChange" event, obtaining the group
    // that i want to fetch Projects and Issues
    public valueChange(value: string): void {
        console.log("Selected Group: ", value);
        this.fetchAndFill(value);
    }

    // Function to fetch both Projects and Issues
    public fetchAndFill(group?: string): void {
        this.busy = this.restService.retrieveProjects(group)
            .subscribe((projectArray: Project[]) => {
                this.projectArray = projectArray;
                console.log("Fetch of Projects DONE");
                console.log("Projects Dimension: ", this.projectArray.length);
                this.loadProducts();
                projectArray.forEach(item => {
                    this.busy = this.restService.retrieveIssues(item.id)
                        .subscribe(((issues: Issue[]) => {
                            item.pjIssues = issues;
                            this.checkIssueOutOfTime(item);
                            this.calcData(item);
                        }),
                        Error => {
                            console.log("Error (Issues) ", Error);
                            this.errNumber = Error.status;
                            this.isError = true;
                        })

                });
                console.log("Fetch of Issues DONE");
            },
            Error => {
                console.log("Error (Projects) ", Error);
                this.errNumber = Error.status;
                this.isError = true;
            });
    }

    // Function to calculate the Time Estimated for each Issue
    // & which one is Active or Closed
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

    // Title pretty self explanatory
    // This function will calculate the whether an Issue is out
    // of the Time Estimated range
    checkIssueOutOfTime(project: Project): void {
        project.pjIssues.forEach(issue => {
            if (issue.time_estimate < ((issue.total_time_spent * 0.9) - 3600)) {
                project.timeOut += 1;
                project.timeOutIssue.push(issue);
            }
        });
    }

    // Parsing from second to hour
    timeSpent(project: Project): void {
        project.timeEstimated.h = Math.floor(project.totalTimeEstimated / 3600);
        project.timeSpent.h = Math.floor(project.totalTimeSpent / 3600);
    }

    // Function to check whether there are Issues OUT_OF_TIME
    // needed to apply "+" near each row of the table
    checkLength(dataItem: Project): boolean {
        return dataItem.timeOutIssue.length > 0;
    }



}
