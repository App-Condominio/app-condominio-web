export const sendPushNotification = async <T>(payload: T) => {
  await fetch("/api/pushNotifications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
};
