import { DomainError } from '../../../utils/errorManagement/DomainError.js';
import { makeNode, makeGuest, makeComm, userId, contractId, nodeId } from './test-helpers.js';

/** Asserts that fn throws a DomainError with the expected code. */
function expectDomainError(fn: () => void, code: string): void {
  try {
    fn();
    fail(`Expected DomainError with code ${code}`);
  } catch (err) {
    expect(err).toBeInstanceOf(DomainError);
    expect((err as DomainError).code).toBe(code);
  }
}

describe('OrgNodeEntity', () => {

  // ─── Construction invariants ────────────────────────────

  describe('constructor', () => {
    it('should create a node with valid props', () => {
      const node = makeNode({ name: 'Design Team' });
      expect(node.name).toBe('Design Team');
      expect(node.status).toBe('active');
      expect(node.id).toMatch(/^orgnode_/);
    });

    it('should trim the name', () => {
      const node = makeNode({ name: '  Spaced  ' });
      expect(node.name).toBe('Spaced');
    });

    it('should reject empty name', () => {
      expectDomainError(() => makeNode({ name: '' }), 'ORGNODE_NAME_REQUIRED');
    });

    it('should reject whitespace-only name', () => {
      expectDomainError(() => makeNode({ name: '   ' }), 'ORGNODE_NAME_REQUIRED');
    });

    it('should reject missing company_id', () => {
      expectDomainError(() => makeNode({ company_id: '' as any }), 'ORGNODE_COMPANY_REQUIRED');
    });

    it('should reject invalid status', () => {
      expectDomainError(() => makeNode({ status: 'invalid' as any }), 'ORGNODE_INVALID_STATUS');
    });

    it('should accept archived status', () => {
      const node = makeNode({ status: 'archived' });
      expect(node.status).toBe('archived');
    });

    it('should preserve existing id when provided', () => {
      const id = nodeId(42);
      const node = makeNode({ id });
      expect(node.id).toBe(id);
    });

    it('should default to root node when no parent_id', () => {
      const node = makeNode();
      expect(node.isRoot).toBe(true);
    });

    it('should not be root when parent_id is set', () => {
      const node = makeNode({ parent_id: nodeId(99) });
      expect(node.isRoot).toBe(false);
    });
  });

  // ─── Rename ──────────────────────────────────────────────

  describe('rename', () => {
    it('should rename the node', () => {
      const node = makeNode({ name: 'Old' });
      node.rename('New');
      expect(node.name).toBe('New');
    });

    it('should trim on rename', () => {
      const node = makeNode();
      node.rename('  Trimmed  ');
      expect(node.name).toBe('Trimmed');
    });

    it('should reject empty name', () => {
      const node = makeNode();
      expectDomainError(() => node.rename(''), 'ORGNODE_NAME_REQUIRED');
    });

    it('should reject whitespace-only name', () => {
      const node = makeNode();
      expectDomainError(() => node.rename('   '), 'ORGNODE_NAME_REQUIRED');
    });
  });

  // ─── Color & Type ────────────────────────────────────────

  describe('setColor', () => {
    it('should set the color', () => {
      const node = makeNode();
      node.setColor('#ff0000');
      expect(node.color).toBe('#ff0000');
    });
  });

  describe('setType', () => {
    it('should set the type', () => {
      const node = makeNode();
      node.setType('music');
      expect(node.type).toBe('music');
    });
  });

  // ─── Communications ──────────────────────────────────────

  describe('setCommunications', () => {
    it('should replace all communications', () => {
      const node = makeNode({ communications: [makeComm()] });
      const newComms = [makeComm({ platform: 'discord', url: 'https://discord.gg/xxx' })];
      node.setCommunications(newComms);
      expect(node.communications).toHaveLength(1);
      expect(node.communications[0].platform).toBe('discord');
    });
  });

  describe('addCommunication', () => {
    it('should add a communication channel', () => {
      const node = makeNode();
      node.addCommunication(makeComm());
      expect(node.communications).toHaveLength(1);
      expect(node.communications[0].platform).toBe('slack');
    });

    it('should append to existing communications', () => {
      const node = makeNode({ communications: [makeComm()] });
      node.addCommunication(makeComm({ platform: 'discord', url: 'https://discord.gg/xxx' }));
      expect(node.communications).toHaveLength(2);
    });
  });

  describe('removeCommunication', () => {
    it('should remove by platform', () => {
      const node = makeNode({ communications: [makeComm(), makeComm({ platform: 'discord', url: 'https://discord.gg/xxx' })] });
      node.removeCommunication('slack');
      expect(node.communications).toHaveLength(1);
      expect(node.communications[0].platform).toBe('discord');
    });

    it('should be a no-op if platform not found', () => {
      const node = makeNode({ communications: [makeComm()] });
      node.removeCommunication('teams');
      expect(node.communications).toHaveLength(1);
    });
  });

  // ─── Member management ───────────────────────────────────

  describe('addMember', () => {
    it('should add a member with default role', () => {
      const node = makeNode();
      const member = node.addMember(userId(1), contractId(1));
      expect(member.user_id).toBe(userId(1));
      expect(member.team_role).toBe('member');
      expect(node.members).toHaveLength(1);
    });

    it('should add a member with custom role', () => {
      const node = makeNode();
      const member = node.addMember(userId(1), contractId(1), 'manager');
      expect(member.team_role).toBe('manager');
    });

    it('should reject duplicate active member', () => {
      const node = makeNode();
      node.addMember(userId(1), contractId(1));
      expectDomainError(() => node.addMember(userId(1), contractId(2)), 'ORGNODE_MEMBER_ALREADY_EXISTS');
    });

    it('should allow re-adding a removed member', () => {
      const node = makeNode();
      node.addMember(userId(1), contractId(1));
      node.removeMember(userId(1));
      const member = node.addMember(userId(1), contractId(2));
      expect(member.contract_id).toBe(contractId(2));
    });
  });

  describe('removeMember', () => {
    it('should soft-delete by setting leftAt', () => {
      const node = makeNode();
      node.addMember(userId(1), contractId(1));
      node.removeMember(userId(1));
      expect(node.getActiveMembers()).toHaveLength(0);
      expect(node.members).toHaveLength(1);
      expect(node.members[0].leftAt).toBeDefined();
    });

    it('should reject if member not active', () => {
      const node = makeNode();
      expectDomainError(() => node.removeMember(userId(99)), 'ORGNODE_MEMBER_NOT_FOUND');
    });

    it('should reject if already removed', () => {
      const node = makeNode();
      node.addMember(userId(1), contractId(1));
      node.removeMember(userId(1));
      expectDomainError(() => node.removeMember(userId(1)), 'ORGNODE_MEMBER_NOT_FOUND');
    });
  });

  describe('updateMemberRole', () => {
    it('should update the role of an active member', () => {
      const node = makeNode();
      node.addMember(userId(1), contractId(1), 'member');
      node.updateMemberRole(userId(1), 'manager');
      expect(node.getActiveMembers()[0].team_role).toBe('manager');
    });

    it('should reject if member not active', () => {
      const node = makeNode();
      expectDomainError(() => node.updateMemberRole(userId(99), 'manager'), 'ORGNODE_MEMBER_NOT_FOUND');
    });
  });

  // ─── Guest members ───────────────────────────────────────

  describe('addGuestMember', () => {
    it('should add a guest', () => {
      const node = makeNode();
      const guest = makeGuest({ display_name: 'External Producer' });
      node.addGuestMember(guest);
      expect(node.guest_members).toHaveLength(1);
      expect(node.guest_members[0].display_name).toBe('External Producer');
    });
  });

  describe('removeGuestMember', () => {
    it('should remove a guest by id', () => {
      const node = makeNode();
      const guest = makeGuest();
      node.addGuestMember(guest);
      node.removeGuestMember(guest.id);
      expect(node.guest_members).toHaveLength(0);
    });

    it('should reject if guest not found', () => {
      const node = makeNode();
      expectDomainError(() => node.removeGuestMember('nonexistent'), 'ORGNODE_GUEST_NOT_FOUND');
    });
  });

  // ─── Temporal queries ────────────────────────────────────

  describe('getMembersAt', () => {
    it('should return members active at a specific date', () => {
      const node = makeNode();
      const jan = new Date('2025-01-01');
      const feb = new Date('2025-02-01');

      node.addMember(userId(1), contractId(1), 'member', jan);
      node.removeMember(userId(1), feb);
      node.addMember(userId(2), contractId(2), 'member', jan);

      // Mid-January: both active
      const midJan = new Date('2025-01-15');
      expect(node.getMembersAt(midJan)).toHaveLength(2);

      // Mid-February: only user 2
      const midFeb = new Date('2025-02-15');
      expect(node.getMembersAt(midFeb)).toHaveLength(1);
      expect(node.getMembersAt(midFeb)[0].user_id).toBe(userId(2));
    });
  });

  describe('getActiveMembers', () => {
    it('should return only members without leftAt', () => {
      const node = makeNode();
      node.addMember(userId(1), contractId(1));
      node.addMember(userId(2), contractId(2));
      node.removeMember(userId(1));
      expect(node.getActiveMembers()).toHaveLength(1);
      expect(node.getActiveMembers()[0].user_id).toBe(userId(2));
    });
  });

  describe('hasActiveMember', () => {
    it('should return true for active member', () => {
      const node = makeNode();
      node.addMember(userId(1), contractId(1));
      expect(node.hasActiveMember(userId(1))).toBe(true);
    });

    it('should return false for removed member', () => {
      const node = makeNode();
      node.addMember(userId(1), contractId(1));
      node.removeMember(userId(1));
      expect(node.hasActiveMember(userId(1))).toBe(false);
    });

    it('should return false for unknown user', () => {
      const node = makeNode();
      expect(node.hasActiveMember(userId(99))).toBe(false);
    });
  });

  // ─── Lifecycle ───────────────────────────────────────────

  describe('archive', () => {
    it('should set status to archived', () => {
      const node = makeNode();
      node.archive();
      expect(node.status).toBe('archived');
      expect(node.isArchived()).toBe(true);
    });

    it('should reject if already archived', () => {
      const node = makeNode({ status: 'archived' });
      expectDomainError(() => node.archive(), 'ORGNODE_ALREADY_ARCHIVED');
    });
  });

  // ─── toDomain ────────────────────────────────────────────

  describe('toDomain', () => {
    it('should return a plain object snapshot', () => {
      const node = makeNode({ name: 'Snapshot Test' });
      node.addMember(userId(1), contractId(1));
      const domain = node.toDomain;
      expect(domain.name).toBe('Snapshot Test');
      expect(domain.members).toHaveLength(1);
      expect(domain.id).toBe(node.id);
    });

    it('should reflect mutations', () => {
      const node = makeNode({ name: 'Before' });
      node.rename('After');
      node.setColor('#123456');
      const domain = node.toDomain;
      expect(domain.name).toBe('After');
      expect(domain.color).toBe('#123456');
    });
  });
});
