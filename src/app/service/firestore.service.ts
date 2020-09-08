// firestore.service.ts
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  collectionName = 'tasks';

  constructor(
    private firestore: AngularFirestore
  ) { }

  create_tasks(record) {
    return this.firestore.collection(this.collectionName).add(record);
  }

  read_tasks(date) {
    return this.firestore.collection(this.collectionName, ref => ref.where('data', '==', date)).snapshotChanges();
  }

  update_tasks(recordID, record) {
    this.firestore.doc(this.collectionName + '/' + recordID).update(record);
  }

  delete_tasks(recordID) {
    this.firestore.doc(this.collectionName + '/' + recordID).delete();
  }
}
