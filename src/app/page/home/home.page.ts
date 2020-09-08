import { Component, OnInit } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { Platform, ToastController, AlertController, ActionSheetController } from '@ionic/angular';
import { FirestoreService } from '../../service/firestore.service';
const { Device } = Plugins;


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  device;
  listSchedule = [];
  objectData = {
    day: 1,
    month: 1,
    year: 1
  }

  constructor(
    private firebaseX: FirebaseX,
    public toastController: ToastController,
    public platform: Platform,
    public firestoreService: FirestoreService,
    public alertController: AlertController,
    public actionSheetCtrl: ActionSheetController
  ) { }

  ngOnInit() {

    this.device = Device.getInfo();
    this.setData();
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

  setData(){
    this.objectData.day = new Date().getDay();
    this.objectData.month = new Date().getMonth();
    this.objectData.year = new Date().getFullYear();
    this.getData(this.objectData);
  }

  dateSelected(e){
    console.log('dateSelected', e);
  }

  getData(data){
    this.firestoreService.read_tasks(`${data.day}/${data.month}/${data.year}`).subscribe(resp => {

        this.listSchedule = resp.map(e => {
          return {
            id: e.payload.doc.id,
            Name: e.payload.doc.data()['Name'],
            Age: e.payload.doc.data()['Age'],
            Address: e.payload.doc.data()['Address'],
          };
        });
        console.log(this.listSchedule);

    });
  }

  async share() {
    const actionSheet = await this.actionSheetCtrl.create({
          buttons: [
              {
                  text: 'Compartilhar ',
                  handler: () => {
                      console.log('set');
                  }
              }, {
                  text: 'Tirar foto',
                  handler: () => {
                    console.log('set');
                  }
              }, {
                  text: 'Cancelar',
                  role: 'cancel'
              }]
      });
    await actionSheet.present();
  }

  async deleteAll(){
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Delete tasks.',
      message: 'Do you have sure that want delete all items?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Clear',
          handler: () => {
            console.log('Confirm Clear: blah');
          }
        }
      ]
    });
    await alert.present();
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
