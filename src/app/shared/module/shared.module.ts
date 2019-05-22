import {NgModule} from '@angular/core';
import {CountDownComponent} from '../component/count-down/count-down';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatCoreModule} from './mat-core-module';
import {ImageUploadComponent} from '../component/image-upload/image-upload.component';
import {SearchComponent} from "../component/search/search.component";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatCoreModule,
    ],
    declarations: [
        CountDownComponent,
        ImageUploadComponent,
        SearchComponent
    ],
    exports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatCoreModule,
        CountDownComponent,
        ImageUploadComponent,
        SearchComponent
    ]
})
export class SharedModule {
}
