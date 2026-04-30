import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';
import { provideRouter } from '@angular/router';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj<AuthService>('AuthService', [
      'getToken',
      'logout',
      'currentUser',
      'isLoggedIn',
    ]);

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authSpy },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock   = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  afterEach(() => httpMock.verify());

  it('adds Authorization header when token exists', () => {
    authService.getToken.and.returnValue('my-token');

    httpClient.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-token');
    req.flush({});
  });

  it('does not add Authorization header when token is null', () => {
    authService.getToken.and.returnValue(null);

    httpClient.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('calls auth.logout() on 401 response', () => {
    authService.getToken.and.returnValue(null);

    httpClient.get('/api/test').subscribe({ error: () => {} });

    const req = httpMock.expectOne('/api/test');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(authService.logout).toHaveBeenCalledTimes(1);
  });

  it('does not call auth.logout() on non-401 errors', () => {
    authService.getToken.and.returnValue(null);

    httpClient.get('/api/test').subscribe({ error: () => {} });

    const req = httpMock.expectOne('/api/test');
    req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });

    expect(authService.logout).not.toHaveBeenCalled();
  });

  it('re-throws the error after a 401', () => {
    authService.getToken.and.returnValue(null);
    let caught: HttpErrorResponse | undefined;

    httpClient.get('/api/test').subscribe({
      error: (err: HttpErrorResponse) => { caught = err; },
    });

    const req = httpMock.expectOne('/api/test');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(caught).toBeDefined();
    expect(caught!.status).toBe(401);
  });
});
