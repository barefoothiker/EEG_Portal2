import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitorJobsComponent } from './monitor-jobs.component';

describe('MonitorJobsComponent', () => {
    let component: MonitorJobsComponent;
    let fixture: ComponentFixture<MonitorJobsComponent>;

    beforeEach(
        async(() => {
            TestBed.configureTestingModule({
                declarations: [MonitorJobsComponent]
            }).compileComponents();
        })
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(MonitorJobsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
