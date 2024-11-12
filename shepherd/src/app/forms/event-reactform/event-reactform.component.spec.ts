import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventReactformComponent } from './event-reactform.component';

describe('EventFormComponent', () => {
  let component: EventReactformComponent;
  let fixture: ComponentFixture<EventReactformComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventReactformComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventReactformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
