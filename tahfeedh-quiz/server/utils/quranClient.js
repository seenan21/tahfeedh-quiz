import axios from "axios";

let accessToken = null;
let tokenExpiry = 0;

export async function getAccessToken() {
  const now = Date.now();

  if (accessToken && now < tokenExpiry) {
    return accessToken;
  }

  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;

  const resp = await axios.post("https://api.quran.com/oauth/token", {
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret
  });

  accessToken = resp.data.access_token;
  tokenExpiry = now + resp.data.expires_in * 1000 - 60000; // refresh 1 min early
  return accessToken;
}

export async function fetchVerse(verseKey, options = {}) {
  const token = await getAccessToken();
  const clientId = process.env.CLIENT_ID;

  const params = new URLSearchParams();

  if (options.language) params.append("language", options.language);
  if (options.words !== undefined) params.append("words", options.words);
  if (options.translations) params.append("translations", options.translations);
  if (options.audio) params.append("audio", options.audio);
  if (options.tafsirs) params.append("tafsirs", options.tafsirs);
  if (options.word_fields) params.append("word_fields", options.word_fields);
  if (options.translation_fields) params.append("translation_fields", options.translation_fields);
  if (options.fields) params.append("fields", options.fields);

  const url = `https://api.quran.com/v1/verses/by_key/${verseKey}?${params.toString()}`;

  const response = await axios.get(url, {
    headers: {
      "x-auth-token": token,
      "x-client-id": clientId
    }
  });

  return response.data;
}
