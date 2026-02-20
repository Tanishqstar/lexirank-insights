import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    if (!url) {
      return new Response(
        JSON.stringify({ error: "URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Step 1: Fetch the page content
    console.log("Fetching URL:", url);
    let pageContent = "";
    let pageTitle = "";
    try {
      const pageRes = await fetch(url, {
        headers: { "User-Agent": "LexiRank-Bot/1.0" },
        redirect: "follow",
      });
      const html = await pageRes.text();

      // Extract title
      const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      pageTitle = titleMatch?.[1]?.trim() || "";

      // Extract text content: strip scripts/styles, then tags
      pageContent = html
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 15000); // Limit to ~15k chars for the AI prompt

      // Also extract meta description and h1 for SEO context
      const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
      const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      const imgAltMissing = (html.match(/<img(?![^>]*alt=)[^>]*>/gi) || []).length;
      const imgTotal = (html.match(/<img[^>]*>/gi) || []).length;
      const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*>/i);

      // Append HTML audit context
      pageContent += `\n\n--- HTML AUDIT CONTEXT ---\nPage title tag: ${pageTitle || "MISSING"}\nMeta description: ${metaDescMatch?.[1] || "MISSING"}\nH1 tag: ${h1Match?.[1]?.replace(/<[^>]+>/g, "").trim() || "MISSING"}\nImages without alt: ${imgAltMissing} of ${imgTotal}\nCanonical tag: ${canonicalMatch ? "Present" : "MISSING"}`;
    } catch (fetchErr) {
      console.error("Failed to fetch URL:", fetchErr);
      return new Response(
        JSON.stringify({ error: `Could not fetch the URL: ${fetchErr.message}` }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 2: Send to Lovable AI for analysis using tool calling for structured output
    console.log("Sending to AI for analysis...");
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are an expert SEO and content readability auditor. Analyze the provided webpage content and return a structured audit. Be specific and actionable in your findings. Score readability and SEO from 0-100. The overall score should be a weighted average (40% readability, 60% SEO). Determine a reading level like "Grade 8 — Good" or "Grade 12 — Difficult". Extract at least 10-15 of the top keywords and key phrases (both single words and multi-word phrases) with their approximate density percentage. Include long-tail keywords and semantic variations. List specific, actionable findings with priorities.`,
          },
          {
            role: "user",
            content: `Analyze this webpage content for SEO and readability issues:\n\nURL: ${url}\n\n${pageContent}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_audit_results",
              description: "Return the structured SEO and readability audit results",
              parameters: {
                type: "object",
                properties: {
                  overall_score: { type: "number", description: "Overall score 0-100" },
                  readability_score: { type: "number", description: "Readability score 0-100" },
                  seo_score: { type: "number", description: "SEO score 0-100" },
                  readability_level: { type: "string", description: "e.g. Grade 8 — Good" },
                  keywords: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        term: { type: "string" },
                        density: { type: "string", description: "e.g. 2.4%" },
                      },
                      required: ["term", "density"],
                      additionalProperties: false,
                    },
                  },
                  findings: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: { type: "string", enum: ["SEO", "Readability"] },
                        issue_description: { type: "string" },
                        priority: { type: "string", enum: ["High", "Medium", "Low"] },
                      },
                      required: ["type", "issue_description", "priority"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["overall_score", "readability_score", "seo_score", "readability_level", "keywords", "findings"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_audit_results" } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", status, errText);
      throw new Error(`AI analysis failed (${status})`);
    }

    const aiData = await aiResponse.json();
    console.log("AI response received");

    // Extract the tool call arguments
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("AI did not return structured results");
    }

    const auditResult = JSON.parse(toolCall.function.arguments);

    // Add IDs to findings
    auditResult.findings = (auditResult.findings || []).map((f: any, i: number) => ({
      ...f,
      id: String(i + 1),
    }));

    return new Response(
      JSON.stringify({ success: true, data: { ...auditResult, url } }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("analyze-url error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
