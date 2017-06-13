import { Component, OnInit } from "@angular/core";
import { HttpModule } from "@angular/http";

import { SortDescriptor, orderBy } from "@progress/kendo-data-query";
import {
    GridComponent, GridDataResult,
    PageChangeEvent, DataStateChangeEvent
} from "@progress/kendo-angular-grid";
import { process, State } from "@progress/kendo-data-query";

import * as Rx from "rxjs/Rx";

import { Project } from "./project";
import { Issue } from "./issue";
import { Group } from "./group";

import { HttpService } from "./http.service";

@Component({
    selector: "my-app",
    templateUrl: "./app/app.component.html",
    styleUrls: ["./app/app.component.css"],

    providers: [
        HttpService
    ]
})

export class AppComponent implements OnInit {

    // Array of Projects, empty now
    public projectArray: Project[] = [];

    // DialogBox
    private isError: boolean = false;
    private errNumber: number = 0;

    public close() {
        this.isError = false;
    }
    // End DialogBox

    // Sorting, Grouping, Filtering (Kendo)
    private state: State = {
        skip: 0,
        take: 10
    };

    private gridData: GridDataResult = process(this.projectArray, this.state);

    protected dataStateChange(state: DataStateChangeEvent): void {
        this.state = state;
        this.gridData = process(this.projectArray, this.state);
    }
    // End of (Kendo)

    // DatePicker (Kendo)
    public startDate: Date = undefined;
    public endDate: Date = undefined;

    public onChangeStart(value: Date): void {
        this.startDate = value;
    }

    public onChangeEnd(value: Date): void {
        this.endDate = value;
    }
    // End of DatePicker (Kendo)

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
        this.comboBoxValue = value;
        return;
    }

    // ComboBox (Kendo)
    public comboBoxValue: string;

    // function that check the the possible combination with endDate, startDate and comboBoxValue
    // if everything is undefined it wont start the fetch
    checkAndStart(): void {
        if ((this.startDate == undefined) || (this.endDate == undefined)) {
            if (this.comboBoxValue != undefined) {
                this.fetchAndFill(this.comboBoxValue);
                return;
            }
            this.errNumber = -1;    // Everything is Undefined
            this.isError = true;
            return;
        } else {
            if (this.comboBoxValue != undefined) {
                this.fetchAndFill(this.comboBoxValue, this.startDate, this.endDate);
            } else {
                let mock: string = undefined
                this.fetchAndFill(mock, this.startDate, this.endDate);
            }
        }


    }

    // Function that using the dateStart and dateEnd set a range
    // where all project must be inbetween
    // then it check if the project (cycling through the whole array)
    // is inside the range, adding it on a mock array
    // at the end it will overwrite the original array with the new one
    filterForDate(dateStart: Date, dateEnd: Date): void {
        let mockArray: Project[] = [];
        let i = 0;

        if (dateEnd.getTime() > dateStart.getTime()) {
            this.projectArray.forEach(item => {
                if (item.created_at.getTime() >= dateStart.getTime() &&
                    item.last_activity_at.getTime() <= dateEnd.getTime()) {
                    mockArray[i] = item;
                    i += 1;
                }
            });
            this.projectArray = mockArray;
            console.log("Filtering by Date: DONE");
            return;
        }
        this.errNumber = -2;    // DateEND < DateSTART
        this.isError = true;
        return;
    }

    // Function to fetch both Projects and Issues
    public fetchAndFill(group?: string, dateStart?: Date, dateEnd?: Date): void {
        this.busy = this.restService.retrieveProjects(group)
            .subscribe((projectArray: Project[]) => {
                this.projectArray = projectArray;
                this.filterForDate(dateStart, dateEnd);
                console.log("Fetch of Projects DONE");
                console.log("Projects Dimension: ", this.projectArray.length);
                this.gridData = process(this.projectArray, this.state);
                projectArray.forEach(item => {
                    this.busy = this.restService.retrieveIssues(item.id)
                        .subscribe(((issues: Issue[]) => {
                            item.pjIssues = issues;
                            this.checkIssueOutOfTime(item);
                            this.calcData(item);
                            this.gridData = process(this.projectArray, this.state);
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
