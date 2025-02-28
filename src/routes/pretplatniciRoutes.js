import express from "express";
import {
  getPretplatnici,
  addPretplatnik,
} from "../controllers/pretplatnici.js";

const router = express.Router();

router.get("/", getPretplatnici);
router.post("/", addPretplatnik);

export default router;
