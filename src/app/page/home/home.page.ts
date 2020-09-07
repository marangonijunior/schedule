import { Component, OnInit } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { Platform, ToastController } from '@ionic/angular';

const { Device } = Plugins;


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  device;

  constructor(
    private firebaseX: FirebaseX,
    public toastController: ToastController,
    public platform: Platform
  ) { }

  ngOnInit() {

    this.device = Device.getInfo();

    this.firebaseX.setAnalyticsCollectionEnabled(true); // Enables analytics data collection
    this.firebaseX.setScreenName('Home Schedule');

    this.firebaseX.hasPermission().then(hasPermission => {
      if (!hasPermission){
          setTimeout(() => {
              this.presentToast('Active the notifications.');
          }, 5000);
      } else if (hasPermission && this.platform.is('ios')){
        this.firebaseX.grantPermission().then(hasGrantPermission => {
          if (hasGrantPermission){
              this.firebaseX.getAPNSToken().then(apnsToken => {
                  this.setPush();
              }, (error: any) => {
                  console.error('getAPNSToken error', error);
              });
          }
        });
      } else {
        this.setPush();
      }
    });

  }

  setPush() {
    this.firebaseX.getToken()
      .then(token => console.log(`The token is ${token}`)) // save the token server-side and use it to push notifications to this device
      .catch(error => console.error('Error getting token', error));

    this.firebaseX.onMessageReceived()
      .subscribe(data => console.log(`User opened a notification ${data}`));
  }

  async presentToast(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000
    });
    toast.present();
  }

}
