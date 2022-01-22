import {Component} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {AppModel} from 'src/app/app.model';
import {Item} from './item';

@Component({
  templateUrl: './params.component.html',
  styleUrls: ['./params.component.scss']
})
export class ParamsComponent {
  readonly form = this.formBuilder.group({
    number: [this.model.number, Validators.required],
    date: [this.model.date, Validators.required],
    place: [this.model.place, Validators.required],
    placeEn: [this.model.placeEn, Validators.required],
    contract: [this.model.contract, Validators.required],
    contractDate: [this.model.contractDate, Validators.required],
    subjectMatter: [this.model.subjectMatter, Validators.required],
    subjectMatterEn: [this.model.subjectMatterEn, Validators.required],
    periodStart: [this.model.periodStart, Validators.required],
    periodEnd: [this.model.periodEnd, Validators.required],
    services: this.formBuilder.array(this.model.services$.getValue().map(x => this.createService(x))),
    name: [this.model.name, Validators.required],
    nameEn: [this.model.nameEn, Validators.required],
    itn: [this.model.itn, Validators.required],
    address: [this.model.address, Validators.required],
    addressEn: [this.model.addressEn, Validators.required],
    iban: [this.model.iban, Validators.required],
    receiver: [this.model.receiver, Validators.required],
    bank: [this.model.bank, Validators.required],
    swiftCode: [this.model.swiftCode, Validators.required],
    bankCity: [this.model.bankCity, Validators.required],
    customer: [this.model.customer, Validators.required],
    customerCountry: [this.model.customerCountry, Validators.required],
    customerAddress1: [this.model.customerAddress1, Validators.required],
    customerAddress2: [this.model.customerAddress2]
  });

  get services() {
    return this.form.get('services') as FormArray;
  }

  get servicesGroups() {
    return this.services.controls as Array<FormGroup>;
  }

  constructor(
    private readonly formBuilder: FormBuilder,
    public readonly dialog: MatDialog,
    public readonly model: AppModel
  ) {}

  addService(): void {
    this.services.push(this.createService());
  }

  removeService(index: number): void {
    this.services.removeAt(index);
  }

  print(): void {
    if (!this.form.valid) return;
    this.model.updateModel(this.form.value);
    this.dialog.closeAll();
  }

  private createService(service?: Item): FormGroup {
    const periodYear = this.model.periodEnd.getFullYear();
    const periodMonth = this.model.periodEnd.getMonth();
    const defaultQuantity = new Array(this.model.periodEnd.getDate()).fill(8).reduce((q, x, i) => {
      const day = (new Date(periodYear, periodMonth, i)).getDay();
      return q + (day && day < 6 && x || 0);
    }, 0);
    return this.formBuilder.group({
      description: [service?.description, Validators.required],
      descriptionEn: [service?.descriptionEn, Validators.required],
      quantity: service?.amount ? [] : [service?.quantity || defaultQuantity],
      price: [service?.price, Validators.required],
      amount: [service?.amount]
    });
  }
}
