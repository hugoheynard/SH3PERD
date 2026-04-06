import { TCompanyStatus } from '@sh3pherd/shared-types';
import { makeCompany, userId } from './test-helpers.js';

describe('CompanyEntity', () => {

  // ─── Construction invariants ────────────────────────────

  describe('constructor', () => {
    it('should create a company with valid props', () => {
      const company = makeCompany({ name: 'Acme Corp' });
      expect(company.name).toBe('Acme Corp');
      expect(company.status).toBe(TCompanyStatus.ACTIVE);
      expect(company.id).toMatch(/^company_/);
    });

    it('should trim the name', () => {
      const company = makeCompany({ name: '  Spaced Corp  ' });
      expect(company.name).toBe('Spaced Corp');
    });

    it('should reject empty name', () => {
      expect(() => makeCompany({ name: '' })).toThrow('COMPANY_NAME_REQUIRED');
    });

    it('should reject whitespace-only name', () => {
      expect(() => makeCompany({ name: '   ' })).toThrow('COMPANY_NAME_REQUIRED');
    });

    it('should reject missing owner_id', () => {
      expect(() => makeCompany({ owner_id: '' as any })).toThrow('COMPANY_OWNER_REQUIRED');
    });

    it('should reject invalid status', () => {
      expect(() => makeCompany({ status: 'invalid' as any })).toThrow('COMPANY_INVALID_STATUS');
    });

    it('should accept pending status', () => {
      const company = makeCompany({ status: TCompanyStatus.PENDING });
      expect(company.status).toBe(TCompanyStatus.PENDING);
    });

    it('should accept suspended status', () => {
      const company = makeCompany({ status: TCompanyStatus.SUSPENDED });
      expect(company.status).toBe(TCompanyStatus.SUSPENDED);
    });

    it('should preserve existing id when provided', () => {
      const company = makeCompany({ id: 'company_test-42' as any });
      expect(company.id).toBe('company_test-42');
    });

    it('should set default description and address', () => {
      const company = makeCompany();
      expect(company.description).toBe('');
      expect(company.address).toEqual({ street: '', city: '', zip: '', country: '' });
    });

    it('should set default org layers', () => {
      const company = makeCompany();
      expect([...company.orgLayers]).toEqual(['Department', 'Team', 'Sub-team']);
    });
  });

  // ─── Ownership ──────────────────────────────────────────

  describe('isOwnedBy', () => {
    it('should return true for the owner', () => {
      const owner = userId(1);
      const company = makeCompany({ owner_id: owner });
      expect(company.isOwnedBy(owner)).toBe(true);
    });

    it('should return false for another user', () => {
      const company = makeCompany({ owner_id: userId(1) });
      expect(company.isOwnedBy(userId(2))).toBe(false);
    });
  });

  // ─── updateInfo ─────────────────────────────────────────

  describe('updateInfo', () => {
    it('should update name, description, and address', () => {
      const company = makeCompany();
      company.updateInfo({
        name: 'New Name',
        description: 'A great company',
        address: { street: '1 Rue', city: 'Paris', zip: '75001', country: 'France' },
      });
      expect(company.name).toBe('New Name');
      expect(company.description).toBe('A great company');
      expect(company.address).toEqual({ street: '1 Rue', city: 'Paris', zip: '75001', country: 'France' });
    });

    it('should trim the name', () => {
      const company = makeCompany();
      company.updateInfo({ name: '  Trimmed  ', description: '', address: { street: '', city: '', zip: '', country: '' } });
      expect(company.name).toBe('Trimmed');
    });

    it('should reject empty name', () => {
      const company = makeCompany();
      expect(() => company.updateInfo({
        name: '',
        description: '',
        address: { street: '', city: '', zip: '', country: '' },
      })).toThrow('COMPANY_NAME_REQUIRED');
    });

    it('should reject whitespace-only name', () => {
      const company = makeCompany();
      expect(() => company.updateInfo({
        name: '   ',
        description: '',
        address: { street: '', city: '', zip: '', country: '' },
      })).toThrow('COMPANY_NAME_REQUIRED');
    });

    it('should not mutate previous values on failure', () => {
      const company = makeCompany({ name: 'Original' });
      try {
        company.updateInfo({ name: '', description: 'new', address: { street: '', city: '', zip: '', country: '' } });
      } catch { /* expected */ }
      expect(company.name).toBe('Original');
    });
  });

  // ─── updateOrgLayers ────────────────────────────────────

  describe('updateOrgLayers', () => {
    it('should replace org layers', () => {
      const company = makeCompany();
      company.updateOrgLayers(['Direction', 'Pole', 'Equipe']);
      expect([...company.orgLayers]).toEqual(['Direction', 'Pole', 'Equipe']);
    });

    it('should trim each layer', () => {
      const company = makeCompany();
      company.updateOrgLayers(['  A  ', '  B  ']);
      expect([...company.orgLayers]).toEqual(['A', 'B']);
    });

    it('should reject empty array', () => {
      const company = makeCompany();
      expect(() => company.updateOrgLayers([])).toThrow('COMPANY_ORG_LAYERS_EMPTY');
    });

    it('should reject blank layer in array', () => {
      const company = makeCompany();
      expect(() => company.updateOrgLayers(['Valid', '   ', 'Also valid'])).toThrow('COMPANY_ORG_LAYER_BLANK');
    });

    it('should accept single layer', () => {
      const company = makeCompany();
      company.updateOrgLayers(['Flat']);
      expect([...company.orgLayers]).toEqual(['Flat']);
    });
  });

  // ─── updateStatus ───────────────────────────────────────

  describe('updateStatus', () => {
    it('should change status to suspended', () => {
      const company = makeCompany();
      company.updateStatus(TCompanyStatus.SUSPENDED);
      expect(company.status).toBe(TCompanyStatus.SUSPENDED);
    });

    it('should change status to pending', () => {
      const company = makeCompany();
      company.updateStatus(TCompanyStatus.PENDING);
      expect(company.status).toBe(TCompanyStatus.PENDING);
    });

    it('should reject invalid status', () => {
      const company = makeCompany();
      expect(() => company.updateStatus('invalid' as any)).toThrow('COMPANY_INVALID_STATUS');
    });
  });

  // ─── orgLayersInfo ──────────────────────────────────────

  describe('orgLayersInfo', () => {
    it('should return only orgLayers', () => {
      const company = makeCompany();
      const info = company.orgLayersInfo;
      expect(info).toEqual({ orgLayers: ['Department', 'Team', 'Sub-team'] });
      expect(info).not.toHaveProperty('id');
      expect(info).not.toHaveProperty('name');
      expect(info).not.toHaveProperty('status');
    });

    it('should reflect mutations', () => {
      const company = makeCompany();
      company.updateOrgLayers(['A', 'B']);
      expect(company.orgLayersInfo).toEqual({ orgLayers: ['A', 'B'] });
    });

    it('should return a copy (not a reference)', () => {
      const company = makeCompany();
      const a = company.orgLayersInfo.orgLayers;
      const b = company.orgLayersInfo.orgLayers;
      expect(a).toEqual(b);
      expect(a).not.toBe(b);
    });
  });

  // ─── companyInfo ─────────────────────────────────────────

  describe('companyInfo', () => {
    it('should return only name, description and address', () => {
      const company = makeCompany({ name: 'Acme', description: 'A company', address: { street: '1', city: 'Paris', zip: '75001', country: 'FR' } });
      const info = company.companyInfo;
      expect(info).toEqual({ name: 'Acme', description: 'A company', address: { street: '1', city: 'Paris', zip: '75001', country: 'FR' } });
      expect(info).not.toHaveProperty('id');
      expect(info).not.toHaveProperty('owner_id');
      expect(info).not.toHaveProperty('status');
      expect(info).not.toHaveProperty('orgLayers');
    });

    it('should reflect mutations', () => {
      const company = makeCompany();
      company.updateInfo({ name: 'New', description: 'Desc', address: { street: 'A', city: 'B', zip: 'C', country: 'D' } });
      expect(company.companyInfo.name).toBe('New');
      expect(company.companyInfo.description).toBe('Desc');
    });

    it('should return a copy of address (not a reference)', () => {
      const company = makeCompany();
      const a1 = company.companyInfo.address;
      const a2 = company.companyInfo.address;
      expect(a1).toEqual(a2);
      expect(a1).not.toBe(a2);
    });
  });

  // ─── toDomain ────────────────────────────────────────────

  describe('toDomain', () => {
    it('should return a plain object snapshot', () => {
      const company = makeCompany({ name: 'Snapshot' });
      const domain = company.toDomain;
      expect(domain.name).toBe('Snapshot');
      expect(domain.id).toBe(company.id);
      expect(domain.owner_id).toBe(company.owner_id);
    });

    it('should reflect mutations', () => {
      const company = makeCompany({ name: 'Before' });
      company.updateInfo({ name: 'After', description: 'Updated', address: { street: '1', city: '2', zip: '3', country: '4' } });
      company.updateOrgLayers(['A', 'B']);
      const domain = company.toDomain;
      expect(domain.name).toBe('After');
      expect(domain.description).toBe('Updated');
      expect(domain.orgLayers).toEqual(['A', 'B']);
    });

    it('should return a copy (not a reference)', () => {
      const company = makeCompany();
      const d1 = company.toDomain;
      const d2 = company.toDomain;
      expect(d1).not.toBe(d2);
      expect(d1).toEqual(d2);
    });
  });
});
