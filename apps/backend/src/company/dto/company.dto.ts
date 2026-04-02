import { ApiProperty } from '@nestjs/swagger';
import { ApiModel } from '../../utils/swagger/api-model.swagger.util.js';

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
