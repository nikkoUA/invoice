import {DOCUMENT} from '@angular/common';
import {Component, Inject, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {fromEvent, map, skip} from 'rxjs';
import {AppModel} from 'src/app/app.model';
import {ParamsComponent} from 'src/app/params.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  private readonly dialogParams = {disableClose: true, width: '100%'};

  readonly items$ = this.model.services$.pipe(map(x => x.map(service => Object.assign({},
    service,
    service.amount ? {quantity: service.amount / service.price} : {amount: service.price * (service.quantity || 0)}))));

  readonly total$ = this.items$.pipe(map(x => x.reduce((total, x) => total += (x.amount || 0), 0)));

  constructor(
    @Inject(DOCUMENT) document: Document,
    public readonly dialog: MatDialog,
    public readonly model: AppModel
  ) {
    this.dialog.afterAllClosed.pipe(skip(1)).subscribe(() => document.defaultView?.print());
    if (document.defaultView)
      fromEvent(document.defaultView, 'afterprint').subscribe(() => this.dialog.open(ParamsComponent, this.dialogParams));
  }

  ngOnInit(): void {
    this.dialog.open(ParamsComponent, this.dialogParams);
  }
}
