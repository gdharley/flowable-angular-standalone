import {HttpClient, HttpHeaders} from '@angular/common/http';
import {ChangeDetectorRef, Component, DestroyRef, OnInit, inject} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ActivatedRoute, Router} from '@angular/router';
import {Model} from '@flowable/forms';
import {forkJoin, of, ReplaySubject} from 'rxjs';
import {catchError, map, switchMap, tap} from 'rxjs/operators';

import {MenuRefreshService} from '../menu-refresh.service';

@Component({
  selector: 'app-task',
  standalone: false,
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss']
})
export class TaskComponent implements OnInit {
  public formData: ReplaySubject<FormData> = new ReplaySubject<FormData>(1);
  public hasForm = false;
  public isLoading = false;
  public variables: Model.Payload = {};
  public taskHeader?: TaskHeader;
  private currentTaskId?: string;
  private readonly destroyRef = inject(DestroyRef);
  private readonly options = {
    headers: new HttpHeaders({
      Authorization: 'Basic YWRtaW46dGVzdA=='
    })
  };

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly route: ActivatedRoute,
    private readonly httpClient: HttpClient,
    private readonly router: Router,
    private readonly menuRefreshService: MenuRefreshService
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(
        map((params) => params['taskId']),
        tap((currentTaskId) => {
          this.currentTaskId = currentTaskId;
          this.isLoading = true;
          this.hasForm = false;
          this.variables = {};
          this.taskHeader = undefined;
          this.cdr.detectChanges();
        }),
        switchMap((currentTaskId) =>
          forkJoin({
            form: this.httpClient
              .get<Model.FormLayout>(`/core-api/tasks/${currentTaskId}/form`, this.options)
              .pipe(catchError(() => of({} as Model.FormLayout))),
            taskDetails: this.httpClient.get<TaskDetails>(
              `/platform-api/tasks/${currentTaskId}`,
              this.options
            ),
            variables: this.httpClient.get<Model.Payload>(
              `/core-api/tasks/${currentTaskId}/variables`,
              this.options
            )
          }).pipe(
            map(({form, taskDetails, variables}) => ({
              currentTaskId,
              form,
              taskDetails,
              variables
            })),
            catchError(() =>
              of({
                currentTaskId,
                form: {} as Model.FormLayout,
                taskDetails: {} as TaskDetails,
                variables: {}
              })
            )
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(({currentTaskId, form, taskDetails, variables}) => {
        this.currentTaskId = currentTaskId;
        this.isLoading = false;
        this.variables = variables;
        this.hasForm = this.hasRenderableForm(form);
        this.taskHeader = {
          name: taskDetails.name || 'Task',
          assignee: taskDetails.assignee || 'Unassigned',
          dueDate: this.formatDate(taskDetails.dueDate),
          createdDate: this.formatDate(taskDetails.createTime)
        };
        form.outcomes = form.outcomes || [
          {
            label: 'Complete',
            value: '__COMPLETE'
          }
        ];

        this.formData.next({
          props: {
            config: form,
            onOutcomePressed: (payload: Model.Payload, result: unknown) => {
              this.completeTask(currentTaskId, payload, result);
            }
          },
          variables
        });
        this.cdr.detectChanges();
      });
  }

  completeWithoutForm(): void {
    if (!this.currentTaskId) {
      return;
    }

    this.completeTaskWithoutVariables(this.currentTaskId, '__COMPLETE');
  }

  private completeTask(taskId: string, payload: Model.Payload, result: unknown): void {
    this.httpClient
      .post(
        `/core-api/tasks/${taskId}/complete`,
        {
          ...payload,
          outcome: result
        },
        this.options
      )
      .subscribe(() => {
        this.menuRefreshService.trigger();
        void this.router.navigate(['/']);
      });
  }

  private completeTaskWithoutVariables(taskId: string, result: unknown): void {
    this.httpClient
      .post(
        `/core-api/tasks/${taskId}/complete`,
        {
          outcome: result
        },
        this.options
      )
      .subscribe(() => {
        this.menuRefreshService.trigger();
        void this.router.navigate(['/']);
      });
  }

  private hasRenderableForm(form: Model.FormLayout | undefined): boolean {
    return Array.isArray(form?.rows) && form.rows.length > 0;
  }

  private formatDate(value: string | undefined): string {
    if (!value) {
      return 'Not set';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  }
}

interface FormData {
  props: Model.CommonFormProps;
  variables: Model.Payload;
}

interface TaskDetails {
  name?: string;
  assignee?: string;
  dueDate?: string;
  createTime?: string;
}

interface TaskHeader {
  name: string;
  assignee: string;
  dueDate: string;
  createdDate: string;
}
