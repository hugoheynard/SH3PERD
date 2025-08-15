import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepertoireEntryComponent } from './repertoire-entry.component';

describe('RepertoireEntryComponent', () => {
  let component: RepertoireEntryComponent;
  let fixture: ComponentFixture<RepertoireEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RepertoireEntryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RepertoireEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
