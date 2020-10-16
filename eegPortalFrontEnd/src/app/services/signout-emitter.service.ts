import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class SignoutEmitterService {

    private emitChangeSource = new Subject<any> ();

    public changeEmitted$ = this.emitChangeSource.asObservable();

    public emitChange(change: any) {
        this.emitChangeSource.next(change);
    }
}
