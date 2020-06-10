import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceiverModalComponent } from './receiver-modal.component';

describe('ReceiverModalComponent', () => {
  let component: ReceiverModalComponent;
  let fixture: ComponentFixture<ReceiverModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReceiverModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReceiverModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
