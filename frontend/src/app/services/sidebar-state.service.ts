import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SidebarStateService {
  private collapsed = new BehaviorSubject<boolean>(false);
  collapsed$ = this.collapsed.asObservable();

  toggle(): void {
    this.collapsed.next(!this.collapsed.value);
  }

  get isCollapsed(): boolean {
    return this.collapsed.value;
  }
}