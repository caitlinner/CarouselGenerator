'use client';

import { useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

const NICHE_LABELS: Record<string, string> = {
  'general-sobriety': '🌻 General Sobriety',
  'alcohol': '🍷 Alcohol Recovery',
  'gambling': '🎰 Gambling Addiction',
  'meth': '💊 Meth Recovery',
  'heroin': '🩸 Heroin Recovery',
  'mdma': '💜 MDMA / Party Drug Recovery',
  'cannabis': '🍃 Cannabis / Weed Recovery',
  'cocaine': '❄️ Cocaine Recovery',
  'fentanyl': '⚠️ Fentanyl Awareness & Recovery',
};

const TEXT_STYLES = [
  {
    id: 'educational',
    emoji: '📚',
    label: 'Educational',
    desc: 'Bold hook title on slide 1, then 5 succinct numbered tips/advice on slides 2-6, CTA on slide 7',
    preview: 'linear-gradient(135deg, #4A1A8A 0%, #8B5DC8 100%)',
  },
  {
    id: 'motivational',
    emoji: '💪',
    label: 'Motivational',
    desc: '6 powerful motivational quotes about quitting — raw, emotional, and shareable',
    preview: 'linear-gradient(135deg, #F5A623 0%, #FF6B6B 100%)',
  },
];

const IMAGE_STYLES = [
  {
    id: 'pixar-animals',
    emoji: '🐻',
    label: 'Cute Pixar Animals',
    desc: 'Adorable 3D animated animals delivering powerful sobriety messages',
    preview: 'linear-gradient(135deg, #FFB347 0%, #FF6B6B 100%)',
  },
  {
    id: 'sunflower-fields',
    emoji: '🌻',
    label: 'Sunflower Fields',
    desc: 'Warm golden sunflower field landscapes — no humans, just nature',
    preview: 'linear-gradient(135deg, #F5C518 0%, #FF8C00 100%)',
  },
  {
    id: 'majestic-mountains',
    emoji: '🏔️',
    label: 'Majestic Mountains',
    desc: 'Epic mountain landscapes with lush greenery — no humans, just nature',
    preview: 'linear-gradient(135deg, #2D5016 0%, #6B8E23 100%)',
  },
  {
    id: 'inspirational-sunsets',
    emoji: '🌅',
    label: 'Inspirational Sunsets',
    desc: 'Breathtaking sunset landscapes with dramatic skies — no humans, just nature',
    preview: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
  {
    id: '3d-animated-bee',
    emoji: '🐝',
    label: '3D Animated Bee',
    desc: 'Adorable chubby 3D bee with glasses in different scenes delivering sobriety wisdom',
    preview: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)',
  },
];

// Composites text onto a background image using Canvas API
async function compositeTextOnImage(bgDataUrl: string, text: string, slideIndex: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;

      // Draw background
      ctx.drawImage(img, 0, 0);

      // Semi-transparent dark overlay for text readability
      const overlayY = img.height * 0.15;
      const overlayH = img.height * 0.7;
      const gradient = ctx.createLinearGradient(0, overlayY, 0, overlayY + overlayH);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(0.15, 'rgba(0, 0, 0, 0.55)');
      gradient.addColorStop(0.85, 'rgba(0, 0, 0, 0.55)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, overlayY, img.width, overlayH);

      // Text settings
      const padding = img.width * 0.08;
      const maxWidth = img.width - padding * 2;
      const isSlide1 = slideIndex === 0;
      const isCTA = slideIndex === 6;

      // Font sizing
      let fontSize = isCTA ? img.width * 0.055 : isSlide1 ? img.width * 0.065 : img.width * 0.048;
      const lineHeight = fontSize * 1.35;

      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      // Word wrap function
      function wrapText(text: string, maxW: number, fs: number): string[] {
        ctx.font = `bold ${fs}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
        const lines: string[] = [];
        // Split on explicit newlines first
        const paragraphs = text.split('\n');
        for (const para of paragraphs) {
          const words = para.split(' ');
          let currentLine = '';
          for (const word of words) {
            const testLine = currentLine ? currentLine + ' ' + word : word;
            if (ctx.measureText(testLine).width > maxW && currentLine) {
              lines.push(currentLine);
              currentLine = word;
            } else {
              currentLine = testLine;
            }
          }
          if (currentLine) lines.push(currentLine);
        }
        return lines;
      }

      let lines = wrapText(text, maxWidth, fontSize);

      // Auto-shrink if too many lines
      while (lines.length * lineHeight > overlayH * 0.8 && fontSize > img.width * 0.03) {
        fontSize *= 0.9;
        lines = wrapText(text, maxWidth, fontSize);
      }

      const totalTextHeight = lines.length * (fontSize * 1.35);
      const startY = (img.height - totalTextHeight) / 2;

      // Draw text with shadow
      ctx.font = `bold ${fontSize}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
      ctx.fillStyle = 'white';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = fontSize * 0.15;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = fontSize * 0.05;

      lines.forEach((line, i) => {
        const y = startY + i * (fontSize * 1.35);
        // Draw outline
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.lineWidth = fontSize * 0.06;
        ctx.strokeText(line, img.width / 2, y);
        // Draw fill
        ctx.fillText(line, img.width / 2, y);
      });

      // Slide number badge (top-left)
      if (!isCTA) {
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        const badgeSize = img.width * 0.06;
        const badgeX = padding;
        const badgeY = img.height * 0.04;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(badgeX + badgeSize / 2, badgeY + badgeSize / 2, badgeSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1a1a2e';
        ctx.font = `bold ${badgeSize * 0.55}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${slideIndex + 1}`, badgeX + badgeSize / 2, badgeY + badgeSize / 2);
      }

      resolve(canvas.toDataURL('image/png'));
    };
    img.src = bgDataUrl;
  });
}

function CreateContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const niche = searchParams.get('niche') || 'general-sobriety';

  const [step, setStep] = useState<'textStyle' | 'style' | 'generating' | 'preview'>('textStyle');
  const [selectedTextStyle, setSelectedTextStyle] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [bgImages, setBgImages] = useState<string[]>([]);
  const [slideTexts, setSlideTexts] = useState<string[]>([]);
  const [storyTitle, setStoryTitle] = useState('');
  const [genProgress, setGenProgress] = useState(0);
  const [error, setError] = useState('');

  const activeStep = step === 'textStyle' ? 2 : step === 'style' ? 3 : 4;

  async function generateCarousel(styleId: string) {
    setSelectedStyle(styleId);
    setStep('generating');
    setGenProgress(0);
    setError('');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche, styleId, textStyle: selectedTextStyle }),
      });
      if (!res.ok) throw new Error(await res.text());

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let localSlideTexts: string[] = [];

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const parsed = JSON.parse(line.slice(6));
                if (parsed.progress !== undefined) setGenProgress(parsed.progress);
                if (parsed.storyTitle) setStoryTitle(parsed.storyTitle);
                if (parsed.slideTexts) {
                  localSlideTexts = parsed.slideTexts;
                  setSlideTexts(parsed.slideTexts);
                }
                if (parsed.images) {
                  // Background images received — now composite text on top programmatically
                  setBgImages(parsed.images);
                  setGenProgress(95);
                  const composited: string[] = [];
                  for (let i = 0; i < parsed.images.length; i++) {
                    if (parsed.images[i] && localSlideTexts[i]) {
                      const result = await compositeTextOnImage(parsed.images[i], localSlideTexts[i], i);
                      composited.push(result);
                    } else {
                      composited.push(parsed.images[i] || '');
                    }
                  }
                  setImages(composited);
                  setStep('preview');
                }
                if (parsed.error) throw new Error(parsed.error);
              } catch { /* partial */ }
            }
          }
        }
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to generate');
      setStep('style');
    }
  }

  const StepBar = () => (
    <div className="flex items-center justify-center gap-3 mb-8 text-sm flex-wrap">
      {[
        { num: 1, label: 'Niche' },
        { num: 2, label: 'Text Style' },
        { num: 3, label: 'Design Style' },
        { num: 4, label: 'Generate' },
      ].map((s, i) => (
        <div key={s.num} className="flex items-center gap-3">
          {i > 0 && <div className="w-8 h-px bg-gray-300" />}
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium ${
              activeStep >= s.num ? 'text-white' : 'text-gray-400 bg-gray-100'
            }`}
            style={activeStep >= s.num ? { background: '#4A1A8A' } : {}}
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              activeStep >= s.num ? 'bg-white/20' : 'bg-gray-200'
            }`}>{s.num}</span>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );

  // Text style selection
  if (step === 'textStyle') {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10">
        <button onClick={() => router.push('/')} className="text-sm text-gray-500 hover:text-purple-600 mb-6 inline-flex items-center gap-1">
          ← Back to niches
        </button>

        <StepBar />

        <div className="mb-2">
          <h1 className="text-2xl font-bold" style={{ color: '#4A1A8A' }}>
            {NICHE_LABELS[niche] || niche}
          </h1>
          <p className="text-gray-500 mt-1">Choose a text prompt style for your 7-slide carousel</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-8">
          {TEXT_STYLES.map(s => (
            <button
              key={s.id}
              onClick={() => { setSelectedTextStyle(s.id); setStep('style'); }}
              className="w-full text-left bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-purple-200 transition-all overflow-hidden group"
            >
              <div className="flex flex-col items-center p-8 text-center">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-4" style={{ background: s.preview }}>
                  {s.emoji}
                </div>
                <div className="font-bold text-lg text-gray-900 group-hover:text-purple-700 transition-colors mb-2">
                  {s.label}
                </div>
                <div className="text-sm text-gray-500">{s.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Design style selection
  if (step === 'style') {
    const textStyleObj = TEXT_STYLES.find(t => t.id === selectedTextStyle);
    return (
      <div className="max-w-4xl mx-auto px-6 py-10">
        <button onClick={() => setStep('textStyle')} className="text-sm text-gray-500 hover:text-purple-600 mb-6 inline-flex items-center gap-1">
          ← Back to text style
        </button>

        <StepBar />

        <div className="mb-2">
          <h1 className="text-2xl font-bold" style={{ color: '#4A1A8A' }}>
            {NICHE_LABELS[niche] || niche}
          </h1>
          <p className="text-gray-500 mt-1">
            {textStyleObj?.emoji} {textStyleObj?.label} — Now choose a design style to generate your 7-slide carousel
          </p>
        </div>

        {error && <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>}

        <div className="grid grid-cols-1 gap-5 mt-8">
          {IMAGE_STYLES.map(s => (
            <button
              key={s.id}
              onClick={() => generateCarousel(s.id)}
              className="w-full text-left bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-purple-200 transition-all overflow-hidden group"
            >
              <div className="flex items-stretch">
                <div className="w-32 shrink-0 flex items-center justify-center text-5xl" style={{ background: s.preview }}>
                  {s.emoji}
                </div>
                <div className="p-6 flex-1">
                  <div className="font-bold text-lg text-gray-900 group-hover:text-purple-700 transition-colors mb-1">
                    {s.label}
                  </div>
                  <div className="text-sm text-gray-500 mb-3">{s.desc}</div>
                  <div className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full" style={{ background: '#F5C518', color: '#1a1a2e' }}>
                    🎨 Click to generate 7 slides
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Generating
  if (step === 'generating') {
    const styleObj = IMAGE_STYLES.find(s => s.id === selectedStyle);
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="text-5xl mb-6">{styleObj?.emoji || '🎨'}</div>
        <h2 className="text-xl font-bold mb-2" style={{ color: '#4A1A8A' }}>
          Generating your carousel...
        </h2>
        <p className="text-gray-500 mb-2">{styleObj?.label} — {NICHE_LABELS[niche]}</p>
        <p className="text-sm text-purple-400 mb-8">Generating backgrounds → adding text overlay programmatically</p>

        <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${genProgress}%`, background: 'linear-gradient(90deg, #4A1A8A, #8B5DC8)' }}
          />
        </div>
        <p className="text-sm text-gray-400">
          {genProgress < 10 && 'Writing your sobriety story...'}
          {genProgress >= 10 && genProgress < 22 && 'Generating slide 1...'}
          {genProgress >= 22 && genProgress < 34 && 'Generating slide 2...'}
          {genProgress >= 34 && genProgress < 46 && 'Generating slide 3...'}
          {genProgress >= 46 && genProgress < 58 && 'Generating slide 4...'}
          {genProgress >= 58 && genProgress < 70 && 'Generating slide 5...'}
          {genProgress >= 70 && genProgress < 82 && 'Generating slide 6...'}
          {genProgress >= 82 && genProgress < 94 && 'Generating slide 7...'}
          {genProgress >= 94 && genProgress < 100 && 'Compositing text onto images...'}
          {genProgress >= 100 && 'Done!'}
        </p>

        {storyTitle && (
          <div className="mt-10 p-4 rounded-xl bg-white border border-gray-100 text-left">
            <div className="font-medium text-sm text-purple-800 mb-2">{storyTitle}</div>
            {slideTexts.length > 0 && (
              <div className="space-y-1">
                {slideTexts.map((t, i) => (
                  <div key={i} className="text-xs text-gray-500 flex items-start gap-2">
                    <span className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white mt-0.5" style={{ background: '#8B5DC8' }}>{i+1}</span>
                    {t}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Preview
  const styleObj = IMAGE_STYLES.find(s => s.id === selectedStyle);
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#4A1A8A' }}>
            {storyTitle || 'Your Carousel'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">7 slides — {styleObj?.label} — {NICHE_LABELS[niche]}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { setStep('textStyle'); setImages([]); setSlideTexts([]); setStoryTitle(''); setSelectedTextStyle(null); }}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50"
          >
            ← New carousel
          </button>
          <button
            onClick={() => {
              images.forEach((img, i) => {
                const a = document.createElement('a');
                a.href = img;
                a.download = `sunflower-carousel-${i + 1}.png`;
                a.click();
              });
            }}
            className="px-6 py-2 rounded-lg text-sm font-medium"
            style={{ background: '#F5C518', color: '#1a1a2e' }}
          >
            ⬇️ Download All
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {images.map((img, i) => (
          <div key={i} className="relative group">
            <div className="aspect-[4/5] rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm">
              {img ? (
                <img src={img} alt={slideTexts[i] || `Slide ${i + 1}`} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No image</div>
              )}
            </div>
            {slideTexts[i] && (
              <div className="mt-2 text-xs text-gray-500 line-clamp-2">{slideTexts[i]}</div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile preview */}
      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
        <h3 className="font-medium text-sm text-gray-500 mb-4">📱 Mobile Carousel Preview</h3>
        <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory">
          {images.map((img, i) => (
            <div key={i} className="snap-center shrink-0 w-[280px]">
              <div className="aspect-[4/5] rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                <img src={img} alt={`Slide ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CreatePage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto px-6 py-10 animate-pulse"><div className="h-8 w-48 rounded bg-gray-200 mb-4" /><div className="h-4 w-96 rounded bg-gray-100" /></div>}>
      <CreateContent />
    </Suspense>
  );
}
