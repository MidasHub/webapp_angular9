import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTerminalsComponent } from './edit-terminals.component';

describe('EditTerminalsComponent', () => {
  let component: EditTerminalsComponent;
  let fixture: ComponentFixture<EditTerminalsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditTerminalsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditTerminalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
