import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

const STORAGE_KEY = 'flowable-form-debug-enabled';

@Injectable({
  providedIn: 'root'
})
export class FormDebugService {
  private readonly debugSubject = new BehaviorSubject(this.readInitialValue());

  readonly debug$ = this.debugSubject.asObservable();

  get enabled(): boolean {
    return this.debugSubject.value;
  }

  toggle(): boolean {
    const nextValue = !this.debugSubject.value;
    this.debugSubject.next(nextValue);
    localStorage.setItem(STORAGE_KEY, String(nextValue));
    return nextValue;
  }

  private readInitialValue(): boolean {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  }
}
