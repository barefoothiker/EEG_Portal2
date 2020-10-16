import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Rotate3DComponent } from './rotate-3d.component';

describe('Rotate3DComponent', () => {
    let component: Rotate3DComponent;
    let fixture: ComponentFixture<Rotate3DComponent>;

    beforeEach(
        async(() => {
            TestBed.configureTestingModule({
                declarations: [Rotate3DComponent]
            }).compileComponents();
        })
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(Rotate3DComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
