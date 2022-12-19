import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LogoutComponent } from "./auth/logout/logout.component";
import { ResetPasswordComponent } from "./auth/reset-password/reset-password.component";
import { SurveyComponent } from "./theme/pages/default/survey/survey.component";

const routes: Routes = [
    { path: 'login', loadChildren: './auth/auth.module#AuthModule' },
    { path: 'logout', component: LogoutComponent },
	{ path: 'passwordreset/:uid/:key', component: ResetPasswordComponent},
    { path: 'survey/:id', component: SurveyComponent },
    { path: '', redirectTo: 'events', pathMatch: 'full' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }