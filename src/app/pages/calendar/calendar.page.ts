import { Component } from '@angular/core';
import { PushUpService } from '../../services/push-up.service';
import { PushUpEntry } from '../../models/push-up-entry.model';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.page.html',
  styleUrls: ['./calendar.page.scss'],
  standalone: false,
})
export class CalendarPage {
  currentDate: Date = new Date();
  currentMonth: number = this.currentDate.getMonth();
  currentYear: number = this.currentDate.getFullYear();
  entries: PushUpEntry[] = [];
  selectedDate: string | null = null;
  selectedDateEntries: PushUpEntry[] = [];

  constructor(private pushUpService: PushUpService) {}

  async ionViewWillEnter() {
    await this.loadMonthData();
  }

  async loadMonthData() {
    this.entries = await this.pushUpService.getEntriesByMonth(this.currentYear, this.currentMonth);
  }

  getDaysInMonth(): number[] {
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }

  getFirstDayOfMonth(): number {
    return new Date(this.currentYear, this.currentMonth, 1).getDay();
  }

  getMonthName(): string {
    return new Date(this.currentYear, this.currentMonth).toLocaleString('default', { month: 'long' });
  }

  hasEntry(day: number): boolean {
    const date = this.getDateString(day);
    return this.entries.some(entry => entry.date === date);
  }

  getEntryCount(day: number): number {
    const date = this.getDateString(day);
    const dayEntries = this.entries.filter(entry => entry.date === date);
    return dayEntries.reduce((total, entry) => total + entry.count, 0);
  }

  async selectDate(day: number) {
    const date = this.getDateString(day);
    this.selectedDate = date;
    this.selectedDateEntries = this.entries.filter(entry => entry.date === date);
  }

  async previousMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    await this.loadMonthData();
  }

  async nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    await this.loadMonthData();
  }

  isToday(day: number): boolean {
    const today = new Date();
    return day === today.getDate() &&
           this.currentMonth === today.getMonth() &&
           this.currentYear === today.getFullYear();
  }

  private getDateString(day: number): string {
    const date = new Date(this.currentYear, this.currentMonth, day);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const dayStr = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  }

  isSelectedDate(day: number): boolean {
    return this.selectedDate === this.getDateString(day);
  }

  async confirmRemoveEntry(entry: PushUpEntry) {
    const alert = document.createElement('ion-alert');
    alert.header = 'Delete Entry';
    alert.message = `Are you sure you want to delete ${entry.count} push-ups on ${entry.date}?`;
    alert.buttons = [
      {
        text: 'Cancel',
        role: 'cancel',
      },
      {
        text: 'Delete',
        role: 'destructive',
        handler: async () => {
          await this.pushUpService.removeEntry(entry.id);
          await this.loadMonthData();
          if (this.selectedDate) {
            this.selectedDateEntries = this.entries.filter(e => e.date === this.selectedDate);
          }
          // Optionally show a toast
        }
      }
    ];
    document.body.appendChild(alert);
    await alert.present();
    await alert.onDidDismiss();
    document.body.removeChild(alert);
  }
}
