import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonIconComponent } from '../../../shared/button-icon/button-icon.component';
import { IconComponent } from '../../../shared/icon/icon.component';
import { InlineConfirmComponent } from '../../../shared/inline-confirm/inline-confirm.component';
import { RatingSparklineComponent } from '../../../shared/rating-sparkline/rating-sparkline.component';
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
    RatingSparklineComponent,
  ],
  templateUrl: './show-detail-header.component.html',
  styleUrl: './show-detail-header.component.scss',
})
export class ShowDetailHeaderComponent {
  protected readonly state = inject(ShowDetailStateService);
}
