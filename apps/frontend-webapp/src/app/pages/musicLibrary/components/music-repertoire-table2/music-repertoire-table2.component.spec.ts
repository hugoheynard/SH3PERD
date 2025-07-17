import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MusicRepertoireTable2Component } from './music-repertoire-table2.component';

describe('MusicRepertoireTable2Component', () => {
  let component: MusicRepertoireTable2Component;
  let fixture: ComponentFixture<MusicRepertoireTable2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MusicRepertoireTable2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MusicRepertoireTable2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
