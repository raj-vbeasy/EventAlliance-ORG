import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ThemeComponent } from './theme/theme.component';
import { LayoutModule } from './theme/layouts/layout.module';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HttpModule } from "@angular/http";
import { HttpClientModule } from "@angular/common/http";
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ScriptLoaderService } from "./_services/script-loader.service";
import { ThemeRoutingModule } from "./theme/theme-routing.module";
import { AuthModule } from "./auth/auth.module";
import { SurveyModule } from "./theme/pages/default/survey/survey.module";
import { ArtistVoting } from "./_services/artist-voting.service";

@NgModule({
    declarations: [
        ThemeComponent,
        AppComponent
    ],
    imports: [
        LayoutModule,
        HttpModule,
        BrowserModule,
        HttpClientModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        ThemeRoutingModule,
        AuthModule,
        SurveyModule,
        FormsModule
    ],
    providers: [ScriptLoaderService, ArtistVoting],
    bootstrap: [AppComponent]
})
export class AppModule { }