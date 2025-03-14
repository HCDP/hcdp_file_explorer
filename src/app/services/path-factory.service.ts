import { Injectable } from '@angular/core';
import { Location } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class PathFactoryService {

  constructor(private location: Location) {

  }

  getAssetURL(asset: string): string {
    return this.location.prepareExternalUrl(`assets/${asset}`);
  }

  getPathURL(path: string): string {
    return this.location.prepareExternalUrl(path);
  }
}
