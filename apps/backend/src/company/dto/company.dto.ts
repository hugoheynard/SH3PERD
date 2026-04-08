import { ApiProperty } from '@nestjs/swagger';
import { ApiModel } from '../../utils/swagger/api-model.swagger.util.js';
import { createZodDto } from 'nestjs-zod';
import { SCompanyInfo, SOrgLayers, SOrgNodeDomainModel } from '@sh3pherd/shared-types';

// ─── Deleted Company (response for DELETE) ────────────────

@ApiModel()
export class DeletedCompanyPayload {
  @ApiProperty({ example: 'company_abc-123' }) id!: string;
}

// ─── Company Info (request + response DTO for settings) ───

@ApiModel()
export class CompanyInfoPayload extends createZodDto(SCompanyInfo) {}

// ─── Org Layers (request + response DTO for settings) ─────

@ApiModel()
export class OrgLayersPayload extends createZodDto(SOrgLayers) {}

// ─── Org Node Domain Model ────────────────────────────────

@ApiModel()
export class OrgNodePayload extends createZodDto(SOrgNodeDomainModel) {}

// ─── Company View Model ────────────────────────────────────

@ApiModel()
export class CompanyViewModelPayload {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() status!: string;
}

// ─── Company Detail View Model ─────────────────────────────

@ApiModel()
export class CompanyDetailViewModelPayload {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() status!: string;
  @ApiProperty({ required: false }) description?: string;
  @ApiProperty() activeTeamCount!: number;
  @ApiProperty() activeContractCount!: number;
}

// ─── Company Card View Model ───────────────────────────────

@ApiModel()
export class CompanyCardViewModelPayload {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() status!: string;
  @ApiProperty() createdAt!: Date;
}

// ─── Team Member View Model ────────────────────────────────

@ApiModel()
export class TeamMemberViewModelPayload {
  @ApiProperty() user_id!: string;
  @ApiProperty() contract_id!: string;
  @ApiProperty() team_role!: string;
  @ApiProperty() joinedAt!: Date;
  @ApiProperty({ required: false }) leftAt?: Date;
  @ApiProperty({ required: false }) first_name?: string;
  @ApiProperty({ required: false }) last_name?: string;
}

// ─── Team View Model ───────────────────────────────────────

@ApiModel()
export class TeamViewModelPayload {
  @ApiProperty() id!: string;
  @ApiProperty() company_id!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ required: false }) parent_id?: string;
  @ApiProperty({ required: false }) type?: string;
  @ApiProperty({ required: false }) color?: string;
  @ApiProperty() status!: string;
  @ApiProperty({ type: () => [TeamMemberViewModelPayload] }) activeMembers!: TeamMemberViewModelPayload[];
}

// ─── Org Node Hierarchy (recursive tree node) ─────────────

@ApiModel()
export class OrgNodeHierarchyPayload {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ required: false }) parent_id?: string;
  @ApiProperty({ required: false }) type?: string;
  @ApiProperty({ required: false }) color?: string;
  @ApiProperty() status!: string;
  @ApiProperty({ type: () => [TeamMemberViewModelPayload] }) members!: TeamMemberViewModelPayload[];
  @ApiProperty({ type: () => [OrgNodeHierarchyPayload] }) children!: OrgNodeHierarchyPayload[];
}

// ─── Company Org Chart View Model ─────────────────────────

@ApiModel()
export class CompanyOrgChartPayload {
  @ApiProperty() company_id!: string;
  @ApiProperty() company_name!: string;
  @ApiProperty({ type: [String] }) orgLayers!: string[];
  @ApiProperty({ type: () => [OrgNodeHierarchyPayload] }) rootNodes!: OrgNodeHierarchyPayload[];
}
