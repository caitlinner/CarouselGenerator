import { NextRequest } from 'next/server';

export const maxDuration = 300;

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
  'fentanyl': 'fentanyl crisis — survival stories, awareness, losing friends to one pill',
};

const STYLE_PROMPTS: Record<string, string> = {
  'pixar-animals': `Pixar-quality 3D animated cute animal character, Disney/Pixar movie animation style, soft volumetric lighting, big expressive eyes full of emotion, vibrant saturated colors, cinematic composition, hyper-detailed soft fur or feathers, Pixar movie quality CGI render, adorable but emotionally deep. IMPORTANT: Use the SAME cute animal character across ALL slides — same species, same fur/feather color, same size, same distinctive features. The character must be clearly recognizable as the same individual throughout the entire carousel. NO humans in any slide.`,
  'iphone-mirror': `Hyper-realistic iPhone 16 Pro mirror selfie photograph, natural bathroom or bedroom mirror, realistic human skin texture with visible pores and natural imperfections, warm indoor lighting, slight phone flash lens flare visible, Instagram-quality candid raw selfie aesthetic. Person looks completely real and human — NOT AI generated. Authentic and emotional. IMPORTANT: Use the SAME person across ALL slides — same gender, same ethnicity, same hair color/style, same approximate age, same facial features. The person must be clearly recognizable as the same individual throughout the entire carousel. Pick either male OR female and stay consistent.`,
  'sunflower-fields': `Stunning sunflower field landscape photograph, professional DSLR 8K quality, warm golden tones, emotionally uplifting. IMPORTANT: NO people, NO humans, NO characters, NO silhouettes of people in ANY slide. Only sunflowers and natural elements: vast sunflower fields stretching to the horizon, golden petals, green stems and leaves, sky, clouds. Each slide should feature the SAME sunflower field setting but with a DIFFERENT sky — one with golden hour warm light, one with dramatic clouds, one with soft misty morning light, one with bright blue sky and white clouds, one with pink/purple twilight. The sunflower field is the constant; the sky mood changes per slide.`,
  'majestic-mountains': `Majestic mountain landscape photograph with lush greenery, professional DSLR 8K quality, rich natural colors, emotionally awe-inspiring. IMPORTANT: NO people, NO humans, NO characters, NO silhouettes of people in ANY slide. Only mountains and natural elements: towering peaks, green valleys, alpine meadows, forests, rivers, waterfalls, mist, clouds. Each slide should feature a different dramatic mountain scene — Swiss Alps style with green meadows, misty forest mountain road, snow-capped peaks with wildflowers, mountain lake reflection, rolling green hills with distant peaks.`,
  'inspirational-sunsets': `Breathtaking sunset landscape photograph, professional DSLR 8K quality, warm rich color grading, emotionally uplifting and awe-inspiring vista. IMPORTANT: NO people, NO humans, NO characters, NO silhouettes of people in ANY slide. Only natural landscape elements: sky, clouds, water, mountains, fields, trees, horizon. Each slide should feature a different stunning sunset scene — ocean sunset, mountain sunset, desert sunset, meadow sunset, lake reflection sunset. Dramatic sky with vivid orange pink and purple clouds, god rays breaking through clouds.`,
};

const NICHE_NAMES: Record<string, string> = {
  'general-sobriety': 'sobriety',
  'alcohol': 'alcohol/drinking',
  'gambling': 'gambling/betting',
  'meth': 'meth',
  'heroin': 'heroin/opioids',
  'mdma': 'MDMA/party drugs',
  'cannabis': 'weed/cannabis',
  'cocaine': 'cocaine',
  'fentanyl': 'fentanyl/opioids',
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
        const nicheName = NICHE_NAMES[niche] || niche;

        // Step 1: Generate story text
        send({ progress: 5 });

        // Story angles inspired by top-performing sobriety carousel content (@sobi.app style)
        // Pattern: Bold aspirational hook → Numbered positive benefits → Engagement CTA
        const STORY_ANGLES = [
          {
            name: 'smartest-choice',
            arc: 'Bold statement about quitting → Numbered benefit #1 (physical) → Numbered benefit #2 (relationships) → Numbered benefit #3 (financial/mental) → CTA with engagement question',
            hook: 'Frame quitting as the SMARTEST decision. Example: "Why Walking Away From Alcohol Was the Smartest Choice I Made". Confident, no regret, aspirational.'
          },
          {
            name: 'things-that-changed',
            arc: 'Listicle hook promising specific benefits → Numbered change #1 → Numbered change #2 → Numbered change #3 → CTA with engagement question',
            hook: 'Listicle promise. Example: "5 Things That Changed When I Stopped Drinking" or "What Nobody Tells You About Quitting Weed". Promise concrete results.'
          },
          {
            name: 'life-after',
            arc: 'Aspirational statement about life now → Numbered gain #1 (energy/health) → Numbered gain #2 (clarity/focus) → Numbered gain #3 (self-respect) → CTA with engagement question',
            hook: 'Paint the aspirational picture. "Life After [substance]" or "What 6 Months Sober Actually Looks Like". Make people WANT what you have.'
          },
          {
            name: 'your-turn',
            arc: 'Empowering direct address → Numbered reason #1 → Numbered reason #2 → Numbered reason #3 → CTA with engagement question',
            hook: 'Direct empowerment. "Your Turn to Choose Different" or "This Is Your Sign to Quit [substance]". Empowering, not preachy.'
          },
          {
            name: 'what-i-gained',
            arc: 'Flip the narrative from loss to gain → Numbered gain #1 → Numbered gain #2 → Numbered gain #3 → CTA with engagement question',
            hook: 'Reframe. "I Didn\'t Lose Anything When I Quit [substance] — Here\'s What I Gained". Focus on addition, not subtraction.'
          },
          {
            name: 'reasons-i-quit',
            arc: 'Personal honest statement → Numbered reason #1 (health) → Numbered reason #2 (people) → Numbered reason #3 (self) → CTA with engagement question',
            hook: 'Relatable honesty. "The Real Reasons I Quit [substance]" — not dramatic, just honest and specific to the addiction.'
          },
          {
            name: 'new-habits',
            arc: 'What replaced the addiction → Numbered habit #1 → Numbered habit #2 → Numbered habit #3 → CTA with engagement question',
            hook: 'Practical and aspirational. "What I Do Instead of [using substance]" or "Habits That Replaced My [substance] Addiction"'
          },
          {
            name: 'honest-truth',
            arc: 'Vulnerable but hopeful opener → Numbered truth #1 → Numbered truth #2 → Numbered truth #3 → CTA with engagement question',
            hook: 'Confession meets hope. "The Honest Truth About My [substance] Addiction" or "I Wish Someone Told Me This About [substance]"'
          },
        ];

        const angle = STORY_ANGLES[Math.floor(Math.random() * STORY_ANGLES.length)];
        const randomSeed = Math.floor(Math.random() * 100000);

        // Style-specific scene instructions
        const SCENE_INSTRUCTIONS: Record<string, string> = {
          'pixar-animals': 'ALL scenes must feature the SAME cute animated animal character (pick ONE specific animal — e.g., a small brown rabbit, a golden retriever puppy, a tiny grey kitten). Describe this exact same character in every scene description. NO humans.',
          'iphone-mirror': 'ALL scenes must feature the SAME person taking iPhone mirror selfies. Pick ONE specific person (gender, approximate age, hair color/style, ethnicity) and describe them consistently in EVERY scene.',
          'sunflower-fields': 'ALL scenes must be sunflower field landscapes with DIFFERENT SKY CONDITIONS per slide. NO people, NO humans, NO characters. Only sunflowers, fields, sky, clouds, sunlight. Vary the sky: golden hour, dramatic clouds, misty morning, bright blue, twilight pink/purple.',
          'majestic-mountains': 'ALL scenes must be majestic mountain landscapes with greenery. NO people, NO humans, NO characters. Only mountains, valleys, forests, meadows, rivers, mist. Each slide should be a different mountain scene.',
          'inspirational-sunsets': 'ALL scenes must be ONLY sunset landscapes. NO people, NO humans, NO characters, NO silhouettes. Only natural elements: sky, clouds, water, mountains, fields, trees. Each slide should be a different breathtaking sunset location.',
        };

        const sceneInstr = SCENE_INSTRUCTIONS[styleId] || '';

        const storyPrompt = `You write carousel text for addiction recovery content on TikTok and Instagram.

REFERENCE STYLE (study these examples carefully — match this EXACT tone and format):

Example carousel 1 - "Why Walking Away From Alcohol Was the Smartest Choice I Made":
- Slide 1 (HOOK): "Why Walking Away From Alcohol Was the Smartest Choice I Made" (bold, aspirational, names the substance)
- Slide 2: "1. Energy Returned" + "I stopped waking up drained. My mornings finally feel alive again."
- Slide 3: "2. Stronger Relationships" + "Without alcohol, my connections became deeper, more real, and more honest."
- Slide 4: "3. Financial Freedom" + "Money once wasted on drinks now builds my future."
- Slide 5 (CTA): "Your new life starts with small habits. Stay focused, stay free—with Sunflower Sober. 🌻" + "What's one habit that helps you stay focused on your growth?"

Example carousel 2 - "Your Turn to Choose Different":
- Slide 1 (HOOK): "Your Turn to Choose Different" + "Life only got better when I let go. If I can do it, so can you."
- Slide 2: "1. Energy Returned" + specific supporting sentence
- Slide 3: "2. Stronger Relationships" + specific supporting sentence
- Slide 4: "3. Financial Freedom" + specific supporting sentence
- Slide 5: "4. True Self-Respect" + "Sobriety taught me I don't need an escape—I need to show up for myself."

KEY STYLE RULES:
- Slide 1: Bold aspirational title that NAMES the substance/behavior. Can have a short supporting line underneath.
- Slides 2-4: Each has a SHORT NUMBERED HEADING (2-4 words, like "1. Energy Returned", "2. Stronger Relationships", "3. Financial Freedom", "4. True Self-Respect", "4. Check In With Myself"). Then a 1-2 sentence supporting line that's personal and specific.
- Slide 5 (CTA): A warm closing line mentioning Sunflower Sober app 🌻, PLUS an engagement question to drive comments.
- TONE: Positive, aspirational, first-person, benefit-focused. Like someone who's thriving in recovery sharing what got better. NOT dark, NOT confessional, NOT shame-based.
- Keep it conversational — like a real person sharing on social media, not a therapist or brand.

ADDICTION TYPE: ${nicheName}
NICHE CONTEXT: ${nicheCtx}

YOUR STORY ANGLE: ${angle.name.toUpperCase()}
Arc: ${angle.arc}
Hook approach: ${angle.hook}

Randomization seed (vary your creative choices): ${randomSeed}

SLIDE TEXT FORMAT:
- Slide 1 "text": The hook title. Can be up to ~15 words.
- Slides 2-4 "text": Format as "N. Short Heading\\n\\nSupporting sentence here." The numbered heading should be 2-4 words. The supporting sentence should be 1-2 sentences, personal and specific to ${nicheName}.
- Slide 5 "text": "Your new life starts with small habits. Stay focused, stay free—with Sunflower Sober. 🌻\\n\\n[Engagement question about recovery/growth]"

NICHE-SPECIFIC REQUIREMENT: Slides MUST reference details specific to ${nicheName}. If you swapped the addiction name, the slide should NOT make sense.

BANNED PHRASES: "one day at a time", "recovery is a journey", "you are not alone", "it gets better", "rock bottom", "breaking free", "chose life", "found the light", "believe in yourself", "light at the end", "stronger than you know", "recovery is possible", "healing journey", "your story isn't over"

${sceneInstr ? `IMAGE SCENE RULES: ${sceneInstr}` : ''}

Return ONLY valid JSON (no markdown, no code fences):
{"title":"carousel title","slides":[{"text":"slide text","scene":"detailed image scene description for AI image generation"}]}`;

        const storyRes = await fetch(
          `${BASE_URL}/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: storyPrompt }] }],
              generationConfig: { temperature: 0.9, maxOutputTokens: 8192 },
            }),
          }
        );

        if (!storyRes.ok) {
          send({ error: 'Failed to generate story: ' + (await storyRes.text()).slice(0, 200) });
          controller.close();
          return;
        }

        const storyData = await storyRes.json();
        // Gemini thinking models return thought parts first, then text parts
        const storyParts = storyData.candidates?.[0]?.content?.parts || [];
        const storyText = storyParts.filter((p: Record<string, unknown>) => typeof p.text === 'string' && !p.thought).pop()?.text || '';
        const cleaned = storyText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        let story: { title: string; slides: Array<{ text: string; scene: string }> };
        try {
          story = JSON.parse(cleaned);
        } catch {
          send({ error: 'Failed to parse story. Raw (first 300 chars): ' + storyText.slice(0, 300) });
          controller.close();
          return;
        }

        send({
          progress: 10,
          storyTitle: story.title,
          slideTexts: story.slides.map(s => s.text),
        });

        // Step 2: Generate images
        const images: string[] = [];

        for (let i = 0; i < Math.min(5, story.slides.length); i++) {
          const slide = story.slides[i];
          send({ progress: 10 + (i * 18) });

          const imagePrompt = `${stylePrompt}

Scene: ${slide.scene}

TEXT OVERLAY INSTRUCTIONS:
${i === 0 ? `This is the HOOK slide. Display the title text in large, bold white letters with strong black outline/shadow, centered on the image: "${slide.text}"` :
  i === story.slides.length - 1 ? `This is the CTA slide. Display the text in white with black outline. Include the Sunflower Sober branding: "${slide.text}"` :
  `This is a NUMBERED BENEFIT slide. Display a short numbered heading in a white rectangular box/banner (black bold text on white background), positioned in the upper-center area. Below it, display the supporting text in large white letters with black outline/shadow: "${slide.text}"`}

The text must be large, clearly readable on mobile. 3:4 portrait aspect ratio for Instagram/TikTok carousel.
This is slide ${i + 1} of 5. Visual consistency across all slides is critical.`;

          let imageData: string | null = null;

          // Try Imagen 4
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

          // Second fallback: gemini-2.5-flash-image
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
