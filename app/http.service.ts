import { Injectable } from "@angular/core";
import { Http, Response, Headers, RequestOptions } from "@angular/http";
import { Observable } from "rxjs/Rx";

import { Project } from "./project";
import { Issue } from "./issue";

import { MapperComponent } from "./mapper.component";

import "rxjs/Rx";

@Injectable()
export class HttpService {
    projectBaseUrl = "https://git.loccioni.com/api/v4/";

    constructor(private http: Http) { }

    retrieveProjects(): Observable<Project[]> {
        let projectUrl: string = this.projectBaseUrl + "projects?per_page=1000&private_token=ij7kczXd7fGz2dyJxT5Y";
        return this.http.get(projectUrl)
            .map((res: Response) => {
                let ProjectDTOs: IProjectDTO[] = res.json();
                return MapperComponent.pjDTOtoPj(ProjectDTOs);
            });
    }

    retrieveIssues(id: number): Observable<Issue[]> {
        let projectIssueUrl: string = this.projectBaseUrl + "projects/" +
             id + "/issues?per_page=10000&private_token=ij7kczXd7fGz2dyJxT5Y";
        return this.http.get(projectIssueUrl)
            .map((res: Response) => {
                let IssueDTOs: IIssueDTO[] = res.json();
                return MapperComponent.isDTOtoIs(IssueDTOs);
         });
    }
}


export interface IProjectDTO {
    id: number;
    name: string;
    default_branch: string;
}

export interface IIssueDTO {
    state: string;
}
