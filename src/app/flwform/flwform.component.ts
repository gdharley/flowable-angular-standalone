import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  OnDestroy,
  Output,
  SimpleChanges,
  inject,
  ViewChild
} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import type {Model} from '@flowable/forms';

import {FormDebugService} from '../form-debug.service';

@Component({
  selector: 'app-flwform',
  standalone: false,
  template: `
    <div *ngIf="renderError" style="padding: 12px; border: 1px solid #c00; color: #900; margin-bottom: 12px;">
      Flowable form render error: {{ renderError }}
    </div>
    <div #el style="min-height: 24px;"></div>
  `
})
export class FlwformComponent implements AfterViewInit, OnChanges, OnInit, OnDestroy {
  @Input() props: Model.CommonFormProps | undefined;
  @Input() payload: Model.Payload = {};
  @Output() payloadChange = new EventEmitter<Model.Payload>();
  @ViewChild('el', {read: ElementRef}) el: ElementRef | undefined;
  private destroyForm: (() => void) | undefined;
  private renderVersion = 0;
  private viewInitialized = false;
  private debugEnabled = false;
  private readonly destroyRef = inject(DestroyRef);
  renderError = '';

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly formDebugService: FormDebugService
  ) {}

  ngOnInit(): void {
    this.debugEnabled = this.formDebugService.enabled;
    this.formDebugService.debug$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((debugEnabled) => {
        const changed = this.debugEnabled !== debugEnabled;
        this.debugEnabled = debugEnabled;

        if (changed && this.viewInitialized) {
          void this.renderForm();
        }
      });
  }

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    void this.renderForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.viewInitialized) {
      return;
    }

    if (changes['props'] || changes['payload']) {
      void this.renderForm();
    }
  }

  ngOnDestroy(): void {
    this.renderVersion += 1;
    this.destroyForm?.();
  }

  private async renderForm(): Promise<void> {
    if (!this.el) {
      return;
    }

    const renderVersion = ++this.renderVersion;
    this.destroyForm?.();
    if (!this.props) {
      this.destroyForm = undefined;
      this.renderError = '';
      this.el.nativeElement.replaceChildren();
      return;
    }

    try {
      const {render} = await import('@flowable/forms/index-complete.js');
      if (!this.el || renderVersion !== this.renderVersion) {
        return;
      }

      this.renderError = '';
      const rendered = render(this.el.nativeElement, {
        ...this.props,
        payload: this.payload,
        debug: this.debugEnabled,
        onChange: (payload: Model.Payload) => {
          this.payload = payload;
          this.payloadChange.emit(payload);
        }
      });
      if (renderVersion !== this.renderVersion) {
        rendered.destroy();
        return;
      }

      this.destroyForm = rendered.destroy;
      this.cdr.detectChanges();

      rendered.form.catch((error: unknown) => {
        if (renderVersion !== this.renderVersion) {
          return;
        }

        this.renderError = error instanceof Error ? error.message : String(error);
        this.cdr.detectChanges();
      });
    } catch (error) {
      if (renderVersion !== this.renderVersion) {
        return;
      }

      this.renderError = error instanceof Error ? error.message : String(error);
      this.cdr.detectChanges();
    }
  }
}
