import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { AuthService } from './services/auth.service';
import { ComplaintService } from './services/complaint.service';
import { NotificationService } from './services/notification.service';
import { FeedbackService } from './services/feedback.service';
import { CommentService } from './services/comment.service';
import { AnalyticsService } from './services/analytics.service';
import { UserService } from './services/user.service';
import { ThemeService } from './services/theme.service';
import { SnackbarService } from './services/snackbar.service';

import { AuthGuard } from './guards/auth.guard';
import { GuestGuard } from './guards/guest.guard';
import { RoleGuard } from './guards/role.guard';

@NgModule({
  imports: [CommonModule, HttpClientModule],
  providers: [
    AuthService,
    ComplaintService,
    NotificationService,
    FeedbackService,
    CommentService,
    AnalyticsService,
    UserService,
    ThemeService,
    SnackbarService,
    AuthGuard,
    GuestGuard,
    RoleGuard,
  ],
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error(
        'CoreModule is already loaded. Import it in the AppModule only.'
      );
    }
  }
}
