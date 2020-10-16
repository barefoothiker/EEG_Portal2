import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private router: Router,
                private authService: AuthService)
                {}

    canActivate() {
        // if (localStorage.getItem('isLoggedin')) {
        //     return true;
        // }

        if (!this.authService.isTokenExpired()) {
          return true;
          // return false;

        }

        this.router.navigate(['/login']);
        return false;
    }
}
