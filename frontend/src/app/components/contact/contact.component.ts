import { Component } from '@angular/core';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
  formData = {
    name: '',
    email: '',
    message: ''
  };

  onSubmit() {
    if (this.formData.name && this.formData.email && this.formData.message) {
      alert(`Merci ${this.formData.name} ! Votre message a été envoyé avec succès. Nous vous répondrons rapidement à ${this.formData.email}.`);
      this.formData = { name: '', email: '', message: '' };
    }
  }
}