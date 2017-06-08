import { NgModule }      from "@angular/core";
import { BrowserModule,  } from "@angular/platform-browser";
import { HttpModule } from "@angular/http";

import { GridModule } from "@progress/kendo-angular-grid";

import { AppComponent }   from "./app.component";
import { Mapper } from "./mapper";

import { HttpService } from "./http.service";

@NgModule({
  imports:      [
      BrowserModule,
      HttpModule,
      GridModule
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
