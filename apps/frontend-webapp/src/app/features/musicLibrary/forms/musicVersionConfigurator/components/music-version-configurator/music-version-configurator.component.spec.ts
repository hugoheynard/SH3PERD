import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MusicVersionConfiguratorComponent } from './music-version-configurator.component';

describe('MusicVersionConfiguratorComponent', () => {
  let component: MusicVersionConfiguratorComponent;
  let fixture: ComponentFixture<MusicVersionConfiguratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MusicVersionConfiguratorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MusicVersionConfiguratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
