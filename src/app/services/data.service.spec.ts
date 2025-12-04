import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DataService } from './data.service';

describe('DataService', () => {
  let service: DataService;
  let snackSpy: jasmine.SpyObj<MatSnackBar>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('MatSnackBar', ['open']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        DataService,
        { provide: MatSnackBar, useValue: spy }
      ]
    });

    service = TestBed.inject(DataService);
    snackSpy = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should toggle loaders', () => {
    service.showLoader();
    expect(service.isLoading).toBeTrue();
    service.hideLoader();
    expect(service.isLoading).toBeFalse();

    service.showLoader(true);
    expect(service.isModalLoading).toBeTrue();
    service.hideLoader(true);
    expect(service.isModalLoading).toBeFalse();
  });

  it('changeMessage should emit new value', (done) => {
    service.currentMessage.subscribe(val => {
      if (val === 'new-test') {
        expect(val).toBe('new-test');
        done();
      }
    });
    service.changeMessage('new-test');
  });

  it('success and warn should call snackBar.open with proper classes', () => {
    service.success('ok');
    expect(snackSpy.open).toHaveBeenCalledWith('ok', '', jasmine.objectContaining({ panelClass: ['notification', 'success'] }));

    service.warn('warn');
    expect(snackSpy.open).toHaveBeenCalledWith('warn', '', jasmine.objectContaining({ panelClass: ['notification', 'warn'] }));
  });
});
