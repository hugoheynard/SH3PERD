import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MusicRepertoireTableComponent } from './music-repertoire-table.component';

describe('MusicRepertoireTableComponent', () => {
  let component: MusicRepertoireTableComponent;
  let fixture: ComponentFixture<MusicRepertoireTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MusicRepertoireTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MusicRepertoireTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
