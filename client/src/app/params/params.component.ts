import {DOCUMENT} from '@angular/common';
import {Component, Inject} from '@angular/core';
import {AppModel} from 'src/app/app.model';

@Component({
  selector: 'params',
  templateUrl: './params.component.html',
  styleUrls: ['./params.component.scss']
})
export class ParamsComponent {
  constructor(
    @Inject(DOCUMENT) private readonly doc: Document,
    public readonly model: AppModel
  ) {}

  print(event: MouseEvent): void {
    if (!this.model.form.valid) {
      event.preventDefault();
      event.stopPropagation();
    }
    else this.doc.defaultView?.print();
  }
}
