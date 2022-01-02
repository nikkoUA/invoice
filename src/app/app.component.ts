import {Component} from '@angular/core';

interface Item {
  description: string;
  descriptionEn: string;
  quantity: number;
  price: number;
  amount: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  private readonly currentDate = new Date();
  readonly date = this.currentDate.getDate() > 15
    ? new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1)
    : new Date(this.currentDate.getFullYear(), this.currentDate.getMonth());
  readonly periodStart = new Date(this.date.getFullYear(), this.date.getMonth() - 1);
  readonly periodEnd = new Date(this.date.getTime() - 1);
  readonly items: ReadonlyArray<Item> = [
    {
      descriptionEn: 'Software Development',
      description: 'Розробка програмного забезпечення',
      quantity: 184,
      price: 12.34
    }
  ].map(x => (
    {...x, amount: x.price * x.quantity}
  ));
  readonly total = this.items.reduce((total, x) => total += x.amount, 0);
}
