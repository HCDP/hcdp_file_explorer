import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, UrlSegment, Router, RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { PathFactoryService } from '../../services/path-factory.service';
import { AuthService } from '../../services/auth.service';
import { firstValueFrom } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { saveAs } from 'file-saver';
import { Sort, MatSortModule } from '@angular/material/sort';
import { BreadcrumbsComponent } from "../breadcrumbs/breadcrumbs.component";

@Component({
    selector: 'app-file-list',
    imports: [MatProgressSpinnerModule, MatIconModule, RouterModule, MatSortModule, BreadcrumbsComponent],
    templateUrl: './file-list.component.html',
    styleUrl: './file-list.component.scss'
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

  getLinkUrl(path: string) {
    let url = this.pathFactory.getPathURL(path);
    return url;
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
      // Otherwise download file and redirect to parent directory
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
    if(item.type === 'f') {
      e.preventDefault(); 
      this.download(item.url, item.name);
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

  fileSize(bytes: number, useIEC: boolean = true) {
    // IEC standard uses binary (1024), SI uses decimal (1000) magnitude
    const base = useIEC ? 1024.0 : 1000.0;
    const exponent = Math.floor(Math.log(bytes) / Math.log(base))
    const decimal = (bytes / Math.pow(base, exponent)).toFixed(exponent ? 2 : 0)
    let units = "B";
    // IEC style prefix
    if(exponent > 0 && useIEC) {
      units = `${'KMGTPEZY'[exponent - 1]}iB`;
    }
    // SI style prefix
    else if(exponent > 0) {
      units = `${'kMGTPEZY'[exponent - 1]}B`;
    }
    return `${decimal} ${units}`;
  }

  formatDate(isoDate: string) {
    let formatted = new Date(isoDate).toLocaleString("en-US", {timeZone: "Pacific/Honolulu"}) + " HST";
    return formatted;
  }

  sortData(sort: Sort) {
    this.fileData?.sort((a: FileData, b: FileData) => {
      console.log(sort)
      let field = <"name" | "sizeBytes" | "modified">sort.active;
      let aField = a[field];
      let bField = b[field];
      let order = sort.direction == "asc" ? -1 : 1
      if(typeof aField == "number" && typeof bField == "number") {
        order *= (aField - bField);
      }
      else if(typeof aField == "string" && typeof bField == "string") {
        order *= aField.localeCompare(bField);
      }
      else {
        throw new Error("Invalid comparison types.");
      }
      return order;
    });
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