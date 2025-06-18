import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { PushUpEntry } from '../models/push-up-entry.model';
import { BehaviorSubject } from 'rxjs';

export const ENTRIES_KEY = 'pushUpEntries';

@Injectable({
  providedIn: 'root'
})
export class PushUpService {
  private storage: Storage | null = null;
  private entriesSubject = new BehaviorSubject<PushUpEntry[]>([]);

  constructor(private ionicStorage: Storage) {
    this.init();
  }

  async init() {
    this.storage = await this.ionicStorage.create();
    await this.loadEntries();
  }

  private async loadEntries() {
    const entries = await this.storage?.get(ENTRIES_KEY) || [];
    this.entriesSubject.next(entries);
  }

  async addEntry(count: number): Promise<void> {
    const entry: PushUpEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      count,
      createdAt: new Date().toISOString()
    };

    const currentEntries = await this.storage?.get(ENTRIES_KEY) || [];
    const updatedEntries = [...currentEntries, entry];
    await this.storage?.set('pushUpEntries', updatedEntries);
    this.entriesSubject.next(updatedEntries);
  }

  async getRecentEntries(days: number = 3): Promise<PushUpEntry[]> {
    const entries = await this.storage?.get(ENTRIES_KEY) || [];
    return entries
      .sort((a: PushUpEntry, b: PushUpEntry) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, days);
  }

  async getTotalPushUps(): Promise<number> {
    const entries = await this.storage?.get(ENTRIES_KEY) || [];
    return entries.reduce((total: number, entry: PushUpEntry) => total + entry.count, 0);
  }

  async getCurrentStreak(): Promise<number> {
    const entries = await this.storage?.get(ENTRIES_KEY) || [];
    const today = new Date().toISOString().split('T')[0];
    const dates = entries.map((entry: PushUpEntry) => entry.date);

    let streak = 0;
    let currentDate = new Date(today);

    while (dates.includes(currentDate.toISOString().split('T')[0])) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  }

  async getEntriesByMonth(year: number, month: number): Promise<PushUpEntry[]> {
    const entries = await this.storage?.get(ENTRIES_KEY) || [];
    return entries.filter((entry: PushUpEntry) => {
      const entryDate = new Date(entry.date);
      return entryDate.getFullYear() === year && entryDate.getMonth() === month;
    });
  }
}
