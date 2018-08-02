import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { tap } from 'rxjs/operators';
import { CartService } from '../../../services/cart.service';
import * as fromCartStore from '../../../store';

@Component({
  selector: 'y-cart-details',
  templateUrl: './cart-details.component.html',
  styleUrls: ['./cart-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartDetailsComponent implements OnInit {
  cart$;
  entries$;

  form: FormGroup = this.fb.group({
    entryArry: this.fb.array([])
  });

  constructor(
    protected store: Store<fromCartStore.CartState>,
    protected cartService: CartService,
    protected fb: FormBuilder
  ) {}

  ngOnInit() {
    this.cartService.loadCartDetails();
    this.cart$ = this.store.select(fromCartStore.getActiveCart);

    const codes = [];
    this.entries$ = this.store.select(fromCartStore.getEntries).pipe(
      tap(entries => {
        const entriesFormArray = this.form.get('entryArry') as FormArray;
        for (const entry of entries) {
          if (codes.indexOf(entry.product.code) === -1) {
            entriesFormArray.push(this.createEntryFormGroup(entry));
            codes.push(entry.product.code);
          } else {
            const entryForms = entriesFormArray.controls as FormGroup[];
            const entryForm = entryForms.filter((form: FormGroup) => {
              return form.controls.entryNumber.value === entry.entryNumber;
            });

            if (entryForm && entryForm[0]) {
              entryForm[0].controls.quantity.setValue(entry.quantity);
            }
          }
        }
      })
    );
  }

  private createEntryFormGroup(entry) {
    return this.fb.group({
      entryNumber: entry.entryNumber,
      quantity: entry.quantity
    });
  }

  removeEntry(entry, index) {
    this.cartService.removeCartEntry(entry);
    const control = this.form.get('entryArry') as FormArray;
    control.removeAt(index);
  }

  updateEntry({ entry, updatedQuantity }, index) {
    const entryFG = this.form.get('entryArry').value[index];
    this.cartService.updateCartEntry(entry.entryNumber, updatedQuantity);

    if (entryFG.quantity === 0) {
      const control = this.form.get('entryArry') as FormArray;
      control.removeAt(index);
    }
  }

  getPotentialPromotionForEntry(cart: any, entry: any): any[] {
    return this.getPromotionForEntry(cart.potentialProductPromotions, entry);
  }

  getAppliedPromotionForEntry(cart: any, entry: any): any[] {
    return this.getPromotionForEntry(cart.appliedProductPromotions, entry);
  }

  private getPromotionForEntry(promotions: any[], entry: any): any {
    const entryPromotions = [];
    if (promotions && promotions.length > 0) {
      for (const promotion of promotions) {
        if (
          promotion.description &&
          promotion.consumedEntries &&
          promotion.consumedEntries.length > 0
        ) {
          for (const consumedEntry of promotion.consumedEntries) {
            if (this.isConsumedByEntry(consumedEntry, entry)) {
              entryPromotions.push(promotion);
            }
          }
        }
      }
    }
    return entryPromotions;
  }

  private isConsumedByEntry(consumedEntry: any, entry: any): boolean {
    const consumendEntryNumber = consumedEntry.orderEntryNumber;
    if (entry.entries && entry.entries.length > 0) {
      for (const subEntry of entry.entries) {
        if (subEntry.entryNumber === consumendEntryNumber) {
          return true;
        }
      }
      return false;
    } else {
      return consumendEntryNumber === entry.entryNumber;
    }
  }
}
