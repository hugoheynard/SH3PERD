import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchConfigurationFormComponent } from './search-configuration-form.component';

describe('SearchConfigurationFormComponent', () => {
  let component: SearchConfigurationFormComponent;
  let fixture: ComponentFixture<SearchConfigurationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchConfigurationFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchConfigurationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
