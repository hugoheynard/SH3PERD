import { ApiProperty } from '@nestjs/swagger';
import { ApiModel } from '../../utils/swagger/api-model.swagger.util.js';

// ─── Service ───────────────────────────────────────────────

@ApiModel()
export class ServicePayload {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
}

// ─── Admin ─────────────────────────────────────────────────

@ApiModel()
export class CompanyAdminPayload {
  @ApiProperty() user_id!: string;
  @ApiProperty() role!: string;
  @ApiProperty() joinedAt!: Date;
}

// ─── Company View Model ────────────────────────────────────

@ApiModel()
export class CompanyViewModelPayload {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ type: () => [ServicePayload] }) services!: ServicePayload[];
}

// ─── Company Detail View Model ─────────────────────────────

@ApiModel()
export class CompanyDetailViewModelPayload {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() status!: string;
  @ApiProperty({ type: () => [ServicePayload] }) services!: ServicePayload[];
  @ApiProperty({ type: () => [CompanyAdminPayload] }) admins!: CompanyAdminPayload[];
  @ApiProperty() activeTeamCount!: number;
  @ApiProperty() activeContractCount!: number;
}

// ─── Company Card View Model ───────────────────────────────

@ApiModel()
export class CompanyCardViewModelPayload {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() status!: string;
  @ApiProperty() adminCount!: number;
  @ApiProperty() createdAt!: Date;
}

// ─── Team Member View Model ────────────────────────────────

@ApiModel()
export class TeamMemberViewModelPayload {
  @ApiProperty() user_id!: string;
  @ApiProperty() contract_id!: string;
  @ApiProperty() joinedAt!: Date;
  @ApiProperty({ required: false }) leftAt?: Date;
}

// ─── Team View Model ───────────────────────────────────────

@ApiModel()
export class TeamViewModelPayload {
  @ApiProperty() id!: string;
  @ApiProperty() company_id!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ required: false }) service_id?: string;
  @ApiProperty() status!: string;
  @ApiProperty({ type: () => [TeamMemberViewModelPayload] }) activeMembers!: TeamMemberViewModelPayload[];
}
