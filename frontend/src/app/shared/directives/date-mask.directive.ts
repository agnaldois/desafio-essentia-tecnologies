import { Directive, ElementRef, HostListener, inject, Renderer2 } from '@angular/core';

@Directive({
  selector: '[dateMask]',
  standalone: true,
})
export class DateMaskDirective {
  private readonly el = inject(ElementRef<HTMLInputElement>);
  private readonly renderer = inject(Renderer2);
  private formatting = false;

  @HostListener('input')
  onInput(): void {
    if (this.formatting) return;
    this.formatting = true;

    const input = this.el.nativeElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 8);

    let formatted = digits;
    if (digits.length > 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    } else if (digits.length > 2) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }

    if (input.value !== formatted) {
      this.renderer.setProperty(input, 'value', formatted);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }

    this.formatting = false;
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    const input = this.el.nativeElement;
    const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'];
    const isDigit = /^\d$/.test(event.key);

    if (!isDigit && !allowed.includes(event.key) && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
    }

    // Skip slash positions automatically when typing forward
    if (isDigit && (input.selectionStart === 2 || input.selectionStart === 5)) {
      const pos = input.selectionStart;
      if (input.value[pos] === '/') {
        input.setSelectionRange(pos + 1, pos + 1);
      }
    }
  }
}
