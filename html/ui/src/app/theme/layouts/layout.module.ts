import { NgModule } from '@angular/core';
import { DefaultComponent } from '../pages/default/default.component';
import { HeaderNavComponent } from './header-nav/header-nav.component';
import { SubheaderTypeSearchComponent } from '../pages/subheader-type-search/subheader-type-search.component';
import { FooterComponent } from './footer/footer.component';
import { ScrollTopComponent } from './scroll-top/scroll-top.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HrefPreventDefaultDirective } from '../../_directives/href-prevent-default.directive';
import { UnwrapTagDirective } from '../../_directives/unwrap-tag.directive';

@NgModule({
    declarations: [
        DefaultComponent,
        HeaderNavComponent,
        SubheaderTypeSearchComponent,
        FooterComponent,
        ScrollTopComponent,
        HrefPreventDefaultDirective,
        UnwrapTagDirective,
    ],
    exports: [
        DefaultComponent,
        HeaderNavComponent,
        SubheaderTypeSearchComponent,
        FooterComponent,
        ScrollTopComponent,
        HrefPreventDefaultDirective,
    ],
    imports: [
        CommonModule,
        RouterModule,
    ]
})

export class LayoutModule {
}