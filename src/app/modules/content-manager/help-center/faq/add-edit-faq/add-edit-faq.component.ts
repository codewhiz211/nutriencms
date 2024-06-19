import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ContentManagerService } from '@app/core/services/content-manager.service';

@Component({
  selector: 'app-add-edit-faq',
  templateUrl: './add-edit-faq.component.html',
  styleUrls: ['./add-edit-faq.component.scss']
})

export class AddEditFaqComponent implements OnInit {

  addEditData = {
    DataID: '',
    TempDataID: 0,
    Name: '',
    Status: '',
    Description: '',
    Document: '',
    Category: '',
    AssetType: 'FAQ',
    file: []
  };
  processName: string;
  formVal = true;
  addEditFAQ = 'Add FAQ';
  isShowSave:boolean = true;
  constructor(
    public activeModal: NgbActiveModal,
    private toastr: ToastrService,
    private contentManager: ContentManagerService) { }

  ngOnInit() {
  }

  onSubmit(val, userForm) {
    if (val) {
      console.log('new data', this.addEditData);
      this.contentManager.AddOrUpdate(this.addEditData).subscribe(Result => {
        if (Result.DataID) {
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
}
