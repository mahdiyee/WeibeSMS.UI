import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ForgotPasswordService} from './forgot-password.service';
import {Router} from '@angular/router';
import {AuthenticationService} from '../login/authentication.service';
import {ConfigService} from '../../shared/config.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {SendVerificationCodeInterface} from '../login/models/send-verification-code.interface';
import {VerifyMobileInterface} from '../login/models/verify-mobile.interface';
import {ChangePasswordInterface} from './models/change-password.interface';
import {CountryInterface} from '../../shared/models/country.interface';
import {SharedService} from '../../shared/service/shared.service';
import {DataCountryInterface} from '../../shared/models/data-country.interface';
import {AuthSharedService} from '../auth-shared.service';
import {CacheObject} from '../../shared/models/cache-object';
import {NotificationService} from '../../shared/notification.service';
import {UtilityService} from '../../shared/utility.service';


@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})

export class ForgotPasswordComponent implements OnInit {

  step: number = 1;
  isCorrectMobile = false;
  verificationCodePart1: string = '';
  verificationCodePart2: string = '';
  verificationCodePart3: string = '';
  verificationCodePart4: string = '';
  verificationCodePart5: string = '';
  key: string;
  verifyKey: string;
  password: string;
  confirmPassword: string;

  forgotPasswordForm: FormGroup;
  resetPassForm: FormGroup;
  notMatch: boolean = false;
  enterPressConfirm: boolean = false;
  verificationCode: string;
  countries: DataCountryInterface[];
  showSpinner: boolean = false;
  isTried: boolean;
  countryPrefix;
  countryFlag;

  mobileValue;
  @ViewChild('verificationCodePart1Element') verificationCodePart1Element: ElementRef;
  @ViewChild('verificationCodePart2Element') verificationCodePart2Element: ElementRef;
  @ViewChild('verificationCodePart3Element') verificationCodePart3Element: ElementRef;
  @ViewChild('verificationCodePart4Element') verificationCodePart4Element: ElementRef;
  @ViewChild('verificationCodePart5Element') verificationCodePart5Element: ElementRef;
  @ViewChild('mobileInput') mobileInput: ElementRef;

  constructor(private forgotPasswordService: ForgotPasswordService,
              private router: Router,
              private fb: FormBuilder,
              private shs: SharedService,
              private authSharedService: AuthSharedService,
              private authService: AuthenticationService,
              private configService: ConfigService,
              private notificationService: NotificationService,
              private utilityService: UtilityService) {
  }

  ngOnInit() {
    this.createForm();
    this.getCountries();
  }

  createForm() {
    this.forgotPasswordForm = this.fb.group({
      Mobile: [null, Validators.compose([Validators.required])],
      Reason: [2],
      prefixNumberId: [1, Validators.required]
    });
    this.resetPassForm = this.fb.group({
      password: [null, Validators.compose([Validators.required,
        Validators.pattern(/^(?=^.{8,}$)(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s)[0-9a-zA-Z!@#$%^&*()]*$/)])],
      confirmPassword: [null]
    });
  }

  changeMobile(mobile: string) {
    debugger;
    this.setMobileValue();
    this.isCorrectMobile = this.utilityService.isMobile(this.mobileValue);
    this.countries.forEach(item => mobile === item.prefixNumber ? this.selectCountry(2, item) : null);
  }

  selectCountry(index, country) {
    this.countryPrefix = country.prefixNumber;
    this.countryFlag = country.flag;
    if (index === 2) {
      this.mobileInput.nativeElement.focus();
      this.countries.forEach(item => {
        if (this.forgotPasswordForm.value.prefixNumberId === item.id) {
          this.mobileValue = this.forgotPasswordForm.value.Mobile.substring(item.prefixNumber.length);
        }
      });
      this.forgotPasswordForm.patchValue({
        Mobile: country.prefixNumber + this.mobileValue
      });
    } else {
      this.forgotPasswordForm.patchValue({
        Mobile: country.prefixNumber
      });
    }
    this.forgotPasswordForm.patchValue({
      prefixNumberId: country.id,
    });
  }

  getCountries() {
    this.shs.getCountries().subscribe((res) => {
      this.countries = res.data;
      this.selectCountry(1, this.countries[0]);
    });
  }

  sendVerificationCode() {
    if (this.forgotPasswordForm.valid) {
      this.setMobileValue();
      this.authSharedService.mobile = this.mobileValue;
      this.authSharedService.prefixNumberId = +this.forgotPasswordForm.value.countryId;
      const payload: SendVerificationCodeInterface = this.forgotPasswordForm.value;
      payload['Mobile'] = this.mobileValue;

      this.showSpinner = true;
      this.forgotPasswordService.sendVerificationCode(payload)
        .subscribe(res => {
            debugger;
            if (res.data.codeIsExists) {
              this.notificationService.info('Use the last verification code', '');
            }

            this.showSpinner = false;
            this.step = 2;
            setTimeout(() => {
              this.verificationCodePart1Element.nativeElement.focus();
            }, 500);
            this.key = res.data.key;
            localStorage.setItem('k-f', res.data.key);

          },
          err => {
            this.isTried = true;
            this.showSpinner = false;
            if (err.error.Message === '4') {
              console.log(err);
              this.step = 2;
              setTimeout(() => {
                this.verificationCodePart1Element.nativeElement.focus();
              }, 500);
            }
          });
    } else {
      this.enterPressConfirm = true;
    }
  }

  keySendVerificationCode(event) {

    if (event.key === 'Enter') {
      console.log(event);
      this.sendVerificationCode();
    }
  }

  changeFocus(elementNumber: number, event) {
    if (event.key === 'Backspace') {
      switch (elementNumber) {

        case 2:
          if (this.verificationCodePart2 === '') {
            this.verificationCodePart1Element.nativeElement.focus();
          }
          this.verificationCodePart2 = '';
          break;

        case 3:
          if (this.verificationCodePart3 === '') {
            this.verificationCodePart2Element.nativeElement.focus();
          }
          this.verificationCodePart3 = '';
          break;

        case 4:
          if (this.verificationCodePart4 === '') {
            this.verificationCodePart3Element.nativeElement.focus();
          }
          this.verificationCodePart4 = '';
          break;

        case 5:
          if (this.verificationCodePart5 === '') {
            this.verificationCodePart4Element.nativeElement.focus();
          }
          this.verificationCodePart5 = '';
          break;

        case 1:
          break;
      }
    }
  }

  getCountDown(event) {
    if (event) {
      this.sendVerificationCode();
      this.verificationCodePart1 = '';
      this.verificationCodePart2 = '';
      this.verificationCodePart3 = '';
      this.verificationCodePart4 = '';
      this.verificationCodePart5 = '';
    }
  }

  verify() {
    this.verificationCode = this.verificationCodePart1.concat(this.verificationCodePart2, this.verificationCodePart3,
      this.verificationCodePart4, this.verificationCodePart5);
    const payload: VerifyMobileInterface = {
      Key: this.key ? this.key : localStorage.getItem('k-f'),
      Mobile: +this.authSharedService.mobile,
      prefixNumberId: +this.forgotPasswordForm.value.prefixNumberId,
      VerificationCode: +this.verificationCode,
      reason: 2
    };
    this.showSpinner = true;
    this.forgotPasswordService.verify(payload)
      .subscribe(res => {
        this.showSpinner = false;
        console.log(res);
        this.step = 3;
        localStorage.setItem('k-v-f', res.data);
        this.verifyKey = res.data;
      }, err => {
        this.verificationCodePart1 = '';
        this.verificationCodePart2 = '';
        this.verificationCodePart3 = '';
        this.verificationCodePart4 = '';
        this.verificationCodePart5 = '';
        this.verificationCodePart1Element.nativeElement.focus();
        this.showSpinner = false;
      });
  }

  changePassword() {
    if (!this.resetPassForm.value.confirmPassword) {
      this.confirmPasswordOut();
    }
    if (this.resetPassForm.valid && !this.notMatch && this.resetPassForm.value.confirmPassword) {
      this.confirmPasswordOut();
      this.showSpinner = true;
      const payload: ChangePasswordInterface = this.resetPassForm.value;
      delete payload['confirmPassword'];
      payload['key'] = this.verifyKey ? this.verifyKey : localStorage.getItem('k-v-f');
      payload['mobile'] = +this.authSharedService.mobile;
      payload['prefixNumberId'] = this.forgotPasswordForm.value.prefixNumberId,
        payload['verificationCode'] = +this.verificationCode,
        this.forgotPasswordService.changePassword(payload)
          .subscribe(res => {
            this.showSpinner = false;
            this.notificationService.success('Password changed successfully', '');
            this.configService.authenticationChanged.emit(true);
            localStorage.removeItem('k-f');
            localStorage.removeItem('k-v-f');
            this.router.navigate(['/']);
            this.authService.setToken(res.data.token);
            this.configService.authenticationChanged.emit(true);
          }, err => {
            this.showSpinner = false;
          });
    }
  }

  confirmPasswordOut() {
    if (this.resetPassForm.value.password !== this.resetPassForm.value.confirmPassword) {
      this.notMatch = true;
      return;
    } else {
      this.notMatch = false;
    }
  }

  setFocus(elementNumber: number, value) {
    if (!value || value.length === 0) {
      return;
    }

    switch (elementNumber) {

      case 1:
        this.verificationCodePart2Element.nativeElement.focus();
        console.log(this.verificationCodePart1);
        break;

      case 2:
        this.verificationCodePart3Element.nativeElement.focus();
        console.log(this.verificationCodePart2);
        break;

      case 3:
        this.verificationCodePart4Element.nativeElement.focus();
        console.log(this.verificationCodePart3);
        break;

      case 4:
        this.verificationCodePart5Element.nativeElement.focus();
        console.log(this.verificationCodePart4);
        break;

      case 5:
        console.log(this.verificationCodePart5);
    }
    if (this.verificationCodePart1 && this.verificationCodePart2 && this.verificationCodePart3 &&
      this.verificationCodePart4 && this.verificationCodePart5) {
      this.verify();
    }
  }

  setMobileValue() {
    this.countries.forEach(item => {
      if (this.forgotPasswordForm.value.prefixNumberId === item.id) {
        this.mobileValue = this.isTried ? this.forgotPasswordForm.value.Mobile :
          this.forgotPasswordForm.value.Mobile.substring(item.prefixNumber.length);
      }
    });
  }
}

