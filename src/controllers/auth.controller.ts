import { AppError } from "../middlewares/error.middleware";
import { Request, Response, NextFunction } from "express"
import axios from "axios";

class AuthController {

    public redirectToGithubAuth = (req: Request, res: Response, next: NextFunction) => {
        try {
            const state = Math.random().toString(36).substring(7);

            (req.session as any).oauthState = state;

            const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.GITHUB_CALLBACK_URL}&scope=user:email,repo,read:org&state=${state}`;

            res.redirect(githubAuthUrl);
        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    public handleGithubCallback = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const { code, state } = req.query;

            if (!code || !state) {
                throw new AppError("Invalid request", 400);
            }

            if (state !== (req.session as any).oauthState) {
                throw new AppError("Invalid state parameter", 400);
            }

            const tokenResponse = await axios.post("https://github.com/login/oauth/access_token", {
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code: code as string,
                redirect_uri: process.env.GITHUB_CALLBACK_URL,
            }, {
                headers: {
                    Accept: "application/json"
                }
            });

            const { access_token } = tokenResponse.data;

            if (!access_token) {
                throw new AppError("Failed to retrieve access token", 500);
            }

            const userResponse = await axios.get("https://api.github.com/user", {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                    Accept: "application/json"
                }
            });
            console.log(userResponse.data)
            return res.status(200).json({
                success: true,
                message: "User authenticated successfully",
                data: userResponse.data
            });
        } catch (error) {
            next(error);
        }
    }
}

const authController = new AuthController();
export default authController;