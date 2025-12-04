import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HighchartsStandaloneComponent } from './highcharts-standalone.component';
import { SimpleChange } from '@angular/core';

describe('HighchartsStandaloneComponent', () => {
  let component: HighchartsStandaloneComponent;
  let fixture: ComponentFixture<HighchartsStandaloneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HighchartsStandaloneComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(HighchartsStandaloneComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have a chart container element', () => {
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('div');
    expect(el).toBeTruthy();
  });

  it('should accept options and not throw during init', () => {
    component.options = { title: { text: 'Test Chart' }, series: [{ data: [1, 2, 3] }] } as any;
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('debounces rapid updates and calls chart.update at most once', fakeAsync(() => {
    // Stub IntersectionObserver to immediately mark element as visible
    (window as any).IntersectionObserver = class {
      constructor(cb: any) { cb([{ isIntersecting: true }], { disconnect(){} }); }
      observe() { }
      disconnect() { }
    } as any;

    // Mock Highcharts chart and update spy
    const mockChart = { update: jasmine.createSpy('update') } as any;
    const mockHighcharts: any = {
      chart: jasmine.createSpy('chart').and.returnValue(mockChart),
      stockChart: undefined
    };

    component.Highcharts = mockHighcharts;
    component.options = { title: { text: 'initial' } } as any;
    fixture.detectChanges(); // triggers ngAfterViewInit -> createChart

    // Rapidly change options and toggle updateFlag several times
    for (let i = 0; i < 5; i++) {
      component.options = { title: { text: 'v' + i } } as any;
      component.updateFlag = !component.updateFlag;
      component.ngOnChanges({
        options: new SimpleChange(null, component.options, false),
        updateFlag: new SimpleChange(null, component.updateFlag, false)
      } as any);
    }

    // Advance timers to allow debounce to fire
    tick(200);

    expect(mockHighcharts.chart).toHaveBeenCalled();
    expect(mockChart.update).toHaveBeenCalledTimes(1);
  }));
});
