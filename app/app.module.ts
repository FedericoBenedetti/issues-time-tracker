import { NgModule } from "@angular/core";
import { FormsModule } from '@angular/forms';
import { BrowserModule, } from "@angular/platform-browser";
import { HttpModule } from "@angular/http";
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GridModule, PDFModule  } from "@progress/kendo-angular-grid";
import { DialogModule } from '@progress/kendo-angular-dialog';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { ChartsModule } from '@progress/kendo-angular-charts';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';

import { BusyModule } from 'angular2-busy';

import { AppComponent } from "./app.component";
import { Mapper } from "./mapper";

import { HttpService } from "./http.service";


@NgModule({
    imports: [
        FormsModule,
        BrowserModule,
        HttpModule,
        GridModule,
        PDFModule,
        ButtonsModule,
        DialogModule,
        DropDownsModule,
        BrowserAnimationsModule,
        BusyModule,
        ChartsModule,
        DateInputsModule
    ],

    declarations: [
        AppComponent
    ],

    bootstrap: [
        AppComponent
    ],

    providers: [
        HttpService
    ]
})

export class AppModule { }
