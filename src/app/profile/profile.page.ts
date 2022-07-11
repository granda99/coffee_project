import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CameraOptions } from '@awesome-cordova-plugins/camera';
import { Camera } from '@awesome-cordova-plugins/camera/ngx';
import { ActionSheetController, Platform } from '@ionic/angular';
import { map, take } from 'rxjs/operators';
import { PRIORIDAD, SharedService } from 'src/services/shared.services';
import { UserService } from 'src/services/user.service';
import { FotoModalComponent } from '../foto-modal/foto-modal.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  fechaNacimiento;
  infoUser;
  base64Img;

  isEdit: Boolean = false;
  isDesck: Boolean = false;

  showCalendar: boolean = false;

  constructor(
    private share: SharedService,
    private user: UserService,
    public actionSheetController: ActionSheetController,
    private camera: Camera,
    private platform: Platform,
    private router: Router
  ) {
    this.platform.backButton.subscribeWithPriority(PRIORIDAD, async () => {
      if (this.router.url == '/tabs/profile')
        this.router.navigate(['/tabs/dashboard']).then(r => { });
    });
    for (let plat of platform.platforms()) {
      if (plat == "desktop")
        this.isDesck = true;
    }
  }

  cameraOptions: CameraOptions = {
    quality: 25,
    targetWidth: 640,
    targetHeight: 640,
    correctOrientation: true,
    destinationType: this.camera.DestinationType.DATA_URL,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
  }

  galleryOptions: CameraOptions = {
    quality: 25,
    targetWidth: 640,
    targetHeight: 640,
    correctOrientation: true,
    destinationType: this.camera.DestinationType.DATA_URL,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
    sourceType: this.camera.PictureSourceType.PHOTOLIBRARY
  }

  ionViewWillEnter() {
    this.infoUser = JSON.parse(sessionStorage.getItem('infoUser'));
    console.log(this.infoUser);

  }

  ngOnInit() {
    this.infoUser = {
      displayName: "",
      email: "",
      emailVerified: "",
      photoURL: "",
      telf: "",
      uid: "",
      fechaNacimiento: "",
    }
  }

  async menuCamara() {
    const actionSheet = await this.actionSheetController.create({

      header: 'Actualizar foto desde: ',
      cssClass: 'optionMenu',
      mode: 'md',
      buttons: [
        {
          text: 'Cámara',
          icon: 'camera-outline',
          handler: () => {
            this.openCamera()
          }
        }, {
          text: 'Galería',
          icon: 'images-outline',
          handler: async () => {
            this.openGallery()
          }
        }, {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel',
          handler: () => {
          }
        }]
    });
    await actionSheet.present();

    const { role } = await actionSheet.onDidDismiss();
  }

  async openCamera() {
    this.camera.getPicture(this.cameraOptions).then(async (imgData) => {
      this.base64Img = 'data:image/jpeg;base64,' + imgData;
      this.infoUser.photoURL = this.base64Img;
      this.updateInfoUser();
    }, (err) => {
      console.log(err);
    });
  }

  async openGallery() {
    this.camera.getPicture(this.galleryOptions).then(async (imgData) => {
      this.base64Img = 'data:image/jpeg;base64,' + imgData;
      if (!this.base64Img) {
        this.share.showToast("Imagen no válida");
        return;
      }
      this.infoUser.photoURL = this.base64Img;
      this.updateInfoUser();

    }, (err) => {
      this.share.showToastColor('Surgió un error!!', 'Error: ' + err, 'd', 's')
    });
  }

  updateInfoUser() {
    this.user.updateUserData(this.infoUser).then(response => {
      this.share.showToastColor('', 'Datos guardados correctamente.', 's', 's');
    }).catch(ex => {
      console.log(ex);
    });
  }

  async openModalPhoto() {
    this.share.openModalPageData(FotoModalComponent, this.infoUser.photoURL);
  }

  edit() {
    this.isEdit = !this.isEdit;
  }

  update() {
    this.isEdit = false;
    this.updateInfoUser();

  }

  logout() {
    this.share.logout();
  }

  showDatePick() {
    if (this.isEdit)
      this.showCalendar = true;
    else
      this.showCalendar = false;
  }

  selectDate() {
    this.showCalendar = false;
    this.infoUser.fechaNacimiento = this.share.toShortDate(this.fechaNacimiento);
  }
}

