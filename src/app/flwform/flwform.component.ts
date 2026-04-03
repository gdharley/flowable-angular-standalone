import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild
} from '@angular/core';
import type {Model} from '@flowable/forms';

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
export class FlwformComponent implements AfterViewInit, OnDestroy {
  @Input() props: Model.CommonFormProps | undefined;
  @Input() payload: Model.Payload = {};
  @Output() payloadChange = new EventEmitter<Model.Payload>();
  @ViewChild('el', {read: ElementRef}) el: ElementRef | undefined;
  private destroyForm: (() => void) | undefined;
  renderError = '';

  constructor(private readonly cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    void this.renderForm();
  }

  ngOnDestroy(): void {
    this.destroyForm?.();
  }

  private async renderForm(): Promise<void> {
    if (!this.el) {
      return;
    }

    this.destroyForm?.();
    if (!this.props) {
      this.destroyForm = undefined;
      this.renderError = '';
      return;
    }

    try {
      const {render} = await import('@flowable/forms/index-complete.js');
      this.renderError = '';
      const rendered = render(this.el.nativeElement, {
        ...this.props,
        payload: this.payload,
        debug: true,
        onChange: (payload: Model.Payload) => {
          this.payload = payload;
          this.payloadChange.emit(payload);
        }
      });

      this.destroyForm = rendered.destroy;
      this.cdr.detectChanges();

      rendered.form.catch((error: unknown) => {
        this.renderError = error instanceof Error ? error.message : String(error);
        this.cdr.detectChanges();
      });
    } catch (error) {
      this.renderError = error instanceof Error ? error.message : String(error);
      this.cdr.detectChanges();
    }
  }
}
