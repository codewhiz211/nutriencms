import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ContentManagerService } from '@app/core/services/content-manager.service';

@Component({
  selector: 'app-add-edit-video',
  templateUrl: './add-edit-video.component.html',
  styleUrls: ['./add-edit-video.component.scss']
})
export class AddEditVideoComponent implements OnInit {

  addEditData = {
    DataID: '',
    TempDataID: 0,
    Name: '',
    Status: 'Active',
    Description: '',
    Document: '',
    Category: '',
    AssetType: 'Video',
    file: []
  };
  processName: string;
  formVal = true;
  addEditVideo = 'Add Video';
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
