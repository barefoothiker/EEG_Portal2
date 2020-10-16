import { ResetPasswordModule } from './resetPassword.module';

describe('ResetPasswordModule', () => {
  let resetPasswordModule: ResetPasswordModule;

  beforeEach(() => {
    resetPasswordModule = new ResetPasswordModule();
  });

  it('should create an instance', () => {
    expect(resetPasswordModule).toBeTruthy();
  });
});
