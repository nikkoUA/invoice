import {DatePipe} from '@angular/common';
import {Injectable} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Service} from 'src/app/service';
import beneficiary from '../../../data/beneficiary.json';
import contract from '../../../data/contract.json';
import customer from '../../../data/customer.json';
import place from '../../../data/place.json';
import services from '../../../data/services.json';
import subjectMatter from '../../../data/subject-matter.json';
import supplier from '../../../data/supplier.json';

@Injectable({providedIn: 'root'})
export class AppModel {
  private readonly currentDate = new Date();
  private readonly date = this.currentDate.getDate() > 15
    ? new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1)
    : new Date(this.currentDate.getFullYear(), this.currentDate.getMonth());
  private readonly periodStart = new Date(this.date.getFullYear(), this.date.getMonth() - 1);
  private readonly periodEnd = new Date(this.date.getTime() - 1);

  readonly form = this.formBuilder.group({
    number: ['', Validators.required],
    date: [undefined, Validators.required],
    periodStart: [this.periodStart, Validators.required],
    periodEnd: [this.periodEnd, Validators.required],

    place: this.formBuilder.group({
      place: ['', Validators.required],
      placeEn: ['', Validators.required]
    }),

    contract: this.formBuilder.group({
      contract: ['', Validators.required],
      contractDate: [undefined, Validators.required]
    }),

    subjectMatter: this.formBuilder.group({
      subjectMatter: ['', Validators.required],
      subjectMatterEn: ['', Validators.required]
    }),

    services: this.formBuilder.array([]),

    supplier: this.formBuilder.group({
      name: ['', Validators.required],
      nameEn: ['', Validators.required],
      itn: ['', Validators.required],
      address: ['', Validators.required],
      addressEn: ['', Validators.required],
      signatureImage: ['', Validators.required],
      signatureImageName: ['', Validators.required]
    }),

    beneficiary: this.formBuilder.group({
      iban: ['', Validators.required],
      receiver: ['', Validators.required],
      bank: ['', Validators.required],
      swiftCode: ['', Validators.required],
      bankCity: ['', Validators.required],
      intermediaryBank: [''],
      intermediaryBankAccountNumber: [''],
      intermediaryBankSwiftCode: [''],
      intermediaryBankCity: ['']
    }),

    customer: this.formBuilder.group({
      customer: [''],
      customerCountry: [''],
      customerAddress1: [''],
      customerAddress2: ['']
    })
  });

  get formPlace() {
    return this.form.get('place') as FormGroup;
  }

  get formContract() {
    return this.form.get('contract') as FormGroup;
  }

  get formSubjectMatter() {
    return this.form.get('subjectMatter') as FormGroup;
  }

  get formServices() {
    return this.form.get('services') as FormArray;
  }

  get formServicesGroups() {
    return this.formServices.controls as Array<FormGroup>;
  }

  get formSupplier() {
    return this.form.get('supplier') as FormGroup;
  }

  get formBeneficiary() {
    return this.form.get('beneficiary') as FormGroup;
  }

  get formCustomer() {
    return this.form.get('customer') as FormGroup;
  }

  constructor(private readonly formBuilder: FormBuilder, private readonly datePipe: DatePipe) {
    this.reset();
  }

  reset(): void {
    this.form.get('number')?.reset(this.datePipe.transform(this.date, 'y-M'));
    this.form.get('date')?.reset(this.date);
    this.form.get('periodStart')?.reset(this.periodStart);
    this.form.get('periodEnd')?.reset(this.periodEnd);
    this.formPlace.reset(place);
    this.formContract.reset(Object.assign({}, contract, {contractDate: new Date(contract.contractDate)}));
    this.formSubjectMatter.reset(subjectMatter);
    this.formSupplier.reset(supplier);
    this.formBeneficiary.reset(beneficiary);
    this.formCustomer.reset(customer);
    for (let i = this.formServices.length; i > 0; i--) this.removeService(i - 1);
    this.formServices.reset();
    services.forEach(service => this.formServices.push(this.createService(service)));
  }

  addService(): void {
    this.formServices.push(this.createService());
  }

  removeService(index: number): void {
    this.formServices.removeAt(index);
  }

  private createService(service?: Service): FormGroup {
    const periodYear = this.periodEnd.getFullYear();
    const periodMonth = this.periodEnd.getMonth();
    const defaultQuantity = new Array(this.periodEnd.getDate()).fill(8).reduce((q, x, i) => {
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
