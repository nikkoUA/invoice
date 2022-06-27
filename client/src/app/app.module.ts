import {DatePipe} from '@angular/common';
import '@angular/common/locales/global/uk';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MAT_DATE_LOCALE, MatNativeDateModule} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatDialogModule} from '@angular/material/dialog';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {MainComponent} from './main/main.component';
import {NumberInWordsPipe} from './number-in-words.pipe';
import {ParamsComponent} from './params/params.component';
import {ReplacePipe} from './replace.pipe';
import {UploadFileDirective} from './upload-file.directive';

@NgModule({
  declarations: [
    MainComponent,
    NumberInWordsPipe,
    ParamsComponent,
    ReplacePipe,
    UploadFileDirective
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatExpansionModule
  ],
  providers: [
    DatePipe,
    {provide: MAT_DATE_LOCALE, useValue: 'uk'}
  ],
  bootstrap: [MainComponent]
})
export class AppModule {}
