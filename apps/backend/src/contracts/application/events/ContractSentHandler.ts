import { CommandBus, EventsHandler, type IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ContractSentEvent } from './ContractSentEvent.js';
import { CreateNotificationCommand } from '../../../notifications/application/commands/CreateNotificationHandler.js';

@EventsHandler(ContractSentEvent)
export class ContractSentHandler implements IEventHandler<ContractSentEvent> {
  private readonly logger = new Logger('Contracts');

  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: ContractSentEvent): Promise<void> {
    this.logger.log(`[ContractSent] contract=${event.contractId} → recipient=${event.recipientId}`);

    await this.commandBus.execute(
      new CreateNotificationCommand({
        user_id: event.recipientId,
        kind: 'contract',
        action: 'received',
        contract_id: event.contractId,
        title: 'New contract to review',
        body: 'The company has signed a contract for you. Review and counter-sign to activate it.',
      }),
    );
  }
}
