import {Component} from '@angular/core';
import {combineLatest, map, Observable, shareReplay, startWith} from 'rxjs';
import {AppModel} from 'src/app/app.model';
import {InvoiceData} from '../invoice-data';
import {Service} from '../service';

type ServiceLayout = ReadonlyArray<(Service & {quantity: number, amount?: undefined}) | (Service & {amount: number, quantity?: undefined})>;

@Component({
  selector: 'app-root',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {
  readonly invoiceData$ = (this.model.form.valueChanges as Observable<InvoiceData>).pipe(
    startWith(this.model.form.value as InvoiceData),
    shareReplay(1));

  readonly services$: Observable<ServiceLayout> = this.invoiceData$.pipe(
    map(x => (x.services || []).map(service => Object.assign({},
      service,
      service.amount ? {quantity: service.amount / service.price} : {amount: service.price * (service.quantity || 0)}))),
    shareReplay(1));

  readonly subTotal$ = this.services$.pipe(
    map(x => x.reduce((total, x) => total + (x.amount || 0), 0)),
    shareReplay(1));

  readonly tax$ = combineLatest([this.invoiceData$, this.subTotal$]).pipe(
    map(([{tax}, subTotal]) => subTotal / 100 * (tax || 0)),
    shareReplay(1));

  readonly total$ = combineLatest([this.subTotal$, this.tax$]).pipe(map(([subTotal, tax]) => subTotal + tax));

  constructor(public readonly model: AppModel) {}
}
