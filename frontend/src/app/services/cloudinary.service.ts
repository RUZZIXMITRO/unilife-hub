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
  uploadFile(file: File, folder: string = 'marketplace'): Observable<any> {
  const isImage = file.type.startsWith('image/');
  const uploadUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/${isImage ? 'image' : 'raw'}/upload`;
  const preset = isImage ? this.uploadPreset : 'social';

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', preset);
  formData.append('folder', `unilifehub/${folder}`);

  return from(
    fetch(uploadUrl, {
      method: 'POST',
      body: formData
    }).then(res => res.json())
  );
}
}