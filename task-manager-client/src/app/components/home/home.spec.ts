import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { HomeComponent } from './home';
import { AuthService } from '../../services/auth.service';

describe('HomeComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: AuthService, useValue: { currentUser: signal(null) } },
        provideRouter([]),
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(HomeComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
