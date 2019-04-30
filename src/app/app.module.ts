import 'reflect-metadata';
import '../polyfills';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AceEditorModule } from 'ng2-ace-editor';
import { MaterialModule } from './material/material.module';

// NG Translate
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { WebviewDirective } from './directives/webview.directive';

// components
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { AuthComponent } from './components/auth/auth.component';
import { WorkspacesComponent } from './components/workspaces/workspaces.component';
import { WorkspaceItemComponent } from './components/workspace-item/workspace-item.component';
import { DbConnectorComponent } from './components/db-connector/db-connector.component';
import { CreateWorkspaceComponent } from './components/create-workspace/create-workspace.component';
import { QueryDbComponent } from './components/query-db/query-db.component';
import { ManageIndicatorComponent } from './components/manage-indicator/manage-indicator.component';
import { AlertComponent } from './components/alert/alert.component';

// providers
import { SharedService } from './providers/shared.service';
import { UserService } from './providers/user.service';
import { ElectronService } from './providers/electron.service';
import { AuthGuardService } from './providers/auth-guard.service';
import { WorkspaceService } from './providers/workspace.service';
import { DatasourceService } from './providers/datasource.service';
import { DatabaseService } from './providers/database.service';
import { HttpCacheInterceptor } from './providers/http-cache-interceptor';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    WebviewDirective,
    AuthComponent,
    WorkspacesComponent,
    WorkspaceItemComponent,
    DbConnectorComponent,
    CreateWorkspaceComponent,
    QueryDbComponent,
    ManageIndicatorComponent,
    AlertComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (HttpLoaderFactory),
        deps: [HttpClient]
      }
    }),
    AceEditorModule,
    MaterialModule,
    BrowserAnimationsModule
  ],
  providers: [
    ElectronService,
    SharedService,
    UserService,
    AuthGuardService,
    DatabaseService,
    WorkspaceService,
    DatasourceService,
    { provide: HTTP_INTERCEPTORS, useClass: HttpCacheInterceptor, multi: true }
  ],
  entryComponents: [AlertComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
