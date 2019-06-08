import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {UserAccountService} from '../../user-account.service';
import {SharedService} from '../../../../../shared/service/shared.service';
import {ChangeEmailInterface} from './models/change-email.interface';

@Component({
  selector: 'app-change-email',
  templateUrl: './change-email.component.html',
  styleUrls: ['./change-email.component.scss']
})
export class ChangeEmailComponent implements OnInit {
  changeEmailForm: FormGroup;
  emailUnique: boolean = false;
  disableButton: boolean = false;

  constructor(private fb: FormBuilder,
              private shs: SharedService,
              private uas: UserAccountService) {
  }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.changeEmailForm = this.fb.group({
      email: [null, Validators.compose([Validators.required, Validators.email])]
    });
  }

  submit() {
    if (this.changeEmailForm.valid && !this.emailUnique) {
      const payload: ChangeEmailInterface = this.changeEmailForm.value;
      this.uas.verifyEmail(payload)
        .subscribe(res => {
          this.disableButton = true;
        });
    }
  }

  checkUnique(key: number, value: string) {
    if (value.length > 0) {
      const payload = {key, value};
      this.shs.checkUnique(payload)
        .subscribe((res: any) => {
          if (!res.data) {
            this.emailUnique = false;
          } else {
            this.emailUnique = true;
          }
        });
    }
  }

}