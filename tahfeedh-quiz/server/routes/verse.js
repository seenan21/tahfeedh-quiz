import { Router } from "express";
import axios from "axios";
import { getAccessToken } from "../utils/auth.js";

const router = Router();
const API_BASE = "https://api.quran.com/api/v4/verses/by_key";

// Fetch only Arabic text of a verse
async function fetchVerse(key) {
  const token = await getAccessToken();
  const res = await axios.get(`${API_BASE}/${key}`, {
    params: { words: false, translations: "", fields: "text_uthmani" },
    headers: { "x-auth-token": token, "x-client-id": process.env.CLIENT_ID },
  });
  return res.data.verse.text_uthmani;
}

// Get last verse number of a chapter
async function getLastVerseNumber(chapter) {
  const token = await getAccessToken();
  const res = await axios.get(`https://api.quran.com/api/v4/chapters/${chapter}`, {
    headers: { "x-auth-token": token, "x-client-id": process.env.CLIENT_ID },
  });
  return res.data.chapter.verses_count;
}

// Get next/prev verse key
async function getAdjacentVerseKey(chapter, verse, direction = "next") {
  const token = await getAccessToken();
  const adjVerse = direction === "next" ? verse + 1 : verse - 1;
  let key = `${chapter}:${adjVerse}`;

  try {
    await axios.get(`${API_BASE}/${key}`, {
      headers: { "x-auth-token": token, "x-client-id": process.env.CLIENT_ID },
    });
    return key;
  } catch {
    // cross-chapter
    const chapterAdj = direction === "next" ? chapter + 1 : chapter - 1;
    if (chapterAdj < 1 || chapterAdj > 114) return null;
    const verseNum = direction === "next" ? 1 : await getLastVerseNumber(chapterAdj);
    return `${chapterAdj}:${verseNum}`;
  }
}

router.get("/", async (req, res) => {
  try {
    const chapter = Number(req.query.chapter);
    const verse = Number(req.query.verse);

    // Main verse
    const main = await fetchVerse(`${chapter}:${verse}`);

    // Next 2
    const nextKeys = [];
    const next1 = await getAdjacentVerseKey(chapter, verse, "next");
    if (next1) nextKeys.push(await fetchVerse(next1));

    if (next1) {
      const [c, v] = next1.split(":").map(Number);
      const next2 = await getAdjacentVerseKey(c, v, "next");
      if (next2) nextKeys.push(await fetchVerse(next2));
    }

    // Prev 2
    const prevKeys = [];
    const prev1 = await getAdjacentVerseKey(chapter, verse, "prev");
    if (prev1) prevKeys.push(await fetchVerse(prev1));

    if (prev1) {
      const [c, v] = prev1.split(":").map(Number);
      const prev2 = await getAdjacentVerseKey(c, v, "prev");
      if (prev2) prevKeys.push(await fetchVerse(prev2));
    }

    if (prevKeys.length === 2) {
      prevKeys.reverse();
    }


    res.json({ main, next2: nextKeys, prev2: prevKeys });
  } catch (err) {
    console.error("Error fetching verse:", err.response?.data || err.message);
    res.status(500).json({ error: "Server failed to fetch verse" });
  }
});

export default router;
