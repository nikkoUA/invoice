import {Component} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {AppModel} from 'src/app/app.model';

@Component({
  templateUrl: './params.component.html',
  styleUrls: ['./params.component.scss']
})
export class ParamsComponent {
  constructor(public readonly dialog: MatDialog, public readonly model: AppModel) {}

  print(): void {
    if (!this.model.form.valid) return;
    this.dialog.closeAll();
  }
}
