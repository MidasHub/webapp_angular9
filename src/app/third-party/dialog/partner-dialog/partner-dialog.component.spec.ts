import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PartnerDialogComponent } from './partner-dialog.component';


describe('PartnerTabComponent', () => {
  let component: PartnerDialogComponent;
  let fixture: ComponentFixture<PartnerDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PartnerDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartnerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
