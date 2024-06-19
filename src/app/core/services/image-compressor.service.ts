import { Injectable } from '@angular/core';
import { Observable} from 'rxjs';
import { ImageCroppedEvent } from 'ngx-image-cropper';

@Injectable({
  providedIn: 'root'
})
export class ImageCompressorService {

  constructor() { }
  compress(croppedImage: ImageCroppedEvent, fileName: string, quality = 1.0): Observable<any> {
    const width = croppedImage.width;
    const height = croppedImage.height;


    return Observable.create(observer => {
      const image = new Image();
      image.src = croppedImage.base64;
     
     
      image.onload = () => {
          const canvas = document.createElement('canvas'); // Use Angular's Renderer2 method
          canvas.width = width;
          canvas.height = height;
          const ctx = <CanvasRenderingContext2D>canvas.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
          ctx.globalCompositeOperation = 'source-over';
          ctx.drawImage(image, 0, 0, width, height);
          ctx.canvas.toBlob(
            blob => {
              observer.next(
                new File([blob], fileName, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                }),
              );
            },
            'image/jpeg',
            quality,
          );
        };
    });
  }
}