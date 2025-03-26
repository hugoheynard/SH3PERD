import {PasswordManager} from "./PasswordManager";
import {HashParser} from "./utils/HashParser";
import {createHasherRegistry} from "./hasherRegistry/createHasherRegistry";
import {isRehashDueFromLastHashDate} from "./utils/isRehashDueFromLastHashDate";


// @sh3pherd/password-hash-manager
// Entry point for @sh3pherd/password-hash-manager
export const passwordManager = new PasswordManager({
    currentStrategyKey: 'argon2id:v1',
    registry: createHasherRegistry({ hashParser: HashParser }),
    hashParser: HashParser.extract,
    verifyLastHashDateFunction: isRehashDueFromLastHashDate,
    rehashAfterDays: 30,
});