import { NgModule } from '@angular/core';
import { ThemeComponent } from './theme.component';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from "../auth/_guards/auth.guard";

const routes: Routes = [
    {
        "path": "",
        "component": ThemeComponent,
        "canActivate": [AuthGuard],
        "children": [
            {
                "path": "index",
				"canActivate": [AuthGuard],
                "loadChildren": ".\/pages\/subheader-type-search\/index\/index.module#IndexModule"
            },
            {
                "path": "insights",
				"canActivate": [AuthGuard],
                "loadChildren": ".\/pages\/default\/insights\/insights.module#InsightsModule"
            },
            {
                "path": "inner",
				"canActivate": [AuthGuard],
                "loadChildren": ".\/pages\/default\/inner\/inner.module#InnerModule"
            },
            {
                "path": "blank",
				"canActivate": [AuthGuard],
                "loadChildren": ".\/pages\/default\/blank\/blank.module#BlankModule"
            },
            {
                "path": "profile",
				"canActivate": [AuthGuard],
                "loadChildren": ".\/pages\/default\/profile\/profile.module#ProfileModule"
            },
            {
                "path": "404",
                "loadChildren": ".\/pages\/default\/not-found\/not-found.module#NotFoundModule"
            },
            {
                "path": "summary",
				"canActivate": [AuthGuard],
                "loadChildren": ".\/pages\/default\/summary\/summary.module#SummaryModule"
            },
            {
                "path": "artists",
				"canActivate": [AuthGuard],
                "loadChildren": ".\/pages\/default\/artists\/artists.module#ArtistsModule"
            },
            {
                "path": "artist-details/:id",
				"canActivate": [AuthGuard],
                "loadChildren": ".\/pages\/default\/artist-details\/artist-details.module#ArtistDetailsModule"
            },
            {
                "path": "edit-artist",
				"canActivate": [AuthGuard],
                "loadChildren": ".\/pages\/default\/edit-artist\/edit-artist.module#EditArtistModule"
            },
            {
                "path": "about-artist/:id",
				"canActivate": [AuthGuard],
                "loadChildren": ".\/pages\/default\/about-artist\/about-artist.module#AboutArtistModule"
            },
            {
                "path": "current-event/:id",
                "canActivate": [AuthGuard],
                "loadChildren": ".\/pages\/default\/current-event\/current-event.module#CurrentEventModule"
            },
            {
                "path": "past-event/:id",
                "canActivate": [AuthGuard],
                "loadChildren": ".\/pages\/default\/past-event\/past-event.module#PastEventModule"
            },
            {
                "path": "artist-availability",
				"canActivate": [AuthGuard],
                "loadChildren": ".\/pages\/default\/artist-availability\/artist-availability.module#ArtistAvailabilityModule"
            },
            {
                "path": "events",
				"canActivate": [AuthGuard],
                "loadChildren": ".\/pages\/default\/events\/events.module#EventsModule"
            },
            {
                "path": "event-summary/:id",
				"canActivate": [AuthGuard],
                "loadChildren": ".\/pages\/default\/event-summary\/event-summary.module#EventSummaryModule"
            },
            {
                "path": "event-approval/:id",
				"canActivate": [AuthGuard],
                "loadChildren": ".\/pages\/default\/event-approval\/event-approval.module#EventApprovalModule"
            },
            {
                "path": "event-public-survey/:id",
				"canActivate": [AuthGuard],
                "loadChildren": ".\/pages\/default\/event-public-survey\/event-public-survey.module#EventPublicSurveyModule"
            },
            {
                "path": "event-picks/:id",
				"canActivate": [AuthGuard],
                "loadChildren": ".\/pages\/default\/event-picks\/event-picks.module#EventPicksModule"
            },
            {
                "path": "surveys",
				"canActivate": [AuthGuard],
                "loadChildren": ".\/pages\/default\/surveys\/surveys.module#SurveysModule"
            },
            {
                "path": "teams",
				"canActivate": [AuthGuard],
                "loadChildren": ".\/pages\/default\/teams\/teams.module#TeamsModule"
            },
            {
                "path": "users",
				"canActivate": [AuthGuard],
                "loadChildren": ".\/pages\/default\/users\/users.module#UsersModule"
            },

            {
                "path": "venues",
				"canActivate": [AuthGuard],
                "loadChildren": ".\/pages\/default\/venues\/venues.module#VenuesModule"
            },
            {
                "path": "",
                "redirectTo": "index",
                "pathMatch": "full"
            }
        ]
    },
    {
        "path": "**",
        "redirectTo": "404",
        "pathMatch": "full"
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ThemeRoutingModule { }
