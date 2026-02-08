import express from "express";
import { getTrashedDocs } from "../controllers/trashController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/trash", protect, getTrashedDocs);

export default router;
