import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoComponent } from './help-center/video/video/video.component';
import { ContentManagerComponent } from './content-manager.component';
import { FormsModule  } from '@angular/forms';

// Routing

import { ContentManagerRoutingModule } from './content-manager-routing.module';
import { ContentManagerSidenavComponent } from './content-manager-sidenav/content-manager-sidenav.component';
import { AssetsComponent } from './help-center/assets/assets/assets.component';
import { FAQsComponent } from './help-center/faq/faqs/faqs.component';
import { SharedModule } from '@app/shared';
import { AddEditAssestComponent } from './help-center/assets/add-edit-assest/add-edit-assest.component';
import { AddEditFaqComponent } from './help-center/faq/add-edit-faq/add-edit-faq.component';
import { AddEditVideoComponent } from './help-center/video/add-edit-video/add-edit-video.component';
import { BannerComponent } from './landing-page/banner/banner/banner.component';
import { AddEditBannerComponent } from './landing-page/banner/add-edit-banner/add-edit-banner.component';
import { ContentComponent } from './landing-page/content/content.component';
import { CKEditorModule } from 'ckeditor4-angular';
import { ImageCropperModule } from 'ngx-image-cropper';
// import { AddEditVideoComponent } from './help-center/video/add-edit-video/add-edit-video.component';

@NgModule({
  declarations: [VideoComponent, ContentManagerSidenavComponent, ContentManagerComponent, AssetsComponent, FAQsComponent,
    AddEditAssestComponent, AddEditFaqComponent, AddEditVideoComponent, BannerComponent, AddEditBannerComponent, ContentComponent
    ],
  imports: [
    CommonModule,
    SharedModule,
    ContentManagerRoutingModule,
    FormsModule,
    CKEditorModule,
    ImageCropperModule
  ],
  entryComponents: [
    AddEditAssestComponent,
    AddEditFaqComponent,
    AddEditVideoComponent,
    AddEditBannerComponent
  ]
})
export class ContentManagerModule { }
