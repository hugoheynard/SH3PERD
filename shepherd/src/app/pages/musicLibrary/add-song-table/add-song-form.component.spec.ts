import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSongFormComponent } from './add-song-form.component';

describe('AddSongTableComponent', () => {
  let component: AddSongFormComponent;
  let fixture: ComponentFixture<AddSongFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSongFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddSongFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
