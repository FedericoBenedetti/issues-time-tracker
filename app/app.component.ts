import { Component, OnInit } from "@angular/core";
import { HttpModule } from "@angular/http";

import { SortDescriptor, orderBy } from "@progress/kendo-data-query";
import {
    GridComponent, GridDataResult,
    PageChangeEvent, DataStateChangeEvent
} from "@progress/kendo-angular-grid";
import { process, State, groupBy, GroupResult } from "@progress/kendo-data-query";

import * as Rx from "rxjs/Rx";

import { Project } from "./project";
import { Issue } from "./issue";
import { Group } from "./group";
import { MockTableData } from "./mocktabledata";

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

    // Show or Hide the Table/Graphs div
    public table: boolean = true;
    public graph: boolean = false;

    public isGraph(): boolean {
        return this.graph;
    }
    public isTable(): boolean {
        return this.table;
    }

    // Toggling function for switching between
    // table and graphs
    toggleTable(): void {
        this.table = true;
        this.graph = false;
    }

    toggleGraphs(): void {
        this.graph = true;
        this.table = false;
    }

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
    public startDate: Date;
    public endDate: Date;

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
    public dropDownGroup: Array<string> = new Array<string>();
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
                this.projectGroups.forEach(group => {
                    this.dropDownGroup.push(group.name);
                });
                this.dropDownGroup.sort();
                console.log("Fetch of Groups DONE");
            });
    }

    // Catching the "valueChange" event, obtaining the group
    // that i want to fetch Projects and Issues
    public valueChange(value: string): void {
        console.log("Selected Group: ", value);
        this.startDate = null;
        this.endDate = null;
        this.dropDownValue = value;
        return;
    }

    // DropDown (Kendo)
    public dropDownValue: string;

    // this variable will prevent the program to
    // queue multiple fetch, allowing only once per time
    public checkIfQueue: boolean = true;

    public isCheckIfQueue(): boolean {
        return this.checkIfQueue;
    }

    // function that check the the possible combination with endDate, startDate and comboBoxValue
    // if everything is undefined it wont start the fetch
    checkAndStart(): void {
        this.monthsArray = [];
        this.counterArray = [];
        this.projectArray = [];
        if (this.checkIfQueue == true) {
            if (this.startDate && this.endDate) {
                if (this.checkDate(this.startDate, this.endDate)) {
                    this.errNumber = -3;    // DateEND < DateSTART
                    this.isError = true;
                    return;
                }
            }
            this.checkIfQueue = false;
            this.fetchAndFill(this.dropDownValue, this.startDate, this.endDate);
        }

    }


    checkDate(dateStart: Date, dateEnd: Date) {
        if (dateStart.getTime() > dateEnd.getTime()) {
            return true;
        }
    }

    // Function that using the dateStart and dateEnd set a range
    // where all project must be inbetween
    // then it check if the project (cycling through the whole array)
    // is inside the range, adding it on a mock array
    // at the end it will overwrite the original array with the new one
    filterForDate(dateStart: Date, dateEnd: Date): void {

        let mockArray: Project[] = [];



        if (dateStart && !dateEnd) {
            console.log("DateStart available: ", dateStart.getTime());
            this.projectArray.forEach(item => {
                if (item.created_at.getTime() >= dateStart.getTime()) {
                    mockArray.push(item);
                }
            });

        } else if (dateEnd && !dateStart) {
            console.log("DateEnd available: ", dateEnd.getTime());
            this.projectArray.forEach(item => {
                if (item.last_activity_at.getTime() <= dateEnd.getTime()) {
                    mockArray.push(item);
                }
            });

        } else if (dateStart && dateEnd) {
            console.log("DateStart available: ", dateStart.getTime(), "DateEnd available: ", dateEnd.getTime());
            this.projectArray.forEach(item => {
                if (item.created_at.getTime() >= dateStart.getTime() &&
                    item.last_activity_at.getTime() <= dateEnd.getTime()) {
                    mockArray.push(item);
                }
            });

        } else if (!dateStart && !dateEnd) {
            console.log("Both DateStart and DateEnd undefined");
            return;
        }

        this.projectArray = mockArray;
        this.gridData = process(this.projectArray, this.state);
        console.log("Filtering by Date: DONE");
        return;

    }

    // Function to fetch both Projects and Issues
    public fetchAndFill(group?: string, dateStart?: Date, dateEnd?: Date): void {
        this.busy = this.restService.retrieveProjects(group)
            .subscribe((projectArray: Project[]) => {
                this.projectArray = projectArray;
                this.filterForDate(dateStart, dateEnd);
                this.gridData = process(this.projectArray, this.state);
                console.log("Fetch of Projects DONE");
                console.log("Projects Dimension: ", this.projectArray.length);
                let obsArray = [Rx.Observable.of({})];
                this.projectArray.forEach(item => {
                    let innerObservable = this.restService.retrieveIssues(item.id)
                        .do(((issues: Issue[]) => {
                            item.pjIssues = issues;
                        }));
                    obsArray.push(innerObservable);

                });
                this.busy = Rx.Observable.forkJoin(obsArray)
                    .subscribe(() => {
                        this.calcData();
                        this.checkIssueOutOfTime();
                        this.gridData = process(this.projectArray, this.state);
                        this.convertToTable();
                        console.log("Fetch of Issues DONE");
                    });
                this.checkIfQueue = true;
            },
            Error => {
                console.log("Error (Projects) ", Error);
                this.errNumber = Error.status;
                this.isError = true;
            });
    }

    public monthsArray: string[] = [];
    public counterArray: number[] = [];

    public convertToTable(): void {
        this.createMinMaxArray();

        let min = Math.min(...this.minMaxArray);
        let max = Math.max(...this.minMaxArray);

        let mockMonths: string[] = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        let delta = (max - min) + 1;

        let j = 0;    // objArray counter
        let k = 0;    // Months counter

        for (let i = 0; i < delta; i++) {
            let realYear = min + i;
            for (let k = 0; k < mockMonths.length; k++) {
                if (!this.counterArray[k]) {
                    this.counterArray[k] = 0;
                }
                if (realYear == this.objArray[j].year) {
                    for (let o = 0; o < this.objArray.length; o ++) {
                        if (mockMonths[k] === this.objArray[o].month) {
                            this.counterArray[k] += 1;
                        }
                    }
                }
                this.monthsArray.push(mockMonths[k] + " " + realYear);
            }

        }

        console.log("MonthsArray: ", this.monthsArray, " CounterArray: ", this.counterArray);
    }

    public minMaxArray: number[] = [];
    public createMinMaxArray(): void {
        for (let i = 0; i < this.projectArray.length; i++) {
            this.minMaxArray.push(this.projectArray[i].created_at.getFullYear());
        }
    }

    // Function to calculate the Time Estimated for each Issue
    // & which one is Active or Closed
    calcData(): void {
        this.projectArray.forEach(project => {
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
        })

    }

    public baseUrl: string = "https://git.loccioni.com/";
    // Title pretty self explanatory
    // This function will calculate the whether an Issue is out
    // of the Time Estimated range

    checkIssueOutOfTime(): void {
        this.projectArray.forEach(project => {
            project.pjIssues.forEach(issue => {
                if (issue.time_estimate < ((issue.total_time_spent * 0.9) - 3600)) {
                    issue.html_link = this.baseUrl + this.dropDownValue + "/" +
                        project.name + "/issues/" + issue.iid + "?private_token=ij7kczXd7fGz2dyJxT5Y";
                    this.handleGraphs(issue);
                    project.timeOut += 1;
                    project.timeOutIssue.push(issue);
                }
            });
        })

    }

    public objArray: MockTableData[] = [];
    public handleGraphs(issue: Issue): void {
        let obj: MockTableData = new MockTableData;

        obj.year = issue.created_at.getFullYear();
        obj.month = issue.created_at.toLocaleString("en-us", { month: "long" });
        this.objArray.push(obj);
        console.log(this.objArray);
    }

    newWindow(htmlLink: string): void {
        open(htmlLink, 'Chrome');
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
