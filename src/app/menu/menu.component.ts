import {ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {HttpHeaders} from '@angular/common/http';
import {NavigationEnd, Router} from '@angular/router';
import {MenuRefreshService} from '../menu-refresh.service';
import {filter, Subscription} from 'rxjs';

@Component({
  selector: 'app-menu',
  standalone: false,
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit, OnDestroy {
  public tasks?: MenuItem[];
  public processes?: MenuItem[];
  public taskSearch = '';
  public processSearch = '';
  private selectedId?: string;
  private selectedType?: MenuItemType;
  private refreshSubscription?: Subscription;
  private navigationSubscription?: Subscription;
  private taskRefreshIntervalId?: number;

  private readonly options = {
    headers: new HttpHeaders({
      Authorization: 'Basic YWRtaW46dGVzdA=='
    })
  };

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly ngZone: NgZone,
    private readonly menuRefreshService: MenuRefreshService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.syncSelectionFromUrl(this.router.url);
    this.loadTasks();
    this.loadProcesses();
    this.refreshSubscription = this.menuRefreshService.refresh$.subscribe(() => {
      this.loadTasks();
      this.loadProcesses();
    });
    this.navigationSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.syncSelectionFromUrl((event as NavigationEnd).urlAfterRedirects);
      });
    this.taskRefreshIntervalId = window.setInterval(() => {
      this.loadTasks();
    }, 10000);
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
    this.navigationSubscription?.unsubscribe();
    if (this.taskRefreshIntervalId !== undefined) {
      window.clearInterval(this.taskRefreshIntervalId);
    }
  }

  select(item: MenuItem, type: MenuItemType): void {
    this.selectedId = item.id;
    this.selectedType = type;
  }

  isActive(item: MenuItem, type: MenuItemType): boolean {
    return this.selectedId === item.id && this.selectedType === type;
  }

  updateTaskSearch(value: string): void {
    this.taskSearch = value;
  }

  updateProcessSearch(value: string): void {
    this.processSearch = value;
  }

  get filteredTasks(): MenuItem[] {
    return this.filterItems(this.tasks, this.taskSearch);
  }

  get filteredProcesses(): MenuItem[] {
    return this.filterItems(this.processes, this.processSearch);
  }

  private extractItems(result: any): MenuItem[] {
    const items = this.extractArray(result);

    return items
      .map((item: any) => ({
        id: String(item?.id ?? item?.key ?? item?.processDefinitionId ?? ''),
        name: String(
          item?.name ??
            item?.processDefinitionName ??
            item?.title ??
            item?.key ??
            item?.id ??
            ''
        )
      }))
      .filter((item) => item.id.length > 0);
  }

  private extractArray(result: any): any[] {
    if (typeof result === 'string') {
      try {
        return this.extractArray(JSON.parse(result));
      } catch {
        return [];
      }
    }

    if (result?.body) {
      return this.extractArray(result.body);
    }

    if (Array.isArray(result)) {
      return result;
    }

    if (Array.isArray(result?.data)) {
      return result.data;
    }

    if (Array.isArray(result?.content)) {
      return result.content;
    }

    if (Array.isArray(result?._embedded?.data)) {
      return result._embedded.data;
    }

    if (Array.isArray(result?._embedded?.processDefinitions)) {
      return result._embedded.processDefinitions;
    }

    if (Array.isArray(result?._embedded?.tasks)) {
      return result._embedded.tasks;
    }

    return [];
  }

  private parseResult(result: string): any {
    try {
      return JSON.parse(result);
    } catch {
      return result;
    }
  }

  private loadTasks(): void {
    this.makeRequest('/platform-api/search/tasks?filterId=open', (result) => {
      this.ngZone.run(() => {
        this.tasks = this.extractItems(this.parseResult(result));
        this.cdr.detectChanges();
      });
    }, (error) => {
      this.ngZone.run(() => {
        console.error('Failed to load tasks', error);
        this.cdr.detectChanges();
      });
    });
  }

  private loadProcesses(): void {
    this.makeRequest('/process-api/repository/process-definitions?latest=true', (result) => {
      this.ngZone.run(() => {
        this.processes = this.extractItems(this.parseResult(result));
        this.cdr.detectChanges();
      });
    }, (error) => {
      this.ngZone.run(() => {
        console.error('Failed to load processes', error);
        this.cdr.detectChanges();
      });
    });
  }

  private makeRequest(
    url: string,
    onSuccess: (result: string) => void,
    onError: (error: string) => void
  ): void {
    const request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.setRequestHeader('Authorization', this.options.headers.get('Authorization') ?? '');
    request.timeout = 15000;

    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        onSuccess(request.responseText);
      } else {
        onError(`HTTP ${request.status}: ${request.responseText}`);
      }
    };

    request.onerror = () => {
      onError('XMLHttpRequest network error');
    };

    request.ontimeout = () => {
      onError('XMLHttpRequest timeout');
    };

    request.send();
  }

  private filterItems(items: MenuItem[] | undefined, term: string): MenuItem[] {
    const normalizedTerm = term.trim().toLowerCase();

    if (!items?.length || !normalizedTerm) {
      return items ?? [];
    }

    return items.filter((item) => item.name.toLowerCase().includes(normalizedTerm));
  }

  private syncSelectionFromUrl(url: string): void {
    const taskMatch = url.match(/\/task\/([^/?#]+)/);
    if (taskMatch) {
      this.selectedType = 'task';
      this.selectedId = decodeURIComponent(taskMatch[1]);
      return;
    }

    const processMatch = url.match(/\/process\/([^/?#]+)/);
    if (processMatch) {
      this.selectedType = 'process';
      this.selectedId = decodeURIComponent(processMatch[1]);
      return;
    }

    this.selectedType = undefined;
    this.selectedId = undefined;
  }
}

interface MenuItem {
  id: string;
  name: string;
}

type MenuItemType = 'task' | 'process';
