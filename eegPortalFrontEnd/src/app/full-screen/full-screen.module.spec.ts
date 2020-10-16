import { FullScreenModule } from './full-screen.module';

describe('FullScreenModule', () => {
  let full-screenModule: FullScreenModule;

  beforeEach(() => {
    full-screenModule = new FullScreenModule();
  });

  it('should create an instance', () => {
    expect(full-screenModule).toBeTruthy();
  });
});
