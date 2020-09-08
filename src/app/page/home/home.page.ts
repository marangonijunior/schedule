import { Component, OnInit } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { AppRate } from '@ionic-native/app-rate/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { ModalTaskPage } from '../modal-task/modal-task.page';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';

import { Platform, ToastController, ModalController, AlertController } from '@ionic/angular';
import { FirestoreService } from '../../service/firestore.service';
const { Device } = Plugins;
// tslint:disable: no-string-literal

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
  };

  uuid = 'scheduled';

  constructor(
    private firebaseX: FirebaseX,
    private appRate: AppRate,
    public toastController: ToastController,
    public platform: Platform,
    public firestoreService: FirestoreService,
    public alertController: AlertController,
    private socialSharing: SocialSharing,
    public modalController: ModalController,
    private localNotifications: LocalNotifications
  ) { }

  ngOnInit() {
    // or, override the whole preferences object
    this.appRate.preferences = {
      usesUntilPrompt: 3,
      storeAppURL: {
      ios: '<app_id>',
      android: 'market://details?id=<package_name>',
      }
    };
    this.appRate.promptForRating(false);
    Device.getInfo().then( item => {
      if (item){
        this.uuid = item.uuid;
        this.setData();
      }
    });
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

  async add(){
    const modal = await this.modalController.create({
      component: ModalTaskPage,
      cssClass: 'custom-modal-css'
    });
    modal.onDidDismiss().then((resp: any) => {
      if (resp.data){
        const newTask = resp.data;
        newTask.id_user = this.uuid;
        newTask.date = `${this.objectData.day}/${this.objectData.month}/${this.objectData.year}`;
        this.firestoreService.create_tasks(newTask).then(() => {
          this.getData(this.objectData);
          this.presentToast('Success!');
          this.setNotification(newTask);
        });
      }
    });
    await modal.present();
  }

  setNotification(task){
    const time = new Date(task.time);
    this.localNotifications.schedule({
      id: time.getHours(),
      title: task.title,
      text: task.description,
      trigger: {at: new Date(time.setHours(time.getHours() - 2))}
    });
  }

  share(){
    this.socialSharing.shareViaWhatsApp('Body').then(() => {
      this.firebaseX.logEvent('Share', {share: 'whatsapp'});
    }).catch(() => {
      this.firebaseX.logEvent('Share Error', {share: 'whatsapp'});
    });
  }

  finish(item){
    item.show = false;
    const time = new Date(item.time);
    this.firestoreService.update_tasks(item.id , item);
    this.getData(this.objectData);
    this.localNotifications.clear(time.getHours());
    this.presentToast('Success!');
  }

  setData(){
    this.objectData.day = new Date().getDate();
    this.objectData.month = new Date().getMonth() + 1;
    this.objectData.year = new Date().getFullYear();
    this.getData(this.objectData);
  }

  dateSelected(e){
    this.objectData = {
      day: new Date(e).getDate(),
      month: new Date(e).getMonth() + 1,
      year: new Date(e).getFullYear()
    };
    this.getData(this.objectData);
  }

  getData(data){
    this.firestoreService.read_tasks(
      `${data.day}/${data.month}/${data.year}`, this.uuid
    ).subscribe(resp => {
        this.listSchedule = resp.map(e => {
          return {
            id: e.payload.doc.id,
            title: e.payload.doc.data()['title'],
            description: e.payload.doc.data()['description'],
            date: e.payload.doc.data()['date'],
            time: e.payload.doc.data()['time'],
            show: e.payload.doc.data()['show'],
          };
        });
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
