import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  private _loaderSubject: Subject<boolean>;
  public loader: Observable<boolean>

  showLoader() {
    this._loaderSubject.next(true)
  }

  hideLoader() {
    this._loaderSubject.next(false)
  }

  constructor() {
    this._loaderSubject = new Subject<boolean>();
    this.loader = this._loaderSubject.asObservable(); 
    this._loaderSubject.next(false);
  }
}
