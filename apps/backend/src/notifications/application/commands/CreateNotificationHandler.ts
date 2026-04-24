import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject, Injectable } from '@nestjs/common';
import type { TCreateNotificationPayload, TNotificationDomainModel } from '@sh3pherd/shared-types';
import { NOTIFICATION_REPO } from '../../../appBootstrap/nestTokens.js';
import type { INotificationRepository } from '../../repositories/NotificationRepository.js';
import { NotificationEntity } from '../../domain/NotificationEntity.js';

/**
 * Internal command — not routed through the REST layer. Dispatched by
 * domain event handlers (contract signed/declined/…, system broadcasts)
 * so the caller is trusted: no actor vs. recipient check, the recipient
 * is whatever `user_id` the payload carries.
 */
export class CreateNotificationCommand {
  constructor(public readonly payload: TCreateNotificationPayload) {}
}

@CommandHandler(CreateNotificationCommand)
@Injectable()
export class CreateNotificationHandler implements ICommandHandler<
  CreateNotificationCommand,
  TNotificationDomainModel
> {
  constructor(
    @Inject(NOTIFICATION_REPO)
    private readonly repo: INotificationRepository,
  ) {}

  async execute(cmd: CreateNotificationCommand): Promise<TNotificationDomainModel> {
    const entity = buildEntity(cmd.payload);
    await this.repo.saveOne(entity.toDomain);
    return entity.toDomain;
  }
}

/** Narrows the discriminated payload before handing it to the entity
 *  constructor so the `action`/`contract_id` properties are only set on
 *  the contract branch and TS stays happy without a cast. */
function buildEntity(payload: TCreateNotificationPayload): NotificationEntity {
  const now = Date.now();
  if (payload.kind === 'contract') {
    return new NotificationEntity({
      user_id: payload.user_id,
      kind: 'contract',
      action: payload.action,
      contract_id: payload.contract_id,
      title: payload.title,
      body: payload.body,
      read: false,
      createdAt: now,
    });
  }
  return new NotificationEntity({
    user_id: payload.user_id,
    kind: 'system',
    title: payload.title,
    body: payload.body,
    read: false,
    createdAt: now,
  });
}
