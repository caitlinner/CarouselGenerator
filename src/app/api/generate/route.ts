import { NextRequest } from 'next/server';

export const maxDuration = 300;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

const NICHE_CONTEXT: Record<string, string> = {
  'general-sobriety': 'General sobriety/recovery. VIRAL ANGLES: the "is this the same person?" before/after disbelief, day counter milestones that make people do math ("wait, 847 days means they quit during COVID"), the specific embarrassing moment that was your last straw, the friend who stopped calling. EMOTIONAL HOOKS: shame spiral specifics, the 3am phone check, waking up and checking your bank account, the apology you never sent.',

  'alcohol': 'Alcohol addiction. VIRAL ANGLES: "mommy wine culture" is manufactured by Big Alcohol targeting women 30-45, the "just one glass" that becomes a bottle by Thursday, the Instagram wine-o-clock memes that normalize dependency, hiding bottles in the recycling before your partner gets home. EMOTIONAL HOOKS: the morning mouth taste, checking your texts with dread, calling in sick on Monday again, your kid seeing you stumble, the exact moment you realized you were drinking alone every night. WHAT HITS: Pop culture references + wine culture critique = proven formula.',

  'gambling': 'Gambling addiction. VIRAL ANGLES: sports betting apps designed like slot machines in your pocket, the "I\'ll win it back" lie you tell yourself at 4am, checking your phone during dinner for live odds, the parlay that was "guaranteed", borrowing money from people who trust you. EMOTIONAL HOOKS: the exact dollar amount you\'ve lost (specificity kills), the notification sound that Pavlov-trained you, refreshing the banking app knowing what you\'ll see, the spreadsheet of losses you\'ll never show anyone.',

  'meth': 'Meth addiction. VIRAL ANGLES: the before/after face that makes people screenshot and share, 72-hour binges where you clean the entire house then don\'t sleep for a week, shadow people, picking at skin in the mirror for hours, the paranoia that everyone knows. EMOTIONAL HOOKS: the first time your mom didn\'t recognize you, teeth crumbling, the weight you lost that people "complimented" not knowing why, the sound of a lighter that still triggers something.',

  'heroin': 'Heroin/opioid addiction. VIRAL ANGLES: started with a prescription after surgery and ended up on the street, the warm blanket feeling vs the cold reality of withdrawal, Narcan saves — the 4 minutes between death and life, long sleeves in July. EMOTIONAL HOOKS: the first time you stole from family, nodding off mid-conversation with your kid, the friend who OD\'d on what you both bought together, the hospital bracelet collection, waking up in the ER and the nurse\'s face.',

  'mdma': 'MDMA/party drug addiction. VIRAL ANGLES: "it\'s not addictive" is the lie that gets you, the Tuesday depression that becomes every day depression, chasing the first roll forever, your serotonin is a credit card and you maxed it out. EMOTIONAL HOOKS: the moment music stopped making you feel anything sober, taking more and feeling less, your jaw hurting on Monday, friends who only text you about the next rave, realizing the "love" you felt was chemistry not connection.',

  'cannabis': 'Cannabis dependency. VIRAL ANGLES: "it\'s just weed" is the most effective gaslighting in addiction — try telling someone you\'re addicted and watch them laugh, waking and baking so long you forgot what mornings feel like sober, spending $400/month on something you said you could quit anytime. EMOTIONAL HOOKS: the first time you dreamed again after quitting, eating food that actually tastes like food, realizing you haven\'t been genuinely bored in years because you smoked every feeling away, the motivation that comes flooding back like someone unclogged a drain.',

  'cocaine': 'Cocaine addiction. VIRAL ANGLES: the "successful" addict — nobody suspects because you still show up to work, $500 weekends that become $500 Tuesdays, bathroom stall confessions where you bond with strangers you\'ll never see again, the 4am group chat that only activates on weekends. EMOTIONAL HOOKS: the drip taste you can\'t forget, the nosebleed at brunch, checking your bank account on Sunday morning, the friends who were really just people who shared a bag, the moment you realized "social use" was a lie you told to everyone including yourself.',

  'fentanyl': 'Fentanyl crisis. VIRAL ANGLES: a pill that looks like Percocet killed your friend — they thought they knew what they were taking, carrying Narcan because you don\'t trust the supply anymore, rainbow fentanyl that looks like candy, losing 3 friends in one year to the same thing. EMOTIONAL HOOKS: the text that starts with "did you hear about...", the phone call from a number you recognize at 2am, the memorial tattoo that keeps getting additions, the empty chair at Thanksgiving that nobody mentions but everyone sees.',
};

const STYLE_PROMPTS: Record<string, string> = {
  'pixar-animals': `Pixar-quality 3D animated cute animal character, Disney/Pixar movie animation style, soft volumetric lighting, big expressive eyes full of emotion, vibrant saturated colors, cinematic composition, hyper-detailed soft fur or feathers, Pixar movie quality CGI render, adorable but emotionally deep. IMPORTANT: Use the SAME cute animal character across ALL slides — same species, same fur/feather color, same size, same distinctive features. The character must be clearly recognizable as the same individual throughout the entire carousel. NO humans in any slide.`,
  'sunflower-fields': `Breathtaking sunflower field landscape photograph, professional DSLR 8K quality, warm golden hour lighting, emotionally uplifting and serene. IMPORTANT: NO people, NO humans, NO characters, NO silhouettes of people in ANY slide. Only sunflower fields and natural landscape elements: endless rows of sunflowers, golden petals, blue sky, soft clouds, rolling hills, warm sunlight filtering through petals. Each slide should feature a DIFFERENT sunflower field scene — vast field stretching to horizon, close-up rows with bokeh background, field at sunrise with golden mist, sunflower field with distant mountains, aerial view of sunflower patterns. Rich warm color grading with golden yellows, deep greens, and soft blue skies.`,
  'majestic-mountains': `Majestic realistic mountain landscape photograph with lush greenery, professional DSLR 8K quality, epic and awe-inspiring composition. IMPORTANT: NO people, NO humans, NO characters, NO silhouettes of people in ANY slide. Only mountains and natural landscape elements: towering peaks, green valleys, alpine meadows, misty forests, winding rivers, waterfalls, dramatic clouds. Each slide should feature a DIFFERENT mountain scene — foggy mountain road through pine forest, alpine lake with mountain reflection, lush green valley with distant peaks, misty mountain sunrise, dramatic mountain range with rolling clouds. Rich natural color grading with deep greens, moody grays, and atmospheric haze.`,
  '3d-animated-bee': `Adorable small chubby 3D Pixar-style animated bumblebee character with round black glasses, yellow and black striped body, tiny translucent buzzing wings, holding a small notepad in one hand and a yellow pencil in the other, big sparkling expressive eyes, warm friendly smile. The bee is the SAME character in every slide — same glasses, same size, same proportions, same cute design. IMPORTANT: Use the SAME bee character across ALL slides. The bee appears in DIFFERENT beautiful scenes for each slide: flower garden, rainy day with umbrella, sunrise meadow, cozy library, starlit night sky. Each scene has a different mood and color palette but the bee character is always recognizable. Pixar-quality 3D CGI render, soft volumetric lighting, shallow depth of field, hearts and flowers as recurring motifs. NO humans in any slide.`,
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
          {
            name: 'nobody-told-me',
            arc: 'The thing nobody warned me about → The ugly reality → The moment it hit me → What I know now → CTA',
            hook: 'Start with "Nobody told me that..." followed by a hyper-specific, unexpected truth about this addiction. NOT a generic observation — something that makes someone in recovery go "holy shit, yes."'
          },
          {
            name: 'the-last-time',
            arc: 'The last time I [used] → What happened in the next hour → The face of the person who found me → The version of me that exists now → CTA',
            hook: 'Paint a cinematic first slide — a single sensory detail from the last time. The taste, the sound, the text message, the exact location. Make the reader SEE it.'
          },
          {
            name: 'the-math',
            arc: 'The dollar amount → What that could have been → The real cost (not money) → What I invest in now → CTA',
            hook: 'Open with a SPECIFIC dollar amount or number that makes people gasp. "$47,000 in 3 years." "1,460 mornings." "23 friends\' funerals." Numbers stop scrollers.'
          },
          {
            name: 'the-text-message',
            arc: 'The text I sent at [time] → What I meant vs what I said → What they replied (or didn\'t) → The conversation I had sober → CTA',
            hook: 'Start with a text-message-style confession — the kind of thing someone types at 2am and deletes in the morning. Raw, unfiltered, embarrassing.'
          },
          {
            name: 'before-after-internal',
            arc: 'What [day/time] looked like using → The ritual/routine of it → What [same day/time] looks like now → The small thing that made me cry with gratitude → CTA',
            hook: 'Describe a hyper-specific time of day or weekly ritual — "Every Sunday at 11am" or "The first 4 minutes after waking up." Make people recognize their own patterns.'
          },
          {
            name: 'the-lie-i-told',
            arc: 'The lie I told everyone → The lie I told myself → The truth I couldn\'t say out loud → Saying it now → CTA',
            hook: 'Start with the exact lie. Not "I lied about my drinking" — the SPECIFIC lie. "I\'m just tired." "I only had two." "I can stop whenever I want." One sentence that millions have said.'
          },
          {
            name: 'they-dont-know',
            arc: 'What my coworkers/friends/family see → What they don\'t see → The moment I almost got caught → Why I stopped hiding → CTA',
            hook: 'Contrast the public persona vs private reality. "My boss thinks I\'m the most reliable person on the team" energy. The functional addict reveal.'
          },
          {
            name: 'the-worst-part',
            arc: 'The worst part isn\'t what you think → It\'s not the [obvious thing] → It\'s the [unexpected gut-punch] → But here\'s what nobody tells you about after → CTA',
            hook: 'Subvert expectations immediately. "The worst part of [addiction] isn\'t [the obvious]. It\'s [the thing that actually haunts you]." Make people curious about what the real worst part is.'
          },
          {
            name: 'letter-to-self',
            arc: 'Hey, it\'s future you → I know what you\'re doing right now → Here\'s what\'s about to happen → But you survive. And here\'s proof. → CTA',
            hook: 'Write directly to the past self in second person. Intimate. Knowing. Like a time traveler who can see everything but can\'t stop it — only offer hope from the other side.'
          },
          {
            name: 'the-object',
            arc: 'This [object] used to mean [addiction thing] → Now it means [recovery thing] → The day the meaning changed → What it\'ll mean tomorrow → CTA',
            hook: 'Focus on a single physical object — a lighter, a bottle opener, a phone notification sound, a bathroom mirror. Objects carry emotional weight. Make it symbolic.'
          },
        ];

        const angle = STORY_ANGLES[Math.floor(Math.random() * STORY_ANGLES.length)];
        const randomSeed = Math.floor(Math.random() * 100000);

        // Style-specific scene instructions
        const SCENE_INSTRUCTIONS: Record<string, string> = {
          'pixar-animals': 'ALL scenes must feature the SAME cute animated animal character (pick ONE specific animal — e.g., a small brown rabbit, a golden retriever puppy, a tiny grey kitten). Describe this exact same character in every scene description. NO humans.',
          'sunflower-fields': 'ALL scenes must be ONLY sunflower field landscapes. NO people, NO humans, NO characters, NO silhouettes. Only sunflowers and natural elements: fields, petals, sky, clouds, hills, sunlight. Each slide should be a different sunflower field scene.',
          'majestic-mountains': 'ALL scenes must be ONLY majestic mountain landscapes with greenery. NO people, NO humans, NO characters, NO silhouettes. Only mountains and natural elements: peaks, valleys, forests, rivers, meadows, clouds, mist. Each slide should be a different mountain scene.',
          'inspirational-sunsets': 'ALL scenes must be ONLY sunset landscapes. NO people, NO humans, NO characters, NO silhouettes. Only natural elements: sky, clouds, water, mountains, fields, trees. Each slide should be a different breathtaking sunset location.',
        };

        const sceneInstr = SCENE_INSTRUCTIONS[styleId] || '';

        // Build the niche name for explicit use in prompts
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
        const nicheName = NICHE_NAMES[niche] || niche;

        const storyPrompt = `You write carousel text for addiction recovery content on TikTok and Instagram. The content must be SPECIFIC to the addiction type — not generic recovery advice.

ADDICTION TYPE: ${nicheName}
NICHE CONTEXT: ${nicheCtx}

YOUR STORY ANGLE: ${angle.name.toUpperCase()}
Arc: ${angle.arc}
Hook approach: ${angle.hook}

Randomization seed (use this to vary your creative choices): ${randomSeed}

SLIDE 1 RULES (THE HOOK):
- MUST explicitly name the addiction. Examples for alcohol: "5 things that changed when I stopped drinking", "How I finally broke free from the weekend drinking cycle", "Alcohol is one of those things that when you remove it from your life, it also removes a lot of problems from your life"
- Examples for cannabis: "What happened when I finally put down the weed", "5 things nobody tells you about quitting weed"
- Examples for gambling: "What happened when I deleted the betting apps", "The real cost of my gambling addiction wasn't money"
- The hook should be a relatable insight, a listicle promise, or a bold statement that NAMES THE SUBSTANCE/BEHAVIOR
- Can be longer than 10 words — clarity and relatability matter more than brevity on the hook

SLIDE 2-4 RULES (NICHE-SPECIFIC CONTENT):
- Each slide MUST contain details SPECIFIC to this addiction type. If you swapped the addiction name, the slide should NOT make sense.
- For alcohol: mention hangovers, wine, beer, bars, drinking alone, morning regret, the taste, the bottle, blackouts
- For cannabis: mention smoking, the high, wake-and-bake, munchies, brain fog, dreams coming back, motivation returning
- For gambling: mention betting apps, parlays, the casino, checking odds, the losses, the "win it back" feeling
- For meth: mention staying up for days, the crash, the pipe, shadow people, weight loss, skin picking
- Slides can be numbered tips ("1. Energy Returned"), lessons learned, or confessional statements
- Keep text conversational and relatable — like someone sharing their real experience
- Each slide should be a complete thought that stands on its own

SLIDE 5 (CTA):
- Text MUST be exactly: "Quit today with the Sunflower Sober app 🌻"
- No variations. This exact text.

ABSOLUTE BANNED PHRASES (instant reject if any appear):
"one day at a time", "recovery is a journey", "you are not alone", "it gets better", "rock bottom" (as motivation), "breaking free", "chose life", "found the light", "finally showing up", "rewrite your story", "you're worth it", "believe in yourself", "light at the end", "stronger than you know", "recovery is possible", "take it one step", "new chapter", "healing journey", "self-love", "your story isn't over", "show up for myself", "choose smarter", "staying consistent", "morning gratitude"

If the slide text could apply to ANY addiction or even just general wellness, REWRITE IT to be specific to ${nicheName}.

VOICE: Write like someone who's been through THIS SPECIFIC addiction and is sharing what they learned. Not a therapist, not a brand — a real person.

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
