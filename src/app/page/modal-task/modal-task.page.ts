import { Component, OnInit } from '@angular/core';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';

@Component({
  selector: 'app-modal-task',
  templateUrl: './modal-task.page.html',
  styleUrls: ['./modal-task.page.scss'],
})
export class ModalTaskPage implements OnInit {

  constructor( private firebaseX: FirebaseX ) { }

  ngOnInit() {
    this.firebaseX.setScreenName('Modal Add Schedule');
  }

}
