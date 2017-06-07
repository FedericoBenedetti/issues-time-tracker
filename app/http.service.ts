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
        let projectUrl: string = this.projectBaseUrl + "projects?per_page=1000&private_token=ij7kczXd7fGz2dyJxT5Y";
        return this.http.get(projectUrl)
            .map((res: Response) => {
                let ProjectDTOs: DTO.IProjectDTO[] = res.json();
                return Mapper.pjDTOtoPj(ProjectDTOs);
            });
    }

    retrieveIssues(id: number): Rx.Observable<Issue[]> {
        let projectIssueUrl: string = this.projectBaseUrl + "projects/" +
            id + "/issues?per_page=10000&private_token=ij7kczXd7fGz2dyJxT5Y";
        return this.http.get(projectIssueUrl)
            .map((res: Response) => {
                let IssueDTOs: DTO.IIssueDTO[] = res.json();
                return Mapper.isDTOtoIs(IssueDTOs);
            }).concatMap(issues => {
                let obsArray = [];

                issues.forEach(issue => {
                    let projectIssueUrl: string = this.projectBaseUrl + "projects/" +
                        id + "/issues/" + issue.iid + "/time_stats?per_page=10000&private_token=ij7kczXd7fGz2dyJxT5Y";
                    let innerObs = this.http.get(projectIssueUrl)
                        .map((res: Response) => {
                            let issueArray: DTO.ITimeTrackingDTO[] = res.json();
                            return Mapper.addTimeTracking(issue, issueArray);
                        });

                    obsArray.push(innerObs);

                });
                return Rx.Observable.forkJoin(obsArray)
                .map(()=>issues);
            });
    }
}
