import {Directive, HostListener, Input} from '@angular/core';
import {AbstractControl} from '@angular/forms';

@Directive({selector: '[uploadFile]'})
export class UploadFileDirective {
  @Input()
  uploadFile: AbstractControl | null | undefined;

  @Input()
  uploadFileName: AbstractControl | null | undefined;

  @HostListener('change', ['$event.target.files'])
  onChange(files: FileList): void {
    if (files[0]) {
      const reader = new FileReader();
      reader.onload = e => {
        this.uploadFile?.setValue(e.target?.result || '');
        this.uploadFileName?.setValue(files[0].name);
      };
      reader.readAsDataURL(files[0]);
    }
    else {
      this.uploadFile?.setValue('');
      this.uploadFileName?.setValue('');
    }
  }
}
