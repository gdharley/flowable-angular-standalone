import {Component, OnDestroy} from '@angular/core';

import {FormDebugService} from './form-debug.service';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {
  readonly title = 'Flowable Simple Portal';
  private logoClickCount = 0;
  private logoClickResetTimerId?: number;

  constructor(private readonly formDebugService: FormDebugService) {}

  toggleDebugFromLogo(): void {
    this.logoClickCount += 1;

    if (this.logoClickResetTimerId !== undefined) {
      window.clearTimeout(this.logoClickResetTimerId);
    }

    this.logoClickResetTimerId = window.setTimeout(() => {
      this.logoClickCount = 0;
      this.logoClickResetTimerId = undefined;
    }, 1500);

    if (this.logoClickCount < 3) {
      return;
    }

    this.logoClickCount = 0;

    if (this.logoClickResetTimerId !== undefined) {
      window.clearTimeout(this.logoClickResetTimerId);
      this.logoClickResetTimerId = undefined;
    }

    const enabled = this.formDebugService.toggle();
    console.info(`Flowable form debug ${enabled ? 'enabled' : 'disabled'}.`);
  }

  ngOnDestroy(): void {
    if (this.logoClickResetTimerId !== undefined) {
      window.clearTimeout(this.logoClickResetTimerId);
    }
  }
}
