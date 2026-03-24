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
  'pixar-animals': `Pixar-quality 3D animated cute animal character, Disney/Pixar movie animation style, soft volumetric lighting, big expressive eyes full of emotion, vibrant saturated colors, cinematic composition, hyper-detailed soft fur or feathers, Pixar movie quality CGI render, adorable but emotionally deep. IMPORTANT: Use the SAME cute animal character across ALL slides — same species, same fur/feather color, same size, same distinctive features. The character must be clearly recognizable as the same individual throughout the entire carousel. NO humans in any slide.`,
  'iphone-mirror': `Hyper-realistic iPhone 16 Pro mirror selfie photograph, natural bathroom or bedroom mirror, realistic human skin texture with visible pores and natural imperfections, warm indoor lighting, slight phone flash lens flare visible, Instagram-quality candid raw selfie aesthetic. Person looks completely real and human — NOT AI generated. Authentic and emotional. IMPORTANT: Use the SAME person across ALL slides — same gender, same ethnicity, same hair color/style, same approximate age, same facial features. The person must be clearly recognizable as the same individual throughout the entire carousel. Pick either male OR female and stay consistent.`,
  'inspirational-sunsets': `Breathtaking sunset landscape photograph, professional DSLR 8K quality, warm rich color grading, emotionally uplifting and awe-inspiring vista. IMPORTANT: NO people, NO humans, NO characters, NO silhouettes of people in ANY slide. Only natural landscape elements: sky, clouds, water, mountains, fields, trees, horizon. Each slide should feature a different stunning sunset scene — ocean sunset, mountain sunset, desert sunset, meadow sunset, lake reflection sunset. Dramatic sky with vivid orange pink and purple clouds, god rays breaking through clouds.`,
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

        // Randomize story structure to prevent repetitive outputs
        const STORY_ANGLES = [
          { name: 'confession', arc: 'Confession → Shame spiral → Rock bottom moment → The ugly first week → CTA', hook: 'Start with a specific shameful confession nobody admits out loud' },
          { name: 'letter-to-past', arc: 'Letter to past self → What you didn\'t know → The moment you wish you could undo → What you\'d say now → CTA', hook: 'Write the opening line of a letter to your past self' },
          { name: 'last-time', arc: 'The last time I used → What happened next → The hospital/police/wake-up → 6 months later → CTA', hook: 'Describe a hyper-specific "last time" scene with sensory detail' },
          { name: 'things-nobody-tells', arc: '5 things nobody tells you → Truth #1 (body) → Truth #2 (relationships) → Truth #3 (identity) → CTA', hook: 'Open with "Nobody warned me about..." and name something unexpected' },
          { name: 'timeline', arc: 'Day 1 → Day 30 → Day 90 → Day 365 → CTA', hook: 'Start with a visceral Day 1 scene — shaking hands, cold sweat, clock watching' },
          { name: 'comparison', arc: 'Saturday night then → Sunday morning then → Saturday night now → Sunday morning now → CTA', hook: 'Paint a vivid "then" scene with specific ugly details' },
          { name: 'relationship', arc: 'What they saw → What I hid → The conversation that broke me → Earning trust back → CTA', hook: 'Start with what someone you love said to you at your worst' },
          { name: 'money', arc: 'Monthly cost of addiction → What I lost → The final receipt → What I spend it on now → CTA', hook: 'Open with a specific dollar amount or financial gut punch' },
        ];

        const angle = STORY_ANGLES[Math.floor(Math.random() * STORY_ANGLES.length)];
        const randomSeed = Math.floor(Math.random() * 100000);

        // Style-specific scene instructions
        const SCENE_INSTRUCTIONS: Record<string, string> = {
          'pixar-animals': 'ALL scenes must feature the SAME cute animated animal character (pick ONE specific animal — e.g., a small brown rabbit, a golden retriever puppy, a tiny grey kitten). Describe this exact same character in every scene description. NO humans.',
          'iphone-mirror': 'ALL scenes must feature the SAME person taking iPhone mirror selfies. Pick ONE specific person (gender, approximate age, hair color/style, ethnicity) and describe them consistently in EVERY scene. The person should look identical across all 5 slides.',
          'inspirational-sunsets': 'ALL scenes must be ONLY sunset landscapes. NO people, NO humans, NO characters, NO silhouettes. Only natural elements: sky, clouds, water, mountains, fields, trees. Each slide should be a different breathtaking sunset location.',
        };

        const sceneInstr = SCENE_INSTRUCTIONS[styleId] || '';

        const storyPrompt = `You write recovery content that sounds like it came from a real person's Instagram story at 2am — not a brand, not a therapist, not AI. Raw. Unpolished. Real.

NICHE: ${nicheCtx}

YOUR STORY ANGLE (use this exact structure): ${angle.name.toUpperCase()}
Arc: ${angle.arc}
Hook approach: ${angle.hook}

Randomization seed (use this to vary your creative choices): ${randomSeed}

RULES:
- Max 12 words per slide text. Fragments > full sentences. How people actually text, not how they write essays.
- NO clichés: banned phrases include "one day at a time", "recovery is a journey", "you are not alone", "it gets better", "rock bottom", "breaking free", "chose life", "found the light". If you've seen it on a motivational poster, don't use it.
- Be NICHE-SPECIFIC. A gambling slide should mention specific gambling details (parlay bets, the slots sound, the app notification). An alcohol slide should mention specific drinking details (the wine bottle hidden in the closet, the mouthwash before work). Generic recovery talk = failure.
- Slide 5 text MUST be exactly: "Quit today with the Sunflower Sober app 🌻"
- Write like a human who's lived it. Typo-free but conversational.
- Each generation should feel completely different from any other. Vary the specific details, emotions, scenes, and word choices.

${sceneInstr ? `IMAGE SCENE RULES: ${sceneInstr}` : ''}

Return ONLY valid JSON:
{"title":"carousel title","slides":[{"text":"overlay text","scene":"detailed image scene description"}]}`;

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

The text must be the focal point, large, centered, and clearly readable on mobile. White text with thick black outline. The background scene should support the emotional message. 3:4 portrait aspect ratio for Instagram/TikTok carousel.

This is slide ${i + 1} of 5 in a carousel series. Visual consistency across all slides is critical.`;

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
