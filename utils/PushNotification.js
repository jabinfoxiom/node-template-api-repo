const axios = require("axios");

module.exports.sendNotification = async (
  message,
  title,
  tokens,
  type,
  objectId
) => {
  let data = JSON.stringify({
    registration_ids: tokens,
    notification: {
      body: message,
      title: title,
    },
    data: {
      id: "com.foxiom.crm",
      type: type,
      priority: "high",
      sound: "app_sound.wav",
      content_available: true,
      bodyText: message,
      organization: "CRM",
      objectId: objectId?.toString(), // Convert ObjectId to string
    },
    priority: "high",
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://fcm.googleapis.com/fcm/send",
    headers: {
      Authorization: "key=",
      "Content-Type": "application/json",
    },
    data: data,
  };

  try {
    const response = await axios.request(config);
    console.log(response?.data);
    return { data: response?.data };
  } catch (error) {
    console.log(error);
    throw { message: `FCM ERROR:${error?.response?.data}`, code: 400 };
  }
};
