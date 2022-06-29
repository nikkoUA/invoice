import {Service} from './service';

export interface InvoiceData {
  readonly number?: string;
  readonly date?: Date;
  readonly periodStart?: Date;
  readonly periodEnd?: Date;

  readonly place?: {
    readonly place: string;
    readonly placeEn: string;
  };

  readonly contract?: {
    readonly contract: string;
    readonly contractDate: Date;
  };

  readonly subjectMatter?: {
    readonly subjectMatter: string;
    readonly subjectMatterEn: string;
  };

  readonly defaultPrice?: number;
  readonly defaultDescription?: string;
  readonly defaultDescriptionEn?: string;
  readonly services?: ReadonlyArray<Service>;

  readonly supplier?: {
    readonly name: string;
    readonly nameEn: string;
    readonly itn?: string;
    readonly address: string;
    readonly addressEn: string;
    readonly signatureImage?: string;
    readonly signatureImageName?: string;
  },

  readonly beneficiary?: {
    readonly iban: string;
    readonly receiver: string;
    readonly bank: string;
    readonly swiftCode: string;
    readonly bankCity: string;
    readonly intermediaryBank: string;
    readonly intermediaryBankAccountNumber: string;
    readonly intermediaryBankSwiftCode: string;
    readonly intermediaryBankCity: string;
  };

  readonly customer?: {
    readonly customer: string;
    readonly customerCountry: string;
    readonly customerAddress1: string;
    readonly customerAddress2: string;
  };
}
