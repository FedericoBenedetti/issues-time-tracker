import { Component, OnInit } from "@angular/core";
import { HttpModule } from "@angular/http";

import { HttpService } from "./http.service";

import { Project } from "./project";

@Component({
  selector: "my-app",
  templateUrl: "./app/app.component.html",
    providers: [
        HttpService
    ]
})

export class AppComponent implements OnInit {

    public projectArray: Project[];

    constructor(
        private _restService: HttpService) { }

    ngOnInit(): void {
        this._restService.retrieveIssues()
        .subscribe((projectArray:Project[]) => {
            this.projectArray = projectArray;
        });
    }

}
