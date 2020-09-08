import { Component, OnInit } from '@angular/core';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { ModalController, NavParams, ToastController } from '@ionic/angular';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-modal-task',
  templateUrl: './modal-task.page.html',
  styleUrls: ['./modal-task.page.scss'],
})
export class ModalTaskPage implements OnInit {

  task = {
    title: '',
    description: '',
    date: '',
    time: '',
    id_user: '',
    show: true,
  };

  constructor(
    private firebaseX: FirebaseX,
    public modalController: ModalController,
    public toastController: ToastController,
    public navParams: NavParams,
  ) { }

  ngOnInit() {
    this.firebaseX.setScreenName('Modal Add Schedule');
  }

  dismiss() {
    this.modalController.dismiss(null);
  }

  onAdd(form: NgForm) {
    if (!form.valid) {
      let message = 'Please check your details.';

      if (!this.task.title || this.task.title.length < 5) {
        message = 'Title short.';
      }
      else if (!this.task.time) {
        message = 'Insert the time.';
      }

      this.presentToast(message);
      return;
    }
    else {
      this.send();
    }

  }

  send(){
    this.modalController.dismiss(this.task);
  }

  async presentToast(msg) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000
    });
    toast.present();
  }

}
