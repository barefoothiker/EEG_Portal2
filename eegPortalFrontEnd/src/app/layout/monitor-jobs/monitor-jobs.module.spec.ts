import { MonitorJobsModule } from './monitor-jobs.module';

describe('MonitorJobsModule', () => {
    let monitorJobsModule: MonitorJobsModule;

    beforeEach(() => {
        monitorJobsModule = new MonitorJobsModule();
    });

    it('should create an instance', () => {
        expect(monitorJobsModule).toBeTruthy();
    });
});
