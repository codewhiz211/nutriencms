import { Component, OnInit, ElementRef, ViewChild, Input, OnDestroy } from '@angular/core';
import { DocumentViewService } from '@app/core/services/document-view.service';
import { GenericGirdService } from '@app/core/services/generic-gird.service';
import { ActivatedRoute } from '@angular/router';
import { ExtendTreeControl } from './extend-tree-control.service';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { IHeaderMap, MessageService } from '@app/core';
import { saveAs } from 'file-saver';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CreateFolderComponent } from '../create-folder/create-folder.component';
import { RenameFileFolderComponent } from '../rename-file-folder/rename-file-folder.component';
import { ImageCroppedEvent, ImageTransform } from 'ngx-image-cropper';
import { MediaService } from '@app/core/services/media.service';
import { ImageCompressorService } from '@app/core/services/image-compressor.service';
import { tap } from 'rxjs/operators';
import { environment } from '@env/environment';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';

class treeNode {
  name: string;
  children?: treeNode[];
  nodeId: string;
  parentId: string;
  expanded: boolean;
  path: string;
  level: number;
  idPath: string;
  isSale?: boolean;
  trnId?:string
}
interface Request {
  Type: string;
  SourceDocumentPath: string;
  OldDocumentName: string;
  DestinationPath: string;
  DocumentType: string;
  NewDocumentName: string;
  DocumentID: string;
  DestinationFolderId: string;
  RootFolderName: string;
  Action: string;
  ProcessName: string;
  TransactionID: string;
  TimeZone: string;
  isSourceSale?: boolean;
  isDestinationSale?: boolean;
  SourceTransactnId?: string;
  DestinationNodeId?: string;
  SourceParentId?: string;
  DestinationParentId?: string;
}
interface ContentNode {
  name: string;
  nodeId: string;
  parentId: string;
  type: string;
  createdBy: string;
  createdOn: string;
  modifiedBy: string;
  modifiedOn: string;
  size: string;
  isDeleted: string;
  deletedBy: string;
  deletedOn: string;
  path: string;
  isActive: string;
  isFeatured: string;
  documentType?: string;
}
interface FolderOption {
  FileExists: boolean;
}
@Component({
  selector: 'app-document-view',
  templateUrl: './document-view.component.html',
  styleUrls: ['./document-view.component.scss']
})

export class DocumentViewComponent implements OnInit, OnDestroy {

  pendingFileLinks$: Observable<any[]>;

  @Input() UseAsMedia: boolean;
  @Input() isCrop: boolean;
  @Input() transactionId: string;
  @Input() isSale: boolean;
  @Input() processName: string = sessionStorage.getItem('processName');
  @Input() IsAllowDirectSave:boolean = false;
  public mediaLinks = {};
  modalRef: any;
  dataSource;
  bredcrum = [];
  idBredcrum = [];
  activeTreeNode;
  treeControl = new ExtendTreeControl<treeNode>(node => node.children);
  document = {
    DocumentID: '0',
    ProcessName: this.route.snapshot.params.process != undefined ? this.route.snapshot.params.process : sessionStorage.getItem('AppName'),
    TransactionID: '',
    TimeZone: '0',
    IsActive: '',
    IsFeatured: '',
  };
  time;
  modalScrollDistance = 2;
  modalScrollThrottle = 50;
  gridConfig: IHeaderMap;
  obj: Request;
  descObj: Request;
  activeRow;
  dataNode = [];
  treeExpendNode = {};
  HierarchyID = 0;
  dataList: any = [];
  tileView: any = [];
  dataList1: any = [];
  currentNodeId: any;
  layout: any = 'grid';
  folderIndex:number;
  FolderLayout:boolean;
  isHyperLink=false;
  // Cropped Image
  width: number;
  height: number;
  transform: ImageTransform = {scale: 1};

  Croppedwidth: number;
  Croppedheight: number;

  imageChangedEvent: any = '';
  croppedImage: any = '';
  errorMsg: string;

  isProcess = true;
  processCompleted = 0.0;
  ProcessPer = 0;
  dmogGuid: string;

  listData: any[];
  ImageList = [];
  IsCopyMove = false;
  IsCopied = false;

  TREE_DATA: treeNode[] = [];
  FolderView = {};

  currentDir: string;
  contextMenuItems = [];
  copiedTile: ContentNode;
  subscription: any;
  TimeZone: number;

  constructor(
    private compressor: ImageCompressorService,
    private msg: MessageService,
    public documentViewService: DocumentViewService,
    public genericGirdService: GenericGirdService,
    private route: ActivatedRoute,
    private elRef: ElementRef,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private mda: MediaService) {
      this.TimeZone = new Date().getTimezoneOffset();
      const currentObj = this;

      this.gridConfig = {
        config: {
          header: {
            columns: [
              {
                objectKey: 'name',
                displayName: 'Name'
              },
              {
                objectKey: 'modifiedBy',
                displayName: 'Member'
              },
              {
                objectKey: 'modifiedOn',
                displayName: 'Modified',
                dataType: 'Date',
                format: environment.Setting.dateTimeFormatNoSeconds,
                timeZone: this.TimeZone.toString()
              },
              {
                objectKey: 'size',
                displayName: 'Size'
              }, {
                objectKey: 'documentType',
                displayName: 'Document Type'
              // }, {
              //   objectKey: 'isActive',
              //   displayName: 'Active'
              // }, {
              //   objectKey: 'isFeatured',
              //   displayName: 'Featured'
              }
            ],
            action: {
              Link: {
                Placement: 'name',
                Action: {
                  Download(row) {
                    if (row.type === '1') {
                      currentObj.isHyperLink = true;
                      currentObj.downloadFile(row, 'DOWNLOAD');
                    } else {
                      currentObj.breadcrumClick(row.nodeId);
                    }
                  }
                }
              },
              DropDown: {
                Action: [
                  {
                    Download(row) {   
                      currentObj.isHyperLink = false;                  
                      currentObj.downloadFile(row, 'DOWNLOAD');
                    }
                  }, {
                    Edit(row) {
                      currentObj.activeRow = row;
                      currentObj.openRenamePopup();
                    }
                  }, {
                    Move(row) {
                      currentObj.IsCopyMove = true;
                      currentObj.UpdateDocument(row, 'MOVE', undefined, undefined);
                      if (currentObj.IsCopyMove === true && currentObj.IsCopied === false) {

                        if(currentObj.gridConfig.config.header.action.DropDown.Action.filter(d => d.Paste).length > 0)
                        {
                          let existRow = currentObj.gridConfig.config.header.action.DropDown.Action.filter(d => d.Paste)[0].Paste;
                          let existRowIndex =  currentObj.gridConfig.config.header.action.DropDown.Action.map(item => item.Paste).indexOf(existRow)
                          currentObj.gridConfig.config.header.action.DropDown.Action.splice(existRowIndex, 1);

                          currentObj.gridConfig.config.header.action.DropDown.Action.push(
                            {
                              Paste(row) {
                                currentObj.UpdateDocument(row, 'PASTE', undefined, undefined);
                              }
                            }
                          );
                        }
                        else{
                          currentObj.gridConfig.config.header.action.DropDown.Action.push(
                            {
                              Paste(row) {
                                currentObj.UpdateDocument(row, 'PASTE', undefined, undefined);
                              }
                            }
                          );
                        }                       
                        currentObj.IsCopyMove = false;
                      }
                    }
                  }, {
                    Copy(row) {
                      currentObj.IsCopied = true;
                      currentObj.UpdateDocument(row, 'COPY', undefined, undefined);
                      if (currentObj.IsCopyMove === false && currentObj.IsCopied === true) {
                        // currentObj.gridConfig.config.header.action.DropDown.Action.push(
                        //   {
                        //     Paste(row) {
                        //       currentObj.UpdateDocument(row, 'PASTE', undefined, undefined);
                        //     }
                        //   }
                        // );
                        
                        if(currentObj.gridConfig.config.header.action.DropDown.Action.filter(d => d.Paste).length > 0)
                        {
                          let existRow = currentObj.gridConfig.config.header.action.DropDown.Action.filter(d => d.Paste)[0].Paste;
                          let existRowIndex =  currentObj.gridConfig.config.header.action.DropDown.Action.map(item => item.Paste).indexOf(existRow)
                          currentObj.gridConfig.config.header.action.DropDown.Action.splice(existRowIndex, 1);

                          currentObj.gridConfig.config.header.action.DropDown.Action.push(
                            {
                              Paste(row) {
                                currentObj.UpdateDocument(row, 'PASTE', undefined, undefined);
                              }
                            }
                          );
                        }
                        else{
                          currentObj.gridConfig.config.header.action.DropDown.Action.push(
                            {
                              Paste(row) {
                                currentObj.UpdateDocument(row, 'PASTE', undefined, undefined);
                              }
                            }
                          );
                        }
                        currentObj.IsCopyMove = false;
                      }
                    }
                  }, {
                    Delete(row) {
                      currentObj.UpdateDocument(row, 'DELETE', undefined, undefined);
                    }
                  }
                ]
              }
            }
          },
          paging: false
        }
      };
  }
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  ngOnInit() {
    if (!this.transactionId) {
      this.transactionId = this.route.snapshot.paramMap.get('id');
    }
    this.document.TransactionID = this.transactionId;
   // this.getTreeData();
   this.subscription = this.documentViewService.callData.subscribe(Count => {
      this.getTreeData();
    });
   this.documentViewService.onFilesUploaded
    .pipe(tap(_ => this.getTreeData()))
    .toPromise();

    const self = this;
    if (this.UseAsMedia === true) {
      this.gridConfig.config.header.columns.push(
        {
          objectKey: 'isActive',
          displayName: 'Active'
        }, {
          objectKey: 'isFeatured',
          displayName: 'Featured'
        }
      );
      this.gridConfig.config.header.action.DropDown.Action.push(
        {
          Toggle_Active(row: ContentNode) {
            self.isActive(row);
          }
        }, {
          Make_Featured(row: ContentNode) {
            self.makeFeatured(row);
          }
        },
      );
    } else {
      this.UseAsMedia = false;
      this.gridConfig.config.header.columns.slice(-1, 2);
      this.gridConfig.config.header.action.DropDown.Action.slice(-1, 2);
    }

    this.pendingFileLinks$ = this.documentViewService.pendingFileLinks;
  }
  
  public generateThumbnail(item: any) {
    return this.mediaLinks[item.ID];
  }

  public isVideo(link: string) {
    link = link.toLowerCase();
    return (
      link.endsWith('.wmv') || 
      link.endsWith('.mp4') ||
      link.endsWith('.3gp') ||
      link.endsWith('.mov') ||
      link.endsWith('.mpg')   
    );
  }

  public isImage(link: string) {
    link = link.toLowerCase();
    return (
      link.endsWith('.jpg') || 
      link.endsWith('.jpeg') || 
      link.endsWith('.png') || 
      link.endsWith('.webp') || 
      link.endsWith('.gif') ||
      link.endsWith('.svg')
    );
  }

  public removeFromPendingList(index: number) {
    this.documentViewService.removeFromPendingFieleList(index);
  }

  /* Toggles activation state for an item in the tree */
  private isActive(row: ContentNode) {
    let status = row.isActive === 'No' ? 1 : 0;
    this.documentViewService.setActive(this.transactionId, row.nodeId, status)
      .subscribe(result => {
        (this.dataList[this.currentNodeId] as Array<any>).forEach(item => {
          if (row.nodeId === item.ID) {
            if (!status) {
              item.IsActive = 0; // deactivates in grid view
              row.isActive = 'No'; // deactivates in list view
            } else {
              item.IsActive = 1; // activates in grid view
              row.isActive = 'Yes'; // activates in list view
            }
          }
        });
      });
  }

  /* Makes the item in the tree featured */
  private makeFeatured(row: ContentNode) {
    if (row.isFeatured === 'Yes')
      return;
    this.documentViewService.setFeatured(this.transactionId, row.nodeId)
      .subscribe(result => {
      if (result) {
        const ar = Object.keys(this.dataList);
        ar.forEach(x => {
          this.dataList[x].map(x => x.IsFeatured = 0); // reset everything in grid view
          this.FolderView[x].map(item => item.isFeatured = 'No'); // reset everything in list view
        });
        this.dataList[this.currentNodeId].forEach(item => {
          if (item.ID === row.nodeId)
            item.IsFeatured = 1; // find the one item in the whole tree and make it featured in grid view
        });
        row.isFeatured = 'Yes'; // make the row featured
      }
    });

  }


  /* Get tree data from server and bind tree data source*/
  getTreeData() {    
    this.documentViewService.FolderTree(this.document,this.isSale)
      .subscribe(
        async data => {
          if(data[0]) {
            this.contextMenuItems = [];
            this.dataList = data;
            this.dataList1 = {...data};
            this.tileView = data[0];
            this.tileView.forEach(item => this.contextMenuItems.push(false));
          }
          this.TREE_DATA = [];
          this.FolderView = [];
          const arr: any[] = [];
          let ob = { name: 'Index', nodeId: '0', parentId: null, children: [], path: '', expanded: true, level: 0, idPath: '0' };
          this.TREE_DATA.push(ob);
          // this.dataNode.push({ name: 'Index', nodeId: '0', parentId: null, children: [], path: '', expanded: true, level: 0, idPath: '0'});
          this.ProcessTreeNode(data, arr, 0, null, '', '0');
          this.TREE_DATA[0].children = arr;
          this.dataSource = new MatTreeNestedDataSource();
          const data1 = this.buildFileTree(this.TREE_DATA, 0);
          this.dataSource.data = data1;
          this.treeControl['dataNodes'] = this.dataNode.reverse();
          this.genericGirdService.data['Document'] = {};
          if (this.activeTreeNode) {
            this.treeControl.expandParents(this.activeTreeNode);
            this.selectContent(this.activeTreeNode);
          } else {
            for (const key in this.dataSource.data) {
              if (this.dataSource.data.hasOwnProperty(key)) {
                const element = this.dataSource.data[key];
                if (element.expanded) {
                  this.treeControl.expand(element);
                }
                this.selectContent(element);
              }
            }
          }
          if (this.currentDir)
            this.getChildList(this.currentDir);

            if(!this.isSale){
              this.documentViewService
              .getFileLinks(this.transactionId).subscribe(links => this.mediaLinks = links);

              if (this.processName === 'LMKOpportunities') {
                const allFiles =  await this.documentViewService.getAttachedFiles();
                if (allFiles.length > 0) {
                  const { featured, active } = await this.documentViewService.hasActiveAndFeaturedImage();
                  if (active && !featured) {
                    const firstFile = allFiles[0];
                    this.setIsFeatured(firstFile);
                  }
                }
              }
            }

          if (this.tileView && this.tileView.length > 0 && this.UseAsMedia === true) {
            this.FolderLayout = true;
          }
        }, err => {
          console.log(err);
        });
  }

  hasChild = (_: number, node: treeNode) => !!node.children && node.children.length > 0;
  /* process tree data JSON and convert JSON into parent child*/
  ProcessTreeNode(data, childNode: any[], nodeKey, parentId, nodePath: string, idPath: string) {
    if (!data[nodeKey]) {
      this.FolderView[nodeKey] = [];
      this.FolderView[nodeKey].push({
        name: '',
        size: '',
        createdBy: '',
        nodeId: '',
        type: '',
        createdOn: '',
        parentId: '',
        modifiedBy: '',
        modifiedOn: '',
        isDeleted: '',
        deletedBy: '',
        deletedOn: '',
        path: nodePath,
        isShowDots: '',
        trnId: '',
        
      });
      return;
    }
    data[nodeKey].forEach(element => {
      if (!this.FolderView[nodeKey]) {
        this.FolderView[nodeKey] = [];
      }
      if (element !== undefined) {
        if (element.Type === '0') {
          const arr: [] = [];
          this.ProcessTreeNode(data, arr, element.ID, nodeKey, nodePath + '/' + element.Name, idPath + '/' + element.ID);
          childNode.push({
            name: element.Name, nodeId: element.ID, parentId: nodeKey, children: arr,
            path: nodePath + '/' + element.Name, expanded: false,
            idPath: idPath + '/' + element.ID,
            trnId: ''
          });
        }
        let localTime = new Date(element.ModifiedOn);
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        const row = {
          name: element.Name,
          size: element.Size,
          createdBy: element.CreatedByName,
          nodeId: element.ID,
          type: element.Type,
          documentType: element.DocumentType,
          createdOn: element.CreatedOn,
          parentId: nodeKey,
          modifiedBy: element.ModifiedByName,
          modifiedOn: element.ModifiedOn,
          isDeleted: element.IsDeleted,
          deletedBy: element.DeletedByName,
          deletedOn: element.DeletedOn,
          path: nodePath + '/' + element.Name,
          isActive: element.IsActive ? 'Yes' : 'No',
          isFeatured: element.IsFeatured ? 'Yes' : 'No',
          isShowDots: element.isShowDots,
          trnId: element.LotTRNSCTNID,

        };
        this.FolderView[nodeKey].push(row);
      }
    });
    if (this.processName === 'LMKOpportunities')
      this.FolderView[nodeKey].sort((a, b) => Date.parse(a.createdOn) - Date.parse(b.createdOn));
  }
  /* Create datasource for tree.*/
  buildFileTree(obj: object, level: number): treeNode[] {
    return Object.keys(obj).reduce<treeNode[]>((accumulator, key) => {
      const element = obj[key];
      const node = new treeNode();
      node.nodeId = key;
      if (element != null) {
        if (typeof element === 'object') {
          node.children = this.buildFileTree(element.children, level + 1);
          node.name = element.name; node.nodeId = element.nodeId; node.parentId = element.parentId;
          node.path = element.path; node.expanded = element.expanded; node.level = level;
          node.idPath = element.idPath;
          this.dataNode.push(node);
        } else {
        }
      }

      return accumulator.concat(node);
    }, []);
  }
  /*Set tree content view*/
  selectContent(node) {
    if(node === undefined){
      return false;
    }

    this.currentNodeId = node.nodeId;
    const now = new Date();
    const t = now;
    if (this.time !== t) {
      this.activeTreeNode = node;
      this.genericGirdService.data['Document'].gridData = this.FolderView[node.nodeId];
      const path = 'Index' + node.path;
      this.bredcrum = path.split(/\//);
      this.idBredcrum = node.idPath.split(/\//);
    }

    if(this.FolderLayout == true){
      this.currentDir = node.nodeId;
      this.tileView = this.dataList1[node.nodeId] || [];
    }
  }

  private convertTileToGrid(row: any): ContentNode {
    let n: ContentNode;
    for (const node of Object.keys(this.FolderView)) {
      const found = this.FolderView[node].find(item => item.nodeId === row.ID);
      if (found) {
        n = found;
        break;
      }
    }
    return n;
  }

  onTileAction(row, action: 'COPY' | 'MOVE') {
    if (row.hasOwnProperty('ID'))
      row = this.convertTileToGrid(row);
    this.IsCopyMove = true;
    this.UpdateDocument(row, action, undefined, undefined);
    if (this.IsCopyMove === true && this.IsCopied === false) {
      this.copiedTile = row;
    }
  }

  pasteTile() {
    this.UpdateDocument(this.copiedTile, 'PASTE');
  }
  /* Download file from server.*/
  downloadFile(row, action) {
    /* Check if item is a tile item */
    /* Tile items have ID property instead of nodeId for grid items */
    if (row.hasOwnProperty('ID'))
      row = this.convertTileToGrid(row);
      
    this.obj = {
      Type: row.type,
      SourceDocumentPath: row.path,
      OldDocumentName: row.name,
      DestinationPath: row.path,
      NewDocumentName: row.name,
      DocumentID: row.nodeId,
      DestinationFolderId: row.parentId,
      RootFolderName: 'Home',
      Action: action,
      ProcessName: '',
      TransactionID: '',
      TimeZone: '',
      DocumentType: row.documentType
    };

    if (this.obj.Type === '0') {
      const CheckOption = { FileExists: false };
      this.ifFileExistInFolder(this.obj.DocumentID, CheckOption);
      if (!CheckOption.FileExists) {
        this.msg.showMessage('Warning', {body: 'No file exists in selected folder'});
        return false;
      }
    }
    let trnId = this.document.TransactionID;
    if (this.isSale == true && Object.keys(this.dataList).length > 0) {
      const pNode = this.dataList[0].find(x => x.ID === this.activeTreeNode.parentId || x.ID === this.activeTreeNode.nodeId);
      if (pNode && pNode.LotTRNSCTNID !== undefined && pNode.LotTRNSCTNID !== null) {
        trnId = pNode.LotTRNSCTNID;
        const rawPath = row.path.split('/');
        if(rawPath.length > 1) {
        delete rawPath[0];
        delete rawPath[1];
        }
        row.path = rawPath.join('/');
      }
    }
    const formData = new FormData();
    if (this.document.TransactionID !== '') {
      formData.append('transactionID', trnId);
    }
    const rawPath = row.path.split('/');
    rawPath.pop();
    formData.append('processName', this.document.ProcessName);
    formData.append('docName', row.name);
    formData.append('path', rawPath.join('/'));
    formData.append('FileName', row.name);
    formData.append('type', row.type);
    this.documentViewService.downloadfile('documentView/downloadfile', formData).subscribe(
      (resultBlob: Blob) => {
        if (row.type === '1') {
          if (this.isHyperLink === true && this.UseAsMedia === false) { 
            let exttyp = (row.name.split('.').pop()).toLowerCase();
            if(exttyp === 'jpg'|| exttyp === 'jpeg'){              
              let fileURL = URL.createObjectURL(resultBlob);
              var image = new Image();
              image.src = fileURL;    
              var w = window.open("");
              w.document.write(image.outerHTML);
            }
              else if(exttyp === 'pdf' || exttyp === 'html'  || exttyp === 'sql' || exttyp === 'mp3' || exttyp === 'mp4'){
                var contantType = exttyp === 'pdf' ? 'application/pdf' : (exttyp === 'html' ? 'text/html' :
                 (exttyp === 'mp3' ? 'audio/mpeg': (exttyp === 'mp4' ? 'video/mp4' : 'text/plain')));
                let file = new Blob([resultBlob], { type: contantType });
                let fileURL = URL.createObjectURL(file);
                window.open(fileURL);
              }
            else {
              saveAs(resultBlob, this.obj.OldDocumentName);
            }             
            this.isHyperLink = false;
          }
          else {
            saveAs(resultBlob, this.obj.OldDocumentName);
          }
        } else {
          saveAs(resultBlob, this.obj.OldDocumentName + '.zip');
        }
      }, err => {
        console.log(err);
      }
    );
  }
  /* Check Duplicate Document in destination*/
  IsDocumentExistInDest(documentName, documentID, documentType) {
    documentName = documentName.toString().toUpperCase();
    let IsError = false;
    if (this.FolderView[documentID] !== undefined) {
      this.FolderView[documentID].forEach(element => {
        if (element.type === documentType && element.name.toString().toUpperCase() === documentName) {
          IsError = true;
        }
      });
    }
    if (IsError) {
      if (documentType === '0') {
        this.msg.showMessage('Fail', 
          {header: 'Folder creation unsuccessful', body: 'A folder with the same name exists in the destination folder'});
      } else {
        this.msg.showMessage('Fail', 
          {header: 'File upload unsuccessful', body: 'A file with the same name exists in the destination folder'});
      }

    }
    return IsError;
  }

  /* Check file exist in destination folder.*/
  ifFileExistInFolder(nodeId, checkOptions: FolderOption) {
    if (this.FolderView[nodeId]) {
      this.FolderView[nodeId].forEach(element => {
        if (element.type === '1') {
          checkOptions.FileExists = true;
        }
      });
      if (!checkOptions.FileExists) {
        this.FolderView[nodeId].forEach(element => {
          if (element.type === '0') {
            this.ifFileExistInFolder(this.FolderView[nodeId].nodeId, checkOptions);
            if (checkOptions.FileExists) {
              return 0;
            }
          }
        });
      }
    }
  }
  /* Show or Hide paste button*/
  // IsCopyMove() {
  //   return !(this.obj && (this.obj.Action === 'COPY' || this.obj.Action === 'MOVE'));   
  // }
  /* Create Update Document JSON*/
  UpdateDocument(row, action, modifiedName?, documentType?) {
    if (row.hasOwnProperty('ID'))
      row = this.convertTileToGrid(row);
    let error = false;
    let title = '';
    let msg = '';
    let SelectedFolderID = '0';
    if (action !== 'PASTE') {
      this.obj = {
        Type: row.type,
        SourceDocumentPath: row.path,
        OldDocumentName: row.name,
        DestinationPath: row.path,
        DocumentType: documentType === undefined ? row.documentType:documentType ,
        NewDocumentName: modifiedName ? modifiedName : row.name,
        DocumentID: row.nodeId,
        DestinationFolderId: row.parentId,
        RootFolderName: 'Document',
        Action: action,
        ProcessName: '',
        TransactionID: '',
        TimeZone: '',
        isSourceSale: row.isShowDots === undefined? false: !row.isShowDots,
        SourceTransactnId: row.trnId,
        SourceParentId:this.activeTreeNode.parentId
      };
    }

    let SourceDocPath = this.obj.DestinationPath;

    if (this.obj.Type === '0') {
      SourceDocPath = SourceDocPath + this.obj.NewDocumentName;
    }

    if ((this.obj.Action === 'COPY' || this.obj.Action === 'MOVE') && action === 'PASTE') {
      if (action === 'PASTE') {
        if (this.FolderLayout == true) {
          if (this.FolderView[this.activeTreeNode.nodeId].filter(d => d.type === "0").length >= this.folderIndex) {
            let dirDeatls = this.FolderView[this.activeTreeNode.nodeId].filter(d => d.type === "0")[this.folderIndex];
            this.obj.DestinationPath = dirDeatls.path + '/';
            this.obj.DestinationFolderId = dirDeatls.nodeId;

          }
        }
        else {
          this.obj.DestinationPath = row.path + '/';
          this.obj.DestinationFolderId = this.currentNodeId;
          this.obj.isDestinationSale = row.isShowDots === undefined? false: !row.isShowDots;
          this.obj.DestinationNodeId = this.activeTreeNode.nodeId;
          this.obj.DestinationParentId = this.activeTreeNode.parentId;
        }
      }
      //this.obj.DestinationPath =  + '/';
      else {
        this.obj.DestinationPath = this.activeTreeNode.path + '/';
        this.obj.DestinationFolderId = this.activeTreeNode.nodeId;
      }        
     
      if (this.obj.SourceDocumentPath === this.obj.DestinationPath) {
        this.msg.showMessage('Warning', { body: 'Source path and destination path should not be same.' });
        return;
      }
     
     // this.FolderView[this.activeTreeNode.nodeId].forEach(element => {
     this.FolderView[this.obj.DestinationFolderId].forEach(element => {
        if (element.name === this.obj.OldDocumentName) {
          this.msg.showMessage('Warning', 
            {header: 'File upload unsuccessful', body: 'A file with the same name exists in the destination folder'});
          error = true;
          return;
        }
      });

      if (error) { return; }

      if (this.obj.Type === '1' && this.obj.Action === 'COPY') {
        title = 'File Copy';
        msg = 'File copied successfully.';
      } else if (this.obj.Type === '1' && this.obj.Action === 'MOVE') {
        title = 'File Move';
        msg = 'File moved successfully.';

      } else if (this.obj.Type === '0' && this.obj.Action === 'COPY') {
        title = 'Folder Copy';
        msg = 'Folder copied successfully.';

      } else if (this.obj.Type === '0' && this.obj.Action === 'MOVE') {
        title = 'Folder Move';
        msg = 'Folder moved successfully.';
      }
      this.obj.ProcessName = this.document.ProcessName;
      this.obj.TransactionID = this.document.TransactionID;
      this.obj.TimeZone = this.document.TimeZone;
      this.UpdateFolderDocument(this.obj, msg);
      this.IsCopyMove=false;
      this.IsCopied=false;
      this.gridConfig.config.header.action.DropDown.Action.pop(
        {
          Paste(row) {
          }
        }
      )
    } else if (this.obj.Action === 'DELETE') {
      if (this.obj.Type === '0') {
        title = 'Folder Delete';
        msg = 'Folder deleted successfully.';

      } else {
        title = 'File Delete';
        msg = 'File deleted successfully.';
      }
      this.obj.NewDocumentName = 'DELETE_' + this.obj.NewDocumentName;
      SelectedFolderID = this.obj.DestinationFolderId;
      this.obj.ProcessName = this.document.ProcessName;
      this.obj.TransactionID = this.document.TransactionID;
      this.obj.TimeZone = this.document.TimeZone;
      this.msg.showMessage('Warning', {
        header: 'Delete file/folder',
        body: 'Are you sure you want to delete this file/folder?',
        isDelete: true,
        checkboxText: 'Yes, delete this file/folder',
        btnText: 'Confirm Delete',
        callback: this.deleteConfirmation,
        caller: this,
      });
    } else if (this.obj.Action === 'RENAME') {
      if (this.obj.Type === '0') {
        title = 'Folder Rename';
        msg = 'Folder updated successfully.';
      } else {
        title = 'File Rename';
        msg = 'File updated successfully.';
      }
      SelectedFolderID = this.obj.DestinationFolderId;
      this.obj.ProcessName = this.document.ProcessName;
      this.obj.TransactionID = this.document.TransactionID;
      this.obj.TimeZone = this.document.TimeZone;
      this.UpdateFolderDocument(this.obj, msg);
    }
  }

  deleteConfirmation(modelRef: NgbModalRef, Caller: DocumentViewComponent) {
    let title = '';
    let msg = '';
    if (Caller.obj.Type === '0') {
      title = 'Folder Delete';
      msg = 'Folder deleted successfully.';

    } else {
      title = 'File Delete';
      msg = 'File deleted successfully.';
    }
    Caller.UpdateFolderDocument(Caller.obj, msg)
  }
  /* Update Document on server*/
  UpdateFolderDocument(obj, msg) {
    if(this.isSale) {
    if(this.isSale == true &&  Object.keys(this.dataList).length > 0) {
      let pNode: any;
      let dest = [];

      if(this.dataList[0] && Object.keys(this.dataList[0]).findIndex(x=> x == obj.DestinationNodeId) ===-1){
        obj.DestinationNodeId = ''
      }
      if (obj.isSourceSale && (obj.Action === 'COPY' || obj.Action === 'MOVE' || obj.Action === 'RENAME' || obj.Action === 'DELETE')) {
        let pId = this.activeTreeNode.parentId;
        if(pId == null || pId == undefined){
          pId = 0;
          obj.DestinationNodeId = this.transactionId;
        }
        const pNode = this.FolderView[pId].find(x=> x.nodeId === this.activeTreeNode.nodeId);
        if(pNode && pNode.trnId !== undefined && pNode.trnId !== null){
          obj.DestinationNodeId= pNode.trnId;
        } else {
          obj.DestinationNodeId = this.transactionId;
          obj.DestinationPath = this.activeTreeNode.path;
          obj.DestinationFolderId = this.activeTreeNode.nodeId;
        }
        if (obj.SourceTransactnId) {
          obj.TransactionID = obj.SourceTransactnId;
        }
        if (obj.DestinationParentId === 0 && pNode && pNode.trnId !== undefined && pNode.trnId !== null) {
          obj.DestinationFolderId = "0";
          obj.DestinationPath = '';
        } else {
          if(pNode && pNode.trnId !== undefined && pNode.trnId !== null){
          dest = obj.DestinationPath.split('/');
          if (dest.length > 1) {
            dest.splice(0,2);
            dest.splice(dest.length-2,2);
      
            obj.DestinationPath = dest.join('/').replace('/+g//','/');
          }
          }
          if(obj.Type == '1' && obj.DestinationPath.charAt(obj.DestinationPath.length-1) == '/') {
            obj.DestinationPath = obj.DestinationPath.slice(0,-1);
          }
        }
        if (obj.SourceParentId === 0 && obj.SourceTransactnId != undefined) {
          dest = obj.SourceDocumentPath.split('/');
          if (dest.length > 1) {
            delete dest[0];
            delete dest[1];
            obj.SourceDocumentPath = dest.join('/').replace('//','/');;
          }
          if(obj.SourceDocumentPath.charAt(obj.SourceDocumentPath.length-1) == '/' && pNode) {
            obj.SourceDocumentPath = obj.SourceDocumentPath.slice(0,-1);
          }
        }
      }
    
     
    } else {
      let pNode = this.dataList[this.activeTreeNode.nodeId].find(x => x.ID === obj.DocumentID);
      if (obj.isSourceSale && this.IsCopied && this.IsCopyMove === false) {
        pNode = this.dataList[0].find(x => x.ID === this.currentNodeId);
        obj.DestinationFolderId = "0";
        let dest = [];
        dest = obj.DestinationPath.split('/');
        if (dest.length > 1) {
          delete dest[0];
          delete dest[1];
          obj.DestinationPath = dest.join('/');
        }
        if (pNode!=null) {
          dest = obj.SourceDocumentPath.split('/');
          if (dest.length > 1) {
            delete dest[0];
            delete dest[1];
            obj.SourceDocumentPath = dest.join('/');
          }
        }
      }
      if (pNode && pNode.LotTRNSCTNID !== undefined && pNode.LotTRNSCTNID !== null) {
        obj.TransactionID = pNode.LotTRNSCTNID;
        obj.ProcessName = pNode.ProcessName;
      }
    }
  } else {
    obj.DestinationNodeId = '';
  }
  //CRMI-1210 - Code Change for Security Issues
    this.documentViewService.UpdateDocuments(obj).subscribe(data => {
      if(data.response === 'Fail'){
        this.toastr.warning(data.Message);
      }
      else{
      if (this.modalRef) {
        this.modalRef.close();
      }
      this.msg.showMessage('Success', {body: msg});
      this.obj = undefined;
      this.getTreeData();
      }
    }, err => {
      console.log(err);
    });
  }
  /* Open File and Folder Dailog*/
  OpenDialog(type) {
    if (type === 'folder') {
      const control = type === 'folder' ? '#folderPicker' : '#filePicker';
      const inputs = this.elRef.nativeElement.querySelector(control);
      inputs.click();
    }
    else if (type === 'file' && this.isCrop == true) {
      const control = '#imagePicker';
      const inputs = this.elRef.nativeElement.querySelector(control);
      inputs.click();
    }
    else {
      const control = '#filePicker';
      const inputs = this.elRef.nativeElement.querySelector(control);
      inputs.click();
    }
  }

  /* Create Folder Hirarchy to upload on serer.*/
  createFolderHierarchy(lstFolderHierarchy, FolderHierarchyJson, HierarchyDetail: any) {
    for (const key in FolderHierarchyJson) {
      if (FolderHierarchyJson.hasOwnProperty(key)) {
        if (key !== 'Files' && key !== 'DirPath' && key !== 'FolderID' && key !== 'ParentFolderID') {
          this.HierarchyID = this.HierarchyID - 1;
          HierarchyDetail.HierarchyID = (this.HierarchyID).toString();
          lstFolderHierarchy.push({
            ID: HierarchyDetail.HierarchyID.toString(),
            ParentID: HierarchyDetail.ParentFolderID,
            Name: key,
            Path: FolderHierarchyJson[key].DirPath
          });
          FolderHierarchyJson.FolderID = HierarchyDetail.HierarchyID.toString();
          FolderHierarchyJson.ParentFolderID = HierarchyDetail.ParentFolderID;
          const ChilHierarchyDetail: any = { HierarchyID: '', ParentFolderID: '' };
          ChilHierarchyDetail.HierarchyID = HierarchyDetail.HierarchyID.toString();
          ChilHierarchyDetail.ParentFolderID = FolderHierarchyJson.FolderID;
          this.createFolderHierarchy(lstFolderHierarchy, FolderHierarchyJson[key], ChilHierarchyDetail);
        }
      }
    }
  }
  /* Create Folder on Server*/
  createFolder(folderJson, lstFiles, fileObj: any, destinationPath,isFileOnly = true) {
    let nodeid = this.activeTreeNode.nodeId;
    let trnId = this.document.TransactionID;
    let processname = this.document.ProcessName;
    if (this.isSale == true &&  Object.keys(this.dataList).length > 0) {
      const pNode = this.dataList[0].find(x => x.ID === this.activeTreeNode.parentId || x.ID === this.activeTreeNode.nodeId);
      if (pNode && pNode.LotTRNSCTNID !== undefined && pNode.LotTRNSCTNID !== null) {
        if(this.activeTreeNode.level === 1) {
          folderJson[0].ParentID = pNode.ParentID ? pNode.ParentID : '0';
          nodeid = '0';
        }
        trnId = pNode.LotTRNSCTNID;
        processname = pNode.ProcessName
      }
    }
    const json = {
      DestinationFolderId: nodeid,
      FolderJson: JSON.stringify(folderJson),
      ProcessName: processname,
      TransactionID: trnId,
      TimeZone: this.document.TimeZone,
      IsActive: 1,
      IsFeatured: 0,
    };
    this.documentViewService.CreateDocumentTree(json).subscribe(data => {
      this.PrepareUploadFile(lstFiles, destinationPath, data, 'Folder(s) uploaded successfully.',isFileOnly);
      if (this.modalRef) {
        this.modalRef.close();
      }
      if (!lstFiles || lstFiles.length === 0) {
        this.getTreeData();
        this.msg.showMessage('Success', {body: 'Folder created successfully'});
      }
    }, err => {
      console.log(err);
    });
  }
  /* Create JSON for File upload*/
  PrepareUploadFile(lstFiles, destinationPath, parentNode, msg, isFileUpload = true) {
    let trnsId = this.document.TransactionID;
    let processName = this.document.ProcessName;
    if (this.isSale == true && Object.keys(this.dataList).length > 0) {
      const pNode = this.dataList[0].find(x => x.ID === this.activeTreeNode.parentId || x.ID === this.activeTreeNode.nodeId);
      if (pNode && pNode.LotTRNSCTNID !== undefined && pNode.LotTRNSCTNID !== null) {
        trnsId = pNode.LotTRNSCTNID;
        processName = pNode.ProcessName;
        if(this.activeTreeNode.level === 1) {
          if(isFileUpload) {
            parentNode = pNode.ParentID ? pNode.ParentID : '0';
          }
          // if(typeof parentNode === 'object' && Object.keys(parentNode).length <= 0)
          
        }
        const rawPath = destinationPath.split('/');
        if(rawPath.length > 1) {
        delete rawPath[0];
        delete rawPath[1];
        }
        destinationPath = rawPath.join('/');
      }
      
    }
    this.currentDir = parentNode;
    let counter = 0;
    for (const key in lstFiles) {
      if (lstFiles.hasOwnProperty(key)) {
        const element = lstFiles[key];
        const lastFolder = element.webkitRelativePath.split('/');
        lastFolder.pop();
        const MapFolder = lastFolder.join('/');
        const formData = new FormData();
        if (this.document.TransactionID !== '') {
          formData.append('transactionID', trnsId);
        }
        formData.append('processName', processName);
        formData.append('parentFolderPath', (destinationPath + '/' + MapFolder).trim());
        formData.append('parentFolderId', MapFolder !== '' ? parentNode[MapFolder] : parentNode);
        formData.append('timeZone', this.document.TimeZone);
        formData.append('uploadFile', element);
        formData.append('isActive', '1');
        formData.append('isFeatured', '0');
        
        if (processName === 'LMKOpportunities' && !this.IsAllowDirectSave)
          this.documentViewService.pushToPendingFileList(formData, element);
        else  {
          if ((lstFiles.length - 1) === counter) {
            this.UploadFile(formData, () => {
              this.getTreeData();
            }, msg,counter, lstFiles.length -1);
          } else {
            this.UploadFile(formData, undefined, msg,counter, lstFiles.length -1);
          }
        }
        counter += 1;
      }
    }
  }
  /* Upload file on Server*/
  UploadFile(formData, callback, msg, counter = 0 , filelen = 0) {
    this.documentViewService.UploadFile('documentView/uploadfile', formData).subscribe(data => {
      if (!callback) {
      this.getTreeData();
      }
      if (counter == filelen) {
        this.msg.showMessage('Success', { body: msg });
      }
      if (callback) {
        callback();
      }
    });
  }
  /* Extract file and folder from upload control.*/
  UploadFolderFiles(ctrl) {      
    const lstFiles = ctrl.target.files;  
    const FolderHierarchy: any = {};
    let SetFolderHierarchy;
    let dirPath = '';
    const startFolderName = '';
    let IsCheckFolder = false;
    let outFolderJson: any = {};
    const UploadFolderID = this.activeTreeNode.nodeId;
    for (const key in lstFiles) {
      if (lstFiles.hasOwnProperty(key)) {
        const element = lstFiles[key];
        const lstFolder = element.webkitRelativePath.split('/');
        SetFolderHierarchy = FolderHierarchy;
        dirPath = '';
        for (let seekIndex = 0; seekIndex < lstFolder.length; seekIndex++) {
          if (seekIndex === lstFolder.length - 1) {
            if (SetFolderHierarchy.Files === undefined) {
              SetFolderHierarchy.Files = new Array();
            }
            SetFolderHierarchy.Files.push(element.webkitRelativePath);
          } else {
            dirPath = (dirPath === '') ? lstFolder[seekIndex] : dirPath + '/' + lstFolder[seekIndex];
            if (SetFolderHierarchy[lstFolder[seekIndex]] === undefined) {
              SetFolderHierarchy[lstFolder[seekIndex]] = new Object();
              SetFolderHierarchy[lstFolder[seekIndex]].DirPath = dirPath;
            }
            SetFolderHierarchy = SetFolderHierarchy[lstFolder[seekIndex]];
          }
        }
      }
    }
    let isFileOnly = true;
    const lstFolderHierarchy = new Array();
    const HierarchyDetail: any = new Object();
    HierarchyDetail.HierarchyID = 0;
    HierarchyDetail.ParentFolderID = UploadFolderID;
    if (FolderHierarchy) {
      let isFolderExist = false;
      for (const key in FolderHierarchy) {
        if (FolderHierarchy.hasOwnProperty(key)) {
          const folder = FolderHierarchy[key];
          if (folder.Files) {
            isFileOnly = folder.Files.length === 0;
          }
          if (this.activeTreeNode.children) {
            this.activeTreeNode.children.forEach(element => {
              if (folder.DirPath === element.name) {
                isFolderExist = true;
              }
            });
          }
        }
      }
      if (isFolderExist) {
        this.msg.showMessage('Fail', 
          {header: 'Folder creation unsuccessful', body: 'A folder with the same name exists in the destination folder'})
        return;
      }
      this.HierarchyID = HierarchyDetail.HierarchyID;
      this.createFolderHierarchy(lstFolderHierarchy, FolderHierarchy, HierarchyDetail);
      if (lstFolderHierarchy.length > 0) {
        IsCheckFolder = true;
        if (this.IsDocumentExistInDest(lstFolderHierarchy[0].Name, UploadFolderID, '0')) {
          return;
        }
        outFolderJson = this.createFolder(lstFolderHierarchy, lstFiles, ctrl, this.activeTreeNode.path, isFileOnly);
        if (outFolderJson) {
          return;
        }
      } else {
        let IsFileExists = false;
        for (let FileIndex = 0; FileIndex < lstFiles.length; FileIndex++) {
          if (!IsFileExists) {
            IsFileExists = this.IsDocumentExistInDest(lstFiles[FileIndex].name, UploadFolderID, '1');
            if (IsFileExists) {
              FileIndex = lstFiles.length;
            }
          }
        }
        const data = {};
        data[this.activeTreeNode.name] = this.activeTreeNode.nodeId;
        if (!IsFileExists) {
          this.PrepareUploadFile(lstFiles, this.activeTreeNode.path, this.activeTreeNode.nodeId, 'File(s) uploaded successfully.',isFileOnly);
        }
      }
    }
  }
  /* Open Create Folder PopUp.*/
  openCreateFolderPopup() {
    this.modalRef = this.modalService.open(CreateFolderComponent, { backdrop: 'static' });
    const modalInstance: CreateFolderComponent = this.modalRef.componentInstance;
    modalInstance.caller = this;

  }
  /* Open Rename File PopUp.*/
  openRenamePopup(item?: any) {
    if (item)
      this.activeRow = this.convertTileToGrid(item);
    this.modalRef = this.modalService.open(RenameFileFolderComponent, { backdrop: 'static' });
    const modalInstance: RenameFileFolderComponent = this.modalRef.componentInstance;
    modalInstance.caller = this;
    modalInstance.row = this.activeRow;
  }
  /* Call Create Folder on dialog submit.*/
  CreateDocFolder(FolderName: string) {
    let error = false;
    const lstFolderHierarchy = [];
    lstFolderHierarchy.push({
      ID: -1,
      ParentID: this.activeTreeNode.nodeId,
      Name: FolderName,
      Path: this.activeTreeNode.path
    });
    this.FolderView[this.activeTreeNode.nodeId].forEach(element => {
      if (element.name === FolderName) {
        error = true;
        return;
      }
    });

    if (error) {
      this.msg.showMessage('Fail', 
        {header: 'Folder creation unsuccessful', body: 'A folder with the same name exists in the destination folder'});
      return;
    }

    this.createFolder(lstFolderHierarchy, undefined, undefined, this.activeTreeNode.path);
  }
  /* Call Rename on dialog submit.*/
  RenameDocFolder(newName: string, documentType: string) {
    const lstFolderHierarchy = [];
    let error = false;
    if (this.modalRef) {
      //this.modalRef.close(); //Code Use After Response is Comming - #CRMI-1210
    }
    this.FolderView[this.activeTreeNode.nodeId].forEach(element => {
      if (element.name === newName && element.DocumentType === documentType) {
        error = true;
        return;
      }
    });

    if (error) {
      this.msg.showMessage('Fail', 
        {header: 'File upload unsuccessful', body: 'A file with the same name exists in the destination folder'});
      return;
    }
    this.UpdateDocument(this.activeRow, 'RENAME', newName, documentType);
  }
  /* Call Paste on action item click.*/
  Paste() {
    this.UpdateDocument(undefined, 'PASTE', undefined, undefined);
  }

  breadcrumClick(nodeId) {
    let node = this.treeControl.getTreeNodebyNodeId(nodeId);
    if (node != null) {
      this.selectContent(node);
      this.treeControl.collapseDescendants(node);
      this.treeControl.expand(node);
      if (this.documentViewService.isAttachmentGridView == true) {
        this.tileView = this.dataList1[nodeId];
        this.contextMenuItems = [];
        (this.tileView || []).forEach(item => this.contextMenuItems.push(false));
      }
    }
  }

  openTileView() {
    this.documentViewService.isAttachmentGridView = true;
    this.layout = 'grid';
    this.tileView = this.dataList[this.currentNodeId];
    this.IsCopied = false;
    this.IsCopyMove = false;
    this.FolderLayout = true;
  }
  openListView() {
    this.documentViewService.isAttachmentGridView = false;
    this.layout = 'list';
    this.IsCopied = false;
    this.IsCopyMove = false;
    this.FolderLayout = false;
    // this.getTreeData() /* No need for extra request */
  }
  getChildList(gridID: any) {
    this.currentDir = gridID;
    this.tileView = this.dataList[gridID] || [];
    if (this.processName === 'LMKOpportunities')
      this.tileView.sort((a: any, b: any) => Date.parse(a.CreatedOn) - Date.parse(b.CreatedOn))
    this.breadcrumClick(gridID)
  }

  setIsActive(item: any, event: any) {
    var Status = event.target.checked == true ? 1 : 0;
    this.documentViewService.setActive(this.transactionId, item.ID, Status).subscribe(result => {
      if (result) {
        item.IsActive = item.IsActive === 1 ? 0 : 1;
        // this.getTreeData();
      }
    });
  }

  setIsFeatured(item: any) {
    this.documentViewService.setFeatured(this.transactionId, item.ID).subscribe(result => {
      if (result) {
        const ar = Object.keys(this.dataList);
        ar.forEach(x => {
          this.dataList[x].map(x => x.IsFeatured = 0);
        })
        item.IsFeatured = 1
        // this.getTreeData();
      }
    });
  }

  fileChangeEvent(event: any, id, width, height): void {    
    this.width = width;
    this.height = height;
    const file = event.target.files.item(0);
    if (!file) return;
    const filetype = file.type.split('/')[0];
    let exttyp = (file.name.split('.').pop()).toLowerCase();
    // #CRMI-1323 - EXT 578 - Attachments required to accept PNG file format - Roshan
    let MatchExt = ['docx', 'doc', 'csv', 'mp3', 'wmv', 'jpg', 'jpeg', 'pdf', 'xls', 'xlsx', 'sql', 'html', 'zip', 'bin', 'mov', 'mp4', 'png'].includes(exttyp);
    if (MatchExt === false) {
      this.msg.showMessage('Warning', { body: 'The uploaded file format is not supported, supported formats are - .docx, .doc, .csv, .mp3, .wmv, .jpg, .jpeg, .png, .pdf, .xls, .xlsx, .sql, .html, .zip, .bin, .mov, .mp4' });
      return;
    }
    if (filetype === 'image' && this.isCrop === true && this.processName !== 'LMKOpportunities') {
      this.errorMsg = '';
      this.imageChangedEvent = event;
      this.modalService.open(id, { ariaLabelledBy: 'modal-basic-title' });
    } else {
      this.UploadFolderFiles(event);
    }
    // }else {
    //   this.msg.showMessage('Warning', {body: 'Not a valid file'});
    // }
  }
  
  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event;
    this.Croppedwidth = event.width;
    this.Croppedheight = event.height;
  }

  Cropped() {
    if (this.height >= this.Croppedheight && this.width >= this.Croppedwidth) { 
      this.compressor
        .compress(this.croppedImage,  this.imageChangedEvent.target.files.item(0).name)
        .pipe(tap(file => {
          const fileChunks = this.mda.getChunk(file, file.type);
          const fileUpload: File = new File(fileChunks, file.name);
                    
          this.UploadCropImageFiles(fileUpload, file.name, file.type)
        }))
        .toPromise();
    } else 
      this.msg.showMessage('Warning', {body: 'Image size is not correct'});
  }


  setFeatured(item) {
    this.mda.setFeatured(this.transactionId, item.MediaID).subscribe(result => {
      if (result) {
        this.listData.map(x => x.Featured = 'unfeatured');
        item.Featured = 'Featured';
      }
    });
  }

  UploadFiles(){
    const control = this.imageChangedEvent;
    this.UploadFolderFiles(control);
    // this.modalService.dismissAll();
    this.transform.scale = 1; /* Reset scale  of image cropper*/
  }

  UploadCropImageFiles(FileList, fileName, type) {    
    const lstFiles = FileList;
    const FolderHierarchy: any = {};
    let SetFolderHierarchy;
    let dirPath = '';
    const startFolderName = '';
    let IsCheckFolder = false;
    let outFolderJson: any = {};
    const UploadFolderID = this.activeTreeNode.nodeId;

    const lstFolderHierarchy = new Array();
    const HierarchyDetail: any = new Object();
    HierarchyDetail.HierarchyID = 0;
    HierarchyDetail.ParentFolderID = UploadFolderID;
    if (FolderHierarchy) {
      let isFolderExist = false;
      for (const key in FolderHierarchy) {
        if (FolderHierarchy.hasOwnProperty(key)) {
          const folder = FolderHierarchy[key];
          if (this.activeTreeNode.children) {
            this.activeTreeNode.children.forEach(element => {
              if (folder.DirPath === element.name) {
                isFolderExist = true;
              }
            });
          }
        }
      }
      let IsFileExists = false;
      if (!IsFileExists) {
        IsFileExists = this.IsDocumentExistInDest(fileName, UploadFolderID, '1');
      }
      const data = {};
      data[this.activeTreeNode.name] = this.activeTreeNode.nodeId;
      if (!IsFileExists) {
        this.PrepareUploadcropedFile(fileName, type, 0, lstFiles, this.activeTreeNode.path, this.activeTreeNode.nodeId, 'File(s) uploaded successfully.');
      }
    }
  }

  PrepareUploadcropedFile(fileName, type, currentPart, lstFiles, destinationPath, parentNode, msg) {  
    this.currentDir = parentNode;
    const lastFolder = [''];
    lastFolder.pop();
    const MapFolder = lastFolder.join('/');
    const formData = new FormData();
    if (this.document.TransactionID !== '') {
      formData.append('transactionID', this.document.TransactionID);
    }
    formData.append('processName', this.document.ProcessName);
    formData.append('parentFolderPath', (destinationPath + '/' + MapFolder).trim());
    formData.append('parentFolderId', MapFolder !== '' ? parentNode[MapFolder] : parentNode);
    formData.append('timeZone', this.document.TimeZone);
    formData.append('uploadFile', lstFiles);
    if(this.activeTreeNode.name === 'All Lots'){
      if(this.dataList[this.activeTreeNode.nodeId] !== undefined){
        const arr = this.dataList[this.activeTreeNode.nodeId].filter(element=>element.Type === "1");
        if(arr.length === 0){
          formData.append('isActive', '1');
          formData.append('isFeatured', '1');
        }else{
          formData.append('isActive', '1');
          formData.append('isFeatured', '0');
        }
      }else{
        if(this.dataList[this.activeTreeNode.nodeId] === undefined){
          formData.append('isActive', '1');
          formData.append('isFeatured', '1');
         }
      }         
    }
    else{
      formData.append('isActive', '1');
      formData.append('isFeatured', '0');
    }
    if (this.processName === 'LMKOpportunities' && !this.IsAllowDirectSave)
      this.documentViewService.pushToPendingFileList(formData, lstFiles);
    else
      this.UploadFile(formData, undefined, msg);
  }

  // onZoomChange(event: Event) {
  //   const scale = 1 + (event.target['valueAsNumber'] - 50) / 50;
  //   this.transform = {...this.transform, scale};
  // }
  
  onZoomIn() {
    const scale = this.transform.scale + 0.1;
    this.transform = {...this.transform, scale};
  }

  onZoomOut() {
    const scale = this.transform.scale - 0.1;
    this.transform = {...this.transform, scale};
  }

  public toggleContextMenu(index: number) {
    for (let i = 0; i < this.contextMenuItems.length; i++) {
      if (i === index)
        this.contextMenuItems[i] = !this.contextMenuItems[i];
      else
        this.contextMenuItems[i] = false;
    }
    this.folderIndex = index;    
  }
}
