import { Injectable } from "@angular/core";
import { Http, Response, Headers, RequestOptions } from "@angular/http";
import * as Rx from "rxjs/Rx";

import { Project } from "./project";
import { Issue } from "./issue";

import { Mapper } from "./mapper";
import * as DTO from "./dtos.interface";



@Injectable()
export class HttpService {
    projectBaseUrl = "https://git.loccioni.com/api/v4/";

    constructor(private http: Http) { }

    retrieveProjects(): Rx.Observable<Project[]> {
        let pages: string;
        console.log("ci siamo");
        return this.http.get("https://git.loccioni.com/api/v4/projects?per_page=100&private_token=ij7kczXd7fGz2dyJxT5Y")
        .do((res: Response)  => {
            pages = res.headers.get("X-Total-Pages");
        }).map((res: Response) => {
            return res.json();
        }).concatMap(Project => {

            let observableArray = [];
            let totalPjs: Project[] = [];
            let i: number = 0;
            while (i < parseInt(pages)) {
                let projectUrl: string = this.projectBaseUrl + "projects?page=" + i
                            + "&per_page=100&private_token=ij7kczXd7fGz2dyJxT5Y";
                let innerObsArray =  this.http.get(projectUrl)
                    .map((res: Response) => {
                    let ProjectDTOs: DTO.IProjectDTO[] = res.json();
                    return Mapper.pjDTOtoPj(ProjectDTOs);
                }).do (pjs => ( pjs.forEach(pj => {
                    totalPjs.push(pj);
                })));
                i = i + 1;
                observableArray.push(innerObsArray);
            }

        return Rx.Observable.forkJoin(observableArray)
                    .map(() => totalPjs);
        });
    }

    retrieveIssues(id: number): Rx.Observable<Issue[]> {
        let projectIssueUrl: string = this.projectBaseUrl + "projects/" +
            id + "/issues?per_page=100&private_token=ij7kczXd7fGz2dyJxT5Y";
        return this.http.get(projectIssueUrl)
            .map((res: Response) => {
                console.log(res.headers.get("X-Total-Pages"), "res.headers.get");
                let IssueDTOs: DTO.IIssueDTO[] = res.json();
                return Mapper.isDTOtoIs(IssueDTOs);
            }).concatMap(issues => {
                let obsArray = [];

                issues.forEach(issue => {
                    let projectIssueUrl: string = this.projectBaseUrl + "projects/" +
                        id + "/issues/" + issue.iid + "/time_stats?per_page=100&private_token=ij7kczXd7fGz2dyJxT5Y";
                    let innerObs = this.http.get(projectIssueUrl)
                        .map((res: Response) => {
                            let issueArray: DTO.ITimeTrackingDTO[] = res.json();
                            return Mapper.addTimeTracking(issue, issueArray);
                        });

                    obsArray.push(innerObs);

                });
                return Rx.Observable.forkJoin(obsArray)
                    .map(() => issues);
            });
    }
}
