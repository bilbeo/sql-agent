import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateChild } from '@angular/router';
import { SharedService } from './shared.service';

@Injectable()
export class AuthGuardService implements CanActivate, CanActivateChild {
    constructor(private sharedService: SharedService, private router: Router) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        const url: string = state.url;
        return this.checkLogin(url);
    }

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        return this.canActivate(route, state);
    }

    checkLogin(url: string): boolean {
        if (this.sharedService.getFromStorage('token')) {
            return true;
        }

        this.router.navigate(['/auth']);
        return false;
    }
}
