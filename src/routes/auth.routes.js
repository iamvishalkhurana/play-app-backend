import { Router } from "express";

const router = Router();
import { verifyMail, deliverMail } from "../controllers/user.controller.js";
router.route("/verify-mail").get(verifyMail);
router.route("/send-mail").get(deliverMail);
router.route("/failure").get((req, res) => {
  res.send("Something went wrong");
});
router.route("/success").get((req, res) => {
  if (req.user) {
    res.status(200).json({
      error: false,
      message: "Successfully logged in",
      user: req.user,
    });
  } else {
    res.status(403).json({ error: true, message: "Not authorised" });
  }
});

export default router;
