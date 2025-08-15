import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MusicReferenceFormComponent } from './music-reference-form.component';

describe('MusicReferenceFormComponent', () => {
  let component: MusicReferenceFormComponent;
  let fixture: ComponentFixture<MusicReferenceFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MusicReferenceFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MusicReferenceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
