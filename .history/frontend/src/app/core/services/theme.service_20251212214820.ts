import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly THEME_KEY = 'dark_mode';
  private isDarkModeSubject: BehaviorSubject<boolean>;

  isDarkMode$ = new BehaviorSubject<boolean>(false).asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    const isDarkMode = this.getStoredTheme();
    this.isDarkModeSubject = new BehaviorSubject<boolean>(isDarkMode);
    this.isDarkMode$ = this.isDarkModeSubject.asObservable();
    this.applyTheme(isDarkMode);
  }

  get isDarkMode(): boolean {
    return this.isDarkModeSubject.value;
  }

  toggleTheme(): void {
    const newValue = !this.isDarkModeSubject.value;
    this.isDarkModeSubject.next(newValue);
    this.storeTheme(newValue);
    this.applyTheme(newValue);
  }

  setDarkMode(isDark: boolean): void {
    this.isDarkModeSubject.next(isDark);
    this.storeTheme(isDark);
    this.applyTheme(isDark);
  }

  private getStoredTheme(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem(this.THEME_KEY);
      if (stored !== null) {
        return stored === 'true';
      }
      // Check system preference
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  }

  private storeTheme(isDark: boolean): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.THEME_KEY, String(isDark));
    }
  }

  private applyTheme(isDark: boolean): void {
    if (isPlatformBrowser(this.platformId)) {
      if (isDark) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
    }
  }
}
