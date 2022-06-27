export interface Service {
  readonly description: string;
  readonly descriptionEn: string;
  readonly appendPeriod: boolean;
  readonly quantity?: number;
  readonly price: number;
  readonly amount?: number;
}
