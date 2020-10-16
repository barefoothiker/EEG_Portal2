import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ParamsModalComponent } from './params-modal.component';

describe('ParamsModalComponent', () => {
  let component: ParamsModalComponent;
  let fixture: ComponentFixture<ParamsModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ParamsModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParamsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
