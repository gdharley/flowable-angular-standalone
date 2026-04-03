import {HttpClient, HttpHeaders} from '@angular/common/http';
import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Model} from '@flowable/forms';
import {combineLatest, firstValueFrom} from 'rxjs';
import {map, mergeMap} from 'rxjs/operators';

@Component({
  selector: 'app-process',
  standalone: false,
  templateUrl: './process.component.html',
  styleUrls: ['./process.component.scss']
})
export class ProcessComponent implements OnInit {
  public props?: Model.CommonFormProps;
  public hasForm = false;
  private processDefinitionId?: string;

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
    const processDefinitionId = this.route.params.pipe(map((params) => params['processId']));

    processDefinitionId.subscribe((result) => {
      this.processDefinitionId = result;
    });

    combineLatest([
      processDefinitionId,
      processDefinitionId.pipe(
        mergeMap((currentProcessDefinitionId) =>
          this.httpClient.get<Model.FormLayout>(
            `/platform-api/process-definitions/${currentProcessDefinitionId}/start-form`,
            this.options
          )
        )
      )
    ]).subscribe({
      next: ([currentProcessDefinitionId, formLayout]) => {
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
      },
      error: () => {
        this.hasForm = false;
        this.props = undefined;
        this.cdr.detectChanges();
      }
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
