import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DevToggleComponent } from './dev-toggle/dev-toggle.component';
import { MockBannerComponent } from './mock-banner/mock-banner.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [CommonModule, RouterOutlet, DevToggleComponent, MockBannerComponent]
})
export class AppComponent {
  title = 'movie-rater-web';
  adminDashboard = '';
  isProduction = environment.production;
}
