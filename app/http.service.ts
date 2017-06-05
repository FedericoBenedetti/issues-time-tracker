import { Injectable } from "@angular/core";
import { Http, Response, Headers, RequestOptions } from "@angular/http";
import { Observable } from "rxjs/Rx";

import { Project } from "./project";

import "rxjs/Rx";

@Injectable()
export class HttpService {
    projectBaseUrl = "https://git.loccioni.com/api/v3/projects?per_page=100&private_token=ij7kczXd7fGz2dyJxT5Y";

    constructor (private http: Http) { }

    retrieveIssues(): Observable<Project[]> {
       return this.http.get(this.projectBaseUrl)
			.map((res:Response) => res.json())
            .catch((error:any) => Observable.throw(error.json().error || "Server error"));
    }
}
