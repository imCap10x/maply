const SYSTEM_PROMPT = `You convert notes, articles, or syllabus text into a structured mind map.

Return ONLY valid JSON, no markdown fences, no preamble, matching this exact shape:

{
  "title": "Short root topic (max 4 words)",
  "children": [
    {
      "label": "Main branch (max 5 words)",
      "children": [
        {
          "label": "Sub-point (max 6 words)",
          "children": [
            { "label": "Detail (max 8 words)", "children": [] }
          ]
        }
      ]
    }
  ]
}

Rules:
- Max depth: 4 levels (root + 3).
- Max 6 main branches off the root.
- Max 5 children per node.
- Keep every label short and scannable, like a mind map node, not a sentence.
- Do not lose important concepts — compress wording, not meaning.
- Output strictly valid JSON. No trailing commas, no comments.`;

export async function POST(req) {
  try {
    const { text } = await req.json();

    if (!text || text.trim().length < 20) {
      return Response.json(
        { error: "Please provide a bit more text — at least a few sentences." },
        { status: 400 }
      );
    }

    const truncated = text.slice(0, 15000); // keep prompt within safe bounds

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "Server is missing GROQ_API_KEY. Add it in your hosting environment variables." },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 2000,
        temperature: 0.4,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: truncated },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return Response.json(
        { error: `AI request failed: ${errText.slice(0, 200)}` },
        { status: 502 }
      );
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content ?? "";
    const cleaned = raw.replace(/```json|```/g, "").trim();

    let tree;
    try {
      tree = JSON.parse(cleaned);
    } catch (e) {
      return Response.json(
        { error: "Couldn't parse the AI's response. Try again." },
        { status: 502 }
      );
    }

    return Response.json({ tree });
  } catch (err) {
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
