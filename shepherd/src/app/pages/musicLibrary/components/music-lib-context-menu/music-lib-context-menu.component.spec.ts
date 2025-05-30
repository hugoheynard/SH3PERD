import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MusicLibContextMenuComponent } from './music-lib-context-menu.component';

describe('MusicLibContextMenuComponent', () => {
  let component: MusicLibContextMenuComponent;
  let fixture: ComponentFixture<MusicLibContextMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MusicLibContextMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MusicLibContextMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
