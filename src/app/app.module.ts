import {HttpClientModule} from '@angular/common/http';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouteReuseStrategy} from '@angular/router';

import {AppRoutingModule, CustomReuseStrategy} from './app-routing.module';
import {AppComponent} from './app.component';
import {FlwformComponent} from './flwform/flwform.component';
import {MenuComponent} from './menu/menu.component';
import {ProcessComponent} from './process/process.component';
import {TaskComponent} from './task/task.component';
import {WelcomeComponent} from './welcome/welcome.component';

@NgModule({
  bootstrap: [AppComponent],
  declarations: [
    AppComponent,
    MenuComponent,
    TaskComponent,
    ProcessComponent,
    WelcomeComponent,
    FlwformComponent
  ],
  imports: [BrowserModule, CommonModule, AppRoutingModule, HttpClientModule],
  providers: [{provide: RouteReuseStrategy, useClass: CustomReuseStrategy}]
})
export class AppModule {}
