import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'replace'})
export class ReplacePipe implements PipeTransform {
  transform(value: string | null, pattern: string | RegExp, replaceValue: string): string | null {
    if (!value) return value;
    return typeof pattern === 'string' ? value.replaceAll(pattern, replaceValue) : value.replace(pattern, replaceValue);
  }
}
