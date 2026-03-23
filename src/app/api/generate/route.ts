import { NextRequest } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

const NICHE_CONTEXT: Record<string, string> = {
  'general-sobriety': 'general sobriety and recovery — healing journeys, sober milestones, rebuilding life',
  'alcohol': 'alcohol addiction — wine mom culture lies, hangover mornings vs sober mornings, the "just one drink" trap',
  'gambling': 'gambling addiction — chasing losses, sports betting destroying lives, financial ruin',
  'meth': 'meth addiction — destruction, psychosis, before/after transformation, rebuilding',
  'heroin': 'heroin/opioid addiction — rock bottom, Narcan saves, losing friends to overdose',
  'mdma': 'MDMA/party drug addiction — serotonin depletion, rave culture exit, fake vs real happiness',
  'cannabis': 'cannabis dependency — brain fog lifting, motivation returning, "it\'s just weed" gaslighting',
  'cocaine': 'cocaine addiction — fake confidence, bathroom stall confessions, 4am existential dread',
  'fentanyl': 'fentanyl crisis — friends dying from one pill, carrying Narcan, losing a generation',
};

const STYLE_PROMPTS: Record<string, string> = {
  'pixar-animals': `Pixar-quality 3D animated cute animal character, Disney/Pixar movie animation style, soft volumetric lighting, big expressive eyes full of emotion, vibrant saturated colors, cinematic composition, hyper-detailed soft fur or feathers, Pixar movie quality CGI render, adorable but emotionally deep.`,
  'iphone-mirror': `Hyper-realistic iPhone 16 Pro mirror selfie photograph, natural bathroom or bedroom mirror, realistic human skin texture with visible pores and natural imperfections, warm indoor lighting, slight phone flash lens flare visible, Instagram-quality candid raw selfie aesthetic. Person looks completely real and human — NOT AI generated. Authentic and emotional.`,
  'inspirational-sunsets': `Breathtaking golden hour sunset landscape photograph, dramatic sky with vivid orange pink and purple clouds, silhouetted horizon with ocean or mountains or open field, professional DSLR 8K quality, warm rich color grading, god rays breaking through clouds, emotionally uplifting and awe-inspiring vista.`,
};

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(data: Record<string, unknown>) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }

      try {
        const { niche, styleId } = await req.json();
        const nicheCtx = NICHE_CONTEXT[niche] || 'addiction recovery';
        const stylePrompt = STYLE_PROMPTS[styleId] || STYLE_PROMPTS['pixar-animals'];

        // Step 1: Generate story text
        send({ progress: 5 });

        const storyPrompt = `You are an elite direct-response copywriter specializing in addiction recovery content that stops the scroll and gets saved/shared. You write like Gary Halbert meets modern TikTok — raw, specific, emotionally precise.

Create a 5-slide Instagram/TikTok carousel for: ${nicheCtx}.

COPYWRITING RULES (follow these exactly):
- Lead with pain or desire. Never open generic.
- Use SPECIFIC details: numbers, timelines, scenes, sensory details. "Day 47 in a parking lot at 2am" beats "Early recovery is hard."
- Write how real people talk, not how brands talk. No corporate wellness speak.
- Every line's job is to make them read the next slide.
- NO typos. NO grammatical errors. Proofread every word.
- Keep text SHORT — max 15 words per slide overlay. Punchy. Instagram-story style.

HOOK FORMULAS (use one for Slide 1):
- Controversial truth: "Nobody talks about this side of sobriety"
- Specific number: "Day 47 is when everything changed"  
- Pattern interrupt: "Stop saying 'I'm fine' when you're dying inside"
- Identity shift: "You're not broken. You got hurt and found the wrong medicine."
- Before/after gap: "I went from [dark specific] to [light specific]"

STORY ARC:
- Slide 1: HOOK — scroll-stopping opening line. Bold, specific, emotional. Use a hook formula above.
- Slide 2: PAIN — name the exact pain with vivid sensory detail. Make them feel seen. "The 3am ceiling stare when your body won't let you sleep."
- Slide 3: TURNING POINT — the moment of shift. Specific, not generic. A real scene, a real decision, a real conversation.
- Slide 4: GROWTH — what recovery actually looks like. Not "everything is perfect" but honest progress. Real, relatable, earned.
- Slide 5: CTA — the text MUST be exactly: "Quit today with the Sunflower Sober app 🌻" (use this EXACT text, do not change a single word)

For each slide, also describe the background scene/image in vivid detail.

Return ONLY valid JSON (no markdown fences):
{
  "title": "Carousel title",
  "slides": [
    {"text": "The bold overlay text (max 15 words, punchy)", "scene": "Detailed background image description"}
  ]
}

QUALITY CHECK before returning:
- Is Slide 1 a genuine scroll-stopper? Would YOU stop scrolling?
- Is every slide specific, not generic? No "recovery is a journey" clichés.
- Does the story flow naturally from hook → pain → turning point → growth → CTA?
- Is Slide 5 text EXACTLY "Quit today with the Sunflower Sober app 🌻"?
- Zero typos?`;

        const storyRes = await fetch(
          `${BASE_URL}/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: storyPrompt }] }],
              generationConfig: { temperature: 0.95, maxOutputTokens: 2048 },
            }),
          }
        );

        if (!storyRes.ok) {
          send({ error: 'Failed to generate story: ' + (await storyRes.text()).slice(0, 200) });
          controller.close();
          return;
        }

        const storyData = await storyRes.json();
        const storyText = storyData.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const cleaned = storyText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        let story: { title: string; slides: Array<{ text: string; scene: string }> };
        try {
          story = JSON.parse(cleaned);
        } catch {
          send({ error: 'Failed to parse story' });
          controller.close();
          return;
        }

        send({
          progress: 10,
          storyTitle: story.title,
          slideTexts: story.slides.map(s => s.text),
        });

        // Step 2: Generate images using Imagen 4
        const images: string[] = [];

        for (let i = 0; i < Math.min(5, story.slides.length); i++) {
          const slide = story.slides[i];
          send({ progress: 10 + (i * 18) });

          const imagePrompt = `${stylePrompt}

Scene: ${slide.scene}

IMPORTANT: Display this text prominently on the image in large bold white letters with a strong black outline/stroke for readability: "${slide.text}"

The text must be the focal point, large, centered, and clearly readable on mobile. White text with thick black outline. The background scene should support the emotional message. 3:4 portrait aspect ratio for Instagram/TikTok carousel.`;

          let imageData: string | null = null;

          // Try Imagen 4 (paid, best quality)
          try {
            const imgRes = await fetch(
              `${BASE_URL}/models/imagen-4.0-generate-001:predict?key=${GEMINI_API_KEY}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  instances: [{ prompt: imagePrompt }],
                  parameters: {
                    sampleCount: 1,
                    aspectRatio: '3:4',
                    personGeneration: 'allow_all',
                  },
                }),
              }
            );

            if (imgRes.ok) {
              const data = await imgRes.json();
              if (data.predictions?.[0]?.bytesBase64Encoded) {
                imageData = `data:image/png;base64,${data.predictions[0].bytesBase64Encoded}`;
              }
            } else {
              console.error(`Imagen 4 slide ${i + 1}:`, (await imgRes.text()).slice(0, 300));
            }
          } catch (e) {
            console.error(`Imagen 4 slide ${i + 1} error:`, e);
          }

          // Fallback: Gemini native image generation
          if (!imageData) {
            try {
              const fbRes = await fetch(
                `${BASE_URL}/models/gemini-2.5-flash-preview-0514:generateContent?key=${GEMINI_API_KEY}`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    contents: [{ parts: [{ text: imagePrompt }] }],
                    generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
                  }),
                }
              );

              if (fbRes.ok) {
                const fbData = await fbRes.json();
                const parts = fbData.candidates?.[0]?.content?.parts || [];
                const imgPart = parts.find((p: Record<string, unknown>) => p.inlineData);
                if (imgPart?.inlineData) {
                  const d = imgPart.inlineData as { data: string; mimeType?: string };
                  imageData = `data:${d.mimeType || 'image/png'};base64,${d.data}`;
                }
              } else {
                console.error(`Gemini fallback slide ${i + 1}:`, (await fbRes.text()).slice(0, 300));
              }
            } catch (e) {
              console.error(`Gemini fallback slide ${i + 1} error:`, e);
            }
          }

          // Second fallback: gemini-2.5-flash-image (free tier)
          if (!imageData) {
            try {
              const fb2Res = await fetch(
                `${BASE_URL}/models/gemini-2.5-flash-image:generateContent?key=${GEMINI_API_KEY}`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    contents: [{ parts: [{ text: imagePrompt }] }],
                    generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
                  }),
                }
              );

              if (fb2Res.ok) {
                const fb2Data = await fb2Res.json();
                const parts = fb2Data.candidates?.[0]?.content?.parts || [];
                const imgPart = parts.find((p: Record<string, unknown>) => p.inlineData);
                if (imgPart?.inlineData) {
                  const d = imgPart.inlineData as { data: string; mimeType?: string };
                  imageData = `data:${d.mimeType || 'image/png'};base64,${d.data}`;
                }
              } else {
                console.error(`Gemini flash-image slide ${i + 1}:`, (await fb2Res.text()).slice(0, 300));
              }
            } catch (e) {
              console.error(`Gemini flash-image slide ${i + 1} error:`, e);
            }
          }

          images.push(imageData || '');
        }

        send({ progress: 100, images });
        controller.close();
      } catch (e) {
        console.error('Generate error:', e);
        send({ error: 'Generation failed' });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
