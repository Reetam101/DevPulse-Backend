import { AppError } from "../middlewares/error.middleware";
import { Request, Response, NextFunction } from "express"
import authService from "../services/auth.service";
import { ApiSuccess } from "../utils/ApiSuccess";

class AuthController {

    public redirectToGithubAuth = (req: Request, res: Response, next: NextFunction) => {
        try {
            const state = Math.random().toString(36).substring(7);

            (req.session as any).oauthState = state;

            const scopes = ["read:user", "user:email"];

            const githubAuthUrl =
                `https://github.com/login/oauth/authorize` +
                `?client_id=${process.env.GITHUB_CLIENT_ID}` +
                `&redirect_uri=${process.env.GITHUB_CALLBACK_URL}` +
                `&scope=${encodeURIComponent(scopes.join(" "))}` +
                `&state=${state}`;

            res.redirect(githubAuthUrl);
        } catch (error) {
            throw new AppError("Internal Server Error", 500);
        }
    }

    public handleGithubCallback = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const { code, state } = req.query;
            console.log(state);
            console.log((req.session as any).oauthState);
            if (!code || !state) {
                throw new AppError("Invalid request", 400);
            }
            const result = await authService.handleGithubCallback(code as string);
            // if (state !== (req.session as any).oauthState) {
            //     throw new AppError("Invalid state parameter", 400);
            // }
            ApiSuccess.ok("User authenticated successfully", result).send(res);
        } catch (error) {
            throw new AppError("Internal Server Error", 500);
        }
    }
}

const authController = new AuthController();
export default authController;