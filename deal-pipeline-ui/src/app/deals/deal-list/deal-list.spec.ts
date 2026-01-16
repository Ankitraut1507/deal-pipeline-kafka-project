import { ComponentFixture, TestBed } from '@angular/core/testing';
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
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { DealListComponent } from './deal-list';
import { DealService } from '../deal';
import { AuthService } from '../../auth/auth';
import { MatDialog } from '@angular/material/dialog';
import { Deal, DealBase } from '../../shared/models/deal.model';
import { DEAL_STAGES, DEAL_TYPES } from '../../shared/constants/deal.constants';

describe('DealListComponent', () => {
  let component: DealListComponent;
  let fixture: ComponentFixture<DealListComponent>;
  let mockDealService: jasmine.SpyObj<DealService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;

  const mockDeal: DealBase = {
    id: '1',
    title: 'Test Deal',
    sector: 'Technology',
    dealType: 'MERGER_ACQUISITION',
    stage: 'PROSPECTING',
    ownerId: 'user123',
    createdAt: '2026-01-15T10:00:00Z'
  };

  beforeEach(async () => {
    mockDealService = jasmine.createSpyObj('DealService', ['getDeals', 'updateDeal', 'updateDealValue', 'deleteDeal']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getUserRole', 'getUserId']);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    
    // Set up default mock return values before component creation
    mockDealService.getDeals.and.returnValue(of({ content: [] }));

    await TestBed.configureTestingModule({
      imports: [
        DealListComponent,
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
        NoopAnimationsModule
      ],
      providers: [
        { provide: DealService, useValue: mockDealService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: ActivatedRoute, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DealListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.deals).toEqual([]);
      expect(component.dealCount).toBe(0);
      expect(component.isLoaded).toBeFalse();
      expect(component.stage).toBe('');
      expect(component.sector).toBe('');
      expect(component.editingDealId).toBeNull();
      expect(component.editModel).toEqual({});
      expect(component.originalDealValue).toBeNull();
      expect(component.originalModel).toEqual({});
    });

    it('should set admin status and columns correctly', () => {
      mockAuthService.getUserRole.and.returnValue('ADMIN');
      
      component.ngOnInit();
      fixture.detectChanges();
      
      expect(component.isAdmin).toBeTrue();
      expect(component.displayedColumns).toContain('dealValue');
    });

    it('should set user status and columns correctly', () => {
      mockAuthService.getUserRole.and.returnValue('USER');
      
      component.ngOnInit();
      fixture.detectChanges();
      
      expect(component.isAdmin).toBeFalse();
      expect(component.displayedColumns).not.toContain('dealValue');
    });

    it('should have correct default sectors', () => {
      expect(component.sectors).toEqual(['Technology', 'Energy', 'Finance', 'Healthcare', 'Manufacturing']);
    });

    it('should have correct stages and deal types', () => {
      expect(component.stages).toEqual(DEAL_STAGES);
      expect(component.dealTypes).toEqual(DEAL_TYPES);
    });
  });

  describe('Date Format Debug', () => {
    it('should check actual date format', () => {
      const validDate = '2026-01-15T10:30:00Z';
      const display = component.getCreatedOnDisplay(validDate);
      expect(display).toContain('Jan 15, 2026');
      expect(display).toContain('04:00 PM');
    });
  });

  describe('Edit Functionality', () => {
    beforeEach(() => {
      mockAuthService.getUserRole.and.returnValue('USER');
      mockAuthService.getUserId.and.returnValue('user123');
      fixture.detectChanges();
    });

    it('should allow editing own deal', () => {
      const ownDeal = { ...mockDeal, ownerId: 'user123' };
      
      component.startEdit(ownDeal);
      
      expect(component.editingDealId).toBe('1');
      expect(component.editModel).toEqual(ownDeal);
      expect(component.originalDealValue).toBeNull();
      expect(component.originalModel).toEqual(ownDeal);
    });

    it('should prevent non-owner from editing deal', () => {
      spyOn(window, 'alert');
      const otherDeal = { ...mockDeal, ownerId: 'other456' };
      
      component.startEdit(otherDeal);
      
      expect(window.alert).toHaveBeenCalledWith('You can only edit deals that you have created. Contact an admin for assistance.');
      expect(component.editingDealId).toBeNull();
      expect(component.editModel).toEqual({});
      expect(component.originalDealValue).toBeNull();
      expect(component.originalModel).toEqual({});
    });

    it('should cancel edit correctly', () => {
      component.editingDealId = '123';
      component.editModel = { title: 'Changed' };
      component.originalDealValue = 1000;
      component.originalModel = { title: 'Original' };
      
      component.cancelEdit();
      
      expect(component.editingDealId).toBeNull();
      expect(component.editModel).toEqual({});
      expect(component.originalDealValue).toBeNull();
      expect(component.originalModel).toEqual({});
    });

    it('should save edit with changed fields', () => {
      mockDealService.updateDeal.and.returnValue(of({}));
      component.editingDealId = '1';
      component.editModel = { 
        title: 'New Title',
        sector: 'Energy',
        dealType: 'IPO',
        stage: 'LEAD'
      };
      component.originalModel = {
        title: 'Old Title',
        sector: 'Technology',
        dealType: 'MERGER_ACQUISITION',
        stage: 'PROSPECTING'
      };
      
      component.saveEdit('1');
      
      expect(mockDealService.updateDeal).toHaveBeenCalledWith('1', {
        title: 'New Title',
        sector: 'Energy',
        dealType: 'IPO',
        stage: 'LEAD'
      });
    });

    it('should save edit with only changed fields', () => {
      mockDealService.updateDeal.and.returnValue(of({}));
      component.editingDealId = '1';
      component.editModel = { 
        title: 'New Title',
        sector: 'Technology'  // unchanged
      };
      component.originalModel = {
        title: 'Old Title',
        sector: 'Technology'
      };
      
      component.saveEdit('1');
      
      expect(mockDealService.updateDeal).toHaveBeenCalledWith('1', {
        title: 'New Title'
      });
    });

    it('should handle save edit error', () => {
      spyOn(console, 'error');
      mockDealService.updateDeal.and.returnValue(throwError('Update failed'));
      component.editingDealId = '1';
      component.editModel = { title: 'New Title' };
      component.originalModel = { title: 'Old Title' };
      
      component.saveEdit('1');
      
      expect(console.error).toHaveBeenCalledWith('Failed to update deal', 'Update failed');
    });
  });

  describe('Load Deals', () => {
    beforeEach(() => {
      mockAuthService.getUserRole.and.returnValue('USER');
      mockDealService.getDeals.and.returnValue(of({ content: [mockDeal] }));
      fixture.detectChanges();
    });

    it('should load deals successfully', () => {
      component.loadDeals();
      fixture.detectChanges();
      
      expect(component.isLoaded).toBeTrue();
      expect(component.deals).toEqual([mockDeal]);
      expect(component.dealCount).toBe(1);
    });
  });

  describe('Delete Deal', () => {
    beforeEach(() => {
      mockAuthService.getUserRole.and.returnValue('ADMIN');
      mockDealService.deleteDeal.and.returnValue(of({}));
      fixture.detectChanges();
      component.deals = [mockDeal];
      component.dealCount = 1;
    });

    it('should delete deal when confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      
      component.deleteDeal('1');
      
      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this deal?');
      expect(mockDealService.deleteDeal).toHaveBeenCalledWith('1');
      expect(component.deals).toEqual([]);
      expect(component.dealCount).toBe(0);
    });

    it('should not delete deal when cancelled', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      
      component.deleteDeal('1');
      
      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this deal?');
      expect(mockDealService.deleteDeal).not.toHaveBeenCalled();
      expect(component.deals).toEqual([mockDeal]);
      expect(component.dealCount).toBe(1);
    });
  });

  describe('Open Notes', () => {
    beforeEach(() => {
      mockAuthService.getUserRole.and.returnValue('USER');
      fixture.detectChanges();
    });

    it('should open notes dialog', () => {
      component.openNotes(mockDeal);
      
      expect(mockDialog.open).toHaveBeenCalledWith(jasmine.any(Function), {
        width: '600px',
        data: mockDeal
      });
    });
  });
});
