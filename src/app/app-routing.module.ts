import {NgModule} from '@angular/core';
import {
  ActivatedRouteSnapshot,
  DetachedRouteHandle,
  RouteReuseStrategy,
  RouterModule,
  Routes
} from '@angular/router';

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

export class CustomReuseStrategy implements RouteReuseStrategy {
  retrieve(_route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    return null;
  }

  shouldAttach(_route: ActivatedRouteSnapshot): boolean {
    return false;
  }

  shouldDetach(_route: ActivatedRouteSnapshot): boolean {
    return false;
  }

  shouldReuseRoute(_future: ActivatedRouteSnapshot, _curr: ActivatedRouteSnapshot): boolean {
    return false;
  }

  store(_route: ActivatedRouteSnapshot, _handle: DetachedRouteHandle | null): void {}
}

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forRoot(routes)]
})
export class AppRoutingModule {}
