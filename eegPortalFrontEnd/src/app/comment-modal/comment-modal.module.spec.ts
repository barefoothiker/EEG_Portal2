import { CommentModalModule } from './comment-modal.module';

describe('CommentModalModule', () => {
  let comment-modalModule: CommentModalModule;

  beforeEach(() => {
    comment-modalModule = new CommentModalModule();
  });

  it('should create an instance', () => {
    expect(comment-modalModule).toBeTruthy();
  });
});
