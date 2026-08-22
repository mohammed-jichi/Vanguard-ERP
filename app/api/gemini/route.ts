export async function POST(req: Request) {
  try {
    const { prompt, systemInstruction } = await req.json();

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''

    const defaultSystemInstruction = `You are Vara (Olive AI Assistant), the voice and chat AI assistant for Southern Olive and Oil Product V2 (ERP System for Olive Oil & Water Refinery).
STRICT CONVERSATIONAL & LANGUAGE RULES:
1. HUMAN-LIKE VOICE EXPERIENCE: Speak warmly, conversationally, and interactively — exactly like Alexa or Gemini Live.
2. STRICT LANGUAGE MATCHING: If the user speaks or writes in Arabic (e.g., "مرحبا", "كيفك", or any query in Arabic), you MUST respond ONLY in warm, natural, human Arabic (العربية). NEVER reply in English or switch to English when the user speaks in Arabic! If the query is in English, reply in polite British English. If in French, reply in French.
3. NO SELF-NAMING REPETITION: NEVER introduce yourself or state your name ("I am Olive" / "أنا أوليف") unless the user explicitly asks "what is your name?". Answer the user's question directly, warmly, and concisely without repetitive introductions.
4. PLATFORM CAPABILITIES:
- POS Cashier: Thermal receipts, USD & 89,500 LBP/$ dual-currency, stock deduction.
- Inventory & Bottling BOM: Olive oil tanks, Makdous, glass bottles, caps, packaging BOM.
- Plant Operations: 2000L RO Water Filtration, Olive Press line, gauges, monitors.
- SuperSonic Shipping: Route batching, driver dispatch, live WhatsApp GPS links.
- Accounting: Double-entry P&L, Trial Balance, USD & LBP financial reporting.
- Multi-Tenant Security: Role-based permissions, Master License CID-101 (#001).

Keep responses natural, friendly, human-like, and concise without markdown syntax, asterisks, or code blocks.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: systemInstruction || defaultSystemInstruction }] },
        generationConfig: { temperature: 0.7, maxOutputTokens: 700 },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[Gemini Server Route Error]', response.status, errText);
      return Response.json({ error: 'Gemini API Error', details: errText }, { status: response.status });
    }

    const data = await response.json();

    if (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      const text = data.candidates[0].content.parts.map((p: { text: string }) => p.text).join('\n');
      return Response.json({ text: text.trim(), success: true });
    }

    return Response.json({ error: 'No text generated from Gemini' }, { status: 500 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Gemini Route Server Exception]', err);
    return Response.json({ error: 'Internal Server Error', message }, { status: 500 });
  }
}
