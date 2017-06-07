import { Injectable } from "@angular/core";
import { Http, Response, Headers, RequestOptions } from "@angular/http";
import { Observable } from "rxjs/Rx";

import { Project } from "./project";
import { Issue } from "./issue";

import { MapperComponent } from "./mapper.component";

import "rxjs/Rx";

@Injectable()
export class HttpService {
    projectBaseUrl = "https://git.loccioni.com/api/v4/projects?per_page=100&private_token=ij7kczXd7fGz2dyJxT5Y";

    constructor (private http: Http) { }

    retrieveProjects(): Observable<Project[]> {
       return this.http.get(this.projectBaseUrl)
			.map((res:Response) => {
                let ProjectDTOs: IProjectDTO[] = res.json();
                return MapperComponent.pjDTOtoPj(ProjectDTOs);
            });
    }

    retrieveIssues(prj: number): Observable<Issue[]> {
        let projectIssueUrl: string = "https://git.loccioni.com/api/v4/projects/" + prj +
                "/issues?per_page=100&private_token=ij7kczXd7fGz2dyJxT5Y";
        console.log(projectIssueUrl);
        return this.http.get(projectIssueUrl)
			.map((res:Response) => {
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
