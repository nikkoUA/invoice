import {DatePipe, DOCUMENT} from '@angular/common';
import {Inject, Injectable} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {DomSanitizer} from '@angular/platform-browser';
import {asapScheduler, debounceTime, fromEvent, map, shareReplay, Subject, withLatestFrom} from 'rxjs';
import {Service} from 'src/app/service';
import {InvoiceData} from './invoice-data';

@Injectable({providedIn: 'root'})
export class AppModel {
  readonly currentDate = new Date();
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
      signatureImage: '',
      signatureImageName: ''
    }),

    beneficiary: this.formBuilder.group({
      iban: ['', Validators.required],
      receiver: ['', Validators.required],
      bank: ['', Validators.required],
      swiftCode: ['', Validators.required],
      bankCity: ['', Validators.required],
      intermediaryBank: '',
      intermediaryBankAccountNumber: '',
      intermediaryBankSwiftCode: '',
      intermediaryBankCity: ''
    }),

    customer: this.formBuilder.group({
      customer: '',
      customerCountry: '',
      customerAddress1: '',
      customerAddress2: ''
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

  readonly invoiceData$ = this.form.valueChanges.pipe(
    debounceTime(0, asapScheduler),
    map(x => this.domSanitizer.bypassSecurityTrustUrl(URL.createObjectURL(new Blob([JSON.stringify(x, null, 2)], {type: 'application/json'})))),
    shareReplay(1));

  private readonly uploadInvoiceDataReader = new FileReader();
  private readonly resetSubject = new Subject<void>();
  private readonly saveSubject = new Subject<void>();

  constructor(
    @Inject(DOCUMENT) doc: Document,
    private readonly formBuilder: FormBuilder,
    private readonly datePipe: DatePipe,
    private readonly domSanitizer: DomSanitizer
  ) {
    fromEvent<ProgressEvent>(this.uploadInvoiceDataReader, 'load').pipe(
      map(x => {
        try {
          const result = (x.target as FileReader).result;
          return typeof result === 'string' ? JSON.parse(result) : null;
        }
        catch (e) {
          console.warn(e);
          return null;
        }
      })).subscribe(x => {
      if (x) this.resetForm(x);
    });

    const win = doc.defaultView;

    this.resetSubject.subscribe(() => {
      if (win) {
        try {
          const invoiceData = win.localStorage.getItem('invoiceData');
          if (invoiceData) this.resetForm(JSON.parse(invoiceData));
          else this.resetForm({});
        }
        catch (e) {
          console.warn(e);
          this.resetForm({});
        }
      }
      else {
        this.resetForm({});
      }
    });

    if (win) {
      this.saveSubject.pipe(withLatestFrom(this.form.valueChanges)).subscribe(([, x]) => {
        win.localStorage.setItem('invoiceData', JSON.stringify(x));
      });
    }

    this.invoiceData$.subscribe();
    this.reset();
  }

  private resetForm(invoiceData: InvoiceData): void {
    this.form.get('number')?.reset(this.datePipe.transform(this.date, 'y-M'));
    this.form.get('date')?.reset(this.date);
    this.form.get('periodStart')?.reset(this.periodStart);
    this.form.get('periodEnd')?.reset(this.periodEnd);
    this.formPlace.reset(invoiceData.place || {});
    this.formContract.reset(Object.assign(
      {},
      invoiceData.contract || {},
      invoiceData.contract?.contractDate ? {contractDate: new Date(invoiceData.contract.contractDate)} : {}));
    this.formSubjectMatter.reset(invoiceData.subjectMatter || {});
    this.formSupplier.reset(invoiceData.supplier || {});
    this.formBeneficiary.reset(invoiceData.beneficiary || {});
    this.formCustomer.reset(invoiceData.customer || {});
    for (let i = this.formServices.length; i > 0; i--) this.removeService(i - 1);
    this.formServices.reset();
    (invoiceData.services || []).forEach(service => this.formServices.push(this.createService(service)));
  }

  uploadInvoiceData(input: HTMLInputElement): void {
    if (input.files && input.files[0]) this.uploadInvoiceDataReader.readAsText(input.files[0]);
  }

  reset(): void {
    this.resetSubject.next();
  }

  save(): void {
    this.saveSubject.next();
  }

  deleteSignature(): void {
    this.formSupplier.get('signatureImage')?.setValue('');
    this.formSupplier.get('signatureImageName')?.setValue('');
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
