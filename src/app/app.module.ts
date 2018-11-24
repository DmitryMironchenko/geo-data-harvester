import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { AgmSnazzyInfoWindowModule } from '@agm/snazzy-info-window';
import { AgmCoreModule } from '@agm/core';
import { AgmJsMarkerClustererModule } from '@agm/js-marker-clusterer';

import { AppComponent } from './app.component';
import { HarvesterComponent } from './harvester/harvester.component';
import { DashComponent } from './operator-dashboard/dash.component';

const appRoutes: Routes = [
  { path: 'harvester',  component: HarvesterComponent },
  { path: 'dashboard',  component: DashComponent },
  { path: '',  component: AppComponent },
  /*{ path: 'hero/:id',   component: HeroDetailComponent },
  {
    path: 'heroes',
    component: HeroListComponent,
    data: { title: 'Heroes List' }
  },
  { path: '',
    redirectTo: '/heroes',
    pathMatch: 'full'
  },
  { path: '**', component: PageNotFoundComponent }*/
];


@NgModule({
  declarations: [
    AppComponent,
    HarvesterComponent,
    DashComponent,
  ],
  imports: [
    BrowserModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyDzUH4ykC5N_aMHgiGAW_XdHDfnARVpJy8',
    }),
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true } // <-- debugging purposes only
    ),
    CommonModule,
    BrowserAnimationsModule, // required animations module
    ToastrModule.forRoot({
      preventDuplicates: true,
      resetTimeoutOnDuplicate: true,
    }),
    AgmSnazzyInfoWindowModule,
    AgmJsMarkerClustererModule,
  ],
  providers: [],
  bootstrap: [ AppComponent ],
})
export class AppModule { }
