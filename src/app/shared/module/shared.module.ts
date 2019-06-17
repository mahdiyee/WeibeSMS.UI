import {NgModule} from '@angular/core';
import {CountDownComponent} from '../component/count-down/count-down';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatCoreModule} from './mat-core-module';
import {ImageUploadComponent} from '../component/image-upload/image-upload.component';
import {SearchComponent} from '../component/search/search.component';
import {NgxPaginationModule} from 'ngx-pagination';
import {DateTimePipe} from '../pipe/date-time.pipe';
import {FilterComponent} from '../component/filter/filter.component';
import {LoadingSpinnerComponent} from '../component/loading-spinner/loading-spinner.component';
import {AngularEditorModule} from '@kolkov/angular-editor';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatCoreModule,
        NgxPaginationModule,
        AngularEditorModule,
        // MatSidenavModule
    ],
    declarations: [
        CountDownComponent,
        ImageUploadComponent,
        SearchComponent,
        DateTimePipe,
        FilterComponent,
        LoadingSpinnerComponent
    ],
    entryComponents: [
        LoadingSpinnerComponent
    ],
    exports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatCoreModule,
        NgxPaginationModule,
        AngularEditorModule,
        CountDownComponent,
        ImageUploadComponent,
        SearchComponent,
        DateTimePipe,
        FilterComponent,
        LoadingSpinnerComponent,
        // MatSidenavModule
    ]
})
export class SharedModule {
}
