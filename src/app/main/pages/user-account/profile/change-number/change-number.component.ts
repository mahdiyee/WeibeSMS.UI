import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {SharedService} from '../../../../../shared/service/shared.service';
import {DataCountryInterface} from '../../../../../shared/models/data-country.interface';
import {SendVerificationCodeInterface} from '../../../../../auth/login/models/send-verification-code.interface';
import {UserAccountService} from '../../user-account.service';
import {ChangeNumberInterface} from './models/change-number.interface';
import {DashboardInfoInterface} from '../../../../../auth/login/models/dashboard-info.interface';
import {UtilityService} from '../../../../../shared/utility.service';

@Component({
  selector: 'app-change-number',
  templateUrl: './change-number.component.html',
  styleUrls: ['./change-number.component.scss']
})
export class ChangeNumberComponent implements OnInit {
  @ViewChild('mobileInput') mobileInput: ElementRef;

  changeNumberForm: FormGroup;
  countries: DataCountryInterface[];
  countryPrefix;
  countryFlag;
  mobileValue;
  currentUserInfo: DashboardInfoInterface;
  isTried = false;
  oldMobileEntered = true;
  isCorrectMobile = true;

  constructor(private fb: FormBuilder,
              private shs: SharedService,
              private router: Router,
              private uas: UserAccountService,
              private utilityService: UtilityService) {

  }

  ngOnInit() {
    this.countries = this.countries = this.shs.getCountriesByCache();
    this.currentUserInfo = this.shs.getCurrentUserInfo();
    this.createForm();
    this.getCountry();
  }

  getCountry() {

    this.selectCountry(1, this.countries[this.currentUserInfo.prefixNumberId - 1]);
    this.changeNumberForm.patchValue({mobile: `+${this.currentUserInfo.mobile}`});
  }

  selectCountry(index, country) {
    this.countryPrefix = country.prefixNumber;
    this.countryFlag = country.flag;
    if (index === 2) {
      this.mobileInput.nativeElement.focus();

      this.setMobileValue();

      this.changeNumberForm.patchValue({
        mobile: country.prefixNumber + this.mobileValue
      });
    } else {
      this.changeNumberForm.patchValue({
        mobile: country.prefixNumber
      });
    }
    this.changeNumberForm.patchValue({
      prefixNumberId: country.id,
    });
  }

  createForm() {
    this.changeNumberForm = this.fb.group({
      mobile: [null, Validators.required],
      reason: [3],
      prefixNumberId: [1, Validators.required]
    });
  }

  changeMobile(mobile: string) {
    this.setMobileValue();
    this.isCorrectMobile = this.utilityService.isMobile(this.mobileValue);
    this.oldMobileEntered = this.changeNumberForm.value.mobile.substring(1) == this.currentUserInfo.mobile;
    this.countries.forEach(item => {
      mobile === item.prefixNumber ? this.selectCountry(2, item) : null;
    });
  }

  submit() {
    if (this.changeNumberForm.valid) {
      this.countries.forEach(item => {
        if (this.changeNumberForm.value.prefixNumberId === item.id) {
          if (!this.isTried) {
            this.mobileValue = this.changeNumberForm.value.mobile.substring(item.prefixNumber.length);
          }
        }
      });
      const payload: SendVerificationCodeInterface = this.changeNumberForm.value;
      payload.mobile = this.mobileValue;
      this.shs.data = payload;
      this.uas.sendVerificationCode(payload)
        .subscribe((res: ChangeNumberInterface) => {
            this.router.navigate(['/profile/verify-number']);
            this.shs.data.key = res.data.key;
            localStorage.setItem('k-u', res.data.key);
          },
          err => {
            this.isTried = true;
            if (err.error.Message === '4') {
              this.router.navigate(['/profile/verify-number']);
            }
          });
    }
  }

  setMobileValue() {
    this.countries.forEach(item => {
      if (this.changeNumberForm.value.prefixNumberId === item.id) {
        this.mobileValue = this.changeNumberForm.value.mobile.substring(item.prefixNumber.length);
      }
    });
  }
}
