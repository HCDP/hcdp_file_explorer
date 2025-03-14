import { Routes } from '@angular/router';
import { FileListComponent } from './components/file-list/file-list.component';

export const routes: Routes = [{ path: "**", component: FileListComponent }];
