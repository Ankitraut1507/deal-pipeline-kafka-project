import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { DealService } from '../deal';
import { AuthService } from '../../auth/auth';
import { Deal } from '../../shared/models/deal.model';
import { DEAL_TYPES, DEAL_STAGES } from '../../shared/constants/deal.constants';

@Component({
  selector: 'app-deal-edit',
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
  templateUrl: './deal-edit.html',
  styleUrl: './deal-edit.scss',
})
export class DealEditComponent implements OnInit {

  dealForm: FormGroup;
  dealId: string = '';
  isAdmin = false;
  dealTypes = DEAL_TYPES;
  dealStages = DEAL_STAGES;

  constructor(
    private fb: FormBuilder,
    private dealService: DealService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.dealForm = this.fb.group({
      title: ['', Validators.required],
      sector: ['', Validators.required],
      dealType: ['', Validators.required],
      stage: ['LEAD'],
      dealValue: [null]
    });
  }

  ngOnInit() {
    this.isAdmin = this.authService.isAdmin();
    if (this.isAdmin) {
      this.dealForm.get('dealValue')?.setValidators([
        Validators.min(0)
      ]);
      this.dealForm.get('dealValue')?.updateValueAndValidity();
    } else {
      this.dealForm.removeControl('dealValue');
    }

    this.dealId = this.route.snapshot.paramMap.get('id') || '';
    if (this.dealId) {
      this.dealService.getDeal(this.dealId).subscribe((deal: any) => {
        this.dealForm.patchValue({
          title: deal.title,
          sector: deal.sector,
          dealType: deal.dealType,
          stage: deal.stage,
          dealValue: this.isAdmin ? (deal as any).dealValue : null
        });
      });
    }
  }

  updateDeal() {
    if (this.dealForm.invalid) return;

    const payload: any = {
      title: this.dealForm.value.title,
      sector: this.dealForm.value.sector,
      dealType: this.dealForm.value.dealType,
      stage: this.dealForm.value.stage
    };

    this.dealService.updateDeal(this.dealId, payload).subscribe({
      next: () => {
        if (this.isAdmin) {
          const raw = this.dealForm.value.dealValue;
          const dealValue =
            raw === '' || raw === null || raw === undefined ? null : Number(raw);

          if (dealValue !== null) {
            this.dealService
              .updateDealValue(this.dealId, dealValue)
              .subscribe(() => this.router.navigate(['/deals']));
            return;
          }
        }

        this.router.navigate(['/deals']);
      }
    });
  }
}
