import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VideoComponent } from './help-center/video/video/video.component';
import { AssetsComponent } from './help-center/assets/assets/assets.component';
import { FAQsComponent } from './help-center/faq/faqs/faqs.component';
import { ContentManagerComponent } from './content-manager.component';
import { BannerComponent } from './landing-page/banner/banner/banner.component';
import { ContentComponent } from './landing-page/content/content.component';

import { AuthGuard } from '@app/core';

const routes: Routes = [
    {
        path: '',
        component: ContentManagerComponent,
        canActivateChild: [AuthGuard],
        children: [
            { path: '', redirectTo: '/banner', pathMatch: 'full' },
            { path: 'video', component: VideoComponent},
            { path: 'assets', component: AssetsComponent},
            { path: 'faq', component: FAQsComponent},
            { path: 'banner', component: BannerComponent},
            { path: 'content', component: ContentComponent}
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ContentManagerRoutingModule { }
