import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-unit-select',
  standalone: true,
  imports: [FormsModule],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => UnitSelectComponent),
    multi: true
  }],
  template: `
    <select [class]="selectClass" [disabled]="disabled"
      [(ngModel)]="value" (ngModelChange)="notifyChange($event)">
      <option value="">{{ placeholder }}</option>
      <optgroup label="Peso">
        <option value="g">g</option>
        <option value="kg">kg</option>
      </optgroup>
      <optgroup label="Volumen">
        <option value="ml">ml</option>
        <option value="l">l</option>
        <option value="cucharadas">cucharadas</option>
        <option value="cucharaditas">cucharaditas</option>
        <option value="tazas">tazas</option>
      </optgroup>
      <optgroup label="Unidades">
        <option value="unidades">unidades</option>
        <option value="filetes">filetes</option>
        <option value="dientes">dientes</option>
        <option value="hojas">hojas</option>
        <option value="manojo">manojo</option>
        <option value="rebanadas">rebanadas</option>
        <option value="lonchas">lonchas</option>
        <option value="rodajas">rodajas</option>
        <option value="ramas">ramas</option>
        <option value="yemas">yemas</option>
      </optgroup>
      <optgroup label="Otro">
        <option value="pizca">pizca</option>
        <option value="al gusto">al gusto</option>
      </optgroup>
    </select>
  `
})
export class UnitSelectComponent implements ControlValueAccessor {
  @Input() selectClass = 'form-select';
  @Input() placeholder = '—';

  value = '';
  disabled = false;

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  notifyChange(v: string): void {
    this.onChange(v);
    this.onTouched();
  }

  writeValue(v: string): void       { this.value = v ?? ''; }
  registerOnChange(fn: (v: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void         { this.onTouched = fn; }
  setDisabledState(disabled: boolean): void       { this.disabled = disabled; }
}
