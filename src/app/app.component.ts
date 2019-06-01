import {Component, HostListener, Injectable, OnInit, ViewChild} from '@angular/core';

import {ConfigService} from './shared/config.service';
import {Router} from '@angular/router';
import {AuthenticationService} from './auth/login/authentication.service';
import {normalizeDebugBindingName} from '@angular/core/src/util/ng_reflect';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

@Injectable()
export class AppComponent implements OnInit {

  constructor(private authService: AuthenticationService
    , public configService: ConfigService
    , private router: Router
  ) {
  }

  title = 'WeibeSMS';
  isAuthenticated: boolean;

  public innerWidth: any;

  ngOnInit() {

    this.configService.authenticationChanged.subscribe(res => {
      this.isAuthenticated = res;
    });

    this.onResize(null);
    this.innerWidth = window.innerWidth;

    this.isAuthenticated = this.authService.isAuthenticated();
    // this.configService.sidebarStateChanged.subscribe(res => this.configService.sidebarMode = res);

    if (!this.authService.isAuthenticated()) {
      this.router.navigateByUrl('/login');
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerWidth = window.innerWidth;
    if (this.innerWidth < 768) {
      this.configService.sidebarMode = 'hidden';
    } else if (this.innerWidth >= 768 && this.innerWidth <= 991) {
      this.configService.sidebarMode = 'slim';
    }
    else {
      this.configService.sidebarMode = 'default';
    }
  }
}
