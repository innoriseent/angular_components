import { Injectable, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject, of, Subscription } from 'rxjs';
import { map, catchError, switchMap, finalize } from 'rxjs/operators';
import { UserModel } from '../_models/user.model';
import { MspModel} from '../_models/msp.model';
import { AuthModel } from '../_models/auth.model';
import { AuthHTTPService } from './auth-http';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import {HttpHeaders} from '@angular/common/http';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
  private authLocalStorageToken = `${environment.appVersion}-${environment.USERDATA_KEY}`;

  // public fields
  // TODO - move it after implementation to SystemStorage service to use globally
  currentUser$: Observable<UserModel>;
  currentMsp$: Observable<MspModel>;
  isLoading$: Observable<boolean>;
  currentUserSubject: BehaviorSubject<UserModel>;
  currentMspSubject: BehaviorSubject<MspModel>;
  isLoadingSubject: BehaviorSubject<boolean>;


  get currentUserValue(): UserModel {
    return this.currentUserSubject.value;
  }

  set currentUserValue(user: UserModel) {
    this.currentUserSubject.next(user);
  }

  get currentMspValue(): MspModel {
    return this.currentMspSubject.value;
  }

  set currentMspValue(msp: MspModel) {
    this.currentMspSubject.next(msp);
  }

  constructor(
    private authHttpService: AuthHTTPService,
    private router: Router,
    private httpClient: HttpClient
  ) {
    this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    this.currentUserSubject = new BehaviorSubject<UserModel>(undefined);
    this.currentMspSubject = new BehaviorSubject<MspModel>(undefined);
    this.currentUser$ = this.currentUserSubject.asObservable();
    this.currentMsp$ = this.currentMspSubject.asObservable();
    // this.isLoading$ = this.isLoadingSubject.asObservable();
    // const subscr = this.getUserByToken().subscribe();
    // this.unsubscribe.push(subscr);
    this.startInitialProcess();
  }

  // public methods
  login(email: string, password: string): Observable<UserModel> {
    this.isLoadingSubject.next(true);
    return this.authHttpService.login(email, password).pipe(
      map((auth: AuthModel) => {
        const result = this.setAuthFromLocalStorage(auth);
        return result;
      }),
      switchMap(() => this.getUserByToken()),
      catchError((err) => {
        console.error('err', err);
        return of(undefined);
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  logout() {
    localStorage.removeItem(this.authLocalStorageToken);
    this.router.navigate(['/auth/login'], {
      queryParams: {},
    });
  }

  getUserByToken(): Observable<UserModel> {
    const auth = this.getAuthFromLocalStorage();
    if (!auth || !auth.authToken) {
      return of(undefined);
    }

    this.isLoadingSubject.next(true);
    return this.authHttpService.getUserByToken(auth.authToken).pipe(
      map((user: UserModel) => {
        if (user) {
          this.currentUserSubject = new BehaviorSubject<UserModel>(user);
        } else {
          this.logout();
        }
        return user;
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  // need create new user then login
  registration(user: UserModel): Observable<any> {
    this.isLoadingSubject.next(true);
    return this.authHttpService.createUser(user).pipe(
      map(() => {
        this.isLoadingSubject.next(false);
      }),
      // switchMap(() => this.login(user.email, user.password)),
      catchError((err) => {
        console.error('err', err);
        return of(undefined);
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  forgotPassword(email: string): Observable<boolean> {
    this.isLoadingSubject.next(true);
    return this.authHttpService
      .forgotPassword(email)
      .pipe(finalize(() => this.isLoadingSubject.next(false)));
  }

  // private methods
  private setAuthFromLocalStorage(auth: AuthModel): boolean {
    // store auth authToken/refreshToken/epiresIn in local storage to keep user logged in between page refreshes
    if (auth && auth.authToken) {
      localStorage.setItem(this.authLocalStorageToken, JSON.stringify(auth));
      return true;
    }
    return false;
  }

  private getAuthFromLocalStorage(): AuthModel {
    try {
      const authData = JSON.parse(
        localStorage.getItem(this.authLocalStorageToken)
      );
      return authData;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }

  public startInitialProcess(){
    const passport =  localStorage.getItem('t');
    if (passport === null){
      this.initial();
      this.router.navigateByUrl('/auth/login');
    }else{
      const userParsed = JSON.parse(passport);
      const token = userParsed.access_token;
      this.initial(token);
      // Take token and initial with it
    }
  }

  async initial(token: string = null){
    let initialData;
    console.log(token);
    if (token) {
      const header = new HttpHeaders({
        Authorization: `Bearer ${token}`
      });
      initialData = await this.httpClient.get(environment.initialUrl, {headers: header}).toPromise();
      if (initialData.user){
        console.log(initialData.user);
        // @ts-ignore
        this.currentUser = new UserModel().setUser(initialData.user);
        await this.router.navigateByUrl('/dashboard');
        // this.currentMsp = new MspModel().setMsp(initialData.msp);
      }
      else{
        localStorage.removeItem('t');
        await this.router.navigateByUrl('/auth/login');
      }
      console.log('-', this.currentUser$);
    } else {
      initialData = await this.httpClient.get(environment.initialUrl).toPromise();
    }

    console.log('initialData = ', initialData);

  }
}
