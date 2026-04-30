import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { AuthService } from '../../../core/services/auth.service';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';

describe('NavbarComponent', () => {
  let fixture: ComponentFixture<NavbarComponent>;
  let component: NavbarComponent;
  let authSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authSpy = jasmine.createSpyObj<AuthService>(
      'AuthService',
      ['logout', 'getToken'],
      {
        currentUser: signal(null),
        isLoggedIn: signal(false) as any,
        isAdmin: signal(false) as any,
      }
    );

    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authSpy },
      ],
    }).compileComponents();

    fixture   = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // --- dropdownOpen signal ---

  it('starts with dropdownOpen = false', () => {
    expect(component.dropdownOpen()).toBeFalse();
  });

  it('toggleDropdown() sets dropdownOpen to true when it was false', () => {
    const event = new MouseEvent('click');
    spyOn(event, 'stopPropagation');

    component.toggleDropdown(event);

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(component.dropdownOpen()).toBeTrue();
  });

  it('toggleDropdown() flips dropdownOpen from true to false', () => {
    const event = new MouseEvent('click');

    component.toggleDropdown(event); // → true
    component.toggleDropdown(event); // → false

    expect(component.dropdownOpen()).toBeFalse();
  });

  it('closeDropdown() sets dropdownOpen to false', () => {
    const event = new MouseEvent('click');
    component.toggleDropdown(event); // open it first
    expect(component.dropdownOpen()).toBeTrue();

    component.closeDropdown();

    expect(component.dropdownOpen()).toBeFalse();
  });

  it('closeDropdown() is a no-op when already false', () => {
    component.closeDropdown();
    expect(component.dropdownOpen()).toBeFalse();
  });

  // --- initials() ---

  it('initials() returns empty string when user is null', () => {
    expect(component.initials()).toBe('');
  });

  it('initials() returns single uppercase initial for one-word name', () => {
    (authSpy as any).currentUser = signal({ id: 1, name: 'Ana', email: 'a@b.com', role: 'USER' });
    expect(component.initials()).toBe('A');
  });

  it('initials() returns two uppercase initials for two-word name', () => {
    (authSpy as any).currentUser = signal({ id: 1, name: 'Juan Perez', email: 'j@b.com', role: 'USER' });
    expect(component.initials()).toBe('JP');
  });

  it('initials() returns only two initials for longer names', () => {
    (authSpy as any).currentUser = signal({ id: 1, name: 'Ana Maria Lopez', email: 'a@b.com', role: 'USER' });
    expect(component.initials()).toBe('AM');
  });

  it('initials() uppercases lowercase names', () => {
    (authSpy as any).currentUser = signal({ id: 1, name: 'john doe', email: 'j@b.com', role: 'USER' });
    expect(component.initials()).toBe('JD');
  });
});
