import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  template: `
    <div class="star-rating" [class.interactive]="interactive">
      @for (star of stars; track star) {
        <span
          class="star"
          [class.filled]="isFull(star)"
          [class.half]="isHalf(star)"
          (mouseenter)="interactive ? hovered.set(star) : null"
          (mouseleave)="interactive ? hovered.set(0) : null"
          (click)="interactive ? select(star) : null">
          <i class="bi"
             [class.bi-star-fill]="isFull(star)"
             [class.bi-star-half]="isHalf(star)"
             [class.bi-star]="isEmpty(star)"></i>
        </span>
      }
      @if (showCount && ratingCount > 0) {
        <span class="rating-count">({{ ratingCount }})</span>
      }
    </div>
  `,
  styles: [`
    .star-rating { display: inline-flex; align-items: center; gap: 2px; }
    .star { font-size: 0.95rem; color: #ccc; line-height: 1; transition: color 0.1s; }
    .star.filled, .star.half { color: #F4A820; }
    .interactive .star { cursor: pointer; }
    .interactive .star:hover, .interactive .star.filled { color: #F4A820; }
    .rating-count { font-size: 0.78rem; color: #52796F; margin-left: 4px; }
  `]
})
export class StarRatingComponent {
  @Input() score: number = 0;
  @Input() ratingCount: number = 0;
  @Input() interactive: boolean = false;
  @Input() showCount: boolean = false;
  @Output() scoreChange = new EventEmitter<number>();

  hovered = signal(0);
  stars = [1, 2, 3, 4, 5];

  private effectiveScore = computed(() =>
    this.interactive ? (this.hovered() || this.score) : this.score
  );

  isFull(star: number): boolean {
    return star <= Math.floor(this.effectiveScore());
  }

  isHalf(star: number): boolean {
    if (this.interactive) return false;
    const frac = this.effectiveScore() % 1;
    return frac >= 0.5 && star === Math.ceil(this.effectiveScore());
  }

  isEmpty(star: number): boolean {
    return !this.isFull(star) && !this.isHalf(star);
  }

  select(star: number): void {
    this.scoreChange.emit(star);
  }
}
