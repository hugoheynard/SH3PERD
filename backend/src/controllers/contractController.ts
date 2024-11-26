import {contractService} from "../services/contractService";

export const contractController = (input: any): any => {
    return {
        contractService: input.contractService
    }
}