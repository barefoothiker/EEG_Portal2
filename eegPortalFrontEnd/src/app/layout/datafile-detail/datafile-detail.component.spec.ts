import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatafileDetailComponent } from './datafile-detail.component';

describe('DatafileDetailComponent', () => {
    let component: DatafileDetailComponent;
    let fixture: ComponentFixture<DatafileDetailComponent>;

    beforeEach(
        async(() => {
            TestBed.configureTestingModule({
                declarations: [DatafileDetailComponent]
            }).compileComponents();
        })
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(DatafileDetailComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
