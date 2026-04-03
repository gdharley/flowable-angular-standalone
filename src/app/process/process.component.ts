import {HttpClient, HttpHeaders} from '@angular/common/http';
import {ChangeDetectorRef, Component, DestroyRef, OnInit, inject} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ActivatedRoute, Router} from '@angular/router';
import {Model} from '@flowable/forms';
import {firstValueFrom, of} from 'rxjs';
import {catchError, map, switchMap, tap} from 'rxjs/operators';

@Component({
  selector: 'app-process',
  standalone: false,
  templateUrl: './process.component.html',
  styleUrls: ['./process.component.scss']
})
export class ProcessComponent implements OnInit {
  public props?: Model.CommonFormProps;
  public hasForm = false;
  public isLoading = false;
  private processDefinitionId?: string;
  private readonly destroyRef = inject(DestroyRef);

  readonly options = {
    headers: new HttpHeaders({
      Authorization: 'Basic YWRtaW46dGVzdA=='
    })
  };

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly route: ActivatedRoute,
    private readonly httpClient: HttpClient,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(
        map((params) => params['processId']),
        tap((currentProcessDefinitionId) => {
          this.processDefinitionId = currentProcessDefinitionId;
          this.isLoading = true;
          this.hasForm = false;
          this.props = undefined;
          this.cdr.detectChanges();
        }),
        switchMap((currentProcessDefinitionId) =>
          this.httpClient.get<Model.FormLayout>(
            `/platform-api/process-definitions/${currentProcessDefinitionId}/start-form`,
            this.options
          )
            .pipe(
              map((formLayout) => ({
                currentProcessDefinitionId,
                formLayout
              })),
              catchError(() =>
                of({
                  currentProcessDefinitionId,
                  formLayout: {} as Model.FormLayout
                })
              )
            )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(({currentProcessDefinitionId, formLayout}) => {
        this.processDefinitionId = currentProcessDefinitionId;
        this.isLoading = false;
        this.hasForm = this.hasRenderableForm(formLayout);
        formLayout.outcomes = formLayout.outcomes || [
          {
            label: 'Create new process',
            value: '__CREATE'
          }
        ];

        this.props = {
          config: formLayout,
          onOutcomePressed: (payload: Model.Payload, result: unknown) => {
            this.httpClient
              .post(
                '/platform-api/process-instances',
                {
                  ...payload,
                  outcome: result,
                  processDefinitionId: currentProcessDefinitionId
                },
                this.options
              )
              .subscribe(() => {
                void this.router.navigate(['/']);
              });
          }
        };
        this.cdr.detectChanges();
      });
  }

  async clickEvent(): Promise<void> {
    await firstValueFrom(
      this.httpClient.post(
        '/platform-api/process-instances',
        {
          outcome: '__CREATE',
          processDefinitionId: this.processDefinitionId
        },
        this.options
      )
    );
    await this.router.navigate(['/']);
  }

  private hasRenderableForm(form: Model.FormLayout | undefined): boolean {
    return Array.isArray(form?.rows) && form.rows.length > 0;
  }
}
