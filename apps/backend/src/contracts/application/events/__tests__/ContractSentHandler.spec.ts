import type { CommandBus } from '@nestjs/cqrs';
import type { TCompanyId, TContractId, TUserId } from '@sh3pherd/shared-types';
import { ContractSentEvent } from '../ContractSentEvent.js';
import { ContractSentHandler } from '../ContractSentHandler.js';
import { CreateNotificationCommand } from '../../../../notifications/application/commands/CreateNotificationHandler.js';

describe('ContractSentHandler', () => {
  it('dispatches a CreateNotificationCommand with action=received to the recipient', async () => {
    const execute = jest.fn().mockResolvedValue(undefined);
    const commandBus = { execute } as unknown as CommandBus;
    const handler = new ContractSentHandler(commandBus);

    const event = new ContractSentEvent(
      'contract_test-1' as TContractId,
      'company_test-1' as TCompanyId,
      'user_recipient' as TUserId,
      'user_company-signer' as TUserId,
    );

    await handler.handle(event);

    expect(execute).toHaveBeenCalledTimes(1);
    const cmd = execute.mock.calls[0][0] as CreateNotificationCommand;
    expect(cmd).toBeInstanceOf(CreateNotificationCommand);
    expect(cmd.payload.kind).toBe('contract');
    expect(cmd.payload.user_id).toBe('user_recipient');
    if (cmd.payload.kind === 'contract') {
      expect(cmd.payload.action).toBe('received');
      expect(cmd.payload.contract_id).toBe('contract_test-1');
    }
  });
});
