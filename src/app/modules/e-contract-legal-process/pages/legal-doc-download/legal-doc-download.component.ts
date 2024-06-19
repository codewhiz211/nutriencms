import { Component, OnInit, OnDestroy } from '@angular/core';
import { saveAs } from 'file-saver';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { ApiESaleyardService } from '@app/core';


@Component({
  selector: 'app-legal-doc-download',
  templateUrl: './legal-doc-download.component.html',
  styleUrls: ['./legal-doc-download.component.scss']
})
export class LegalDocDownloadComponent implements OnInit, OnDestroy {

  TrnsctnID: string;
  documentno: string;
  role: string;
  private unsubscribe: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private api: ApiESaleyardService
  ) { }

  ngOnInit() {
    // const tokenParameter: any = {
    //   assettype: 'ZY381nukfis5j3ElXw6nLiBJ1LbqxXwxxoR5K0sxkFCWLJ5wRy7IaIWN6FpMkZiN'
    // };

    // const tokenSubscription = this.api.get('contentmanager/getassets', tokenParameter).subscribe(token => {
    //   localStorage.setItem('AccessToken', token.assetname);

    const routerSubscription = this.route.queryParams.subscribe(params => {
      this.TrnsctnID = params.TrnsctnID;
      this.documentno = params.documentno;
      this.role = params.role;
      this.downloadPDF();
    });
    this.unsubscribe.push(routerSubscription);
    //  });
    //  this.unsubscribe.push(tokenSubscription);

  }

  ngOnDestroy(): void {
    // Called once, before the instance is destroyed.
    this.unsubscribe.forEach(sb => sb.unsubscribe());
  }

  downloadPDF() {
    const header = {
      roleGuid: this.role,
      docno: this.documentno
    };

    this.api.postGetFileWithoutToken(`LegalDocument/downloadfile?oppTranctnid=${this.TrnsctnID}`, null, 'Blob', header).subscribe(
      (res: Blob) => {
        const newBlob = new Blob([res], { type: 'application/pdf' });

        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          const curDate = new Date();
          const fileName = 'LegalDocs'
            + '_' + (curDate.getMonth() + 1).toString()
            + '_' + curDate.getDate()
            + '_' + curDate.getFullYear()
            + '_' + curDate.getHours()
            + '_' + curDate.getMinutes()
            + '_' + curDate.getSeconds()
            + '.pdf';
          window.navigator.msSaveOrOpenBlob(newBlob, fileName);
        } else {
          const blobUrl = URL.createObjectURL(newBlob);
          window.open(blobUrl, '_self');
        }
      }
    );
  }
}
