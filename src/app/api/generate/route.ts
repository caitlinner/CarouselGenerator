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
  'pixar-animals': '', // Dynamic — built at generation time with random animal selection
  'sunflower-fields': `Beautiful animated/illustrated sunflower field in a warm, colorful cartoon/digital art style — NOT photorealistic, NOT a photograph. Think Pixar background art, Studio Ghibli fields, or vibrant digital illustration. Thousands of bright golden sunflowers filling the scene from foreground to background, lush green stems and leaves, rich saturated colors. IMPORTANT: NO people, NO humans, NO characters, NO silhouettes in ANY slide. Each slide MUST have a DIFFERENT sky and atmosphere — pick one per slide: golden sunset sky with orange/pink clouds, bright blue daytime sky with fluffy white clouds, dramatic purple/pink twilight, soft pastel sunrise with morning mist, stormy sky with dramatic clouds and light breaking through, starry night sky with moonlight on sunflowers, warm amber afternoon with lens flare. The sunflower field itself should vary too: endless rows to the horizon, close-up of giant sunflower heads, field on rolling hills, sunflowers by a winding path, field near a small pond reflection, aerial view of sunflower patterns. Vibrant warm color palette — golden yellows, deep greens, rich sky colors.`,
  'majestic-mountains': `Hyperrealistic mountain landscape photograph, shot on Hasselblad medium format, 8K resolution, jaw-droppingly real. ONLY mountains — nothing else. NO people, NO humans, NO animals, NO buildings, NO roads, NO vehicles, NO characters, NO silhouettes, NO man-made objects in ANY slide. Pure untouched mountain wilderness only: towering snow-capped peaks, dramatic ridgelines, mountain faces, alpine rock formations, mountain ranges stretching to infinity, volcanic peaks, jagged summits piercing clouds. Each slide MUST show a DIFFERENT mountain scene and mood — golden hour light on a massive peak, dramatic storm clouds swirling around a summit, misty mountain range at dawn, snow-covered peak under blue sky, mountain reflected in a pristine alpine lake, aerial view of endless mountain ridges, mountain silhouette at sunset. Motivational and awe-inspiring — the kind of image that makes you feel small but powerful. Cinematic color grading, dramatic lighting, extreme detail in rock textures and cloud formations.`,
  '3d-animated-bee': `Adorable chubby kawaii 3D animated bumblebee character — round yellow body with black horizontal stripes, two black ball-tipped antennae on top, small translucent wings, big round black glasses, huge sparkling expressive eyes behind the glasses, tiny orange/yellow arms and legs, warm friendly smile. Cute cartoon style (like a children's sticker or mobile game character), vibrant flat colors with soft shading, clean vector-like 3D render. The bee is the SAME character in EVERY slide — same glasses, same body shape, same proportions, same cute design. IMPORTANT: The bee must appear in EVERY slide doing a DIFFERENT cute action that relates to the slide's recovery/sobriety message. Surround the bee with colorful flowers (sunflowers, daisies, purple flowers, pink flowers), hearts, leaves, and cheerful decorative elements. Backgrounds should be warm and inviting — gardens, meadows, cozy scenes, window sills with flowers, grassy fields. NO humans in any slide. NO dark or gloomy scenes — keep everything bright, warm, and uplifting.`,
  'inspirational-sunsets': `Breathtaking sunset landscape photograph, professional DSLR 8K quality, warm rich color grading, emotionally uplifting and awe-inspiring vista. IMPORTANT: NO people, NO humans, NO characters, NO silhouettes of people in ANY slide. Only natural landscape elements: sky, clouds, water, mountains, fields, trees, horizon. Each slide should feature a different stunning sunset scene — ocean sunset, mountain sunset, desert sunset, meadow sunset, lake reflection sunset. Dramatic sky with vivid orange pink and purple clouds, god rays breaking through clouds.`,
  'ocean': `Hyperrealistic ocean photograph, shot on Hasselblad medium format, 8K resolution, breathtakingly real. ONLY ocean — the ocean MUST be the primary subject in every image. NO people, NO humans, NO animals, NO boats, NO buildings, NO man-made objects, NO characters in ANY slide. Pure ocean in all its forms: massive crashing waves, calm turquoise shallows, deep navy blue open water, aerial view of ocean patterns, underwater light rays through crystal clear water, dramatic wave curling with spray, ocean surface reflecting sky colors. Each slide MUST show a DIFFERENT angle and color palette — turquoise tropical water from above, dark stormy ocean with dramatic waves, golden hour light sparkling on calm water, deep blue ocean stretching to horizon, emerald green wave curling with white foam, pink/purple sunset reflecting on still water, powerful wave crashing against rocks with spray. Inspirational and powerful — the vastness and beauty of the ocean. Cinematic color grading, stunning water textures, dramatic lighting.`,
  'pixar-substance': '', // Dynamic — built at generation time based on niche
};

const PIXAR_ANIMALS = [
  'a tiny baby otter with sleek brown fur and big round eyes',
  'a fluffy red panda with a bushy striped tail and curious expression',
  'a baby elephant with oversized floppy ears and a playful trunk',
  'an adorable fox cub with bright orange fur and a white-tipped tail',
  'a tiny hedgehog with soft spines and a button nose',
  'a baby penguin with a round belly and tiny flapping wings',
  'a baby deer (fawn) with spotted fur and wobbly long legs',
  'an adorable corgi puppy with stubby legs and a big smile',
  'a fluffy yellow duckling with tiny wings and bright eyes',
  'a baby owl with enormous round eyes and fluffy tufted feathers',
  'a baby koala with round fluffy ears clinging to a eucalyptus branch',
  'a baby sea turtle with a patterned shell and gentle eyes',
  'a tiny chinchilla with impossibly soft grey fur and round ears',
  'a baby polar bear cub with pure white fur and a black nose',
  'a tiny grey kitten with big green eyes and a pink nose',
  'a golden retriever puppy with floppy ears and a wagging tail',
  'a baby bunny with long soft ears and a cotton-ball tail',
  'a baby sloth with a permanent gentle smile and long arms',
  'a baby raccoon with a striped tail and a little mask face',
  'a tiny hamster with chubby cheeks and small pink paws',
];

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

        // Build dynamic prompt for pixar-animals style — random animal per generation, consistent across slides
        if (styleId === 'pixar-animals') {
          const animal = PIXAR_ANIMALS[Math.floor(Math.random() * PIXAR_ANIMALS.length)];
          stylePrompt = `Pixar-quality 3D animated cute animal character: ${animal}. Disney/Pixar movie animation style, soft volumetric lighting, big expressive eyes full of emotion, vibrant saturated colors, cinematic composition, hyper-detailed soft fur or feathers, Pixar movie quality CGI render, adorable but emotionally deep. IMPORTANT: Use the SAME character (${animal}) across ALL slides — same species, same fur/feather color, same size, same distinctive features. The character must be clearly recognizable as the same individual throughout the entire carousel. NO humans in any slide.`;
        }

        // Build dynamic prompt for pixar-substance style
        if (styleId === 'pixar-substance') {
          const characterDesc = SUBSTANCE_CHARACTERS[niche] || SUBSTANCE_CHARACTERS['general-sobriety'];
          stylePrompt = `${characterDesc}. Pixar-quality 3D CGI render, soft volumetric lighting, cinematic composition, vibrant saturated colors, hyper-detailed texturing. IMPORTANT: Use the SAME personified substance character across ALL slides — same design, same proportions, same distinctive features. The character must be clearly recognizable as the same individual throughout the entire carousel. The character appears in DIFFERENT scenes for each slide showing different moods and situations. NO humans in any slide.`;
        }

        // ── FULL MODE: text first → images influenced by text → client composites text on top ──
        // Step 1: Generate story text
        send({ progress: 5, status: 'Writing carousel text...' });

        // Randomize story structure to prevent repetitive outputs
        const STORY_ANGLES = [
          // ── PERSONAL / CONFESSIONAL ──
          { name: 'nobody-told-me', arc: 'The thing nobody warned me about → The ugly reality → The moment it hit me → What I know now → CTA', hook: 'Start with "Nobody told me that..." followed by a hyper-specific, unexpected truth. Something that makes someone in recovery go "holy shit, yes."' },
          { name: 'the-last-time', arc: 'The last time I [used] → What happened next → The face of the person who found me → The version of me now → CTA', hook: 'Paint a cinematic first slide — a single sensory detail from the last time. The taste, the sound, the text message, the exact location.' },
          { name: 'the-lie-i-told', arc: 'The lie I told everyone → The lie I told myself → The truth I couldn\'t say → Saying it now → CTA', hook: 'Start with the SPECIFIC lie. "I\'m just tired." "I only had two." "I can stop whenever I want." One sentence millions have said.' },
          { name: 'they-dont-know', arc: 'What people see → What they don\'t see → The moment I almost got caught → Why I stopped hiding → CTA', hook: 'Contrast the public persona vs private reality. The functional addict reveal.' },
          { name: 'letter-to-self', arc: 'Hey, it\'s future you → I know what you\'re doing right now → Here\'s what happens → But you survive → CTA', hook: 'Write directly to the past self in second person. Intimate. Knowing. A time traveler who offers hope from the other side.' },
          { name: 'the-first-time', arc: 'The first time I tried it → What it felt like → When it stopped feeling like that → What I chase now instead → CTA', hook: 'Describe the very first experience in vivid detail — the innocence of it, the excitement, the moment before everything changed.' },
          { name: 'the-secret-routine', arc: 'My secret routine → The lengths I went to hide it → The exhaustion of the performance → The relief of stopping → CTA', hook: 'Describe the elaborate daily routine of hiding addiction. The specific steps, timing, locations. The exhausting choreography nobody knew about.' },

          // ── FINANCIAL / NUMBERS ──
          { name: 'the-math', arc: 'The dollar amount → What that could have been → The real cost (not money) → What I invest in now → CTA', hook: 'Open with a SPECIFIC dollar amount that makes people gasp. "$47,000 in 3 years." "1,460 mornings." Numbers stop scrollers.' },
          { name: 'the-receipt', arc: 'The bank statement → The pattern I couldn\'t unsee → What I\'d been telling myself → What that money means now → CTA', hook: 'Describe the moment of looking at a bank/credit card statement and seeing the addiction spelled out in transactions. Specific amounts, specific vendors.' },
          { name: 'the-calculator', arc: 'I opened my calculator → Added up [specific thing] → The total was → Now I spend it on → CTA', hook: 'Frame it as doing actual math in real time. "I multiplied $14 x 5 nights x 52 weeks..." Make the reader do the math with you.' },

          // ── RELATIONSHIPS ──
          { name: 'the-text-message', arc: 'The text I sent at [time] → What I meant vs said → What they replied (or didn\'t) → The sober conversation → CTA', hook: 'Start with a text-message-style confession — the kind typed at 2am and deleted in the morning.' },
          { name: 'the-phone-call', arc: 'The call I got → What they said → What I heard → What I did about it → CTA', hook: 'Start with a phone call that changed everything — from a parent, a doctor, a friend, an ex. The exact words they said.' },
          { name: 'the-kid-moment', arc: 'What my kid saw → What they said → What I felt → What I decided → CTA', hook: 'A child\'s innocent observation that shattered the illusion. Kids don\'t sugarcoat. The exact words, the exact moment.' },
          { name: 'the-friend-who-left', arc: 'The friend who stopped calling → What they tried before giving up → The voicemail I never answered → Finding them again → CTA', hook: 'Tell the story of the friend who loved you enough to leave. The slow fade, the final attempt, the silence.' },
          { name: 'the-apology', arc: 'The apology I owe → What I did → Why I haven\'t said it → What I\'d say now → CTA', hook: 'Start with who you owe the apology to and what you did — specific, raw, uncomfortable.' },
          { name: 'the-partner', arc: 'What my partner pretended not to notice → The argument we kept having → The night they almost left → What we\'re building now → CTA', hook: 'The addiction from your partner\'s perspective. The things they saw but didn\'t say. The toll on love.' },

          // ── BODY / HEALTH ──
          { name: 'the-mirror', arc: 'What I saw in the mirror → What I told myself → What my body was actually saying → What the mirror shows now → CTA', hook: 'Describe the specific physical change you noticed — the face, the eyes, the skin, the weight. The moment you didn\'t recognize yourself.' },
          { name: 'the-doctor', arc: 'What the doctor said → The test results → What I did with that information → The follow-up appointment → CTA', hook: 'Start with the doctor\'s exact words or the specific medical finding. Lab numbers, diagnoses, warnings. Clinical reality hitting.' },
          { name: 'the-sleep', arc: 'What sleep looked like using → The 3am ritual → The first real night of sleep sober → What mornings feel like now → CTA', hook: 'Describe the specific sleep patterns of addiction — the insomnia, the passing out, the nightmares, the sweats. Then the miracle of real sleep.' },

          // ── IDENTITY / PSYCHOLOGICAL ──
          { name: 'the-worst-part', arc: 'The worst part isn\'t what you think → Not the [obvious] → It\'s the [gut-punch] → What nobody tells you about after → CTA', hook: 'Subvert expectations. "The worst part isn\'t [obvious thing]. It\'s [the thing that actually haunts you]."' },
          { name: 'the-object', arc: 'This [object] used to mean [addiction] → Now it means [recovery] → The day it changed → What it\'ll mean tomorrow → CTA', hook: 'Focus on a single physical object — a lighter, a bottle opener, a notification sound. Objects carry emotional weight.' },
          { name: 'before-after-internal', arc: 'What [time of day] looked like using → The ritual → What it looks like sober → The small thing that made me cry → CTA', hook: 'Describe a hyper-specific time of day. "Every Sunday at 11am" or "The first 4 minutes after waking up."' },
          { name: 'the-personality', arc: 'The personality trait I thought was me → How it was actually the addiction → Who I am without it → The surprise of meeting myself → CTA', hook: 'Name a specific personality trait people associated with you that was actually the substance — "the fun one," "the wild one," "the life of the party."' },
          { name: 'the-excuse', arc: 'My best excuse → Why it worked so well → When it stopped working → What honesty sounds like → CTA', hook: 'Start with your single best, most bulletproof excuse. The one that fooled everyone. Deliver it like you\'re still selling it.' },
          { name: 'two-versions', arc: 'The daytime version of me → The nighttime version → The moment they collided → Which one survived → CTA', hook: 'Describe living as two completely different people. The mask and the face behind it. When the worlds finally overlapped.' },

          // ── MOMENTS / TURNING POINTS ──
          { name: 'the-quiet-moment', arc: 'It wasn\'t a dramatic rock bottom → It was a Tuesday afternoon → The small ordinary thing that broke me → Why quiet moments hit harder → CTA', hook: 'Describe the anticlimactic moment of realization — not a car crash or an arrest, but a quiet Tuesday that somehow broke through.' },
          { name: 'the-google-search', arc: 'The search I typed at 3am → The results I found → What I did the next morning → Where that search led me → CTA', hook: 'Start with the exact Google search — "am I an alcoholic quiz," "how to quit without anyone knowing," "is it normal to..." Raw browser history energy.' },
          { name: 'the-voicemail', arc: 'The voicemail I left → What I said vs what I meant → Whether they ever heard it → The conversation I had sober → CTA', hook: 'Start with the drunk voicemail or text — the rambling, the honesty that only comes when you\'re not sober enough to filter.' },
          { name: 'the-relapse', arc: 'The day I relapsed → What triggered it → What was different this time → Why falling doesn\'t mean failing → CTA', hook: 'Start with the specific moment of relapse — not shame, but honesty. What happened, how it felt, and the crucial difference the second time.' },
          { name: 'the-holiday', arc: 'The holiday/event I dreaded sober → What I expected → What actually happened → The tradition I\'m building now → CTA', hook: 'Name the specific holiday, birthday, or social event. The fear of being sober at it. The surprise of what it actually felt like.' },

          // ── SOCIAL / CULTURAL ──
          { name: 'the-normalization', arc: 'The meme/joke that made everyone laugh → Why I laughed too → What it\'s actually describing → What we should be saying → CTA', hook: 'Start with a specific social media meme or cultural joke about the substance — wine o\'clock, "I need a drink," bet slip bragging. Deconstruct it.' },
          { name: 'the-enabler', arc: 'The person who always said yes → Why they kept enabling → The day they stopped → What real support looks like → CTA', hook: 'Describe the specific person who made it easy to keep going — the drinking buddy, the dealer who "checked in," the partner who looked away.' },
          { name: 'the-industry', arc: 'How [industry] profits from addiction → The marketing they use → What they don\'t show → The real product is you → CTA', hook: 'Call out the specific industry — Big Alcohol, gambling apps, pharma. Name the marketing tactics. Follow the money.' },
          { name: 'the-group-chat', arc: 'The group chat that only activated at night → The messages I\'d send → The morning regret → The group chat I\'m in now → CTA', hook: 'Describe the specific friend group dynamic around the substance. The enabling texts, the weekend plans, the unspoken rules.' },

          // ── RECOVERY WINS / HOPE ──
          { name: 'the-first-week', arc: 'Day 1 → Day 3 (the worst) → Day 5 (the surprise) → Day 7 (the realization) → CTA', hook: 'Hour-by-hour or day-by-day account of the first week. Brutal honesty about withdrawal, cravings, and the tiny moments of clarity.' },
          { name: 'the-boring-life', arc: 'People said sobriety is boring → What my "boring" Saturday looks like → What I can actually feel now → Why boring is the point → CTA', hook: 'Lean into the "boring" criticism head-on. Describe a mundane sober day in beautiful detail. Make ordinary feel luxurious.' },
          { name: 'the-money-back', arc: 'Month 1 savings → What I bought → Month 6 savings → The account balance that made me cry → CTA', hook: 'Track the literal money saved month by month. Specific purchases, specific account balances. The financial glow-up.' },
          { name: 'the-taste', arc: 'The first meal I actually tasted → The first song that made me feel something → The first morning I wasn\'t afraid → The first time I was bored and okay with it → CTA', hook: 'Describe the sensory experience of sobriety — when colors, flavors, music, and emotions come back online after being numbed.' },
          { name: 'the-dream', arc: 'The dream I had about using → How real it felt → Waking up and realizing → What recovery dreams mean → CTA', hook: 'Start with a vivid using dream — common in recovery. The panic of waking up thinking you relapsed. The relief and what it teaches you.' },
          { name: 'the-thing-i-got-back', arc: 'The thing I lost to addiction → How long it was gone → The day I got it back → What it means now → CTA', hook: 'Name ONE specific thing — custody, a friendship, a job, trust, your health, your creativity. The full circle story of losing and reclaiming it.' },
        ];

        const angle = STORY_ANGLES[Math.floor(Math.random() * STORY_ANGLES.length)];
        const randomSeed = Math.floor(Math.random() * 100000);

        // Style-specific scene instructions
        const SCENE_INSTRUCTIONS: Record<string, string> = {
          'pixar-animals': 'ALL scenes must feature the SAME cute animated animal character — describe this exact same character in every scene doing different cute actions and in different settings. NO humans.',
          'sunflower-fields': 'ALL scenes must be animated/illustrated sunflower fields (NOT photos). NO people, NO humans, NO characters. Each slide MUST have a DIFFERENT sky — sunset, blue day, twilight, sunrise mist, stormy, starry night, warm amber. Vary the field composition too: wide view, close-up, rolling hills, path through field, pond reflection, aerial.',
          'majestic-mountains': 'ALL scenes must be ONLY hyperrealistic mountain landscapes. NO people, NO humans, NO animals, NO buildings, NO roads, NO man-made objects. ONLY mountains: peaks, ridges, summits, rock faces, snow, clouds. Each slide MUST have a different mountain and different lighting/mood.',
          'inspirational-sunsets': 'ALL scenes must be ONLY sunset landscapes. NO people, NO humans, NO characters, NO silhouettes. Only natural elements: sky, clouds, water, mountains, fields, trees. Each slide should be a different breathtaking sunset location.',
          'ocean': 'ALL scenes must be ONLY hyperrealistic ocean images. NO people, NO humans, NO animals, NO boats, NO buildings, NO man-made objects. ONLY ocean: waves, water, spray, reflections, depth. Each slide MUST show a different angle, color, and mood — turquoise, dark stormy, golden hour, deep blue, emerald green, sunset pink, powerful waves.',
          '3d-animated-bee': 'ALL scenes must feature the SAME adorable chubby kawaii bee character with round black glasses. The bee should be doing a cute action that DIRECTLY relates to the slide text/message — if the text is about strength, show the bee flexing or lifting something; if about peace, show the bee meditating or sleeping; if about community, show the bee with friends. Each slide has a different action and background but the SAME bee character. Surround with colorful flowers, hearts, and cheerful elements. Bright warm colors only. NO humans.',
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

TEXT STYLE: STANDALONE MOTIVATIONAL QUOTES
Generate exactly 4 slides. Each content slide is ONE standalone inspirational quote about recovery, sobriety, or quitting ${nicheName}. NOT a storyline. NOT connected slides. Each quote stands completely on its own.

SLIDE 1 (HOOK QUOTE):
- The most powerful, scroll-stopping quote. MUST name ${nicheName} or reference it specifically.
- Short, punchy, emotional. Think: "I didn't quit ${nicheName} because I was strong. I quit because I was tired."
- This quote alone should make someone stop scrolling and feel something.

SLIDES 2-3 (2 STANDALONE QUOTES):
- Each slide is ONE independent motivational quote about quitting ${nicheName} or being in recovery from it.
- Every quote MUST be specific to ${nicheName} — mention the substance, its effects, its rituals, or its specific recovery experience. If you could swap in any other addiction and the quote still works, it's too generic. REWRITE IT.
- Quotes should be INSPIRATIONAL and EMPOWERING — about strength, clarity, freedom, choosing yourself, the beauty of sobriety.
- Vary the emotional tone: triumphant, fierce, gentle, reflective, defiant, grateful.
- Keep quotes concise — 1-3 sentences max. They go on images.
- Each quote is COMPLETELY independent. No "Part 1, Part 2" energy. No narrative arc.

SLIDE 4 (CTA):
- Text MUST be exactly: Quit with the Sunflower Sober app
- No variations. Plain text only.

CRITICAL: You MUST return exactly 4 slides in the JSON array. All 4 must be present.

ABSOLUTE BANNED CHARACTERS AND FORMATTING:
- Do NOT use em dashes (—). Use periods or commas instead.
- Do NOT use en dashes (–).
- Do NOT use asterisks (*), markdown bold (**), or any special formatting.
- Plain text only. No special characters.

ABSOLUTE BANNED PHRASES (instant reject if any appear):
"one day at a time", "recovery is a journey", "you are not alone", "it gets better", "rock bottom" (as motivation), "breaking free", "chose life", "found the light", "finally showing up", "rewrite your story", "you're worth it", "believe in yourself", "light at the end", "stronger than you know", "recovery is possible", "take it one step", "new chapter", "healing journey", "self-love", "your story isn't over", "show up for myself", "choose smarter", "staying consistent", "morning gratitude", "you've got this", "stay strong", "never give up", "the struggle is worth it"

VOICE: Write like someone who beat THIS SPECIFIC addiction and is sharing hard-won wisdom. Raw, real, specific. Not a therapist, not a greeting card.

QUALITY CHECK: Triple-check ALL text for spelling, grammar, and typos. No em dashes. This text gets rendered on images — errors will be visible.

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

        // Generate images: content slides + 2 for screenshot overlays (tracker + community) + 1 CTA
        // Motivational: 3 content + tracker + community + CTA = 6
        // Educational: 6 content + tracker + community + CTA = 9
        const contentSlideCount = textStyle === 'motivational' ? 3 : 6;
        const totalImages = contentSlideCount + 3; // +tracker +community +CTA
        for (let i = 0; i < totalImages; i++) {
          const slide = i < story.slides.length ? story.slides[i] : null;
          const extraScenes = [
            'A warm, inviting scene that conveys tracking progress and personal growth',
            'A welcoming, communal scene that conveys connection, support, and belonging',
          ];
          const sceneText = slide ? slide.scene : extraScenes[i - contentSlideCount] || extraScenes[0];
          send({ progress: 10 + (i * 10), status: `Generating image ${i + 1} of ${totalImages}...` });

          const imagePrompt = `${stylePrompt}

Scene: ${sceneText}

Generate a beautiful background image with NO text, NO words, NO letters, NO numbers, NO captions, NO titles, NO watermarks anywhere in the image. The image must be completely free of any written content — pure visual scene only. Text will be added programmatically afterwards.

3:4 portrait aspect ratio for Instagram/TikTok carousel. Leave space in the center for text overlay (slightly darker or simpler area in the middle third of the image works well).

This is slide ${i + 1} of ${totalImages} in a carousel series. Visual consistency across all slides is critical.`;

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
