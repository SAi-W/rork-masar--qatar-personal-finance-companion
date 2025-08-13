import { ENV } from "../env";
import { TRPCError } from "@trpc/server";

type Msg = { role: "system"|"user"|"assistant"; content: string };

async function call(model: string, messages: Msg[]) {
  const res = await fetch(`${ENV.OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${ENV.OPENROUTER_API_KEY}`,
      "HTTP-Referer": ENV.APP_URL ?? "https://masar.app",
      "X-Title": "Masar AI Coach",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.3,
      max_tokens: 800,
    }),
  });
  
  if (!res.ok) {
    let body = "";
    try { body = JSON.stringify(await res.json()); } catch {}
    throw new TRPCError({ 
      code: "BAD_REQUEST", 
      message: `AI ${model} ${res.status}: ${body || res.statusText}` 
    });
  }
  
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content as string | undefined;
  if (!text) {
    throw new TRPCError({ 
      code: "BAD_REQUEST", 
      message: `AI ${model} returned no content` 
    });
  }
  return text;
}

export async function chatOpenRouter(messages: Msg[]) {
  // Retry Kimi free (2x) then fallback model once.
  const attempt = async () => call(ENV.AI_MODEL, messages);
  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
  
  for (let i = 0; i < 2; i++) {
    try { 
      return await attempt(); 
    } catch (e: any) {
      // 429/529/over capacity – short backoff then retry
      if (String(e?.message).match(/\b(429|rate|capacity|timeout|529)\b/i)) {
        await sleep(800 * (i + 1));
      } else {
        break;
      }
    }
  }
  
  // Fallback
  return call(ENV.AI_MODEL_FALLBACK, messages);
}
