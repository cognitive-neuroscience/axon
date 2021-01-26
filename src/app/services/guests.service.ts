import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import { take } from "rxjs/operators";
import { Role } from "../models/InternalDTOs";
import { User } from '../models/Login';
import { AuthService } from "./auth.service";

@Injectable({
    providedIn: "root"
})
export class GuestsService {

    private _guestsBehaviorSubject$: BehaviorSubject<User[]>;
    public guests: Observable<User[]>;

    constructor(private authService: AuthService) {
        this._guestsBehaviorSubject$ = new BehaviorSubject(null);
        this.guests = this._guestsBehaviorSubject$.asObservable();
    }

    public updateGuests(): void {
        const jwt = this.authService.getDecodedToken()
        const role = jwt ? jwt.Role : null

        if(role && (role === Role.ADMIN || role === Role.GUEST)) {
            this._getGuests().pipe(take(1)).subscribe(guests => {
                this._guestsBehaviorSubject$.next(guests)
            })
        }
    }

    private _getGuests(): Observable<User[]> {
        return of([
            {
                UserID: "1",
                Email: "example1@gmail.com",
                Role: Role.GUEST,
                exp: null
            },
            {
                UserID: "2",
                Email: "example2@gmail.com",
                Role: Role.GUEST,
                exp: null
            },
            {
                UserID: "3",
                Email: "example3@gmail.com",
                Role: Role.GUEST,
                exp: null
            },
            {
                UserID: "4",
                Email: "example4@gmail.com",
                Role: Role.GUEST,
                exp: null
            }
        ]);
    }

}