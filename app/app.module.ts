import { NgModule }      from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { HttpModule } from "@angular/http";

import { AppComponent }   from "./app.component";
import { Mapper } from "./mapper";

import { HttpService } from "./http.service";

@NgModule({
  imports:      [
      BrowserModule,
      HttpModule,
    ],

  declarations: [
      AppComponent
    ],

  bootstrap:    [
      AppComponent
      ],

    providers: [
        HttpService
    ]
})

export class AppModule { }
