import { Component, OnInit, ViewEncapsulation } from "@angular/core";
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
import { Model } from "./model";

import { HttpService } from "./http.service";

@Component({
    selector: "my-app",
    templateUrl: "./app/app.component.html",
    encapsulation: ViewEncapsulation.None,
    styleUrls: ["./app/app.component.css", "./app/pdf-styles.css"],

    providers: [
        HttpService
    ]
})


export class AppComponent implements OnInit {

    // Array of Projects, empty now
    public projectArray: Project[] = [];

    // Show or Hide the Table/Graphs div
    public toggle: boolean = true;

    public toggleTable(): void {
        this.toggle = true;
    }

    public toggleGraph(): void {
        this.toggle = false;
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
        console.log("onChangeStart: ", value.getMonth(), value.getDay(), value.getFullYear());
        this.startDate = value;
    }

    public onChangeEnd(value: Date): void {
        console.log("onChangeEnd: ", value.getMonth(), value.getDay(), value.getFullYear());
        this.endDate = value;
        this.endDate.setHours(23, 59, 59, 59);
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
        this.dropDownValue = value;
        return;
    }

    // DropDown (Kendo)
    public dropDownValue: string;

    public seriesData: Model = new Model();
    // function that check the the possible combination with endDate, startDate and comboBoxValue
    // if everything is undefined it wont start the fetch
    checkAndStart(): void {
        this.projectArray = [];
        this.seriesData = new Model();
        this.objArray = [];

        this.fetchAndFill(this.dropDownValue, this.startDate, this.endDate);

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
    filterForDateProject(dateStart: Date, dateEnd: Date): void {
        let mockArray: Project[] = [];


        if (dateStart && !dateEnd) {
            console.log("DateStart available: ", dateStart.getTime());
            this.projectArray.forEach(item => {
                if (item.last_activity_at.getTime() >= dateStart.getTime()) {
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
                if (item.last_activity_at.getTime() >= dateStart.getTime() &&
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
        console.log("Filtering by Date (Project): DONE");
        return;

    }



    // Function to fetch both Projects and Issues
    public fetchAndFill(group?: string, dateStart?: Date, dateEnd?: Date): void {
        this.busy = this.restService.retrieveProjects(group)
            .subscribe((projectArray: Project[]) => {
                this.projectArray = projectArray;
                this.filterForDateProject(dateStart, dateEnd);
                console.log("Fetch of Projects DONE");
                console.log("Projects Dimension: ", this.projectArray.length);
                this.gridData = process(this.projectArray, this.state);
                let obsArray = [Rx.Observable.of({})];
                let obsArrayFilteredIssue = [Rx.Observable.of(void {})];
                this.projectArray.forEach(item => {
                    let innerObservable = this.restService.retrieveIssues(item.id)
                        .do((issueArray: Issue[]) => {
                            item.pjIssues = issueArray;
                            this.calcData(item);
                        });
                    obsArray.push(innerObservable);
                });

                this.busy = Rx.Observable.forkJoin(obsArray)
                    .concatMap(data => {
                        this.projectArray.forEach(item => {
                            item.closedFilteredIssue.forEach(closedIssue => {
                                let innerObservableFilteredIssue = this.restService.retrieveTimeStats(item.id, closedIssue)
                                obsArrayFilteredIssue.push(innerObservableFilteredIssue);
                            });
                        });
                        return Rx.Observable.forkJoin(obsArrayFilteredIssue)
                    }).subscribe(() => {
                        this.checkIssueOutOfTime();
                        this.convertToTable();
                        this.spliceArray();
                        this.gridData = process(this.projectArray, this.state);
                        console.log("Fetch of Issues DONE");
                    });
            },
            Error => {
                console.log("Error (Projects) ", Error);
                this.errNumber = Error.status;
                this.isError = true;

            });
    }

    public spliceArray(): void {
        let indexOfFirstGreaterThanZero = this.seriesData.count.findIndex(x => { return x > 0 });
        let indexOfFirstGreaterThanZero2 = this.seriesData.closed.findIndex(x => { return x > 0 });

        let min = Math.min(indexOfFirstGreaterThanZero, indexOfFirstGreaterThanZero2);

        this.seriesData.count.splice(0, min);
        this.seriesData.monthAndYear.splice(0, min);
        this.seriesData.closed.splice(0, min);

        let indexOfLastGreaterThanZero = 0;
        let indexOfLastGreaterThanZero2 = 0;

        for (let i = 0; i < this.seriesData.count.length; i++) {
            if (this.seriesData.count[i] > 0) {
                indexOfLastGreaterThanZero = i;
            }
        }

        for (let i = 0; i < this.seriesData.closed.length; i++) {
            if (this.seriesData.closed[i] > 0) {
                indexOfLastGreaterThanZero2 = i;
            }
        }

        let max = Math.max(indexOfLastGreaterThanZero, indexOfLastGreaterThanZero2);

        this.seriesData.count.splice(max + 1);
        this.seriesData.monthAndYear.splice(max + 1);
        this.seriesData.closed.splice(max + 1);
         this.seriesData.percentage.splice(max + 1);
    }


    public convertToTable(): void {
        this.createMinMaxArray();

        let min = Math.min(...this.minMaxArray);
        let max = Math.max(...this.minMaxArray);

        let mockMonths: string[] = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        console.log("Min: ", min, " Max: ", max);

        let savePos: number = 0;

        for (let y = min; y <= max; y++) {
            for (let j = 0; j < mockMonths.length; j++) {
                let perMonthNofIssue = this.objArray.filter(iss => (iss.month === mockMonths[j] && iss.year === y)).length;
                let perMonthNofIssue2 = this.objArray2.filter(iss => (iss.month === mockMonths[j] && iss.year === y)).length;
                console.log("perMonthNofIssue: ", perMonthNofIssue, " perMonthNofIssue2: ", perMonthNofIssue2, " savePos: ", savePos, " mockMonth: ",  mockMonths[j] + " " + y);
                this.seriesData.count[savePos] = perMonthNofIssue;
                this.seriesData.monthAndYear[savePos] = mockMonths[j] + " " + y;
                this.seriesData.closed[savePos] = perMonthNofIssue2;
                if (perMonthNofIssue2)
                 this.seriesData.percentage[savePos] = perMonthNofIssue/perMonthNofIssue2 *100;
                 else
                 this.seriesData.percentage[savePos] =0;
                savePos += 1;
            }
        }

        console.log("MonthsArray: ", this.seriesData.monthAndYear, " CounterArray: ", this.seriesData.count);
    }

    public minMaxArray: number[] = [];

    public createMinMaxArray(): void {
        this.projectArray.forEach(item => {
            item.closedFilteredIssue.forEach(FilteredIssues => {
                this.minMaxArray.push(FilteredIssues.updated_at.getUTCFullYear());
            })
            item.timeOutIssue.forEach(Issues => {
                this.minMaxArray.push(Issues.updated_at.getUTCFullYear());
            })
        })
    }

    calcTime(): void {
        this.projectArray.forEach(project => {
            project.pjIssues.forEach(issue => {
                project.totalTimeEstimated += issue.time_estimate;
                project.totalTimeSpent += issue.total_time_spent;
            });

            this.timeSpent(project);
        })

    }

    calcData(project: Project): void {

        project.pjIssues.forEach(issue => {
            if (typeof this.endDate === "undefined") {
                console.log("EndDate undefined");
                this.endDate = new Date();
                this.endDate.setHours(23, 59, 59, 59);
            }

            if (typeof this.startDate === "undefined") {
                console.log("StartDate undefined");
                this.startDate = new Date(1970, 0);
            }

            if (issue.created_at.getTime() >= this.startDate.getTime() && issue.created_at.getTime() <= this.endDate.getTime()) {
                project.nCreated += 1;
            }

            if ((issue.state === "closed") && (issue.updated_at.getTime() >= this.startDate.getTime()) && (issue.updated_at.getTime() <= this.endDate.getTime())) {
                project.nClosed += 1;
                project.closedFilteredIssue.push(issue);
            }
        });

    }

    public baseUrl: string = "https://git.loccioni.com/";
    // Title pretty self explanatory
    // This function will calculate the whether an Issue is out
    // of the Time Estimated range
    public objArray: MockTableData[] = [];
    public objArray2: MockTableData[] = [];
    checkIssueOutOfTime(): void {
        this.projectArray.forEach(project => {
            project.closedFilteredIssue.forEach(FilteredIssue => {
                this.handleGraphs(FilteredIssue, this.objArray2);
            });
            project.closedFilteredIssue.forEach(issue => {
                if (issue.time_estimate < ((issue.total_time_spent * 0.9) - 3600)) {
                    this.handleGraphs(issue, this.objArray);
                    issue.html_link = this.baseUrl + this.dropDownValue + "/" +
                        project.name + "/issues/" + issue.iid + "?private_token=ij7kczXd7fGz2dyJxT5Y";
                    project.timeOut += 1;
                    project.timeOutIssue.push(issue);
                }
            });
        });

    }



    public handleGraphs(issue: Issue, array: MockTableData[]): void {
        let locale = "en-us";
        let obj: MockTableData = new MockTableData;

        obj.year = issue.updated_at.getUTCFullYear();
        obj.month = issue.updated_at.toLocaleString(locale, { month: "long" });
        obj.iid = issue.iid;
        console.log("Obj.year: ", obj.year);
        array.push(obj);
    }

    newWindow(htmlLink: string): void {
        open(htmlLink);
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
