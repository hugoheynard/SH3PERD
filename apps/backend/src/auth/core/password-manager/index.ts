import {PasswordManager} from "./PasswordManager.js";
import {HashParser} from "./utils/HashParser.js";
import {createHasherRegistry} from "./hasherRegistry/createHasherRegistry.js";
import {isRehashDueFromLastHashDate} from "./utils/isRehashDueFromLastHashDate.js";


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
    hashParserFunction: HashParser.extract,
    verifyLastHashDateFunction: isRehashDueFromLastHashDate,
    rehashAfterDays: 30,
});