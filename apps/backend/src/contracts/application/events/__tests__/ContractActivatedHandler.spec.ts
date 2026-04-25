import type { CommandBus } from '@nestjs/cqrs';
import type { TCompanyId, TContractId, TUserId } from '@sh3pherd/shared-types';
import { ContractActivatedEvent } from '../ContractActivatedEvent.js';
import { ContractActivatedHandler } from '../ContractActivatedHandler.js';
import { CreateNotificationCommand } from '../../../../notifications/application/commands/CreateNotificationHandler.js';

describe('ContractActivatedHandler', () => {
  it('notifies the company signer with action=signed, never the user actor', async () => {
    const execute = jest.fn().mockResolvedValue(undefined);
    const commandBus = { execute } as unknown as CommandBus;
    const handler = new ContractActivatedHandler(commandBus);

    const event = new ContractActivatedEvent(
      'contract_test-1' as TContractId,
      'company_test-1' as TCompanyId,
      'user_company-signer' as TUserId,
      'user_recipient' as TUserId,
    );

    await handler.handle(event);

    expect(execute).toHaveBeenCalledTimes(1);
    const cmd = execute.mock.calls[0][0] as CreateNotificationCommand;
    expect(cmd).toBeInstanceOf(CreateNotificationCommand);
    expect(cmd.payload.user_id).toBe('user_company-signer');
    if (cmd.payload.kind === 'contract') {
      expect(cmd.payload.action).toBe('signed');
      expect(cmd.payload.contract_id).toBe('contract_test-1');
    }
  });
});
