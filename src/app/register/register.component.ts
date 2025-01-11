import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { SendOtpModel } from '../models/send-otp.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  sendOtpModel: SendOtpModel = new SendOtpModel();
  myForm: FormGroup;
  myForm1: FormGroup;
  isEmailAlreadyExisting:boolean = false;
  disableSubmitButton:boolean = false;
  disableRegisteredButton:boolean = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.myForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email, this.emailExistingValidator()]],
      age: ['', [Validators.required, Validators.minLength(3)]],
      phoneNo: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      tShirt: ['L', []],
      walkFormat: ['2KM', []],
      terms: [false, Validators.requiredTrue]
    }, {
      validators: this.passwordMatchValidator
    });

    this.myForm1 = this.fb.group({
      optNumber: ['',[this.passwordComplexityOKValidator(), this.passwordComplexityValidator()]],
      terms: [false, Validators.requiredTrue]
    }, {
      validators: this.passwordMatchValidator
    });

    this.myForm.valueChanges.subscribe((changedObj: any) => {
      this.disableSubmitButton = this.myForm.valid;
      this.isEmailAlreadyExisting = false;
      this.myForm.controls['email'].setErrors(null);
    });

    this.myForm1.valueChanges.subscribe((changedObj: any) => {
      this.disableRegisteredButton = this.myForm1.valid;
    });
  }

  sendOtpMessage() {
    this.sendOtpModel.route = "otp";
    this.sendOtpModel.variables_values = "000000";
    this.sendOtpModel.numbers = this.myForm.value.phoneNo;
    this.auth.sendOtp(this.sendOtpModel).subscribe({ next: (res) => { 
        this.sendOtpModel.variables_values = res.variables_values
        console.log(res) 
      }});
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  checkOtp() {
    this.myForm.value.optNumber == this.sendOtpModel.variables_values ? console.log("OTP Matched") : console.log("OTP Not Matched");
  }

  emailExistingValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control == undefined) return null;  
      return this.isEmailAlreadyExisting ? { emailExisting: true } : null;
    };
  }
  

  passwordComplexityValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control == undefined) return null;  
      const password = control.value;
        const isValid = /^\d{6}$/.test(password);
        if (!isValid) return null;
        if(this.myForm == undefined) return null;
        const passwordValid = password == this.sendOtpModel.variables_values
        return !passwordValid ? { passwordComplexity: true } : null;
    };
  }
  passwordComplexityOKValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control == undefined) return null;
      const password = control.value;
      const isValid = /^\d{6}$/.test(password);
      if (!isValid) return null;
      if (this.myForm == undefined) return null;
      const passwordValid = password == this.sendOtpModel.variables_values
      return !passwordValid ? null : { passwordMatched: true };
    };
  }

  onSubmit() {
    if (this.myForm.valid) {
      const { name, email, age, phoneNo, password, tShirt, workFormat, token = "not" } = this.myForm.value;
      const formData = { name, email, age, phoneNo, password, tShirt, workFormat, token };
      this.auth.getRecord(formData).subscribe({
        next: (res) => {
          if (Array.isArray(res)) {
            this.isEmailAlreadyExisting = res.length > 0;
          } else {
            this.isEmailAlreadyExisting = false;
          }
          if (this.isEmailAlreadyExisting) {
            this.myForm.controls['email'].setErrors({ emailExisting: true });
            Swal.fire({
              icon: 'error',
              title: "User Already Exists",
              iconColor: 'white',
              background: 'red',
              color: 'white',
              timer: 3000,
              timerProgressBar: true,
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
              }
            });
          }else{

            this.sendOtpMessage();
            console.log('Form Submitted!', formData);
            this.auth.signup(formData)
            .subscribe({
              next: (res) => {
                Swal.fire({
                  icon: 'success',
                  title: res.message,
                  iconColor: 'white',
                  background: 'green',
                  color: 'white',
                  timer: 2000,
                  timerProgressBar: true,
                  toast: true,
                  position: 'top-end',
                  showConfirmButton: false,
                }).then(() => {
                  this.router.navigate(['']); 
                });
              },
              error: (err) => {
                Swal.fire({
                  icon: 'error',
                  title: err.error.message,
                  iconColor: 'white',
                  background: 'red',
                  color: 'white',
                  timer: 3000,
                  timerProgressBar: true,
                  toast: true,
                  position: 'top-end',
                  showConfirmButton: false,
                  didOpen: (toast) => {
                    toast.addEventListener('mouseenter', Swal.stopTimer);
                    toast.addEventListener('mouseleave', Swal.resumeTimer);
                  }
                });
              }
            });
          }
        }
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: "You Missing Something! Kindly Check Form again!",
        iconColor: 'white',
        background: 'red',
        color: 'white',
        timer: 3000,
        timerProgressBar: true,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer);
          toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
      });
      console.log('Form is invalid');
    }
  }
}
