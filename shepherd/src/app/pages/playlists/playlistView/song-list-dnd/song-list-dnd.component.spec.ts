import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SongListDndComponent } from './song-list-dnd.component';

describe('SongListDndComponent', () => {
  let component: SongListDndComponent;
  let fixture: ComponentFixture<SongListDndComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SongListDndComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SongListDndComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
