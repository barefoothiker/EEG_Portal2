import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailResetPasswordLinkComponent } from './emailEmailResetPasswordLinkLink.component';

describe('EmailResetPasswordLinkComponent', () => {
  let component: EmailResetPasswordLinkComponent;
  let fixture: ComponentFixture<EmailResetPasswordLinkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmailResetPasswordLinkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailResetPasswordLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
