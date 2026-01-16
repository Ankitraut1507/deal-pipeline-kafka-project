import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { UserService } from '../user.service';
import { User } from '../../shared/models/user.model';

@Component({
  selector: 'app-user-list',
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule
  ],
  templateUrl: './user-list.html',
  styleUrl: './user-list.scss'
})
export class UserListComponent implements OnInit {

  users: User[] = [];
  filteredUsers: User[] = [];
  isLoaded = false;
  displayedColumns: string[] = ['username', 'role', 'status', 'actions'];
  searchTerm = '';
  searchType: 'username' | 'email' = 'username';

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadUsers();
  }

  /** ✅ ONLY place allowed to change isLoaded */
  loadUsers() {
    this.isLoaded = false;

    this.userService.getAllUsers().subscribe(res => {
      this.users = [...res];     // immutable
      this.filteredUsers = [...res]; // initialize filtered list
      this.isLoaded = true;      // set ONCE
    });
  }

  /** 🔍 Search functionality */
  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredUsers = [...this.users];
      return;
    }

    const term = this.searchTerm.toLowerCase().trim();
    
    if (this.searchType === 'username') {
      // Try exact match first
      this.userService.getUserByUsername(term).subscribe({
        next: (user) => {
          this.filteredUsers = [user];
        },
        error: () => {
          // If exact match fails, filter locally
          this.filteredUsers = this.users.filter(user => 
            user.username.toLowerCase().includes(term)
          );
        }
      });
    } else {
      // Try exact email match first
      this.userService.getUserByEmail(term).subscribe({
        next: (user) => {
          this.filteredUsers = [user];
        },
        error: () => {
          // If exact match fails, filter locally
          this.filteredUsers = this.users.filter(user => 
            user.email && user.email.toLowerCase().includes(term)
          );
        }
      });
    }
  }

  /** 🔄 Clear search */
  clearSearch() {
    this.searchTerm = '';
    this.filteredUsers = [...this.users];
  }

  /** ❌ MUST NOT touch isLoaded */
  makeAdmin(username: string) {
    this.userService.promoteToAdmin(username).subscribe({
      next: () => {
        this.loadUsers();          // delegate state change
      },
      error: err => console.error(err)
    });
  }

  /** Activate / Deactivate */
  updateStatus(username: string, active: boolean) {
    this.userService.updateUserStatus(username, active).subscribe({
      next: () => {
        this.loadUsers();
      },
      error: err => console.error(err)
    });
  }

  /** 🗑️ Delete user */
  deleteUser(username: string, userRole: string) {
    if (userRole === 'ADMIN') {
      alert('Admin users cannot be deleted!');
      return;
    }

    if (confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      this.userService.deleteUser(username).subscribe({
        next: () => {
          alert(`User "${username}" has been deleted successfully.`);
          this.loadUsers();
        },
        error: (err) => {
          console.error('Delete error:', err);
          alert('Failed to delete user. Please try again.');
        }
      });
    }
  }
}
