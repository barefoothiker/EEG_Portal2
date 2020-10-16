import { Rotate3DModule } from './rotate-3d.module';

describe('Rotate3DModule', () => {
    let rotate3DModule: Rotate3DModule;

    beforeEach(() => {
        rotate3DModule = new Rotate3DModule();
    });

    it('should create an instance', () => {
        expect(rotate3DModule).toBeTruthy();
    });
});
