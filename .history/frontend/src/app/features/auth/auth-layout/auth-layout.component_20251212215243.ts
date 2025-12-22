import { Component } from '@angular/core';

@Component({
  selector: 'app-auth-layout',
  template: `
    <div class="auth-layout">
      <div class="auth-card">
        <div class="auth-header">
          <mat-icon class="logo-icon">support_agent</mat-icon>
          <h1>Complaint Portal</h1>
          <p>Digital Complaint Management & Grievance Portal</p>
        </div>
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [
    `
      .auth-layout {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        padding: 20px;
      }

      .auth-card {
        background: var(--bg-card);
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        padding: 40px;
        width: 100%;
        max-width: 440px;
        animation: slideUp 0.3s ease-out;
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .auth-header {
        text-align: center;
        margin-bottom: 32px;
      }

      .logo-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #3f51b5;
        margin-bottom: 16px;
      }

      h1 {
        margin: 0 0 8px;
        font-size: 1.75rem;
        font-weight: 500;
        color: var(--text-primary);
      }

      p {
        margin: 0;
        color: var(--text-secondary);
        font-size: 0.875rem;
      }

      @media (max-width: 480px) {
        .auth-card {
          padding: 24px;
        }
      }
    `,
  ],
})
export class AuthLayoutComponent {}
