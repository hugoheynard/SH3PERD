import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MusicTabConfiguratorComponent } from './music-tab-configurator.component';

describe('MusicTabConfiguratorComponent', () => {
  let component: MusicTabConfiguratorComponent;
  let fixture: ComponentFixture<MusicTabConfiguratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MusicTabConfiguratorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MusicTabConfiguratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
