import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMusicPanelComponent } from './add-music-panel.component';

describe('AddMusicPanelComponent', () => {
  let component: AddMusicPanelComponent;
  let fixture: ComponentFixture<AddMusicPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMusicPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddMusicPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
