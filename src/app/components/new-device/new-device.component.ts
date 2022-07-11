import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SharedService } from 'src/services/shared.services';

@Component({
  selector: 'app-new-device',
  templateUrl: './new-device.component.html',
  styleUrls: ['./new-device.component.scss'],
})
export class NewDeviceComponent implements OnInit {

  public infoDevice;

  constructor(
    private share: SharedService,
    private modal: ModalController
  ) { }

  ngOnInit() {
    this.initForm();
    console.log(this.infoDevice);
  }

  ionViewWillEnter() {
    this.initForm();
  }

  initForm() {
    let hoy = this.share.getDateNow();
    this.infoDevice = {
      lastDate: hoy.fecha,
      lasthour: hoy.hora,
      nombre: "Dispositivo nuevo"
    }
  }

  close() {
    this.modal.dismiss();
  }
}
