import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { DealService } from '../deal';
import { AuthService } from '../../auth/auth';
import { MatDialog } from '@angular/material/dialog';
import { DealNotesComponent } from '../deal-notes/deal-notes.component';
import { Deal } from '../../shared/models/deal.model';
import { DEAL_STAGES, DEAL_TYPES } from '../../shared/constants/deal.constants';
import { Observable, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-deal-list',
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTooltipModule,
    RouterModule
  ],
  templateUrl: './deal-list.html',
  styleUrls: ['./deal-list.scss'],
})
export class DealListComponent implements OnInit {

  deals: Deal[] = [];
  dealCount = 0;
  isLoaded = false;
  isAdmin = false;
  stage = '';
  sector = '';
  stages = DEAL_STAGES;
  sectors = ['Technology', 'Energy', 'Finance', 'Healthcare', 'Manufacturing'];
  dealTypes = DEAL_TYPES;
  displayedColumns: string[] = ['title', 'sector', 'dealType', 'stage', 'actions'];

  editingDealId: string | null = null;
  editModel: any = {};
  originalDealValue: number | null = null;
  originalModel: any = {};

  constructor(
    private dealService: DealService,
    private authService: AuthService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    const role = this.authService.getUserRole();
    this.isAdmin = role === 'ADMIN';

    this.displayedColumns = [
      'title',
      'sector',
      'dealType',
      'stage',
      ...(this.isAdmin ? ['dealValue'] : []),
      'createdBy',
      'createdOn',
      'actions'
    ];

    this.loadDeals();
  }

  getStageClass(stage: string | null | undefined): string {
    return (stage || '').toLowerCase().replace(/[\s_]+/g, '-');
  }

  getStageLabel(value: string | null | undefined): string {
    return DEAL_STAGES.find(s => s.value === value)?.label || '';
  }

  getDealTypeLabel(value: string | null | undefined): string {
    return DEAL_TYPES.find(t => t.value === value)?.label || '';
  }

  getCreatedByDisplay(ownerId: string | null | undefined): string {
    if (!ownerId) return 'Unknown';
    // For now, return the ownerId directly. In a real implementation,
    // you might want to map this to a user-friendly name
    return ownerId.charAt(0).toUpperCase() + ownerId.slice(1);
  }

  getCreatedOnDisplay(createdAt: string | null | undefined): string {
    if (!createdAt) return 'Unknown';
    
    try {
      const date = new Date(createdAt);
      // Format: Jan 12, 2026 5:30 PM
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  }

  isEditing(dealId: string): boolean {
    return this.editingDealId === dealId;
  }

  startEdit(deal: any) {
    // Check if user can edit this deal
    const currentUserId = this.authService.getUserId();
    const isOwner = deal.ownerId === currentUserId;
    const isAdmin = this.isAdmin;
    
    if (!isOwner && !isAdmin) {
      alert('You can only edit deals that you have created. Contact an admin for assistance.');
      return;
    }
    
    this.editingDealId = deal.id;
    this.editModel = { ...deal };
    this.originalDealValue = deal?.dealValue ?? null;
    this.originalModel = { ...deal };
  }

  openNotes(deal: any) {
    this.dialog.open(DealNotesComponent, {
      width: '600px',
      data: deal
    });
  }

  cancelEdit() {
    this.editingDealId = null;
    this.editModel = {};
    this.originalDealValue = null;
    this.originalModel = {};
  }

  saveEdit(dealId: string) {
    const patch: any = {};

    // Only send basic fields that changed
    if (this.editModel?.title !== this.originalModel?.title) {
      patch.title = this.editModel?.title;
    }
    if (this.editModel?.sector !== this.originalModel?.sector) {
      patch.sector = this.editModel?.sector;
    }
    if (this.editModel?.dealType !== this.originalModel?.dealType) {
      patch.dealType = this.editModel?.dealType;
    }
    if (this.editModel?.stage !== this.originalModel?.stage) {
      patch.stage = this.editModel?.stage;
    }

    const shouldPatchDeal = Object.keys(patch).length > 0;
    const patchDeal$: Observable<unknown> = shouldPatchDeal
      ? this.dealService.updateDeal(dealId, patch)
      : of(null as unknown);

    patchDeal$.pipe(
      switchMap(() => {
        // Admin-only dealValue update (separate call)
        if (this.isAdmin) {
          const valueRaw = (this.editModel as any).dealValue;
          const nextDealValue = valueRaw === '' || valueRaw === undefined || valueRaw === null
            ? null
            : Number(valueRaw);
          
          if (nextDealValue !== null && nextDealValue !== this.originalDealValue) {
            return this.dealService.updateDealValue(dealId, nextDealValue as number);
          }
        }
        return of(null as unknown);
      })
    ).subscribe({
      next: () => {
        this.loadDeals();
        this.cancelEdit();
      },
      error: (err: unknown) => {
        console.error('Failed to update deal', err);
      }
    });
  }

  loadDeals() {
    this.isLoaded = false;

    const filters = {
      stage: this.stage,
      sector: this.sector,
      page: 0,
      size: 10
    };

    // Show all deals for both admin and regular users
    this.dealService.getDeals(filters).subscribe(res => {
      this.deals = [...(res.content || res)];
      this.dealCount = this.deals.length;
      this.isLoaded = true;
    });
  }

  deleteDeal(dealId: string) {
    if (!confirm('Are you sure you want to delete this deal?')) return;

    this.dealService.deleteDeal(dealId).subscribe(() => {
      // ✅ REMOVE FROM FRONTEND ARRAY (immutable)
      this.deals = this.deals.filter(d => d.id !== dealId);
      
      // ✅ UPDATE COUNT
      this.dealCount = this.deals.length;
    });
  }
}
