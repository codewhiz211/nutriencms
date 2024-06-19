import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { QuickMindService } from '@app/core/services/quick-mind.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
  selector: 'app-listing-detail',
  templateUrl: './listing-detail.component.html',
  styleUrls: ['./listing-detail.component.scss']
})
export class ListingDetailComponent implements OnInit {

  Editor = ClassicEditor;

  constructor(public activeModal: NgbActiveModal, private quickMind: QuickMindService,
              private toastr: ToastrService) { }

  questionDetail = {
    QmindId: 0,
    Question: '',
    Tag: '',
    Answer: ''
  };
  processName: string;
  formVal = true;
  ngOnInit() {
  }

  onSubmit(val, userForm) {
    if (val) {
      console.log('form data', userForm.value);
      this.quickMind.AddOrUpdate(userForm.value, this.processName).subscribe(Result => {
        if (Result > 0) {
          this.toastr.success('Data saved successfully');
          this.activeModal.close(Result);
        }
      },
      err => {
        this.toastr.error(err.error.message);
        this.activeModal.close(0);
      });
    }
  }

  onReady(eventData) {
    eventData.plugins.get('FileRepository').createUploadAdapter = function (loader) {
      console.log('loader : ', loader)
      console.log(btoa(loader.file));
      return new UploadAdapter(loader);
    };
  }
}
export class UploadAdapter {
  private loader;
  constructor( loader ) {
     this.loader = loader;
  }
  upload() {
     return this.loader.file
           .then( file => new Promise( ( resolve, reject ) => {
                 var myReader= new FileReader();
                 myReader.onloadend = (e) => {
                    resolve({ default: myReader.result });
                 }
                 myReader.readAsDataURL(file);
           } ) );
  };
}
