import { DatafileDetailModule } from './datafile-detail.module';

describe('DatafileDetailModule', () => {
    let datafileDetailModule: DatafileDetailModule;

    beforeEach(() => {
        datafileDetailModule = new DatafileDetailModule();
    });

    it('should create an instance', () => {
        expect(datafileDetailModule).toBeTruthy();
    });
});
