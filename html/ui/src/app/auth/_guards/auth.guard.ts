import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
//import { UserService } from "../_services/user.service";
import { AuthenticationService } from "../_services/authentication.service";
import { Observable } from "rxjs/Rx";

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private _router: Router, private _authService: AuthenticationService) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
        return this._authService.verify().map(
            (isValid) => {
				console.log(isValid);
                if (isValid) {
                    return true;
                } else {
                    // error when verify so redirect to login page with the return url
                    this._router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
                    return false;
                }
            },
            (error) => {
                // error when verify so redirect to login page with the return url
                this._router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
                return false;
            });
    }
}