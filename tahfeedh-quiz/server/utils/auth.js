import axios from "axios";

let ACCESS_TOKEN = null;
let EXPIRES_AT = 0;

export async function getAccessToken() {
  const now = Date.now();
  if (ACCESS_TOKEN && now < EXPIRES_AT) return ACCESS_TOKEN;

  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  try {
    const res = await axios({
      method: "post",
      url: "https://prelive-oauth2.quran.foundation/oauth2/token",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: "grant_type=client_credentials&scope=content",
    });

    ACCESS_TOKEN = res.data.access_token;
    EXPIRES_AT = now + (res.data.expires_in - 30) * 1000; // 30s safety
    return ACCESS_TOKEN;
  } catch (err) {
    console.error("Error getting access token:", err.response?.data || err.message);
    throw err;
  }
}
