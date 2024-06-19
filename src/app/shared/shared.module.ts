import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule  } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrModule } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { TextMaskModule } from 'angular2-text-mask';
import { InputMaskModule } from 'racoon-mask-raw';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { MentionModule } from 'angular-mentions';
import { ImageCropperModule } from 'ngx-image-cropper';
import { DpDatePickerModule } from 'ng2-date-picker';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';

import { MaterialModule } from './material.module';

// pipes
import { SearchColumnPipe, SearchDMOPipe, SearchRowPipe, ListFilterPipe, StripHtmlPipe } from './pipe/search-column.pipe';
import { FilterPipe, FilterCustomPipe } from './pipe/filter.pipe';
import { SafePipe } from './pipe/safe.pipe';

// directives
import { TwoDigitDecimaNumberDirective } from './directive/two-digit-decima-number.directive';
import { OptionsScrollDirective } from './directive/options-scroll.directive';
import { FourDigitDecimaNumberDirective } from './directive/four-digit-decima-number.directive';
// components
import { TabComponent } from './components/tab/tab.component';
import { TabsComponent } from './components/tabs/tabs.component';
import { AccordionItemComponent } from './components/accordion-item/accordion-item.component';
import { AccordionComponent } from './components/accordion/accordion.component';
import { GridViewComponent } from './components/grid-view/grid-view.component';
import { DmoComponent } from './components/dmo/dmo.component';
import { LogViewModelComponent } from './components/log-view-model/log-view-model.component';
import { NotesComponent } from './components/notes/notes.component';
import { GenericGridComponent } from './components/generic-grid/generic-grid.component';
import { CustomizedGridComponent } from './components/customized-grid/customized-grid.component';
import { TermsAndConditionsComponent } from './components/terms-and-conditions/terms-and-conditions.component';


// entry components
import { MessageComponent } from './components/message/message.component';
import { GridViewExportComponent } from './components/grid-view-export/grid-view-export.component';
import { FormViewModalComponent } from './components/form-view-modal/form-view-modal.component';
import { GridViewConfigurationComponent } from './components/grid-view-configuration/grid-view-configuration.component';
import { BulkUpdateModalComponent } from './components/bulk-update-modal/bulk-update-modal.component';
import { ProcessFormViewComponent } from './components/process-form-view/process-form-view.component';
import { LoaderComponent } from './components/loader/loader.component';
import { DmogGridEditModalComponent } from './components/dmog-grid-edit-modal/dmog-grid-edit-modal.component';

import { CopyRecordComponent } from './components/copy-record/copy-record.component';
import { DocumentViewComponent } from './components/document-view/document-view.component';
import { CreateFolderComponent } from './components/create-folder/create-folder.component';
import { RenameFileFolderComponent } from './components/rename-file-folder/rename-file-folder.component';
import { ListComponent } from './components/Annoucement/list/list.component';
import { AddNewComponent } from './components/Annoucement/add-new/add-new.component';
import { ShowDetailComponent } from './components/Annoucement/show-detail/show-detail.component';
import { SubProcessCopyRecordComponent } from './components/sub-process-copy-record/sub-process-copy-record.component';
import { QuickMindDetailComponent } from './components/quick-mind-detail/quick-mind-detail.component';
import { QuickMindComponent } from './components/quick-mind/quick-mind.component';
import { ListingDetailComponent } from './components/quick-mind/admin/listing-detail/listing-detail.component';
import { ListingComponent } from './components/quick-mind/admin/listing/listing.component';
import { FormViewTcModelComponent } from './components/form-view-tc-model/form-view-tc-model.component';
import { MediaViewComponent } from './components/media-view/media-view.component';
import { DmogGridViewComponent } from './components/dmog-grid-view/dmog-grid-view.component';
import { ForgotPwdComponent } from './components/forgot-pwd/forgot-pwd.component';
import { ChangePwdComponent } from './components/change-pwd/change-pwd.component';
import { RangeDirective } from './directive/range.directive';
import { ExportGridViewConfigComponent } from './components/export-grid-view-config/export-grid-view-config.component';

@NgModule({
  declarations: [
    TabComponent,
    TabsComponent,
    AccordionItemComponent,
    AccordionComponent,
    GridViewComponent,
    DmoComponent,
    LogViewModelComponent,
    MessageComponent,
    GridViewExportComponent,
    FormViewModalComponent,
    FormViewTcModelComponent,
    BulkUpdateModalComponent,
    GridViewConfigurationComponent,
    SearchColumnPipe,
    SearchDMOPipe,
    SearchRowPipe,
    ListFilterPipe,
    StripHtmlPipe,
    SafePipe,
    GenericGridComponent,
    CustomizedGridComponent,
    DocumentViewComponent,
    CreateFolderComponent,
    RenameFileFolderComponent,
    NotesComponent,
    CopyRecordComponent,
    ListComponent,
    AddNewComponent,
    ShowDetailComponent,
    ProcessFormViewComponent,
    LoaderComponent,
    SubProcessCopyRecordComponent,
    QuickMindComponent,
    QuickMindDetailComponent,
    ListingComponent,
    ListingDetailComponent,
    MediaViewComponent,
    DmogGridViewComponent,
    DmogGridEditModalComponent,
    FilterPipe,
    FilterCustomPipe,
    OptionsScrollDirective,
    TwoDigitDecimaNumberDirective,
    FourDigitDecimaNumberDirective,
    RangeDirective,
    ForgotPwdComponent,
    ChangePwdComponent,
    TermsAndConditionsComponent,    
    ExportGridViewConfigComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NgbModule,
    ToastrModule.forRoot(),
    NgSelectModule,
    TextMaskModule,
    InputMaskModule,
    MaterialModule,
    NgMultiSelectDropDownModule.forRoot(),
    AutocompleteLibModule,
    MentionModule,
    CKEditorModule,
    ImageCropperModule,
    DpDatePickerModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NgbModule,
    ToastrModule,
    NgSelectModule,
    TextMaskModule,
    InputMaskModule,
    MentionModule,
    MaterialModule,
    NgMultiSelectDropDownModule,
    AutocompleteLibModule,
    DpDatePickerModule,
    TabComponent,
    TabsComponent,
    AccordionItemComponent,
    AccordionComponent,
    GridViewComponent,
    DmoComponent,
    LogViewModelComponent,
    SearchColumnPipe,
    SearchDMOPipe,
    SearchRowPipe,
    ListFilterPipe,
    StripHtmlPipe,
    SafePipe,
    GenericGridComponent,
    CustomizedGridComponent,
    DocumentViewComponent,
    NotesComponent,
    CopyRecordComponent,
    SubProcessCopyRecordComponent,
    MediaViewComponent,
    DmogGridViewComponent,
    FilterPipe,
    FilterCustomPipe,
    TwoDigitDecimaNumberDirective,
    FourDigitDecimaNumberDirective,
    RangeDirective,
    LoaderComponent,
    ForgotPwdComponent,
    ChangePwdComponent
  ],
  entryComponents: [
    MessageComponent,
    GridViewExportComponent,
    FormViewModalComponent,
    FormViewTcModelComponent,
    BulkUpdateModalComponent,
    GridViewConfigurationComponent,
    CreateFolderComponent,
    RenameFileFolderComponent,
    CopyRecordComponent,
    ProcessFormViewComponent,
    LoaderComponent,
    SubProcessCopyRecordComponent,
    ListingDetailComponent,
    DmogGridEditModalComponent,
    ForgotPwdComponent,
    ChangePwdComponent,
    ExportGridViewConfigComponent
  ]
})
export class SharedModule { }
