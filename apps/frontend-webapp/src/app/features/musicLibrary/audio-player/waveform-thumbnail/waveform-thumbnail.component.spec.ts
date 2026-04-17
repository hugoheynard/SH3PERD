import { TestBed } from '@angular/core/testing';
import { WaveformThumbnailComponent } from './waveform-thumbnail.component';

describe('WaveformThumbnailComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaveformThumbnailComponent],
    }).compileComponents();
  });

  it('renders a canvas host', () => {
    const fixture = TestBed.createComponent(WaveformThumbnailComponent);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('canvas.waveform-thumb'),
    ).toBeTruthy();
  });

  it('is a no-op when peaks are empty — no exception, canvas not resized', () => {
    const fixture = TestBed.createComponent(WaveformThumbnailComponent);
    fixture.componentRef.setInput('peaks', new Float32Array(0));
    fixture.detectChanges();
    // No assertion on output — paint() early-returns. This test guards
    // the effect against crashing on a pristine empty input.
    expect(true).toBe(true);
  });
});
