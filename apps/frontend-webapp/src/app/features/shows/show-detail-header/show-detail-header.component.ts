import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonIconComponent } from '../../../shared/button-icon/button-icon.component';
import { IconComponent } from '../../../shared/icon/icon.component';
import { InlineConfirmComponent } from '../../../shared/inline-confirm/inline-confirm.component';
import { RatingRowComponent } from '../../../shared/music-analytics/rating-row/rating-row.component';
import { TargetBarComponent } from '../../../shared/target-bar/target-bar.component';
import { ShowDetailStateService } from '../show-detail/show-detail-state.service';

@Component({
  selector: 'app-show-detail-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    FormsModule,
    ButtonIconComponent,
    IconComponent,
    InlineConfirmComponent,
    RatingRowComponent,
    TargetBarComponent,
  ],
  templateUrl: './show-detail-header.component.html',
  styleUrl: './show-detail-header.component.scss',
})
export class ShowDetailHeaderComponent {
  protected readonly state = inject(ShowDetailStateService);
}
