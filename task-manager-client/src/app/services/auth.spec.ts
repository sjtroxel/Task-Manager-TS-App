import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

const BASE_URL = `${environment.apiUrl}/users`;

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('login()', () => {
    it('POSTs to /login, sets currentUser signal, and saves token to localStorage', () => {
      const credentials = { email: 'test@test.com', password: 'password123' };
      const mockResponse = { _id: '1', name: 'Test User', email: 'test@test.com', token: 'abc123' };

      service.login(credentials).subscribe();

      const req = httpMock.expectOne(`${BASE_URL}/login`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);

      expect(service.currentUser()).toEqual(mockResponse);
      expect(localStorage.getItem('token')).toBe('abc123');
      expect(JSON.parse(localStorage.getItem('user')!)).toEqual(mockResponse);
    });

    it('does not update currentUser or localStorage when credentials are invalid', () => {
      let errorCaught = false;

      service.login({ email: 'bad@bad.com', password: 'wrong' }).subscribe({
        error: () => (errorCaught = true),
      });

      const req = httpMock.expectOne(`${BASE_URL}/login`);
      req.flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });

      expect(service.currentUser()).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
      expect(errorCaught).toBe(true);
    });
  });

  describe('register()', () => {
    it('POSTs to /register, sets currentUser signal, and saves token to localStorage', () => {
      const userData = { name: 'New User', email: 'new@test.com', password: 'pass123' };
      const mockResponse = { _id: '2', name: 'New User', email: 'new@test.com', token: 'tok456' };

      service.register(userData).subscribe();

      const req = httpMock.expectOne(`${BASE_URL}/register`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);

      expect(service.currentUser()).toEqual(mockResponse);
      expect(localStorage.getItem('token')).toBe('tok456');
    });
  });

  describe('logout()', () => {
    it('clears the currentUser signal and removes token and user from localStorage', () => {
      localStorage.setItem('token', 'existing-token');
      localStorage.setItem('user', JSON.stringify({ name: 'Someone' }));
      service.currentUser.set({ name: 'Someone' });

      service.logout();

      expect(service.currentUser()).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('updateProfile()', () => {
    it('PUTs to /profile and merges updated name into the currentUser signal and localStorage', () => {
      const existing = { _id: '1', name: 'Old Name', email: 'a@b.com', token: 'tok' };
      service.currentUser.set(existing);
      localStorage.setItem('user', JSON.stringify(existing));

      const serverResponse = { _id: '1', name: 'New Name', email: 'a@b.com' };
      service.updateProfile({ name: 'New Name' }).subscribe();

      const req = httpMock.expectOne(`${BASE_URL}/profile`);
      expect(req.request.method).toBe('PUT');
      req.flush(serverResponse);

      expect(service.currentUser()?.name).toBe('New Name');
      expect(JSON.parse(localStorage.getItem('user')!).name).toBe('New Name');
    });
  });
});
