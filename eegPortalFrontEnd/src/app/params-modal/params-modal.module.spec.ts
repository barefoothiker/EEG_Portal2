import { ParamsModalModule } from './params-modal.module';

describe('ParamsModalModule', () => {
  let params-modalModule: ParamsModalModule;

  beforeEach(() => {
    params-modalModule = new ParamsModalModule();
  });

  it('should create an instance', () => {
    expect(params-modalModule).toBeTruthy();
  });
});
