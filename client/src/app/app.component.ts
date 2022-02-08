import {DOCUMENT} from '@angular/common';
import {Component, Inject} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {filter, fromEvent, map, Observable, shareReplay, skip, startWith} from 'rxjs';
import {AppModel} from 'src/app/app.model';
import {ParamsComponent} from 'src/app/params.component';
import {InvoiceData} from './invoice-data';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  private readonly dialogParams = {disableClose: true, width: '100%'};

  readonly invoiceData$ = (this.model.form.valueChanges as Observable<InvoiceData>).pipe(
    startWith(this.model.form.value as InvoiceData),
    filter(() => this.model.form.valid),
    shareReplay(1));

  readonly services$ = this.invoiceData$.pipe(
    map(x => (x.services || []).map(service => Object.assign({},
      service,
      service.amount ? {quantity: service.amount / service.price} : {amount: service.price * (service.quantity || 0)}))),
    shareReplay(1));

  readonly total$ = this.services$.pipe(map(x => x.reduce((total, x) => total += (x.amount || 0), 0)));

  constructor(
    @Inject(DOCUMENT) document: Document,
    public readonly dialog: MatDialog,
    public readonly model: AppModel
  ) {
    this.dialog.afterAllClosed.pipe(skip(1)).subscribe(() => document.defaultView?.print());
    if (document.defaultView)
      fromEvent(document.defaultView, 'afterprint').subscribe(() => this.dialog.open(ParamsComponent, this.dialogParams));
    this.dialog.open(ParamsComponent, this.dialogParams);
  }
}
