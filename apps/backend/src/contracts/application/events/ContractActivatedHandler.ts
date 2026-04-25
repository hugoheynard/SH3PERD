import { CommandBus, EventsHandler, type IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ContractActivatedEvent } from './ContractActivatedEvent.js';
import { CreateNotificationCommand } from '../../../notifications/application/commands/CreateNotificationHandler.js';

@EventsHandler(ContractActivatedEvent)
export class ContractActivatedHandler implements IEventHandler<ContractActivatedEvent> {
  private readonly logger = new Logger('Contracts');

  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: ContractActivatedEvent): Promise<void> {
    this.logger.log(
      `[ContractActivated] contract=${event.contractId} → companySigner=${event.companySignerId}`,
    );

    await this.commandBus.execute(
      new CreateNotificationCommand({
        user_id: event.companySignerId,
        kind: 'contract',
        action: 'signed',
        contract_id: event.contractId,
        title: 'Contract signed by recipient',
        body: 'The recipient has counter-signed. The contract is now active.',
      }),
    );
  }
}
