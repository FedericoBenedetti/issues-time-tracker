import { Injectable } from "@angular/core";
import { Http, Response, Headers, RequestOptions } from "@angular/http";
import * as Rx from "rxjs/Rx";

import { Project } from "./project";
import { Issue } from "./issue";
import { Group } from "./group";
import { Mapper } from "./mapper";
import * as DTO from "./dtos.interface";



@Injectable()
export class HttpService {
    projectBaseUrl = "https://git.loccioni.com/api/v4/";

    constructor(private http: Http) { }

    retrieveGroups(): Rx.Observable<Group[]> {
        let pages: number;
        return this.http
            .get(this.projectBaseUrl + "groups?per_page=100&private_token=ij7kczXd7fGz2dyJxT5Y")
            .do((res: Response) => {
                pages = parseInt(res.headers.get("X-Total-Pages"));
                console.log("Number of Pages (Groups): ", pages);
            })
            .map((res: Response) => {
                return res.json();
            })
            .concatMap(Group => {
                let observableArray = [Rx.Observable.of({})];
                let totalGrps: Group[] = [];
                for (let i = 1; i <= pages; i++) {
                    let groupUrl: string = this.projectBaseUrl + "groups?page=" + i
                        + "&per_page=100&private_token=ij7kczXd7fGz2dyJxT5Y";
                    let innerObsGroupArray = this.http.get(groupUrl)
                        .map((res: Response) => {
                            let groupDTOs: DTO.IGroupDTO[] = res.json();
                            return Mapper.grpDROtoGrp(groupDTOs);

                        })
                        .do(grps => (grps.forEach(grp => {
                            totalGrps.push(grp);
                        })));
                    observableArray.push(innerObsGroupArray);
                }

                return Rx.Observable.forkJoin(observableArray)
                    .map(() => totalGrps);

            })

    }

    retrieveProjects(group?: string): Rx.Observable<Project[]> {
        let pages: number;
        let urlForPages: string = this.projectBaseUrl;
        let urlForFetch: string = this.projectBaseUrl;
        if (group) {
            urlForPages += "groups/" + group + "/";
            urlForFetch += "groups/" + group + "/";
        }
        return this.http
            .get(urlForPages + "projects?per_page=100&private_token=ij7kczXd7fGz2dyJxT5Y")
            .do((res: Response) => {
                pages = parseInt(res.headers.get("X-Total-Pages"));
                console.log("Number of Pages (Projects): ", pages);
            }).map((res: Response) => {
                return res.json();
            }).concatMap(Project => {
                let observableArray = [Rx.Observable.of({})];
                let totalPjs: Project[] = [];
                for (let i = 1; i <= pages; i++) {
                    let innerObsArray = this.http.get(urlForFetch + "projects?page=" + i
                        + "&per_page=100&private_token=ij7kczXd7fGz2dyJxT5Y")
                        .map((res: Response) => {
                            let ProjectDTOs: DTO.IProjectDTO[] = res.json();
                            return Mapper.pjDTOtoPj(ProjectDTOs);
                        }).do(pjs => (pjs.forEach(pj => {
                            totalPjs.push(pj);
                        })));
                    observableArray.push(innerObsArray);
                }

                return Rx.Observable.forkJoin(observableArray)
                    .map(() => totalPjs);
            });
    }

    retrieveTimeStats(id: number, issue: Issue): Rx.Observable<void> {
        let projectIssueUrl: string = this.projectBaseUrl + "projects/" +
            id + "/issues/" + issue.iid + "/time_stats?private_token=ij7kczXd7fGz2dyJxT5Y";

        return this.http
            .get(projectIssueUrl)
            .map((res: Response) => {
                let ITimeTrackingDTO: DTO.ITimeTrackingDTO[] = res.json();
                return Mapper.addTimeTracking(issue, ITimeTrackingDTO);
            });

    }

    retrieveIssues(id: number): Rx.Observable<Issue[]> {
        let projectIssueUrl: string = this.projectBaseUrl + "projects/" +
            id + "/issues?per_page=100&private_token=ij7kczXd7fGz2dyJxT5Y";
        let pages: number;
        return this.http
            .get(projectIssueUrl)
            .do((res: Response) => {
                pages = parseInt(res.headers.get("X-Total-Pages"));
                console.log("Number of Pages (Groups): ", pages);
            })
            .map((res: Response) => {
                return res.json();
            })
            .concatMap(Issue => {
                let observableArray = [Rx.Observable.of({})];
                let totalIssues: Issue[] = [];
                for (let i = 1; i <= pages; i++) {
                    let projectIssueUrlSecond: string = this.projectBaseUrl + "projects/" +
                        id + "/issues?page=" + i + "&per_page=100&private_token=ij7kczXd7fGz2dyJxT5Y";
                    let innerObsIssArray = this.http.get(projectIssueUrlSecond)
                        .map((res: Response) => {
                            let IssueDTOs: DTO.IIssueDTO[] = res.json();
                            return Mapper.isDTOtoIs(IssueDTOs);

                        })
                        .do(isss => (isss.forEach(iss => {
                            totalIssues.push(iss);
                        })));
                    observableArray.push(innerObsIssArray);
                }

                return Rx.Observable.forkJoin(observableArray)
                    .map(() => totalIssues);

            })

    }

}


        /* let projectIssueUrl: string = this.projectBaseUrl + "projects/" +
            id + "/issues?per_page=100&private_token=ij7kczXd7fGz2dyJxT5Y";
        let pages: number;

        return this.http
            .get(projectIssueUrl)
            .do((res: Response) => {
                pages = parseInt(res.headers.get("X-Total-Pages"));
                console.log("Number of Pages (Issues): ", pages);
            }).map((res: Response) => {
                return res.json();
            }).concatMap(Issue => {
                let obsIssuesArray = [Rx.Observable.of({})];
                let loadedIssues: Issue[] = [];
                for (let i = 1; i <= pages; i++) {
                    let projectIssueUrl: string = this.projectBaseUrl + "projects/" +
                        id + "/issues?page=" + i + "&per_page=100&private_token=ij7kczXd7fGz2dyJxT5Y";


                    let innerIssArray = this.http.get(projectIssueUrl)
                        .map((res: Response) => {
                            let IssueDTOs: DTO.IIssueDTO[] = res.json();
                            return Mapper.isDTOtoIs(IssueDTOs);
                        })
                        .concatMap(issues => {
                            let obsArray = [Rx.Observable.of({})];


                            issues.forEach(issue => {
                                let projectIssueUrl: string = this.projectBaseUrl + "projects/" +
                                    id + "/issues/" + issue.iid + "/time_stats?private_token=ij7kczXd7fGz2dyJxT5Y";
                                let innerObs = this.http.get(projectIssueUrl)
                                    .map((res: Response) => {
                                        let issueTimeStatsDTO: DTO.ITimeTrackingDTO = res.json();
                                        return Mapper.addTimeTracking(issue, issueTimeStatsDTO);
                                    });

                                obsArray.push(<any>innerObs);

                            });
                            return Rx.Observable.forkJoin(obsArray)
                                .map(() => issues);
                        })
                        .do(iss => (iss.forEach(is => {
                            loadedIssues.push(is);

                        })))
                    obsIssuesArray.push(innerIssArray);
                }

                return Rx.Observable.forkJoin(obsIssuesArray)
                    .map(() => loadedIssues);

            });
    }*/

