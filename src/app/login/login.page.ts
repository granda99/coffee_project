import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController, Platform } from '@ionic/angular';
import { PRIORIDAD, SharedService } from 'src/services/shared.services';
import { UserService } from 'src/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  constructor(
    private menu: MenuController,
    private authService: UserService,
    private share: SharedService,
    private route: Router,
    private platform: Platform
  ) {
    this.platform.backButton.subscribeWithPriority(PRIORIDAD, () => {
      navigator['app'].exitApp();
    });
  }
  activeSession: Boolean = false;
  public isView: Boolean = false;
  public loginObj;

  ionViewWillEnter() {
    this.menu.swipeGesture(false);
    this.fastLogin();
  }
  ngOnInit() {
    this.loginObj = {
      email: '',
      password: ''
    }
  }

  showPass() {
    let txtPass: any = document.getElementById('pass');
    let txtPass1: any = document.getElementById('pass1');
    if (txtPass.type == 'text')
      txtPass.type = 'password'
    else
      txtPass.type = 'text'

    if (txtPass1.type == 'text')
      txtPass1.type = 'password'
    else
      txtPass1.type = 'text'

    this.isView = !this.isView;
  }

  async login() {
    try {
      await this.share.startLoading();
      if (this.loginObj.email != '' && this.loginObj.password != '') {
        const user: any = await this.authService.login(this.loginObj);
        if (user) {
          await this.route.navigate(['/tabs/dashboard']).then(r => { });
          sessionStorage.setItem('user', JSON.stringify(user));
          if (this.activeSession)
            localStorage.setItem('user', this.share.encodeInfo(user));
          this.share.showToastColor('', 'Bienvenido de nuevo ' + user.email, 's', 'm');
        }
        this.share.stopLoading();
      }
      else
        this.share.showToastColor('', 'Hay campos vacíos.', 'w', 's');
    }
    catch (ex) {
      this.share.stopLoading();
      let msg = this.share.getMessageError(ex.code);
      this.share.showToastColor('', msg, 'd', 'm')
    }
  }

  async fastLogin() {
    try {
      if (localStorage.getItem('user')) {
        await this.share.startLoading();

        let tokens = this.share.decodeInfo(localStorage.getItem('user'));
        if (tokens) {
          this.activeSession = true;
          sessionStorage.setItem('user', JSON.stringify(tokens));

          const response = await this.authService.onIdTokenRevocation().toPromise();

          let newStsTokenManager = {
            refreshToken: response.refresh_token,
            accessToken: response.access_token,
            expirationTime: this.share.setTimeExpire()
          }

          let user = JSON.parse(sessionStorage.getItem('user'));
          user.stsTokenManager = newStsTokenManager;
          sessionStorage.setItem('user', JSON.stringify(user));

          await this.route.navigate(['/tabs/dashboard']).then(r => { });

          this.share.showToastColor('Auto-Login', 'Bienvenido de nuevo ' + user.email, 's', 'm');
        }
      }
    } catch (ex) {
      this.share.showToastColor('Erorr!!', 'No pudo renovarse la sesión, vuelva a iniciar', 'd', 'm');
      localStorage.clear();
      sessionStorage.clear();
      console.log(ex);
    } finally {
      if (localStorage.getItem('user'))
        this.share.stopLoading();
    }
  }

}
