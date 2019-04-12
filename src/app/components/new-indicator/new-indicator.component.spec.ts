import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewIndicatorComponent } from './new-indicator.component';

describe('NewIndicatorComponent', () => {
  let component: NewIndicatorComponent;
  let fixture: ComponentFixture<NewIndicatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewIndicatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
