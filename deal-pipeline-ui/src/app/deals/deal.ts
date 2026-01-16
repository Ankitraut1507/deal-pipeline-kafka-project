import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Deal } from '../shared/models/deal.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DealService {

  constructor(private http: HttpClient) {}

  getDeals(filters: any): Observable<any> {
    let params = new HttpParams();

    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params = params.set(key, filters[key]);
      }
    });

    return this.http.get(`${environment.apiUrl}/api/deals`, { params });
  }

  getMyDeals(filters: any): Observable<any> {
    let params = new HttpParams();

    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params = params.set(key, filters[key]);
      }
    });

    return this.http.get(`${environment.apiUrl}/api/deals/my`, { params });
  }

  createDeal(deal: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/deals`, deal);
  }

  getDeal(id: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/deals/${id}`);
  }

  updateDeal(id: string, deal: any): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/api/deals/${id}`, deal);
  }

  updateDealValue(dealId: string, dealValue: number): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/api/deals/${dealId}/value`, { dealValue });
  }

  addNote(dealId: string, note: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/deals/${dealId}/notes`, { note });
  }

  deleteNote(dealId: string, noteId: string): Observable<any> {
    const url = `${environment.apiUrl}/api/deals/${dealId}/notes/${noteId}`;
    return this.http.delete(url);
  }

  deleteDeal(dealId: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/api/deals/${dealId}`);
  }
}
