import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const NICHE_CONTEXT: Record<string, string> = {
  'general-sobriety': `General sobriety and recovery. Topics: sober milestones, healing journeys, the moment of clarity, rebuilding trust, sober dating, holidays sober, PAWS (post-acute withdrawal), sponsor relationships, meeting culture, one day at a time philosophy.`,
  'alcohol': `Alcohol addiction and recovery. Topics: wine mom culture lies, hangover mornings vs sober mornings, bar culture exit, the "just one drink" trap, liver recovery timeline, drunk texts you'll never send again, alcohol-free alternatives, social pressure at parties, binge drinking wake-up calls.`,
  'gambling': `Gambling addiction and recovery. Topics: chasing losses, sports betting apps destroying lives, the casino high vs real joy, financial ruin and rebuilding, hiding bets from family, online gambling at 3am, scratch ticket addiction, the lie of "one more bet", banned from casinos stories.`,
  'meth': `Meth addiction and recovery. Topics: teeth and skin destruction, psychosis episodes, the 3-day binge crash, meth mouth recovery, before/after face transformations, losing custody to meth, trailer park to stable life, the paranoia of using, tweaking at work.`,
  'heroin': `Heroin and opioid addiction recovery. Topics: needle marks healing, Narcan saves, the nod vs being present, methadone/suboxone journeys, losing friends to overdose, fentanyl-laced supply fear, track marks and long sleeves in summer, the warmth of the high vs real human warmth.`,
  'mdma': `MDMA and party drug recovery. Topics: serotonin syndrome recovery, rave culture exit, fake happiness vs real joy, Tuesday blues becoming every day, losing the magic, brain zaps, realizing ecstasy stole your ability to feel, party friends vs real friends.`,
  'cannabis': `Cannabis addiction recovery (often dismissed). Topics: "it's just weed" gaslighting, brain fog lifting, motivation returning after quitting, the ritual of rolling up, CHS (cannabinoid hyperemesis), weed dependency vs addiction debate, dreaming again after quitting, appetite without being high.`,
  'cocaine': `Cocaine addiction recovery. Topics: bathroom stall confessions, the fake confidence, spending $500 in one night, coke jaw, nosebleeds, 4am existential dread, the crash after the high, mixing coke and alcohol dangers, Wall Street/party culture normalization.`,
  'fentanyl': `Fentanyl crisis awareness and recovery. Topics: friends dying from one pill, pressed pills looking like prescriptions, carrying Narcan everywhere, fentanyl test strips, the 2-minute overdose window, rainbow fentanyl awareness, losing a generation, the most dangerous drug in history, parent grief stories.`,
};

export async function POST(req: NextRequest) {
  try {
    const { niche } = await req.json();
    if (!niche) return NextResponse.json({ error: 'Niche required' }, { status: 400 });

    const nicheContext = NICHE_CONTEXT[niche] || `Addiction recovery content about: ${niche}`;

    const prompt = `You are a viral social media content strategist specializing in addiction recovery and sobriety content. Generate exactly 5 carousel story ideas for this specific niche:

NICHE: ${nicheContext}

Each carousel has exactly 5 slides that tell a cohesive VISUAL story — designed for Instagram/TikTok carousel posts in the recovery/sobriety space.

The ideas should be:
- Emotionally gut-punching (the kind that makes people stop scrolling)
- Relatable to people in recovery or their families
- Visually story-driven (each slide should be a distinct powerful image)
- Shareable — the kind of content people save and send to friends

Return ONLY valid JSON (no markdown, no code fences) in this exact format:
{
  "ideas": [
    {
      "title": "Compelling carousel title that hooks immediately",
      "slides": [
        "Detailed image description for slide 1 — describe the scene, person, emotion, environment",
        "Detailed image description for slide 2",
        "Detailed image description for slide 3",
        "Detailed image description for slide 4",
        "Detailed image description for slide 5 — this should be the emotional payoff/resolution"
      ],
      "style": "Suggested photography/art style for this specific story"
    }
  ]
}

Make each slide description vivid and specific enough to generate a compelling AI image. Vary the narrative structures: use before/after, day-in-the-life, timeline progression, emotional journey, contrast stories, awareness, or family impact angles.`;

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
