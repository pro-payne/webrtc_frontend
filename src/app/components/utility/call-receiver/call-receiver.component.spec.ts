import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CallReceiverComponent } from './call-receiver.component';

describe('CallReceiverComponent', () => {
  let component: CallReceiverComponent;
  let fixture: ComponentFixture<CallReceiverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CallReceiverComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CallReceiverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
