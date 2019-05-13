import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageIndicatorComponent } from './manage-indicator.component';

describe('ManageIndicatorComponent', () => {
  let component: ManageIndicatorComponent;
  let fixture: ComponentFixture<ManageIndicatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageIndicatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
