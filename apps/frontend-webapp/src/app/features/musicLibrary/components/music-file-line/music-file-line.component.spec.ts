import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MusicFileLineComponent } from './music-file-line.component';

describe('MusicFileLineComponent', () => {
  let component: MusicFileLineComponent;
  let fixture: ComponentFixture<MusicFileLineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MusicFileLineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MusicFileLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
