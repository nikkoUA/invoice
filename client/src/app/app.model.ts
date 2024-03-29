import {DatePipe, DOCUMENT} from '@angular/common';
import {Inject, Injectable} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
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

    defaultPrice: [0, Validators.min(0)],
    defaultDescription: ['', Validators.required],
    defaultDescriptionEn: ['', Validators.required],
    services: this.formBuilder.array([]),
    tax: [0, [Validators.min(0), Validators.max(100)]],

    supplier: this.formBuilder.group({
      name: ['', Validators.required],
      nameEn: ['', Validators.required],
      itn: '',
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

  get defaultPrice() {
    return this.form.get('defaultPrice') as FormControl;
  }

  get defaultDescription() {
    return this.form.get('defaultDescription') as FormControl;
  }

  get defaultDescriptionEn() {
    return this.form.get('defaultDescriptionEn') as FormControl;
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
    this.defaultPrice.valueChanges.pipe(debounceTime(500)).subscribe(x => this.formServices.controls.forEach(control => {
      const price = control.get('price');
      if (price && !price.value) price.reset(x);
    }));

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
      if (x) this.resetForm(x, true);
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

  private resetForm(invoiceData: InvoiceData, fromFile: boolean = false): void {
    if (fromFile) {
      this.form.get('number')?.reset(invoiceData.number || this.datePipe.transform(this.date, 'y-M'));
      this.form.get('date')?.reset(invoiceData.date || this.date);
      this.form.get('periodStart')?.reset(invoiceData.periodStart || this.periodStart);
      this.form.get('periodEnd')?.reset(invoiceData.periodEnd || this.periodEnd);
    }
    else {
      this.form.get('number')?.reset(this.datePipe.transform(this.date, 'y-M'));
      this.form.get('date')?.reset(this.date);
      this.form.get('periodStart')?.reset(this.periodStart);
      this.form.get('periodEnd')?.reset(this.periodEnd);
    }
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
    this.defaultPrice.reset(invoiceData.defaultPrice || 0);
    this.defaultDescription.reset(invoiceData.defaultDescription || 'Розробка програмного забезпечення');
    this.defaultDescriptionEn.reset(invoiceData.defaultDescriptionEn || 'Software Development');
    this.formServices.reset();
    if (fromFile) (invoiceData.services || []).forEach(service => this.formServices.push(this.createService(service)));
    else this.addService();
    this.form.get('tax')?.reset(invoiceData.tax || 0);
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
    const formGroup = this.formBuilder.group({
      description: [service?.description || this.defaultDescription.value, Validators.required],
      descriptionEn: [service?.descriptionEn || this.defaultDescriptionEn.value, Validators.required],
      appendPeriod: service?.appendPeriod !== false,
      quantity: service?.amount ? [] : [service?.quantity || defaultQuantity],
      price: [service?.price || this.defaultPrice.value, [Validators.required, Validators.min(0)]],
      amount: service?.amount
    });
    formGroup.get('amount')?.valueChanges.pipe(debounceTime(0)).subscribe(x => {
      if (x) formGroup.get('quantity')?.reset(null);
    });
    formGroup.get('quantity')?.valueChanges.pipe(debounceTime(0)).subscribe(x => {
      if (x) formGroup.get('amount')?.reset(null);
    });
    return formGroup;
  }
}
