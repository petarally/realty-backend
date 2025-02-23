import express from "express";
import { getPretplatnici } from "../controllers/pretplatnici.js";

const router = express.Router();

router.get("/", getPretplatnici);

export default router;
