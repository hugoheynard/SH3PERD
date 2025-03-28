import {PasswordManager} from "./PasswordManager";
import {HashParser} from "./utils/HashParser";
import {createHasherRegistry} from "./hasherRegistry/createHasherRegistry";
import {isRehashDueFromLastHashDate} from "./utils/isRehashDueFromLastHashDate";


// @sh3pherd/password-manager

/**
 * Preconfigured PasswordManager instance using Argon2id v1.
 * Can be imported directly from the package entry point.
 *
 * @example
 * import { passwordManager } from '@sh3pherd/password-manager';
 */
export const passwordManager = new PasswordManager({
    currentStrategyKey: 'argon2id:v1',
    registry: createHasherRegistry({ hashParser: HashParser }),
    hashParser: HashParser.extract,
    verifyLastHashDateFunction: isRehashDueFromLastHashDate,
    rehashAfterDays: 30,
});