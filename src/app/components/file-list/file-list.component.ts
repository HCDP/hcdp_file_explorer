import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, UrlSegment, Router, RouterModule } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { PathFactoryService } from '../../services/path-factory.service';
import { AuthService } from '../../services/auth.service';
import { firstValueFrom } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-file-list',
  standalone: true,
  imports: [HttpClientModule, MatProgressSpinnerModule, CommonModule, MatIconModule, RouterModule],
  templateUrl: './file-list.component.html',
  styleUrl: './file-list.component.css'
})
export class FileListComponent implements OnInit {
  loading = true;
  fileData: FileData[] | null;
  message: string;

  constructor(private http: HttpClient, private route: ActivatedRoute, private auth: AuthService, private pathFactory: PathFactoryService, private location: Location, private router: Router) {
    this.fileData = null;
    this.message = "";
  }

  ngOnInit() {
    this.route.url.subscribe((urlSegments: UrlSegment[]) => {
      // Reset the view state every time the URL changes
      this.loading = true;
      this.fileData = null;
      this.message = "";

      // Build the endpoint route dynamically based on the new segments
      let epRoute = urlSegments.reduce((stub: string, urlData: UrlSegment) => {
        return stub + `/${urlData.path}`;
      }, "https://api.hcdp.ikewai.org/files/explore");
      
      
      // Fetch the new data
      this.getValues(epRoute);
    });
  }

  private async getValues(ep: string) {
    const headers = await this.auth.getAPIHeaders();
    let fileData: FileData[] | null = null;
    try {
      let pathData = await firstValueFrom<PathData>(this.http.get<PathData>(ep, { headers, responseType: "json" }));
      // If the current path is a directory then list the directory
      if(pathData.pathType == "d") {
        fileData = pathData.content;
        // Rewrite URLs to explorer app URLs
        for(let data of fileData) {
          if(data.type == "d") {
            data.url = this.pathFactory.getPathURL(data.path);
          }
        }
      }
      // Otherwise redirect to file download link
      else {
        const fileObj = pathData.content[0];
        await this.download(fileObj.url, fileObj.name);
        this.router.navigate(['../'], { relativeTo: this.route });
      }
    }
    catch(e: any) {
      if(e.status == 404) {
        this.message = "The requested folder could not be found"
      }
      else {
        this.message = "An error occurred while retreiving the requested folder"
      }
    }
    
    this.loading = false;
    this.fileData = fileData;
  }

  linkClick(e: MouseEvent, item: FileData) {
    e.preventDefault(); 
    if (item.type === 'f') {
      this.download(item.url, item.name);
    } else {
      this.router.navigate([item.path]);
    }
  }

  async download(url: string, name: string) {
    const headers = await this.auth.getAPIHeaders();
    try {
      let blob = await firstValueFrom<Blob>(this.http.get(url, { headers, responseType: "blob" }));
      saveAs(blob, name);
    }
    catch(e: any) {
      if(e.status == 404) {
        this.message = "The requested file could not be found"
      }
      else {
        this.message = "An error occurred while retreiving the requested directory"
      }
    }
  }
}

interface PathData {
  pathType: "f" | "d",
  content: FileData[]
}

interface FileData {
  url: string,
  path: string
  name: string,
  ext: string,
  modified: string,
  sizeBytes: number,
  type: "f" | "d"
}