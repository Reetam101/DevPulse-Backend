import { AppError } from "../middlewares/error.middleware";
import { User } from "../models/User.model";
import axios from "axios";

class AuthService {
    public handleGithubCallback = async (code: string) => {
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
                Accept: "application/vnd.github+json"
            }
        });
        console.log(userResponse.data)
        const {
            id: githubId,
            login: username,
            name: displayName,
            avatar_url: avatar,
            html_url: profileUrl,
            email
        } = userResponse.data;

        let userEmail = email;
        if (!userEmail) {
            const emailsResponse = await axios.get('https://api.github.com/user/emails', {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                    Accept: 'application/vnd.github+json'
                }
            });
            console.log("email Response: ", emailsResponse)
            const primaryEmail = emailsResponse.data.find((email: any) => email.primary);
            userEmail = primaryEmail ? primaryEmail.email : null;
        }

        let user = await User.findOne({ githubId });
        console.log(user);
        if (!user) {
            user = await User.create({
                email: userEmail,
                name: displayName,
                avatar,
                githubId,
                githubUsername: username,
                githubAccessToken: access_token,
                userType: "github",
                lastLoginAt: new Date()
            });
        } else {
            user = await User.findOneAndUpdate({ githubId }, {
                name: displayName,
                avatar: avatar,
                githubAccessToken: access_token,
                lastLoginAt: new Date()
            }, { new: true })
        }

        return user;
    }
}

const authService = new AuthService();
export default authService;