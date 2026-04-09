import { GoogleGenerativeAI } from "@google/generative-ai";

let genAIInstance = null;
const getGenAI = () => {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!genAIInstance) {
    genAIInstance = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAIInstance;
};

class RateLimitedQueue {
  constructor(requestsPerMinute = 12) {
    this.queue = [];
    this.interval = (60 * 1000) / requestsPerMinute;
    this.processing = false;
  }

  add(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      if (!this.processing) this._process();
    });
  }

  async _process() {
    this.processing = true;
    while (this.queue.length > 0) {
      const { fn, resolve, reject } = this.queue.shift();
      try {
        resolve(await fn());
      } catch (e) {
        reject(e);
      }
      if (this.queue.length > 0) {
        await new Promise((res) => setTimeout(res, this.interval));
      }
    }
    this.processing = false;
  }
}

const geminiQueue = new RateLimitedQueue(12); // 12 RPM — safely under free-tier 15 RPM


async function callWithRetry(fn, retries = 3, baseDelay = 2000) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const is429 = err?.message?.includes("429");
      const isLastAttempt = attempt === retries;

      if (is429 && !isLastAttempt) {
        const delay = baseDelay * Math.pow(2, attempt); // 2s → 4s → 8s
        console.warn(`[AI] Rate limited. Retrying in ${delay}ms... (attempt ${attempt + 1}/${retries})`);
        await new Promise((res) => setTimeout(res, delay)); // wait loop for 2s, 4s, 8s
      } else {
        throw err; // non-429 error or out of retries
      }
    }
  }
}

async function callGemini(prompt) {
  const genAI = getGenAI();
  if (!genAI) return null;

  return geminiQueue.add(() =>
    callWithRetry(async () => {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    })
  );
}

export async function generateTags(fileName, mimeType, extension) {
  const prompt = `You are a document management assistant. Analyze the following file metadata and generate relevant tags.

File name: "${fileName}"
MIME type: "${mimeType}"
Extension: "${extension}"

Rules:
- Return ONLY a valid JSON array of strings (no explanation, no markdown, no extra text)
- Generate 3 to 5 tags maximum
- Tags must be lowercase, single words or short hyphenated phrases (e.g. "invoice", "tax-report")
- Tags should reflect the document's likely category, purpose, or type
- Be specific and useful for search/filtering

Example output: ["invoice", "finance", "tax", "2024"]

Output:`;

  try {
    const text = await callGemini(prompt);
    if (!text) return [];

    const match = text.match(/\[[\s\S]*?\]/);
    if (!match) return [];

    const tags = JSON.parse(match[0]);
    if (!Array.isArray(tags)) return [];

    return tags
      .filter((t) => typeof t === "string" && t.trim())
      .map((t) => t.toLowerCase().trim())
      .slice(0, 5);
  } catch (err) {
    console.error("[AI] generateTags failed:", err?.message);
    return [];
  }
}

export async function generateSummary(fileName, mimeType, extension, size) {
  const sizeLabel = size
    ? size < 1024
      ? `${size} bytes`
      : size < 1024 * 1024
        ? `${(size / 1024).toFixed(1)} KB`
        : `${(size / (1024 * 1024)).toFixed(1)} MB`
    : "unknown size";

  const prompt = `You are a document management assistant. Based only on the following file metadata, write a concise, helpful 2–3 sentence description of what this document likely contains and its purpose.

File name: "${fileName}"
MIME type: "${mimeType}"
Extension: "${extension}"
File size: "${sizeLabel}"

Rules:
- Write in plain English, professional tone
- Do NOT say "I think" or "probably" — be direct and confident
- Do NOT mention that you are inferring from metadata
- Keep it under 60 words
- Return ONLY the description text, no headers or formatting

Output:`;

  try {
    const text = await callGemini(prompt);
    return text ?? "";
  } catch (err) {
    console.error("[AI] generateSummary failed:", err?.message);
    return "";
  }
}