import { 
 Component,
 OnInit,
 AfterViewInit,
 ViewChild,
 ViewEncapsulation,
 ViewContainerRef,
 ComponentFactoryResolver
} from "@angular/core";
import { Router,ActivatedRoute,Params } from "@angular/router";
import { AuthenticationService } from "../_services/authentication.service";
import { AlertService } from '../_services/alert.service';
import { AlertComponent } from '../_directives/alert.component';
import { Helpers } from "../../helpers";

@Component({
   selector: '.m-grid.m-grid--hor.m-grid--root.m-page',
    templateUrl: './reset-password.component.html',
    encapsulation: ViewEncapsulation.None,
})

export class ResetPasswordComponent implements AfterViewInit {

 @ViewChild('alertResetPassword',
        { read: ViewContainerRef }) alertResetPassword: ViewContainerRef;
	public model:any={
		password:'',
		cpassword:''
	}
	public userId:number=0;
	public key:string="";
	public loading: boolean = false;
	
    constructor(private _activatedRoute: ActivatedRoute,
		private _router: Router,
		private _alertService: AlertService,
		private cfr: ComponentFactoryResolver,
		 private _authService: AuthenticationService) {
			
    }
	
	 ngAfterViewInit() {
		 this._activatedRoute.params.subscribe((params: Params) => {
            setTimeout(() => {
               this.userId=params['uid'];
				console.log(this.userId);
				this.key=params['key'];
				console.log(this.key);
            }, 500);
        });
			
    }
	
	public changePassword(){
		if(this.model.password.trim() =="" || this.model.cpassword.trim()==""){
			this.showAlert('alertResetPassword');
            this._alertService.error("password and confirm password both are mandatory.");
		}
		else if(this.model.password.trim() != this.model.cpassword.trim()){
			this.showAlert('alertResetPassword');
            this._alertService.error("password and confirm password does not match");
		}
		else{
			 Helpers.setLoading(true);
			 this._authService.changePassword(this.userId,this.model.password,this.key).subscribe(
				(isSuccess) => {
					if(isSuccess){
						
						this.model = {};
					} else {
						                 
					}
					 Helpers.setLoading(false);
				},
				(error) => {
					this.showAlert('alertResetPassword');
					this._alertService.error(error);
					 Helpers.setLoading(false);
				});
		}
	}
	
	showAlert(target) {
        this[target].clear();
        let factory = this.cfr.resolveComponentFactory(AlertComponent);
        let ref = this[target].createComponent(factory);
        ref.changeDetectorRef.detectChanges();
    }

}