import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryDbComponent } from './query-db.component';

describe('QueryDbComponent', () => {
  let component: QueryDbComponent;
  let fixture: ComponentFixture<QueryDbComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QueryDbComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryDbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
