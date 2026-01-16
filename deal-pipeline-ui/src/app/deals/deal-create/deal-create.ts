import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { DealService } from '../deal';
import { AuthService } from '../../auth/auth';
import { DEAL_TYPES } from '../../shared/constants/deal.constants';

@Component({
  selector: 'app-deal-create',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './deal-create.html',
  styleUrl: './deal-create.scss',
})
export class DealCreateComponent implements OnInit {

  dealForm!: FormGroup;
  isAdmin = false;
  dealTypes = DEAL_TYPES;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private dealService: DealService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();

    this.dealForm = this.fb.group({
      title: ['', Validators.required],
      sector: ['', Validators.required],
      dealType: ['', Validators.required],
      dealValue: [null]
    });
  }

  createDeal() {
    if (this.dealForm.invalid) return;

    const payload: any = {
      title: this.dealForm.value.title,
      sector: this.dealForm.value.sector,
      dealType: this.dealForm.value.dealType
    };

    if (this.isAdmin && this.dealForm.value.dealValue !== null) {
      payload.dealValue = Number(this.dealForm.value.dealValue);
    }

    this.dealService.createDeal(payload)
      .subscribe(() => {
        this.router.navigate(['/deals']);
      });
  }
}
