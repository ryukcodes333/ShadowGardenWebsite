import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import profileRouter from "./profile.js";
import leaderboardRouter from "./leaderboard.js";
import cardsRouter from "./cards.js";
import chatRouter from "./chat.js";
import statsRouter from "./stats.js";
import animeRouter from "./anime.js";
import pokemonRouter from "./pokemon.js";
import groqRouter from "./groq.js";
import otpRouter from "./otp.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(otpRouter);
router.use(profileRouter);
router.use(leaderboardRouter);
router.use(cardsRouter);
router.use(chatRouter);
router.use(statsRouter);
router.use(animeRouter);
router.use(pokemonRouter);
router.use(groqRouter);

export default router;
