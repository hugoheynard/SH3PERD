import { Injectable } from '@nestjs/common';

@Injectable()
export class OnContractInactive {

  constructor(

  ) {};


  removeContractFromUserGroups() {
    /*
    userGroupRepository.removeContractFromAllGroups(contractId);
     */
  }

  markContractAsInactiveOnDb() {
    /*
    contractRepository.markAsInactive(contractId);
     */
  }

}

