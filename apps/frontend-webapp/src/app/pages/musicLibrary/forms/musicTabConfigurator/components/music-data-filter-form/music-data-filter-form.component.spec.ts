import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MusicDataFilterFormComponent } from './music-data-filter-form.component';

describe('MusicDataFilterFormComponent', () => {
  let component: MusicDataFilterFormComponent;
  let fixture: ComponentFixture<MusicDataFilterFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MusicDataFilterFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MusicDataFilterFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
