import { Component, Inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { DealService } from '../deal';
import { AuthService } from '../../auth/auth';
import { Deal, DealNote } from '../../shared/models/deal.model';

@Component({
  selector: 'app-deal-notes',
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    FormsModule
  ],
  templateUrl: './deal-notes.component.html',
  styleUrl: './deal-notes.component.scss'
})
export class DealNotesComponent {
  deal: Deal;
  newNote = '';
  currentUserId: string;
  isAdmin: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) data: Deal,
    private dialogRef: MatDialogRef<DealNotesComponent>,
    private dealService: DealService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.deal = data;
    this.currentUserId = this.authService.getUserId() || '';
    this.isAdmin = this.authService.isAdmin();
  }

  addNote() {
    if (!this.newNote.trim()) return;

    this.dealService
      .addNote(this.deal.id, this.newNote)
      .subscribe((updatedDeal: any) => {
        // Fix NG0100: Defer UI update to next change detection cycle
        setTimeout(() => {
          this.deal.notes = updatedDeal.notes;
          this.newNote = '';
          this.cdr.detectChanges();
        }, 0);
      });
  }

  deleteNote(noteId: string) {
    if (!confirm('Delete this note?')) return;

    this.dealService
      .deleteNote(this.deal.id, noteId)
      .subscribe({
        next: (updatedDeal: any) => {
          // Fix NG0100: Defer UI update to next change detection cycle
          setTimeout(() => {
            this.deal.notes = updatedDeal.notes;
            this.cdr.detectChanges();
          }, 0);
        },
        error: (err) => {
          console.error('Failed to delete note', err);
          // Fallback: remove locally for instant UI update
          setTimeout(() => {
            this.deal.notes = this.deal.notes?.filter(n => n.noteId !== noteId) || [];
            this.cdr.detectChanges();
          }, 0);
        }
      });
  }

  canDelete(note: DealNote): boolean {
    // Show delete button only if user is ADMIN OR note belongs to current user
    return this.isAdmin || note.userId === this.currentUserId;
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
