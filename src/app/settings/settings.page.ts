import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { nodoServices } from 'src/services/nodoServices';
import { PRIORIDAD, SharedService } from 'src/services/shared.services';
import { UserService } from 'src/services/user.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  public nodosList = [];
  public expanded: any[] = [];
  public disconect: any[] = [];
  public uid

  public viewKey: boolean = true;
  public viewInfo: boolean = true;

  constructor(
    private authService: UserService,
    private share: SharedService,
    private nodos: nodoServices,
    private platform: Platform,
    private router: Router
  ) {
    this.platform.backButton.subscribeWithPriority(PRIORIDAD, async () => {
      if (this.router.url == '/tabs/settings')
        this.router.navigate(['/tabs/dashboard']).then(r => { });
    });
  }

  ionViewWillEnter() {
    this.loadDataConfig();
    this.loadDevices();
  }
  
  ngOnInit() {
  }

  loadDataConfig() {
    this.uid = JSON.parse(sessionStorage.getItem('user')).uid;
  }

  showKey() {
    this.viewKey = !this.viewKey;
    if (!this.viewInfo)
      this.viewInfo = !this.viewInfo
  }

  showInfo() {
    this.viewInfo = !this.viewInfo;
    if (!this.viewKey)
      this.viewKey = !this.viewKey
  }

  async loadDevices() {
    try {
      this.nodosList = [];
      this.expanded = [];
      const response = await this.nodos.getDevicesStatus().toPromise();
      Object.keys(response).forEach((k) => {
        this.nodosList.push(response[k])
      });
      for (let x = 0; x < this.nodosList.length; x++) {
        this.expanded[x] = false;
        this.disconect[x] = this.isConnect(x);
      }
    } catch (ex) {
      if (ex.status == 401) {
        //this.authServ.onIdTokenRevocation();
        this.share.showToastColor('Alerta', 'La sesión a caducado, vuelvva a iniciar sesión', 'w', 'm')
        this.router.navigate(['/login']).then(r => { });
      }
    }
  }

  expandInfo(i) {
    if (this.expanded[i])
      this.expanded[i] = false;
    else {
      for (let x = 0; x < this.nodosList.length; x++) {
        this.expanded[x] = false;
      }
      this.expanded[i] = true;
    }
  }

  isConnect(x): Boolean {
    let nodo = this.nodosList[x];
    if (nodo.lastDate != null && nodo.lastDate != '') {
      let f = new Date()
      let hoy = this.share.getDateNow();
      let ultimo = this.share.jsonDate(nodo.lastDate);
      var horaMinut = nodo.lasthour.split(':')

      if (ultimo.dia + '/' + ultimo.mes + '/' + ultimo.año == hoy[0] + '/' + hoy[1] + '/' + hoy[2]) {

        if (f.getHours() == horaMinut[0])
          return true;
        else
          return false;
      }
      else
        return false;
    }
    return false;
  }

  async doRefresh(ev) {
    await this.loadDevices();
    ev.target.complete();
  }

}
