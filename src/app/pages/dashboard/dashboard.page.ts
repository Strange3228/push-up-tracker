import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { PushUpService } from '../../services/push-up.service';
import { PushUpEntry } from '../../models/push-up-entry.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false,
})
export class DashboardPage {
  pushUpCount: number = 0;
  recentEntries: PushUpEntry[] = [];
  totalPushUps: number = 0;
  currentStreak: number = 0;

  constructor(
    private pushUpService: PushUpService,
    private toastController: ToastController,
    private router: Router
  ) {}

  async ionViewWillEnter() {
    await this.loadData();
  }

  async loadData() {
    this.recentEntries = await this.pushUpService.getRecentEntries();
    this.totalPushUps = await this.pushUpService.getTotalPushUps();
    this.currentStreak = await this.pushUpService.getCurrentStreak();
  }

  async logPushUps() {
    if (this.pushUpCount <= 0) {
      const toast = await this.toastController.create({
        message: 'Please enter a valid number of push-ups',
        duration: 2000,
        position: 'bottom',
        color: 'warning'
      });
      toast.present();
      return;
    }

    await this.pushUpService.addEntry(this.pushUpCount);
    this.pushUpCount = 0;
    await this.loadData();

    const toast = await this.toastController.create({
      message: 'Push-ups logged successfully!',
      duration: 2000,
      position: 'bottom',
      color: 'success'
    });
    toast.present();
  }

  navigateToCalendar() {
    this.router.navigate(['/calendar']);
  }
}
