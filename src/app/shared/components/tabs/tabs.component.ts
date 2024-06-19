import {
  Component,
  OnInit,
  ContentChildren,
  QueryList,
  AfterContentInit,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  OnDestroy
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, Subject } from 'rxjs';
import { first } from 'rxjs/operators';

import { TabComponent } from './../tab/tab.component';
import { NotesComponent } from '@app/shared/components/notes/notes.component';

import { ApplicationService } from '@app/core/services/application.service';
import { GenericGirdService } from '@app/core/services/generic-gird.service';
import { LogHeaderMapping } from '@app/core/models/log-header-mapping';
import { DocumentViewService } from '@app/core/services/document-view.service';
import { ListviewService } from '@app/core';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss']
})
export class TabsComponent implements OnInit, AfterContentInit, OnDestroy {

  @ContentChildren(TabComponent) tabs: QueryList < TabComponent > ;

  @Input() confirmSwitchTab = false;
  @Input() confirmed$: Subject < boolean > = new Subject();
  @Output() tabSelected: EventEmitter < string > = new EventEmitter();

  private logHeaderMapping: LogHeaderMapping = new LogHeaderMapping();
  private unsubscribe: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private applicationService: ApplicationService,
    private gService: GenericGirdService,
    private el: ElementRef,
    private notescomponent: NotesComponent,
    public documentViewService: DocumentViewService,
    public listviewservice: ListviewService) {}

  ngOnInit() {
    const checkValidationSub = this.applicationService.checkValidation.subscribe((isCheck: boolean) => {
      if (isCheck) {
        setTimeout(() => {
          this.makeValidate();
        });
      }
    });
    this.unsubscribe.push(checkValidationSub);
  }

  ngOnDestroy() {
    this.unsubscribe.forEach(sb => sb.unsubscribe());
  }

  // contentChildren are set
  ngAfterContentInit() {
    setTimeout(() => {
      // get all active tabs
      const activeTabs = this.tabs.filter(tab => tab.active);
      // if there is no active tab set, activate the first
      if (activeTabs.length === 0) {
        this.selectTab(this.tabs.first);
      }
    });
  }

  makeValidate() {
    const allTabs = this.el.nativeElement.querySelectorAll('app-tab');
    if (this.tabs) {
      const tabCmp = this.tabs.toArray();
      for (let index = 0; index < allTabs.length; index++) {
        const invalidElement = allTabs[index].querySelector('.invalid-feedback');
        if (invalidElement) {
          tabCmp[index].hasInvalidForm = true;
        } else {
          tabCmp[index].hasInvalidForm = false;
        }
      }
    }
  }

  selectTab(tab: TabComponent) {
    if (this.confirmSwitchTab) {
      const confirmSubr = this.confirmed$.subscribe((isConfirmed: boolean) => {
        if (isConfirmed) {
          // deactivate all tabs
          this.tabs.toArray().forEach(tabItem => (tabItem.active = false));
          // activate the tab the user has clicked on.
          this.getLogData(tab.title, tab.trnsctnId, tab.ProcessType, tab.ChildProcessName);
          tab.active = true;
        }
      });
      this.unsubscribe.push(confirmSubr);
    } else {
      // deactivate all tabs
      this.tabs.toArray().forEach(tabItem => (tabItem.active = false));
      // activate the tab the user has clicked on.
      this.getLogData(tab.title, tab.trnsctnId, tab.ProcessType, tab.ChildProcessName);
      tab.active = true;
    }

    this.tabSelected.emit(tab.title);
  }

  getLogData(title: string, trnsctnId: string, ProcessType: any, ChildProcessName: any) {
    this.unsubscribe.push(
      this.route.paramMap.subscribe(params => {
        let transactionId;
        if (trnsctnId) {
          transactionId = trnsctnId;
        } else {
          transactionId = params.get('id');
        }

        if (ProcessType === 'ChildProcess') {
          this.listviewservice.getChildProcessData(ChildProcessName);
        }

        switch (title) {
          case 'Activity Log':
            this.gService.data.activitylog = {};
            this.gService.data.activitylog.gridColumn = this.logHeaderMapping.activityHeaderMap;
            this.applicationService.getLogData(null, null, transactionId)
              .pipe(first())
              .subscribe(
                (result: any) => {
                  this.gService.data.activitylog.gridData = result.log;
                  this.gService.data.activitylog.gridCount = result.totalCount;
                  this.gService.data.activitylog.isChangeLog = false;
                },
                error => {
                  console.log(error);
                }
              );
            break;
          case 'Change Log':
            this.gService.data.history = {};
            this.gService.data.history.gridColumn = this.logHeaderMapping.historyHeaderMap;
            this.applicationService.getHistoryLogData(null, null, transactionId)
              .pipe(first())
              .subscribe(
                (result: any) => {
                  this.gService.data.history.gridData = result.json;
                  this.gService.data.history.gridCount = result.json.totalCount;
                  this.gService.data.history.isChangeLog = true;
                },
                error => {
                  this.gService.data.history.gridData = [];
                  this.gService.data.history.gridCount = 0;
                  console.log(error);
                }
              );
            break;
          case 'Notification':
            this.gService.data.notification = {};
            this.gService.data.notification.gridColumn = this.logHeaderMapping.notificationHeaderMap;
            this.applicationService.getNotificationLogData(null, null, transactionId)
              .pipe(first())
              .subscribe(
                (result: any) => {
                  this.gService.data.notification.gridData = result.log;
                  this.gService.data.notification.gridCount = result.totalCount;
                  this.gService.data.notification.isChangeLog = false;
                },
                error => {
                  this.gService.data.notification.gridData = [];
                  this.gService.data.notification.gridCount = 0;
                  console.log(error);
                }
              );
            break;
          case 'Notes':
            this.notescomponent.listviewService.noteMessage(transactionId)
              .subscribe(
                data => {
                  this.notescomponent.notesData = data;
                  this.notescomponent.notesData = this.notescomponent.notesData.reverse();
                  this.notescomponent.listviewService.notesShowData = [];
                  this.notescomponent.notesData.filter((prop, index) => {
                    if (prop.Files.length > 0) {
                      this.notescomponent.fullFileName = prop.Files[0].OriginalFileName;
                      this.notescomponent.fileTYpe = this.notescomponent.fullFileName.substring(this.notescomponent.fullFileName.lastIndexOf('.') + 1).toLowerCase();
                      if (this.notescomponent.fileTYpe === 'png') {
                        this.notescomponent.showFileType = 'far fa-image';
                      } else if (this.notescomponent.fileTYpe === 'txt') {
                        this.notescomponent.showFileType = 'far fa-file';
                      } else {
                        this.notescomponent.showFileType = 'far fa-file';
                      }
                    }
                    this.notescomponent.listviewService.notesShowData.push({
                      fileDetail: prop,
                      filename: this.notescomponent.showFileType ? this.notescomponent.showFileType : '',
                      fileFullName: this.notescomponent.fullFileName
                    });
                    this.notescomponent.showFileType = '';
                  });
                });
            break;
          case 'Attachments':
            this.documentViewService.getTreeData();
            break;
          default:
            break;
        }
      })
    );
  }
}
