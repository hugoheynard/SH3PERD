import {validateAuthInput} from "./middlewares/validateAuthInput.js";
import {userExistsCheck} from "./middlewares/userExistCheck.js";
import {passwordCheck} from "./middlewares/passwordCheck.js";
import {generateAuthToken} from "./middlewares/generateAuthToken.js";
import {JWT_module} from "../../login/JWT/class_JWTGenerator.js";
import {PasswordHasher} from "../../login/crypto/PasswordHasher.js";
import express from "express";


/**
 * Creates a login router for user authentication.
 *
 * @param {Object} db - The database object containing collections, used to access the 'staffs' collection.
 * @returns {Router} - An Express router object handling the '/login' POST route.
 *
 * The '/login' route uses the following middleware functions in sequence:
 * 1. validateAuthInput: Validates the incoming authentication request payload.
 * 2. userExistsCheck: Checks if a user exists in the 'staffs' collection of the provided database.
 * 3. passwordCheck: Verifies the user's password against the hashed one stored in the database.
 * 4. generateAuthToken: Generates a JWT authentication token for the user.
 *
 * The successful response contains:
 * - A status of 200 (OK).
 * - A message indicating a successful login.
 * - The generated authentication token in the response body.
 *
 * In case of an error, it forwards the error to the next middleware for handling.
 */
export const loginRouter = (db) => {
    const loginRoute = express.Router();

    loginRoute.post('/login',
        validateAuthInput,
        userExistsCheck(db.collection('staffs')),
        passwordCheck(new PasswordHasher().verify),
        generateAuthToken(JWT_module.getToken),
        async (req, res, next) => {
            try {
                return res.status(200).json({
                    message: 'Login successful',
                    body: {
                        authToken: req.authToken
                    }
                });
            } catch (err){
                next(err);
            }
        }
    );
    return loginRoute;
};