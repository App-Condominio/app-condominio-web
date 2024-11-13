// pages/api/verifyToken.ts
import { admin } from "@/config/firebaseAdmin";

export default async function handler(req, res) {
  const {
    authToken: { value },
  } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(value);
    res.status(200).json(decodedToken);
  } catch (error) {
    res.status(400).json({ error: "Invalid token" });
  }
}
