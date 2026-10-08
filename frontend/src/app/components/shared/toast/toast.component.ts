import { Component, OnInit } from '@angular/core';
import { Toast, ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css']
})
export class ToastComponent implements OnInit {
  toasts: Toast[] = [];

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.toastService.toasts.subscribe(t => this.toasts = t);
  }

  remove(id: number): void {
    this.toastService.remove(id);
  }
}