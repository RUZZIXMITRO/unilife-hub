import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {

  private cloudName = 'dklozwwgu';
  private uploadPreset = 'marketplace';
  private uploadUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;

  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);

    return from(
      fetch(this.uploadUrl, {
        method: 'POST',
        body: formData
      }).then(res => res.json())
    );
  }
}