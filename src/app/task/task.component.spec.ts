import {ComponentFixture, TestBed} from '@angular/core/testing';
import {convertToParamMap} from '@angular/router';
import {provideHttpClient} from '@angular/common/http';
import {provideRouter, ActivatedRoute} from '@angular/router';
import {of} from 'rxjs';

import {TaskComponent} from './task.component';

describe('TaskComponent', () => {
  let component: TaskComponent;
  let fixture: ComponentFixture<TaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TaskComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({taskId: 'demo-task'}))
          }
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
