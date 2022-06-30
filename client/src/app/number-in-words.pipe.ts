import {Pipe, PipeTransform} from '@angular/core';

interface CurrencyValues {
  readonly currencyNameCases: ReadonlyArray<string>;
  readonly decimalNameCases: ReadonlyArray<string>;
  readonly currencyValueCase: number;
  readonly decimalValueCase: number;
}

interface TextValue {
  readonly numbers: ReadonlyArray<ReadonlyArray<string>>;
  readonly tens: ReadonlyArray<string>;
  readonly units: ReadonlyArray<ReadonlyArray<string>>;
  readonly currency: Record<string, CurrencyValues>;
}

const textValues = new Map<string, TextValue>([
  [
    'uk_UA', {
    numbers: [
      ['', 'одна', 'дві', 'три', 'чотири', 'п\'ять', 'шість', 'сім', 'вісім', 'дев\'ять'],
      ['нуль', 'один', 'два', 'три', 'чотири', 'п\'ять', 'шість', 'сім', 'вісім', 'дев\'ять'],
      ['', '', 'двадцять', 'тридцять', 'сорок', 'п\'ятдесят', 'шістдесят', 'сімдесят', 'вісімдесят', 'дев\'яносто'],
      ['', 'сто', 'двісті', 'триста', 'чотириста', 'п\'ятсот', 'шістсот', 'сімсот', 'вісімсот', 'дев\'ятсот']
    ],
    tens: [
      'десять',
      'одинадцять',
      'дванадцять',
      'тринадцять',
      'чотирнадцять',
      'п\'ятнадцять',
      'шістнадцять',
      'сімнадцять',
      'вісімнадцять',
      'дев\'ятнадцять'
    ],
    units: [
      [],
      [],
      ['тисяча', 'тисячі', 'тисяч'],
      ['мільйон', 'мільйони', 'мільйонів'],
      ['мільярд', 'мільярди', 'мільярдів'],
      ['трильйон', 'трильйони', 'трильйонів']
    ],
    currency: {
      usd: {
        currencyNameCases: ['долар США', 'долари США', 'доларів США'],
        decimalNameCases: ['цент', 'центи', 'центів'],
        currencyValueCase: 1,
        decimalValueCase: 0
      }
    }
  }
  ],
  [
    'en', {
    numbers: [
      ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'],
      ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'],
      ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'],
      [
        '',
        'one hundred',
        'two hundred',
        'three hundred',
        'four hundred',
        'five hundred',
        'six hundred',
        'seven hundred',
        'eight hundred',
        'nine hundred'
      ]
    ],
    tens: [
      'ten',
      'eleven',
      'twelve',
      'thirteen',
      'fourteen',
      'fifteen',
      'sixteen',
      'seventeen',
      'eighteen',
      'nineteen'
    ],
    units: [
      [],
      [],
      ['thousand', 'thousand', 'thousand'],
      ['million', 'million', 'million'],
      ['billion', 'billion', 'billion'],
      ['trillion', 'trillion', 'trillion']
    ],
    currency: {
      usd: {
        currencyNameCases: ['United States dollar', 'United States dollars', 'United States dollars'],
        decimalNameCases: ['cent', 'cents', 'cents'],
        currencyValueCase: 1,
        decimalValueCase: 0
      }
    }
  }
  ]
]);

enum TextCasesDictionary {
  ForOne,
  FromTwoToFour,
  FromFiveToNine
}

@Pipe({
  name: 'numberInWords'
})
export class NumberInWordsPipe implements PipeTransform {

  transform(value: number, locale: string = 'en'): string {
    const textValue = textValues.get(locale);
    if (!textValue) throw new Error(`NumberInWordsPipe: locale ${locale} not found`);

    const currencyValues = textValue.currency['usd'];

    const numberValue = Math.round(value * 100) / 100;
    const integerValue = Math.trunc(numberValue);

    const {result, currencyTextCase} = this.getResult(integerValue, locale, textValue);
    const {fractional, fractionalTextCase} = this.getFractional(numberValue, locale, textValue);

    return `${result} ${currencyValues.currencyNameCases[currencyTextCase]} ${fractional} ${currencyValues.decimalNameCases[fractionalTextCase]}`
      .replaceAll(' - ', '-').replace(/^(.)/, x => x.toUpperCase());
  }

  private getResult(integerValue: number, locale: string, textValue: TextValue): {result: string, currencyTextCase: TextCasesDictionary} {
    const numberLength = `${integerValue}`.length;
    let currentClassNumber = `${integerValue}`.slice(0, numberLength % 3 || 3);
    let deletedDigits = 0;
    const result: Array<string | undefined> = [];
    let currencyTextCase = TextCasesDictionary.FromFiveToNine;
    for (let currentUnitClass = Math.ceil(numberLength / 3); currentUnitClass > 0; currentUnitClass--) {
      let classTextCase: TextCasesDictionary | undefined = undefined;

      while (currentClassNumber.length > 0) {
        const currentDigit = parseInt(currentClassNumber.slice(0, 1));
        let nextDigit: number | undefined;

        if (locale === 'en') nextDigit = parseInt(currentClassNumber.slice(1, 2));

        if (currentClassNumber === '000') {
          currentClassNumber = '';
          deletedDigits += 3;
          continue;
        }

        if (currentDigit === 1) {
          classTextCase = TextCasesDictionary.FromFiveToNine;

          if (currentClassNumber.length < 2) classTextCase = TextCasesDictionary.ForOne;
        }
        else if (currentDigit > 1 && currentDigit < 5) classTextCase = TextCasesDictionary.FromTwoToFour;
        else if (currentDigit > 4 && currentDigit < 10) classTextCase = TextCasesDictionary.FromFiveToNine;
        else if (currentDigit === 0) classTextCase = TextCasesDictionary.FromFiveToNine;

        if (integerValue === 0) result.push(textValue.numbers[1][0]);

        if (currentUnitClass === 1) {
          if ((
            currentClassNumber.length !== 2 || currentDigit !== 1
          ) && currentClassNumber.length < 3) {
            if (currentDigit === 1) currencyTextCase = TextCasesDictionary.ForOne;
            else if (currentDigit > 1 && currentDigit < 5) currencyTextCase = TextCasesDictionary.FromTwoToFour;
            else currencyTextCase = TextCasesDictionary.FromFiveToNine;
          }
        }

        if (currentClassNumber.length === 2 && currentDigit === 1) {
          result.push(textValue.tens[+currentClassNumber.slice(1, 2)]);
          deletedDigits++;
          currentClassNumber = '';
          classTextCase = TextCasesDictionary.FromFiveToNine;
        }
        else if (currentDigit !== 0) {
          if (currentUnitClass === 2 && currentClassNumber.length === 1) result.push(textValue.numbers[0][currentDigit]);
          else {
            if (currentClassNumber.length > 1) {
              result.push(textValue.numbers[currentClassNumber.length][currentDigit]);

              if (!!nextDigit && currentClassNumber.length === 2) result.push('-');
            }
            else if (currentUnitClass === 1) result.push(textValue.numbers[textValue.currency['usd'].currencyValueCase][currentDigit]);
            else result.push(textValue.numbers[1][currentDigit]);
          }
        }

        currentClassNumber = currentClassNumber.slice(1);
        deletedDigits++;
      }

      if (classTextCase != null && currentUnitClass > 1) result.push(textValue.units[currentUnitClass][classTextCase]);

      currentClassNumber = `${integerValue}`.slice(deletedDigits, deletedDigits + 3);
    }

    return {result: result.filter(x => x != null).join(' '), currencyTextCase};
  }

  private getFractional(numberValue: number, locale: string, textValue: TextValue): {fractional: string; fractionalTextCase: TextCasesDictionary} {
    const fractionalValue = `${numberValue * 100}`.slice(-2);
    let fractionalTextCase = TextCasesDictionary.FromFiveToNine;
    const fractionalWords: string[] = [];

    if (fractionalValue === '00') fractionalWords.push('00');
    else
      for (let fractionalIndex = 0; fractionalIndex < fractionalValue.length; fractionalIndex++) {
        const currentFractionalDigit = parseInt(fractionalValue[fractionalIndex]);

        if (parseInt(fractionalValue) > 9 && parseInt(fractionalValue) < 20) {
          fractionalWords.push(textValue.tens[+fractionalValue.slice(1, 2)]);
          fractionalIndex = 2;
        }
        else if (currentFractionalDigit !== 0) {
          if (fractionalIndex === 0)
            fractionalWords.push(textValue.numbers[2][currentFractionalDigit]);
          else if (fractionalIndex === 1) {
            if (locale === 'en') fractionalWords.push('-');
            fractionalWords.push(textValue.numbers[1][currentFractionalDigit]);
          }

          if (fractionalIndex === 1) {
            if (currentFractionalDigit === 1) fractionalTextCase = TextCasesDictionary.ForOne;
            else if (currentFractionalDigit > 1 && currentFractionalDigit < 5) fractionalTextCase = TextCasesDictionary.FromTwoToFour;
          }
        }
      }

    return {fractional: fractionalWords.filter(x => !!x).join(' '), fractionalTextCase};
  }
}
