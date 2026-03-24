import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const NICHE_CONTEXT: Record<string, string> = {
  'general-sobriety': `General sobriety/recovery. VIRAL ANGLES: the "is this the same person?" before/after disbelief, day counter milestones that make people do math ("wait, 847 days means they quit during COVID"), the specific embarrassing moment that was your last straw, the friend who stopped calling. EMOTIONAL HOOKS: shame spiral specifics, the 3am phone check, waking up and checking your bank account, the apology you never sent.`,
  'alcohol': `Alcohol addiction. VIRAL ANGLES: "mommy wine culture" is manufactured by Big Alcohol targeting women 30-45, the "just one glass" that becomes a bottle by Thursday, hiding bottles in the recycling before your partner gets home, the Instagram wine-o-clock memes that normalize dependency. EMOTIONAL HOOKS: the morning mouth taste, checking your texts with dread, calling in sick on Monday again, your kid seeing you stumble, the exact moment you realized you were drinking alone every night.`,
  'gambling': `Gambling addiction. VIRAL ANGLES: sports betting apps designed like slot machines in your pocket, the "I'll win it back" lie at 4am, checking your phone during dinner for live odds, the parlay that was "guaranteed", borrowing money from people who trust you. EMOTIONAL HOOKS: the exact dollar amount you've lost (specificity kills), the notification sound that Pavlov-trained you, refreshing the banking app knowing what you'll see, the spreadsheet of losses you'll never show anyone.`,
  'meth': `Meth addiction. VIRAL ANGLES: the before/after face that makes people screenshot and share, 72-hour binges where you clean the entire house then don't sleep for a week, shadow people, picking at skin in the mirror for hours, the paranoia that everyone knows. EMOTIONAL HOOKS: the first time your mom didn't recognize you, teeth crumbling, the weight you lost that people "complimented" not knowing why, the sound of a lighter that still triggers something.`,
  'heroin': `Heroin/opioid addiction. VIRAL ANGLES: started with a prescription after surgery and ended up on the street, the warm blanket feeling vs the cold reality of withdrawal, Narcan saves — the 4 minutes between death and life, long sleeves in July. EMOTIONAL HOOKS: the first time you stole from family, nodding off mid-conversation with your kid, the friend who OD'd on what you both bought together, the hospital bracelet collection, waking up in the ER and the nurse's face.`,
  'mdma': `MDMA/party drug addiction. VIRAL ANGLES: "it's not addictive" is the lie that gets you, the Tuesday depression that becomes every day depression, chasing the first roll forever, your serotonin is a credit card and you maxed it out. EMOTIONAL HOOKS: the moment music stopped making you feel anything sober, taking more and feeling less, your jaw hurting on Monday, friends who only text you about the next rave, realizing the "love" you felt was chemistry not connection.`,
  'cannabis': `Cannabis dependency. VIRAL ANGLES: "it's just weed" is the most effective gaslighting in addiction — try telling someone you're addicted and watch them laugh, waking and baking so long you forgot what mornings feel like sober, spending $400/month on something you said you could quit anytime. EMOTIONAL HOOKS: the first time you dreamed again after quitting, eating food that actually tastes like food, realizing you haven't been genuinely bored in years because you smoked every feeling away, the motivation that comes flooding back like someone unclogged a drain.`,
  'cocaine': `Cocaine addiction. VIRAL ANGLES: the "successful" addict — nobody suspects because you still show up to work, $500 weekends that become $500 Tuesdays, bathroom stall confessions where you bond with strangers you'll never see again, the 4am group chat that only activates on weekends. EMOTIONAL HOOKS: the drip taste you can't forget, the nosebleed at brunch, checking your bank account on Sunday morning, the friends who were really just people who shared a bag, the moment you realized "social use" was a lie you told to everyone including yourself.`,
  'fentanyl': `Fentanyl crisis. VIRAL ANGLES: a pill that looks like Percocet killed your friend — they thought they knew what they were taking, carrying Narcan because you don't trust the supply anymore, rainbow fentanyl that looks like candy, losing 3 friends in one year to the same thing. EMOTIONAL HOOKS: the text that starts with "did you hear about...", the phone call from a number you recognize at 2am, the memorial tattoo that keeps getting additions, the empty chair at Thanksgiving that nobody mentions but everyone sees.`,
};

export async function POST(req: NextRequest) {
  try {
    const { niche } = await req.json();
    if (!niche) return NextResponse.json({ error: 'Niche required' }, { status: 400 });

    const nicheContext = NICHE_CONTEXT[niche] || `Addiction recovery content about: ${niche}`;

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

    const prompt = `You generate carousel concepts for ${nicheName} recovery content on Instagram and TikTok.

ADDICTION TYPE: ${nicheName}
NICHE CONTEXT: ${nicheContext}

Generate exactly 5 carousel story ideas. Each carousel has 5 slides.

CRITICAL RULE: Every single carousel must be UNMISTAKABLY about ${nicheName}. If you could swap the addiction name and the content still works, it's too generic. REWRITE IT.

HOOK SLIDE (SLIDE 1) FORMAT — must explicitly name the addiction:
- "5 things that changed when I stopped [drinking/smoking weed/gambling/etc]"
- "[Substance] is one of those things that when you remove it from your life, it also removes a lot of problems"
- "How I finally stopped [drinking/smoking/betting/etc]"
- "5 lessons I learned after I quit [substance/behavior]"
- "What happened when I [deleted the betting apps/put down the bottle/stopped smoking/etc]"
- The hook MUST name the specific substance or behavior. Not "addiction" — the actual thing.

SLIDES 2-4 — NICHE-SPECIFIC CONTENT:
- Each slide must contain details that ONLY apply to ${nicheName}
- For alcohol: hangovers, wine culture, bars, blackouts, morning-after texts, hiding bottles, the "just one glass" lie, beer belly, liver, Sunday scaries
- For cannabis: brain fog lifting, dreams coming back, actually tasting food, motivation returning, spending $400/month on weed, wake-and-bake routine, the "it's not addictive" lie, remembering conversations
- For gambling: betting apps, checking odds during dinner, the "I'll win it back" spiral, DraftKings/FanDuel, parlays, the casino, maxed credit cards, lying about losses, watching sports without betting
- For cocaine: $500 weekends, the 4am group chat, bathroom stalls, nosebleeds, the Sunday comedown, "just on weekends" lie, the drip
- For meth: staying up for days, the crash, before/after face, shadow people, paranoia, teeth, weight
- For heroin: the warm blanket feeling vs withdrawal, long sleeves in July, nodding off, Narcan, pill to needle pipeline
- For MDMA: Tuesday depression, chasing the first roll, jaw clenching, music feeling flat sober, serotonin debt
- For fentanyl: pill presses, Narcan, friends dying, the supply fear, "I thought it was Percocet"
- Slides can be numbered tips/lessons or confessional statements — either format works
- Text should sound like a real person sharing their experience, not a therapist

SLIDE 5: Text MUST be exactly: "Quit today with the Sunflower Sober app 🌻"

ABSOLUTE BANNED PHRASES:
"one day at a time", "recovery is a journey", "you are not alone", "it gets better", "rock bottom", "breaking free", "chose life", "found the light", "finally showing up", "rewrite your story", "you're worth it", "believe in yourself", "light at the end", "stronger than you know", "recovery is possible", "new chapter", "healing journey", "self-love", "your story isn't over", "show up for myself", "choose smarter", "morning gratitude", "staying consistent"

Return ONLY valid JSON (no markdown, no code fences):
{
  "ideas": [
    {
      "title": "The hook that would make someone screenshot this",
      "slides": [
        "Detailed image scene for slide 1",
        "Detailed image scene for slide 2",
        "Detailed image scene for slide 3",
        "Detailed image scene for slide 4",
        "Detailed image scene for slide 5 — should visually represent hope/the Sunflower app"
      ],
      "slideTexts": [
        "Slide 1 text (THE HOOK — max 10 words, must stop scrolling)",
        "Slide 2 text (escalation or reveal)",
        "Slide 3 text (the gut-punch)",
        "Slide 4 text (the turn — raw honesty or unexpected hope)",
        "Quit today with the Sunflower Sober app 🌻"
      ],
      "style": "Suggested visual style",
      "whyItWorks": "One sentence explaining the viral mechanic"
    }
  ]
}`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.95, maxOutputTokens: 4096 },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error('Gemini ideas error:', err);
      return NextResponse.json({ error: 'Failed to generate ideas' }, { status: 500 });
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json(parsed);
  } catch (e) {
    console.error('Ideas error:', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
