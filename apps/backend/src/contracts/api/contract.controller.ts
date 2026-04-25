import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { P } from '@sh3pherd/shared-types';
import type {
  TAddendumChanges,
  TAddendumId,
  TCompanyContractViewModel,
  TCompanyId,
  TContractAddendumDomainModel,
  TContractDetailViewModel,
  TContractDocument,
  TContractDocumentId,
  TContractId,
  TContractRecord,
  TCreateContractRequestDTO,
  TUpdateContractDTO,
} from '@sh3pherd/shared-types';
import type { TContractRole } from '@sh3pherd/shared-types';
import { ActorId } from '../../utils/nest/decorators/ActorId.js';
import { ContractRoles } from '../../utils/nest/decorators/ContractRoles.js';
import type { TUserId } from '@sh3pherd/shared-types';
import { RequirePermission } from '../../utils/nest/guards/RequirePermission.js';
import { ContractScoped } from '../../utils/nest/decorators/ContractScoped.js';

// Commands
import { CreateContractCommand } from '../application/commands/CreateContractCommand.js';
import { UpdateContractCommand } from '../application/commands/UpdateContractCommand.js';
import { AssignContractRoleCommand } from '../application/commands/AssignContractRoleCommand.js';
import { RemoveContractRoleCommand } from '../application/commands/RemoveContractRoleCommand.js';
import { UploadContractDocumentCommand } from '../application/commands/UploadContractDocumentCommand.js';
import { PatchContractDocumentCommand } from '../application/commands/PatchContractDocumentCommand.js';
import { SignContractCommand } from '../application/commands/SignContractCommand.js';
import { SignContractDocumentCommand } from '../application/commands/SignContractDocumentCommand.js';
import { CreateAddendumCommand } from '../application/commands/CreateAddendumCommand.js';
import { SignAddendumCommand } from '../application/commands/SignAddendumCommand.js';

// Queries
import { GetCompanyContractsQuery } from '../application/queries/GetCompanyContractsQuery.js';
import { GetContractByIdQuery } from '../application/queries/GetContractByIdQuery.js';
import { GetContractDocumentDownloadUrlQuery } from '../application/queries/GetContractDocumentDownloadUrlQuery.js';
import { GetAddendaByContractQuery } from '../application/queries/GetAddendaByContractQuery.js';

/**
 * `@ContractScoped()` lives on the class — not on each method — so that
 * `ContractContextGuard` runs before `PermissionGuard` and populates
 * `req.contract_roles`. Stacking both at method level inverts the guard
 * order and yields a guaranteed 403 (see `orgchart-export.controller.ts`).
 */
@ApiTags('contracts')
@ApiBearerAuth('bearer')
@ContractScoped()
@Controller()
export class ContractController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @RequirePermission(P.Company.Members.Read)
  @Get('company/:companyId')
  getCompanyContracts(
    @Param('companyId') companyId: TCompanyId,
  ): Promise<TCompanyContractViewModel[]> {
    return this.queryBus.execute(new GetCompanyContractsQuery(companyId));
  }

  @RequirePermission(P.Company.Members.Read)
  @Get(':contractId')
  getContractById(@Param('contractId') contractId: TContractId): Promise<TContractDetailViewModel> {
    return this.queryBus.execute(new GetContractByIdQuery(contractId));
  }

  @RequirePermission(P.Company.Members.Write)
  @Patch(':contractId')
  updateContract(
    @Param('contractId') contractId: TContractId,
    @Body() dto: Omit<TUpdateContractDTO, 'contract_id'>,
  ): Promise<TContractRecord> {
    return this.commandBus.execute(new UpdateContractCommand({ ...dto, contract_id: contractId }));
  }

  @RequirePermission(P.Company.Members.Invite)
  @Post()
  createContract(
    @Body() dto: TCreateContractRequestDTO,
    @ActorId() actorId: TUserId,
  ): Promise<TContractRecord> {
    return this.commandBus.execute(new CreateContractCommand(dto, actorId));
  }

  // ── Signature ────────────────────────────────────────────

  @RequirePermission(P.Company.Members.Sign)
  @Post(':contractId/sign')
  signContract(
    @Param('contractId') contractId: TContractId,
    @ActorId() actorId: TUserId,
    @ContractRoles() roles: TContractRole[],
    @Body() body: { notify?: boolean },
  ): Promise<TContractRecord> {
    return this.commandBus.execute(
      new SignContractCommand(contractId, actorId, roles, body.notify ?? false),
    );
  }

  // ── Role management ──────────────────────────────────────

  @RequirePermission(P.Company.Members.Write)
  @Post(':contractId/roles')
  assignRole(
    @Param('contractId') contractId: TContractId,
    @Body() body: { role: TContractRole },
    @ActorId() actorId: TUserId,
  ): Promise<TContractRecord> {
    return this.commandBus.execute(new AssignContractRoleCommand(contractId, body.role, actorId));
  }

  @RequirePermission(P.Company.Members.Write)
  @Delete(':contractId/roles/:role')
  removeRole(
    @Param('contractId') contractId: TContractId,
    @Param('role') role: TContractRole,
    @ActorId() actorId: TUserId,
  ): Promise<TContractRecord> {
    return this.commandBus.execute(new RemoveContractRoleCommand(contractId, role, actorId));
  }

  // ── Documents ────────────────────────────────────────────

  @RequirePermission(P.Company.Members.Write)
  @Post(':contractId/documents')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 20 * 1024 * 1024 } }))
  uploadDocument(
    @Param('contractId') contractId: TContractId,
    @ActorId() actorId: TUserId,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<TContractDocument> {
    return this.commandBus.execute(
      new UploadContractDocumentCommand(
        contractId,
        actorId,
        file.buffer,
        file.originalname,
        file.mimetype,
      ),
    );
  }

  @RequirePermission(P.Company.Members.Write)
  @Patch(':contractId/documents/:documentId')
  patchDocument(
    @Param('contractId') contractId: TContractId,
    @Param('documentId') documentId: TContractDocumentId,
    @Body() body: { requiresSignature?: boolean },
  ): Promise<TContractRecord> {
    return this.commandBus.execute(new PatchContractDocumentCommand(contractId, documentId, body));
  }

  @RequirePermission(P.Company.Members.Sign)
  @Post(':contractId/documents/:documentId/sign')
  signDocument(
    @Param('contractId') contractId: TContractId,
    @Param('documentId') documentId: TContractDocumentId,
    @ActorId() actorId: TUserId,
    @ContractRoles() roles: TContractRole[],
  ): Promise<TContractRecord> {
    return this.commandBus.execute(
      new SignContractDocumentCommand(contractId, documentId, actorId, roles),
    );
  }

  @RequirePermission(P.Company.Members.Read)
  @Get(':contractId/documents/:documentId/download')
  getDocumentDownloadUrl(
    @Param('contractId') contractId: TContractId,
    @Param('documentId') documentId: TContractDocumentId,
  ): Promise<{ url: string }> {
    return this.queryBus.execute(new GetContractDocumentDownloadUrlQuery(contractId, documentId));
  }

  // ── Addenda ──────────────────────────────────────────────

  @RequirePermission(P.Company.Members.Read)
  @Get(':contractId/addenda')
  getAddenda(
    @Param('contractId') contractId: TContractId,
  ): Promise<TContractAddendumDomainModel[]> {
    return this.queryBus.execute(new GetAddendaByContractQuery(contractId));
  }

  @RequirePermission(P.Company.Members.Write)
  @Post(':contractId/addenda')
  createAddendum(
    @Param('contractId') contractId: TContractId,
    @ActorId() actorId: TUserId,
    @Body() body: { changes: TAddendumChanges; effectiveDate: string; reason?: string },
  ): Promise<TContractAddendumDomainModel> {
    return this.commandBus.execute(
      new CreateAddendumCommand(
        contractId,
        actorId,
        body.changes,
        new Date(body.effectiveDate),
        body.reason,
      ),
    );
  }

  @RequirePermission(P.Company.Members.Sign)
  @Post(':contractId/addenda/:addendumId/sign')
  signAddendum(
    @Param('addendumId') addendumId: TAddendumId,
    @ActorId() actorId: TUserId,
    @ContractRoles() roles: TContractRole[],
  ): Promise<TContractAddendumDomainModel> {
    return this.commandBus.execute(new SignAddendumCommand(addendumId, actorId, roles));
  }
}
