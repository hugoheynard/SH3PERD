import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenMusicLibButtonComponent } from './open-music-lib-button.component';

describe('OpenMusicLibButtonComponent', () => {
  let component: OpenMusicLibButtonComponent;
  let fixture: ComponentFixture<OpenMusicLibButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpenMusicLibButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpenMusicLibButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
