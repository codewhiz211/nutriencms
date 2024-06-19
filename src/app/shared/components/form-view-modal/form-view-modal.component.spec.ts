// import { async, ComponentFixture, TestBed } from '@angular/core/testing';
// import { NO_ERRORS_SCHEMA } from '@angular/core';
// import { HttpClientTestingModule } from '@angular/common/http/testing';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { FormsModule, ReactiveFormsModule  } from '@angular/forms';
// import { RouterTestingModule } from '@angular/router/testing';
// import { ToastrService } from 'ngx-toastr';
// import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
// import { DmoControlService, FormViewService, ApplicationService } from '@app/core';
// import { DmoControlMockService, FormViewMockService, ApplicationMockService, currentUser } from '@app/testing';

// import { FormViewModalComponent } from './form-view-modal.component';

// class MockToastrService {
//   error() {
//   }
// }



// describe('FormViewModalComponent', () => {
//   let component: FormViewModalComponent;
//   let fixture: ComponentFixture<FormViewModalComponent>;

//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       declarations: [ FormViewModalComponent ],
//       schemas: [ NO_ERRORS_SCHEMA ],
//       imports: [
//         HttpClientTestingModule,
//         BrowserAnimationsModule,
//         FormsModule,
//         ReactiveFormsModule,
//         RouterTestingModule
//       ],
//       providers: [
//         {provide: ToastrService, useClass: MockToastrService},
//         {provide: DmoControlService, useClass: DmoControlMockService},
//         {provide: FormViewService, useClass: FormViewMockService},
//         {provide: ApplicationService, useClass: ApplicationMockService},
//         NgbActiveModal
//       ]
//     })
//     .compileComponents();
//   }));

//   beforeEach(() => {
//     fixture = TestBed.createComponent(FormViewModalComponent);
//     component = fixture.componentInstance;
//     let store = {};
//     const mockLocalStorage = {
//       getItem: (key: string): string => {
//         return key in store ? store[key] : null;
//       },
//       setItem: (key: string, value: string) => {
//         store[key] = `${value}`;
//       },
//       removeItem: (key: string) => {
//         delete store[key];
//       },
//       clear: () => {
//         store = {};
//       }
//     };
//     spyOn(localStorage, 'getItem')
//     .and.callFake(mockLocalStorage.getItem);
//     spyOn(localStorage, 'setItem')
//       .and.callFake(mockLocalStorage.setItem);
//     spyOn(localStorage, 'removeItem')
//       .and.callFake(mockLocalStorage.removeItem);
//     spyOn(localStorage, 'clear')
//       .and.callFake(mockLocalStorage.clear);

//     localStorage.setItem('currentUser', JSON.stringify(currentUser));
//     fixture.detectChanges();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
// });
