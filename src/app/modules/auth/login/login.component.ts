import {Component, OnInit, OnDestroy, ChangeDetectorRef} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Subscription, Observable} from 'rxjs';
import {first} from 'rxjs/operators';
import {UserModel} from '../_models/user.model';
import {AuthService} from '../_services/auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {InitializationService} from '../../../initialization.service';
import {environment} from '../../../../environments/environment';
import {CookieService} from 'ngx-cookie-service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  // KeenThemes mock, change it to:
  // defaultAuth = {
  //   email: '',
  //   password: '',
  // };
  // defaultAuth: any = {
  //   email: 'admin@demo.com',
  //   password: 'demo',
  // };
  defaultAuth: any = {
    email: 'test-user@mailinator.com',
    password: '12345678',
  };
  loginForm: FormGroup;
  hasError: boolean;
  returnUrl: string;
  isLoading$: Observable<boolean>;

  initialData;

  submitData;
  submitResponseData;
  authUser;
  public accessToken;
  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
  constructor(
      private fb: FormBuilder,
      private authService: AuthService,
      private route: ActivatedRoute,
      private router: Router,
      private initializationService: InitializationService,
      private cookieService: CookieService,
  ) {
    this.initialData = null;
    this.submitData = null;
    this.isLoading$ = this.authService.isLoading$;

    this.accessToken = this.cookieService.get('accessToken') ? this.cookieService.get('accessToken') : null;

    // redirect to home if already logged in
    if (this.authService.currentUserValue) {
      this.router.navigate(['/']);
    }
  }
  async ngOnInit(): Promise<void> {
    this.initForm();
    // this.cookieService.delete('accessToken');

    // console.log(this.accessToken);

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'.toString()] || '/';
    if (this.accessToken) {
      this.initialData = this.initializationService.getResponseUser(this.accessToken);
    } else {
      this.initialData = this.initializationService.getConfigResponse();
    }

    // console.log('initialData = ', this.initialData);
  }
  // convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }
  initForm() {
    this.loginForm = this.fb.group({
      email: [
        this.defaultAuth.email,
        Validators.compose([
          Validators.required,
          Validators.email,
          Validators.minLength(3),
          Validators.maxLength(320)
          // https://stackoverflow.com/questions/386294/what-is-the-maximum-length-of-a-valid-email-address
        ]),
      ],
      password: [
        this.defaultAuth.password,
        Validators.compose([
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ]),
      ],
    });
  }
  async submit() {
    this.hasError = false;
    this.submitData = {
      grant_type: 'password',
      client_id: environment.client_id,
      client_secret: environment.client_secret,
      password: this.f.password.value,
      username: this.f.email.value,
      scope: '*'
    };

    try {
      this.submitResponseData = await this.initializationService.signIn(this.submitData);
    } catch (e) {
      this.initializationService.deleteAccessToken();
      console.log('invalid // login failed // route login');
      console.log(e);
      this.hasError = true;
    }
    // console.log(this.submitResponseData);
    // debugger;
    // if (!this.submitResponseData.access_token) {
    //   this.hasError = true;
    // }

    // debugger;
    // const loginSubscr = this.authService
    //     .login(this.f.email.value, this.f.password.value)
    //     .pipe(first())
    //     .subscribe((user: UserModel) => {
    //       console.log(user);
    //       if (user) {
    //         console.log('Redirect to ' + this.returnUrl);
    //         // console.log(this.router.navigate([this.returnUrl]));;
    //         this.router.navigate([this.returnUrl]);
    //       } else {
    //         this.hasError = true;
    //       }
    //     });
    // console.log(this.unsubscribe);
    // this.unsubscribe.push(loginSubscr);
  }
  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
