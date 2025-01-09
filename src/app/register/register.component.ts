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

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.myForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      age: ['', [Validators.required, Validators.minLength(3)]],
      phoneNo: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      tShirt: ['L', [Validators.pattern(/^\*/), Validators.pattern(/^\*/)]],
      walkFormat: ['2KM', [Validators.required, Validators.minLength(3)]],
      optNumber: ['',[this.passwordComplexityOKValidator(), this.passwordComplexityValidator()]],
      role: ['', Validators.required],
      terms: [false, Validators.requiredTrue]
    }, {
      validators: this.passwordMatchValidator
    });
  }


  sendMessage1() {
    this.sendOtpModel.route = "otp";
    this.sendOtpModel.variables_values = "000000";
    this.sendOtpModel.numbers = this.myForm.value.phoneNo;
    this.auth.sendOtp(this.sendOtpModel).subscribe({ next: (res) => 
      { 
        this.sendOtpModel.variables_values = res.variables_values
        console.log(res) 

      } });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  checkOtp() {
    this.myForm.value.optNumber == this.sendOtpModel.variables_values ? console.log("OTP Matched") : console.log("OTP Not Matched");
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
    passwordComplexityOKValidator():ValidatorFn {
      return (control: AbstractControl): ValidationErrors | null => {
        if (control == undefined) return null;    
        const password = control.value;
          const isValid = /^\d{6}$/.test(password);
          if (!isValid) return null;
          if(this.myForm == undefined) return null;
          const passwordValid = password == this.sendOtpModel.variables_values
          return !passwordValid ? null : { passwordMatched: true };
      };
    }

  onSubmit() {
    if (this.myForm.errors == null) {
      const { name, email, age, phoneNo, password, tShirt, workFormat, role, token = "not" } = this.myForm.value;
      const formData = { name, email, age, phoneNo, password, tShirt, workFormat, role, token };

      /*
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
      */
      this.sendMessage1();
      console.log('Form Submitted!', formData);
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

  selectPropertyType(type: string) {
    this.myForm.get('role')?.setValue(type);
  }
}
