import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {ProcessComponent} from './process/process.component';
import {TaskComponent} from './task/task.component';
import {WelcomeComponent} from './welcome/welcome.component';

const routes: Routes = [
  {
    component: TaskComponent,
    path: 'task/:taskId'
  },
  {
    component: WelcomeComponent,
    path: ''
  },
  {
    component: ProcessComponent,
    path: 'process/:processId'
  }
];

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forRoot(routes)]
})
export class AppRoutingModule {}
