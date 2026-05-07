import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';

export const BR_DATE_FORMATS = {
  parse: { dateInput: 'DD/MM/YYYY' },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: { year: 'numeric', month: 'short' },
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' },
  },
};

@Injectable()
export class BrazilianDateAdapter extends NativeDateAdapter {
  override parse(value: string): Date | null {
    if (!value?.trim()) return null;
    const digits = value.replace(/\D/g, '');
    if (digits.length === 8) {
      const day = parseInt(digits.slice(0, 2), 10);
      const month = parseInt(digits.slice(2, 4), 10) - 1;
      const year = parseInt(digits.slice(4, 8), 10);
      if (month < 0 || month > 11 || day < 1 || day > 31 || year < 1000) return null;
      const date = new Date(year, month, day);
      return isNaN(date.getTime()) ? null : date;
    }
    return null;
  }

  override format(date: Date, _displayFormat: object): string {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    return `${d}/${m}/${date.getFullYear()}`;
  }
}
