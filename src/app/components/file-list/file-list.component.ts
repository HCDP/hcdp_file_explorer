import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PathFactoryService } from '../../services/path-factory.service';
import { AuthService } from '../../services/auth.service';
import { firstValueFrom } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-file-list',
  standalone: true,
  imports: [HttpClientModule, MatProgressSpinnerModule, CommonModule, MatIconModule],
  templateUrl: './file-list.component.html',
  styleUrl: './file-list.component.css'
})
export class FileListComponent {
  loading = true;
  fileData: FileData[];

  constructor(private http: HttpClient, private route: ActivatedRoute, private auth: AuthService, private pathFactory: PathFactoryService) {
    this.fileData = [];
    let epRoute = route.snapshot.url.reduce((stub: string, urlData: UrlSegment) => {
      return stub + `/${urlData.path}`;
    }, "https://api.hcdp.ikewai.org/files/explore");
    this.getValues(epRoute);
  }

  private async getValues(ep: string) {
    const headers = await this.auth.getAPIHeaders();
    let fileData: FileData[] = await firstValueFrom<FileData[]>(this.http.get<FileData[]>(ep, { headers, responseType: "json" }));
    for(let data of fileData) {
      if(data.type == "d") {
        data.url = this.pathFactory.getPathURL(data.path);
      }
    }
    this.loading = false;
    this.fileData = fileData;
  }

  async download(url: string, name: string) {
    const headers = await this.auth.getAPIHeaders();
    let blob = await firstValueFrom<Blob>(this.http.get(url, { headers, responseType: "blob" }));
    saveAs(blob, name);
  }
}

interface FileData {
  url: string,
  path: string
  name: string,
  ext: string,
  sizeBytes: number,
  type: "f" | "d"
}