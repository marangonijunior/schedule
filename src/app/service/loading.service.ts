import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';


/*
  Generated class for the LoadingProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class LoadingProvider {

  loading: any;
  isLoading = false;

  constructor(private loadingCtrl: LoadingController) {

  }

  public dismiss() {
    try {
      this.isLoading = false;
      this.loading.dismiss();
    }
    catch (error) {

    }
  }

  public present() {
    if (this.loading && this.isLoading) {
        this.loading.dismiss().then(() => {
          this.showLoading();
        });
    }
    else {
      this.showLoading();
    }
  }

  async showLoading() {
    this.isLoading = true;
    this.loading = await this.loadingCtrl.create({
      message: 'Waiting...',
    });
    await this.loading.present();
  }

}
