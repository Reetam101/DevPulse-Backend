import authController from "../controllers/auth.controller";
import { Router } from "express";

const router = Router();

router.get('/github', authController.redirectToGithubAuth);
router.get("/github/callback", authController.handleGithubCallback);

export default router;