import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { roleGuard } from './role-guard';

describe('RoleGuard', () => {
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRouteSnapshot: ActivatedRouteSnapshot;
  let mockRouterStateSnapshot: RouterStateSnapshot;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy }
      ]
    });

    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    
    // Clear localStorage before each test
    localStorage.clear();
    
    // Create mock route snapshots
    mockActivatedRouteSnapshot = {} as ActivatedRouteSnapshot;
    mockRouterStateSnapshot = {} as RouterStateSnapshot;
  });

  afterEach(() => {
    localStorage.clear();
  });

  const callGuard = () => {
    return TestBed.runInInjectionContext(() => 
      roleGuard(mockActivatedRouteSnapshot, mockRouterStateSnapshot)
    );
  };

  describe('Token Validation', () => {
    it('should deny access when no token exists', () => {
      const result = callGuard();

      expect(result).toBeFalse();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should deny access when token is malformed', () => {
      localStorage.setItem('token', 'invalid.token.format');

      const result = callGuard();

      expect(result).toBeFalse();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should deny access when token has no payload', () => {
      const malformedToken = btoa(JSON.stringify({})) + '.signature';
      localStorage.setItem('token', malformedToken);

      const result = callGuard();

      expect(result).toBeFalse();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should deny access when token is expired', () => {
      const expiredPayload = {
        exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
        role: 'ADMIN'
      };
      const expiredToken = btoa(JSON.stringify(expiredPayload)) + '.signature';
      localStorage.setItem('token', expiredToken);

      const result = callGuard();

      expect(result).toBeFalse();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should deny access when token has no expiration', () => {
      const noExpPayload = {
        role: 'ADMIN'
        // No exp field
      };
      const noExpToken = btoa(JSON.stringify(noExpPayload)) + '.signature';
      localStorage.setItem('token', noExpToken);

      const result = callGuard();

      expect(result).toBeFalse();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should allow access when token is valid and not expired', () => {
      const validPayload = {
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
        role: 'ADMIN'
      };
      const validToken = 'header.' + btoa(JSON.stringify(validPayload)) + '.signature';
      localStorage.setItem('token', validToken);

      const result = callGuard();

      expect(result).toBeTrue();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('Role Extraction and Validation', () => {
    it('should deny access when user role is USER', () => {
      const userPayload = {
        exp: Math.floor(Date.now() / 1000) + 3600,
        role: 'USER'
      };
      const userToken = 'header.' + btoa(JSON.stringify(userPayload)) + '.signature';
      localStorage.setItem('token', userToken);

      const result = callGuard();

      expect(result).toBeFalse();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/deals']);
    });

    it('should deny access when user role is user (lowercase)', () => {
      const userPayload = {
        exp: Math.floor(Date.now() / 1000) + 3600,
        role: 'user'
      };
      const userToken = 'header.' + btoa(JSON.stringify(userPayload)) + '.signature';
      localStorage.setItem('token', userToken);

      const result = callGuard();

      expect(result).toBeFalse();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/deals']);
    });

    it('should allow access when user role is ADMIN', () => {
      const adminPayload = {
        exp: Math.floor(Date.now() / 1000) + 3600,
        role: 'ADMIN'
      };
      const adminToken = 'header.' + btoa(JSON.stringify(adminPayload)) + '.signature';
      localStorage.setItem('token', adminToken);

      const result = callGuard();

      expect(result).toBeTrue();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should allow access when user role is admin (lowercase)', () => {
      const adminPayload = {
        exp: Math.floor(Date.now() / 1000) + 3600,
        role: 'admin'
      };
      const adminToken = 'header.' + btoa(JSON.stringify(adminPayload)) + '.signature';
      localStorage.setItem('token', adminToken);

      const result = callGuard();

      expect(result).toBeTrue();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should deny access when role is missing from payload', () => {
      const noRolePayload = {
        exp: Math.floor(Date.now() / 1000) + 3600
        // No role field
      };
      const noRoleToken = btoa(JSON.stringify(noRolePayload)) + '.signature';
      localStorage.setItem('token', noRoleToken);

      const result = callGuard();

      expect(result).toBeFalse();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should handle role from authorities array (ROLE_ADMIN)', () => {
      const authoritiesPayload = {
        exp: Math.floor(Date.now() / 1000) + 3600,
        authorities: ['ROLE_ADMIN']
      };
      const authoritiesToken = 'header.' + btoa(JSON.stringify(authoritiesPayload)) + '.signature';
      localStorage.setItem('token', authoritiesToken);

      const result = callGuard();

      expect(result).toBeTrue();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should handle role from authorities array (ROLE_USER)', () => {
      const authoritiesPayload = {
        exp: Math.floor(Date.now() / 1000) + 3600,
        authorities: ['ROLE_USER']
      };
      const authoritiesToken = 'header.' + btoa(JSON.stringify(authoritiesPayload)) + '.signature';
      localStorage.setItem('token', authoritiesToken);

      const result = callGuard();

      expect(result).toBeFalse();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/deals']);
    });

    it('should deny access when role is invalid', () => {
      const invalidRolePayload = {
        exp: Math.floor(Date.now() / 1000) + 3600,
        role: 'INVALID_ROLE'
      };
      const invalidRoleToken = btoa(JSON.stringify(invalidRolePayload)) + '.signature';
      localStorage.setItem('token', invalidRoleToken);

      const result = callGuard();

      expect(result).toBeFalse();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle JSON parsing errors gracefully', () => {
      const invalidJsonToken = 'invalid.' + btoa('invalid json') + '.signature';
      localStorage.setItem('token', invalidJsonToken);

      const result = callGuard();

      expect(result).toBeFalse();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should handle base64 decoding errors gracefully', () => {
      const invalidBase64Token = 'invalid!@#$%^&*()signature';
      localStorage.setItem('token', invalidBase64Token);

      const result = callGuard();

      expect(result).toBeFalse();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should remove invalid token from localStorage', () => {
      localStorage.setItem('token', 'invalid.token');
      
      callGuard();

      expect(localStorage.getItem('token')).toBeNull();
    });

    it('should handle empty authorities array', () => {
      const emptyAuthoritiesPayload = {
        exp: Math.floor(Date.now() / 1000) + 3600,
        authorities: []
      };
      const emptyAuthoritiesToken = btoa(JSON.stringify(emptyAuthoritiesPayload)) + '.signature';
      localStorage.setItem('token', emptyAuthoritiesToken);

      const result = callGuard();

      expect(result).toBeFalse();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should handle null authorities', () => {
      const nullAuthoritiesPayload = {
        exp: Math.floor(Date.now() / 1000) + 3600,
        authorities: null
      };
      const nullAuthoritiesToken = btoa(JSON.stringify(nullAuthoritiesPayload)) + '.signature';
      localStorage.setItem('token', nullAuthoritiesToken);

      const result = callGuard();

      expect(result).toBeFalse();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('Integration Tests', () => {
    it('should work with complete valid admin token', () => {
      // Simulate a real JWT-like token structure
      const payload = {
        sub: 'admin-user',
        role: 'ADMIN',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000)
      };
      
      const mockToken = 'header.' + btoa(JSON.stringify(payload)) + '.signature';
      
      localStorage.setItem('token', mockToken);

      const result = callGuard();

      expect(result).toBeTrue();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should work with complete valid user token', () => {
      const payload = {
        sub: 'regular-user',
        role: 'USER',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000)
      };
      
      const mockToken = 'header.' + btoa(JSON.stringify(payload)) + '.signature';
      
      localStorage.setItem('token', mockToken);

      const result = callGuard();

      expect(result).toBeFalse();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/deals']);
    });
  });
});
