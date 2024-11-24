import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { token, title, description, urlToNavigate } = req.body;

  if (!token) {
    res
      .status(401)
      .json({ error: "You're not allowed to access this resource." });
  }

  if (!title || !description || !urlToNavigate) {
    res.status(400).json({ error: "Required fields are missing." });
  }

  try {
    const message = {
      to: token,
      sound: "default",
      title,
      body: description,
      data: { url: urlToNavigate },
    };

    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
}
