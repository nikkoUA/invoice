import {DatePipe} from '@angular/common';
import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {Item} from 'src/app/item';

@Injectable({providedIn: 'root'})
export class AppModel {
  private readonly currentDate = new Date();

  date = this.currentDate.getDate() > 15
    ? new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1)
    : new Date(this.currentDate.getFullYear(), this.currentDate.getMonth());
  number = this.datePipe.transform(this.date, 'y-M');
  place = '';
  placeEn = '';

  name = '';
  nameEn = '';
  address = '';
  addressEn = '';
  itn = '';
  needSupplierData = !this.name || !this.nameEn || !this.address || !this.addressEn || !this.itn;

  iban = '';
  receiver = '';
  bank = '';
  swiftCode = '';
  bankCity = '';
  intermediaryBank = '';
  intermediaryBankAccountNumber = '';
  intermediaryBankSwiftCode = '';
  intermediaryBankCity = '';
  needBeneficiaryData = !this.iban || !this.receiver || !this.bank || !this.swiftCode || !this.bankCity;

  customer = '';
  customerAddress1 = '';
  customerAddress2 = '';
  customerCountry = '';

  subjectMatter = 'Розробка програмного забезпечення';
  subjectMatterEn = 'Software Development';

  contract = '12-34';
  contractDate = new Date(2021, 1, 1);

  periodStart = new Date(this.date.getFullYear(), this.date.getMonth() - 1);
  periodEnd = new Date(this.date.getTime() - 1);

  readonly services$ = new BehaviorSubject<Array<Item>>([
    {
      description: 'Розробка програмного забезпечення',
      descriptionEn: 'Software Development',
      quantity: 123,
      price: 12.34
    }
  ]);

  constructor(private readonly datePipe: DatePipe) {}

  updateModel(data: any): void {
    if (data.date instanceof Date) this.date = data.date;
    if (typeof data.number === 'string') this.number = data.number;
    if (typeof data.place === 'string') this.place = data.place;
    if (typeof data.placeEn === 'string') this.placeEn = data.placeEn;

    if (typeof data.name === 'string') this.name = data.name;
    if (typeof data.nameEn === 'string') this.nameEn = data.nameEn;
    if (typeof data.address === 'string') this.address = data.address;
    if (typeof data.addressEn === 'string') this.addressEn = data.addressEn;
    if (typeof data.itn === 'string') this.itn = data.itn;

    if (typeof data.iban === 'string') this.iban = data.iban;
    if (typeof data.receiver === 'string') this.receiver = data.receiver;
    if (typeof data.bank === 'string') this.bank = data.bank;
    if (typeof data.swiftCode === 'string') this.swiftCode = data.swiftCode;
    if (typeof data.bankCity === 'string') this.bankCity = data.bankCity;
    if (typeof data.intermediaryBank === 'string') this.intermediaryBank = data.intermediaryBank;
    if (typeof data.intermediaryBankAccountNumber === 'string') this.intermediaryBankAccountNumber = data.intermediaryBankAccountNumber;
    if (typeof data.intermediaryBankSwiftCode === 'string') this.intermediaryBankSwiftCode = data.intermediaryBankSwiftCode;
    if (typeof data.intermediaryBankCity === 'string') this.intermediaryBankCity = data.intermediaryBankCity;

    if (typeof data.customer === 'string') this.customer = data.customer;
    if (typeof data.customerAddress1 === 'string') this.customerAddress1 = data.customerAddress1;
    if (typeof data.customerAddress2 === 'string') this.customerAddress2 = data.customerAddress2;
    if (typeof data.customerCountry === 'string') this.customerCountry = data.customerCountry;

    if (typeof data.subjectMatter === 'string') this.subjectMatter = data.subjectMatter;
    if (typeof data.subjectMatterEn === 'string') this.subjectMatterEn = data.subjectMatterEn;

    if (typeof data.contract === 'string') this.contract = data.contract;
    if (typeof data.contractDate === 'string') this.contractDate = data.contractDate;

    if (data.periodStart instanceof Date) this.periodStart = data.periodStart;
    if (data.periodEnd instanceof Date) this.periodEnd = data.periodEnd;

    if (Array.isArray(data.services)) {
      this.services$.next(data.services.map((x: any) => {
        const service: Partial<Item> = {};
        if (typeof x.description === 'string') service.description = x.description;
        if (typeof x.descriptionEn === 'string') service.descriptionEn = x.descriptionEn;
        if (typeof x.quantity === 'number') service.quantity = x.quantity;
        if (typeof x.price === 'number') service.price = x.price;
        if (typeof x.amount === 'number') service.amount = x.amount;
        return service;
      }).filter((x: Partial<Item>) => x.description != null && x.descriptionEn != null));
    }
  }
}
