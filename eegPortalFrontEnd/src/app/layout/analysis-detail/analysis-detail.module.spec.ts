import { AnalysisDetailModule } from './analysis-detail.module';

describe('AnalysisDetailModule', () => {
    let analysisDetailModule: AnalysisDetailModule;

    beforeEach(() => {
        analysisDetailModule = new AnalysisDetailModule();
    });

    it('should create an instance', () => {
        expect(analysisDetailModule).toBeTruthy();
    });
});
