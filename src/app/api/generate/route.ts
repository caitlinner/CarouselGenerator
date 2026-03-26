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
  '3d-animated-bee': `Adorable small chubby 3D Pixar-style animated bumblebee character with round black glasses, yellow and black striped body, tiny translucent buzzing wings, big sparkling expressive eyes, warm friendly smile. The bee is the SAME character in every slide — same glasses, same size, same proportions, same cute design. IMPORTANT: The bee must appear in EVERY slide doing a DIFFERENT cute action — reading a book, holding a flower, sitting on a mushroom, flying through a garden, hugging a sunflower, waving, meditating, dancing, carrying a tiny sign, peeking around a corner, etc. Each slide should show the bee in a DIFFERENT beautiful scene with a different action and mood. Pixar-quality 3D CGI render, soft volumetric lighting, shallow depth of field, hearts and flowers as recurring motifs. NO humans in any slide.`,
  'inspirational-sunsets': `Breathtaking sunset landscape photograph, professional DSLR 8K quality, warm rich color grading, emotionally uplifting and awe-inspiring vista. IMPORTANT: NO people, NO humans, NO characters, NO silhouettes of people in ANY slide. Only natural landscape elements: sky, clouds, water, mountains, fields, trees, horizon. Each slide should feature a different stunning sunset scene — ocean sunset, mountain sunset, desert sunset, meadow sunset, lake reflection sunset. Dramatic sky with vivid orange pink and purple clouds, god rays breaking through clouds.`,
  'pixar-substance': '', // Dynamic — built at generation time based on niche
};

const SUBSTANCE_CHARACTERS: Record<string, string> = {
  'general-sobriety': 'a Pixar-style 3D animated pill bottle character with arms, legs, big expressive eyes, and a mischievous grin — personified as a sneaky villain who pretends to be friendly',
  'alcohol': 'a Pixar-style 3D animated wine bottle character with arms, legs, big expressive cartoon eyes, a charming but devious smile, and a tiny top hat — personified as a smooth-talking villain. Sometimes appears as a beer can or cocktail glass sidekick',
  'gambling': 'a Pixar-style 3D animated slot machine character with arms, legs, big flashing cartoon eyes shaped like dollar signs, a cheeky grin with gold teeth, and spinning reels on its belly — personified as a flashy con artist',
  'meth': 'a Pixar-style 3D animated crystal/rock character with jagged translucent edges, arms, legs, wild twitchy eyes with dilated pupils, and a cracked unsettling grin — personified as a hyperactive destructive gremlin',
  'heroin': 'a Pixar-style 3D animated syringe character with arms, legs, droopy half-closed eyes, and a warm deceptive smile that hides danger — personified as a seductive liar who promises comfort',
  'mdma': 'a Pixar-style 3D animated colorful pill/tablet character with arms, legs, rainbow swirl patterns, huge dilated pupils, a wide euphoric grin, and tiny wings — personified as a party fairy who crashes hard',
  'cannabis': 'a Pixar-style 3D animated joint/spliff character with arms, legs, half-lidded red sleepy eyes, a lazy grin, and a tiny wisp of smoke coming from its head — personified as a chill slacker who steals your motivation',
  'cocaine': 'a Pixar-style 3D animated powder bag character with arms, legs, wide manic eyes, a fast-talking mouth, and a sharp suit — personified as a hyper confident hustler who drains your wallet',
  'fentanyl': 'a Pixar-style 3D animated tiny pill character that looks innocent and small but has a dark shadow looming behind it, big innocent-looking eyes that hide danger — personified as the most deceptive villain, looks harmless but is deadly',
};

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(data: Record<string, unknown>) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }

      try {
        const { niche, styleId, textStyle } = await req.json();
        const nicheCtx = NICHE_CONTEXT[niche] || 'addiction recovery';
        let stylePrompt = STYLE_PROMPTS[styleId] || STYLE_PROMPTS['pixar-animals'];

        // Build dynamic prompt for pixar-substance style
        if (styleId === 'pixar-substance') {
          const characterDesc = SUBSTANCE_CHARACTERS[niche] || SUBSTANCE_CHARACTERS['general-sobriety'];
          stylePrompt = `${characterDesc}. Pixar-quality 3D CGI render, soft volumetric lighting, cinematic composition, vibrant saturated colors, hyper-detailed texturing. IMPORTANT: Use the SAME personified substance character across ALL slides — same design, same proportions, same distinctive features. The character must be clearly recognizable as the same individual throughout the entire carousel. The character appears in DIFFERENT scenes for each slide showing different moods and situations. NO humans in any slide.`;
        }

        // ── REMOVED TEXT-ONLY MODE ──
        if (false) {
          send({ progress: 10 });

          // Randomize story structure
          const STORY_ANGLES_SHORT = [
            { name: 'nobody-told-me', hook: 'Start with "Nobody told me that..." followed by a hyper-specific truth' },
            { name: 'the-last-time', hook: 'Paint a cinematic first slide — a single sensory detail from the last time' },
            { name: 'the-math', hook: 'Open with a SPECIFIC dollar amount or number that makes people gasp' },
            { name: 'the-text-message', hook: 'Start with a text-message-style confession' },
            { name: 'before-after-internal', hook: 'Describe a hyper-specific time of day or weekly ritual' },
            { name: 'the-lie-i-told', hook: 'Start with the exact lie — one sentence that millions have said' },
            { name: 'they-dont-know', hook: 'Contrast the public persona vs private reality' },
            { name: 'the-worst-part', hook: 'Subvert expectations about what the worst part really is' },
            { name: 'letter-to-self', hook: 'Write directly to the past self in second person' },
            { name: 'the-object', hook: 'Focus on a single physical object that carries emotional weight' },
          ];
          const angle = STORY_ANGLES_SHORT[Math.floor(Math.random() * STORY_ANGLES_SHORT.length)];
          const randomSeed = Math.floor(Math.random() * 100000);

          const NICHE_NAMES: Record<string, string> = {
            'general-sobriety': 'sobriety', 'alcohol': 'alcohol/drinking', 'gambling': 'gambling/betting',
            'meth': 'meth', 'heroin': 'heroin/opioids', 'mdma': 'MDMA/party drugs',
            'cannabis': 'weed/cannabis', 'cocaine': 'cocaine', 'fentanyl': 'fentanyl/opioids',
          };
          const nicheName = NICHE_NAMES[niche] || niche;

          let textPrompt: string;
          if (textStyle === 'motivational') {
            textPrompt = `You write carousel text for addiction recovery TikTok/Instagram. SPECIFIC to ${nicheName}.
NICHE CONTEXT: ${nicheCtx}
Seed: ${randomSeed} | Angle: ${angle.name} — ${angle.hook}
Generate exactly 7 slides of MOTIVATIONAL QUOTES.
Slide 1: Hook that names ${nicheName} directly.
Slides 2-6: 5 raw, emotional motivational quotes specific to ${nicheName}.
Slide 7: Text MUST be exactly: Quit with the Sunflower Sober app
BANNED: "one day at a time", "recovery is a journey", "you are not alone", "it gets better", "rock bottom", "breaking free", "chose life", "found the light", "rewrite your story", "you're worth it", "believe in yourself", all asterisks/markdown.
QUALITY: Triple-check spelling. This renders on images.
Return ONLY valid JSON: {"title":"...","slides":[{"text":"..."},{"text":"..."},{"text":"..."},{"text":"..."},{"text":"..."},{"text":"..."},{"text":"..."}]}`;
          } else {
            textPrompt = `You write carousel text for addiction recovery TikTok/Instagram. SPECIFIC to ${nicheName}.
NICHE CONTEXT: ${nicheCtx}
Seed: ${randomSeed} | Angle: ${angle.name} — ${angle.hook}
Generate exactly 7 slides of EDUCATIONAL LISTICLE.
Slide 1: Bold listicle title naming ${nicheName}.
Slides 2-6: Numbered tips 1-5, format "1. [Title]\\n[One sentence]". Specific to ${nicheName}.
Slide 7: Text MUST be exactly: Quit with the Sunflower Sober app
BANNED: "one day at a time", "recovery is a journey", "you are not alone", "it gets better", "rock bottom", "breaking free", "chose life", "found the light", "rewrite your story", "you're worth it", "believe in yourself", all asterisks/markdown.
QUALITY: Triple-check spelling. This renders on images.
Return ONLY valid JSON: {"title":"...","slides":[{"text":"..."},{"text":"..."},{"text":"..."},{"text":"..."},{"text":"..."},{"text":"..."},{"text":"..."}]}`;
          }

          const textRes = await fetch(
            `${BASE_URL}/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: textPrompt }] }],
                generationConfig: { temperature: 1.2, maxOutputTokens: 2048, thinkingConfig: { thinkingBudget: 0 } },
              }),
            }
          );

          if (!textRes.ok) {
            send({ error: 'Failed to generate text: ' + (await textRes.text()).slice(0, 200) });
            controller.close();
            return;
          }

          const textData = await textRes.json();
          const tParts = textData.candidates?.[0]?.content?.parts || [];
          const rawText = tParts.filter((p: { thought?: boolean }) => !p.thought).map((p: { text?: string }) => p.text || '').join('');
          const cleanedText = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

          let parsed: { title: string; slides: Array<{ text: string }> };
          try {
            parsed = JSON.parse(cleanedText);
          } catch {
            send({ error: 'Failed to parse text. Raw: ' + cleanedText.slice(0, 300) });
            controller.close();
            return;
          }

          parsed.slides = parsed.slides.map(s => ({ ...s, text: s.text.replace(/\*+/g, '').trim() }));
          parsed.title = parsed.title.replace(/\*+/g, '').trim();

          send({
            progress: 100,
            storyTitle: parsed.title,
            slideTexts: parsed.slides.map(s => s.text),
          });
          controller.close();
          return;
        }

        // ── REMOVED IMAGES-ONLY MODE ──
        if (false) {
          const GENERIC_SCENES = [
            'A serene, emotionally evocative scene perfect for a carousel cover or opening hook',
            'A contemplative, introspective scene suggesting reflection and change',
            'A scene showing struggle or tension — nature in contrast, storm meeting calm',
            'A transitional scene — dawn breaking, fog lifting, path emerging',
            'A scene of quiet strength — resilience in nature, something standing firm',
            'A scene of peace and resolution — calm waters, open sky, warmth',
            'A hopeful, uplifting scene perfect for a call-to-action — bright, warm, inviting',
          ];

          const images: string[] = [];
          for (let i = 0; i < 7; i++) {
            send({ progress: Math.round((i / 7) * 100) });

            const imagePrompt = `${stylePrompt}

Scene: ${GENERIC_SCENES[i]}

Generate a beautiful background image with NO text, NO words, NO letters, NO numbers, NO captions, NO titles, NO watermarks anywhere in the image. The image must be completely free of any written content — pure visual scene only. Text will be added programmatically afterwards.

3:4 portrait aspect ratio for Instagram/TikTok carousel. Leave space in the center for text overlay (slightly darker or simpler area in the middle third of the image works well).

This is slide ${i + 1} of 7 in a carousel series. Visual consistency across all slides is critical.`;

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
                    parameters: { sampleCount: 1, aspectRatio: '3:4', personGeneration: 'allow_all' },
                  }),
                }
              );
              if (imgRes.ok) {
                const data = await imgRes.json();
                if (data.predictions?.[0]?.bytesBase64Encoded) {
                  imageData = `data:image/png;base64,${data.predictions[0].bytesBase64Encoded}`;
                }
              }
            } catch (e) { console.error(`Imagen 4 bg ${i + 1}:`, e); }

            // Fallback: Gemini native
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
                  const fbParts = fbData.candidates?.[0]?.content?.parts || [];
                  const imgPart = fbParts.find((p: Record<string, unknown>) => p.inlineData);
                  if (imgPart?.inlineData) {
                    const d = imgPart.inlineData as { data: string; mimeType?: string };
                    imageData = `data:${d.mimeType || 'image/png'};base64,${d.data}`;
                  }
                }
              } catch (e) { console.error(`Gemini fb bg ${i + 1}:`, e); }
            }

            images.push(imageData || '');
          }

          send({ progress: 100, images });
          controller.close();
          return;
        }

        // ── FULL MODE: text first → images influenced by text → client composites text on top ──
        // Step 1: Generate story text
        send({ progress: 5, status: 'Writing carousel text...' });

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
          'pixar-substance': `ALL scenes must feature the SAME personified substance character — the addiction itself as a Pixar-style 3D animated character. The character is the substance/vice personified (e.g., a wine bottle with arms and legs, a slot machine character, a joint character). Keep the SAME character design across all slides but show them in different scenes and moods. NO humans.`,
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

        let storyPrompt: string;

        if (textStyle === 'motivational') {
          storyPrompt = `You write carousel text for addiction recovery content on TikTok and Instagram. The content must be SPECIFIC to the addiction type — not generic recovery advice.

ADDICTION TYPE: ${nicheName}
NICHE CONTEXT: ${nicheCtx}

Randomization seed (use this to vary your creative choices): ${randomSeed}
CRITICAL UNIQUENESS RULE: You MUST generate completely fresh, never-before-seen content. Do NOT fall back on common addiction tropes or recycled ideas. Use the seed number above to push your creativity in unexpected directions. Think of a SPECIFIC, surprising angle that hasn't been done before. Avoid generic motivational content — be raw, specific, and original. If your first idea feels obvious, throw it away and dig deeper.

TEXT STYLE: MOTIVATIONAL QUOTES
CONTENT ANGLE: ${angle.name.toUpperCase()} — ${angle.hook}
Generate exactly 7 slides.

SLIDE 1 (THE HOOK):
- This is the attention-grabber. It MUST name ${nicheName} directly and hook the reader.
- Examples of the vibe: "The hardest part of quitting ${nicheName} wasn't the withdrawal" / "Nobody warns you about the loneliness after you quit ${nicheName}" / "I didn't quit ${nicheName} because I was strong. I quit because I was tired."
- Make it specific, emotional, and impossible to scroll past. Name the substance/behavior.

SLIDES 2-6:
- 5 powerful, raw motivational quotes about quitting ${nicheName}.
- Each quote MUST reference specific details of THIS addiction — not generic inspiration that could apply to anything.
- Use the content angle above to guide the emotional direction. Vary the tone: some angry, some vulnerable, some darkly funny, some triumphant.
- Each quote should be a standalone statement that hits hard.
- NEVER repeat themes across slides. Each must offer a genuinely different perspective or insight.

SLIDE 7 (CTA):
- Text MUST be exactly: Quit with the Sunflower Sober app
- No asterisks, no stars, no ** characters, no markdown formatting. Plain text only.

CRITICAL: You MUST return exactly 7 slides in the JSON array. All 7 must be present.

ABSOLUTE BANNED PHRASES (instant reject if any appear):
"one day at a time", "recovery is a journey", "you are not alone", "it gets better", "rock bottom" (as motivation), "breaking free", "chose life", "found the light", "finally showing up", "rewrite your story", "you're worth it", "believe in yourself", "light at the end", "stronger than you know", "recovery is possible", "take it one step", "new chapter", "healing journey", "self-love", "your story isn't over", "show up for myself", "choose smarter", "staying consistent", "morning gratitude"

BANNED CHARACTERS: Do NOT use asterisks (*), markdown bold (**), or any special formatting. Plain text only.

VOICE: Write like someone who's been through THIS SPECIFIC addiction and is sharing what they learned. Not a therapist, not a brand — a real person.

QUALITY CHECK: Triple-check ALL text for spelling, grammar, and typos. This text gets rendered on images — errors will be visible.

${sceneInstr ? `IMAGE SCENE RULES: ${sceneInstr}` : ''}

Return ONLY valid JSON with exactly 7 slides:
{"title":"carousel title","slides":[{"text":"overlay text","scene":"..."},{"text":"...","scene":"..."},{"text":"...","scene":"..."},{"text":"...","scene":"..."},{"text":"...","scene":"..."},{"text":"...","scene":"..."},{"text":"...","scene":"..."}]}`;
        } else {
          // Educational (default)
          storyPrompt = `You write carousel text for addiction recovery content on TikTok and Instagram. The content must be SPECIFIC to the addiction type — not generic recovery advice.

ADDICTION TYPE: ${nicheName}
NICHE CONTEXT: ${nicheCtx}

Randomization seed (use this to vary your creative choices): ${randomSeed}
CRITICAL UNIQUENESS RULE: You MUST generate completely fresh, never-before-seen content. Do NOT fall back on common addiction tropes or recycled ideas. Use the seed number above to push your creativity in unexpected directions. Think of a SPECIFIC, surprising angle that hasn't been done before. Avoid generic listicles — be raw, specific, and original. If your first idea feels obvious, throw it away and dig deeper.

TEXT STYLE: EDUCATIONAL LISTICLE
CONTENT ANGLE: ${angle.name.toUpperCase()} — ${angle.hook}
Generate exactly 7 slides.

SLIDE 1 (THE HOOK TITLE):
- Bold, catchy listicle title that grabs attention and NAMES the addiction/substance.
- Must feel like a real person sharing experience or hard-won knowledge.
- VARY the topic based on the content angle above. Examples of different angles:
  • Practical tips: "5 Things That Helped Me Quit ${nicheName}" / "5 Rules to Protect My Sobriety"
  • Hard truths: "5 Truths About ${nicheName} Nobody Talks About" / "5 Lies ${nicheName} Told Me"
  • Science/health: "5 Things That Happen to Your Brain After Quitting ${nicheName}" / "What ${nicheName} Actually Does to Your Body"
  • Emotional: "5 Moments That Made Me Realize I Had to Quit ${nicheName}" / "5 Things I Lost to ${nicheName}"
  • Recovery wins: "5 Things That Got Better After I Quit ${nicheName}" / "5 Surprises in My First Year Sober"
  • Warning signs: "5 Signs Your ${nicheName} Use Isn't 'Casual' Anymore" / "5 Red Flags I Ignored"
  • Relationships: "5 Ways ${nicheName} Destroyed My Relationships" / "5 Conversations I Avoided Because of ${nicheName}"
  • Financial: "5 Things I Could Afford After Quitting ${nicheName}" / "What ${nicheName} Really Cost Me"
- Pick a DIFFERENT angle each time based on the seed and content angle. Do NOT default to the same "5 tips" format every time.
- MUST be specific to ${nicheName}. Name the substance/behavior directly.
- Keep it interesting — make people want to swipe.

SLIDES 2-6 (NUMBERED TIPS 1 THROUGH 5):
- 5 educational tips, lessons, or pieces of advice about quitting ${nicheName}.
- Number them 1-5. Format: "1. [Title]\n[One sentence of explanation]"
- Keep it SHORT — the text gets rendered on an image, so less is more. One clear sentence of explanation after the numbered title.
- NEVER include "Slide 1", "Slide 2" etc.
- Each tip MUST be specific to ${nicheName} — if you swapped the addiction name, the tip should NOT make sense.
- Make it interesting and educational, not preachy. Like a friend sharing real advice.
- Substance-specific details matter:
  • Alcohol: hangovers, wine culture, bars, drinking alone, morning regret, blackouts, the bottle
  • Cannabis: wake-and-bake, brain fog, dreams returning, motivation, munchies, the high
  • Gambling: betting apps, parlays, the casino, chasing losses, checking odds
  • Meth: staying up for days, the crash, weight loss, paranoia, skin picking
  • Cocaine: weekend use becoming weekday, nosebleeds, the drip, bank account damage
  • Heroin: withdrawal, nodding off, the warm blanket feeling, Narcan, prescriptions to street
  • Fentanyl: fake pills, supply danger, Narcan, losing friends, awareness
  • MDMA: Tuesday depression, serotonin depletion, chasing the first roll, jaw clenching

SLIDE 7 (CTA):
- Text MUST be exactly: Quit with the Sunflower Sober app
- No asterisks, no stars, no ** characters, no markdown formatting. Plain text only.
- No variations from that exact text.

CRITICAL: You MUST return exactly 7 slides in the JSON array. Slide 1 = hook title, Slides 2-6 = numbered tips, Slide 7 = CTA. All 7 must be in the "slides" array.

ABSOLUTE BANNED PHRASES (instant reject if any appear):
"one day at a time", "recovery is a journey", "you are not alone", "it gets better", "rock bottom" (as motivation), "breaking free", "chose life", "found the light", "finally showing up", "rewrite your story", "you're worth it", "believe in yourself", "light at the end", "stronger than you know", "recovery is possible", "take it one step", "new chapter", "healing journey", "self-love", "your story isn't over", "show up for myself", "choose smarter", "staying consistent", "morning gratitude"

BANNED CHARACTERS: Do NOT use asterisks (*), markdown bold (**), or any special formatting in slide text. Plain text only.

If the slide text could apply to ANY addiction or even just general wellness, REWRITE IT to be specific to ${nicheName}.

VOICE: Write like someone who's been through THIS SPECIFIC addiction and is sharing what they learned. Not a therapist, not a brand — a real person.

QUALITY CHECK: Triple-check ALL text for spelling errors, grammar mistakes, and typos. Every word must be correct. No misspellings, no broken sentences, no awkward phrasing. This text will be rendered directly onto images — errors will be visible.

${sceneInstr ? `IMAGE SCENE RULES: ${sceneInstr}` : ''}

Return ONLY valid JSON with exactly 7 slides:
{"title":"carousel title","slides":[{"text":"overlay text","scene":"detailed image scene description"},{"text":"...","scene":"..."},{"text":"...","scene":"..."},{"text":"...","scene":"..."},{"text":"...","scene":"..."},{"text":"...","scene":"..."},{"text":"...","scene":"..."}]}`;
        }

        const storyRes = await fetch(
          `${BASE_URL}/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: storyPrompt }] }],
              generationConfig: { temperature: 1.2, maxOutputTokens: 2048, thinkingConfig: { thinkingBudget: 0 } },
            }),
          }
        );

        if (!storyRes.ok) {
          send({ error: 'Failed to generate story: ' + (await storyRes.text()).slice(0, 200) });
          controller.close();
          return;
        }

        const storyData = await storyRes.json();
        // Gemini thinking models return thought parts separately — skip them
        const parts = storyData.candidates?.[0]?.content?.parts || [];
        const storyText = parts
          .filter((p: { thought?: boolean }) => !p.thought)
          .map((p: { text?: string }) => p.text || '')
          .join('');
        const cleaned = storyText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        let story: { title: string; slides: Array<{ text: string; scene: string }> };
        try {
          story = JSON.parse(cleaned);
        } catch {
          send({ error: 'Failed to parse story. Raw: ' + cleaned.slice(0, 300) });
          controller.close();
          return;
        }

        // Sanitize: strip asterisks/markdown from all slide text
        story.slides = story.slides.map(s => ({
          ...s,
          text: s.text.replace(/\*+/g, '').trim(),
        }));
        story.title = story.title.replace(/\*+/g, '').trim();

        send({
          progress: 10,
          status: 'Text ready — generating images influenced by your content...',
          storyTitle: story.title,
          slideTexts: story.slides.map(s => s.text),
        });

        // Step 2: Generate images using Imagen 4 (scenes influenced by text)
        const images: string[] = [];

        for (let i = 0; i < Math.min(7, story.slides.length); i++) {
          const slide = story.slides[i];
          send({ progress: 10 + (i * 12), status: `Generating image ${i + 1} of 7...` });

          const imagePrompt = `${stylePrompt}

Scene: ${slide.scene}

Generate a beautiful background image with NO text, NO words, NO letters, NO numbers, NO captions, NO titles, NO watermarks anywhere in the image. The image must be completely free of any written content — pure visual scene only. Text will be added programmatically afterwards.

3:4 portrait aspect ratio for Instagram/TikTok carousel. Leave space in the center for text overlay (slightly darker or simpler area in the middle third of the image works well).

This is slide ${i + 1} of 7 in a carousel series. Visual consistency across all slides is critical.`;

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
