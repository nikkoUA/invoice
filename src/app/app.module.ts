import '@angular/common/locales/global/uk';
import {NgModule} from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {NumberInWordsPipe} from './number-in-words.pipe';

@NgModule({
  declarations: [
    AppComponent,
    NumberInWordsPipe
  ],
  imports: [
    BrowserModule,
    MatTableModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
