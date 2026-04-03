import {TestBed} from '@angular/core/testing';
import {provideHttpClient} from '@angular/common/http';
import {RouterTestingModule} from '@angular/router/testing';

import {AppComponent} from './app.component';
import {MenuComponent} from './menu/menu.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent, MenuComponent],
      imports: [RouterTestingModule],
      providers: [provideHttpClient()]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should expose the portal title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('Flowable Simple Portal');
  });
});
