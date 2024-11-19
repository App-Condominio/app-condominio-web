// pages/api/verifyToken.ts

export default async function handler(req, res) {
  const { token } = req.body;
  const message = {
    to: token,
    sound: "default",
    title: "Nova encomenda",
    body: "Olá Tiago, você tem uma nova encomenda para buscar!",
    data: { url: "/settings" },
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
}
