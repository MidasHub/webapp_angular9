import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FixedDepositAccountViewComponent } from './fixed-deposit-account-view.component';

describe('FixedDepositAccountViewComponent', () => {
  let component: FixedDepositAccountViewComponent;
  let fixture: ComponentFixture<FixedDepositAccountViewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FixedDepositAccountViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixedDepositAccountViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
