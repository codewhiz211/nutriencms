import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '@app/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-activate-account',
  templateUrl: './activate-account.component.html',
  styleUrls: ['./activate-account.component.scss']
})
export class ActivateAccountComponent implements OnInit {

  constructor(private router_activate: ActivatedRoute,private registeruser:AuthenticationService, private toastr: ToastrService,private router: Router) { }

  ngOnInit() {
    if(this.router_activate.snapshot.queryParamMap.get('email')&&this.router_activate.snapshot.queryParamMap.get('unlockcode')){
     const email=this.router_activate.snapshot.queryParamMap.get('email');
     const code=this.router_activate.snapshot.queryParamMap.get('unlockcode');   
     const URL='/User/UnlockAccount?username='+email+'&unlockcode='+code;
     this.registeruser.activateUser(URL).subscribe(data => {
       this.toastr.success(data);
       this.gotologin();
     },
      error => {}
      );
    }
    else{
      this.gotologin();
    }
  }
  gotologin(){
    this.router.navigateByUrl('/auth/login');
  }
}
