import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../shared/models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/api/users`);
  }

  // 🔍 Search user by username
  getUserByUsername(username: string): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/api/users/username/${username}`);
  }

  // 🔍 Search user by email
  getUserByEmail(email: string): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/api/users/email/${email}`);
  }

  createUser(user: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/users`, user);
  }

  promoteToAdmin(username: string): Observable<any> {
    return this.http.patch(
      `${environment.apiUrl}/api/users/${username}/make-admin`,
      {}
    );
  }

  // ✅ NEW: Activate / Deactivate
  updateUserStatus(username: string, active: boolean): Observable<any> {
    return this.http.patch(
      `${environment.apiUrl}/api/users/${username}/status?active=${active}`,
      {}
    );
  }

  // 🗑️ Delete user (admin protection handled in backend)
  deleteUser(username: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/api/users/${username}`);
  }

  // 🔐 Reset user password
  resetUserPassword(username: string, newPassword: string): Observable<any> {
    return this.http.put(
      `${environment.apiUrl}/api/users/${username}/password`,
      { password: newPassword }
    );
  }
}
