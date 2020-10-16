import { HelpModalModule } from './help-modal.module';

describe('HelpModalModule', () => {
  let help-modalModule: HelpModalModule;

  beforeEach(() => {
    help-modalModule = new HelpModalModule();
  });

  it('should create an instance', () => {
    expect(help-modalModule).toBeTruthy();
  });
});
