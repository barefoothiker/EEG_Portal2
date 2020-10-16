import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrainViewerComponent } from './brain-viewer.component';

describe('BrainViewerComponent', () => {
    let component: BrainViewerComponent;
    let fixture: ComponentFixture<BrainViewerComponent>;

    beforeEach(
        async(() => {
            TestBed.configureTestingModule({
                declarations: [BrainViewerComponent]
            }).compileComponents();
        })
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(BrainViewerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
