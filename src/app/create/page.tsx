'use client';

import { useState, Suspense } from 'react';
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

const IMAGE_STYLES = [
  {
    id: 'pixar-animals',
    emoji: '🐻',
    label: 'Cute Pixar Animals',
    desc: 'Adorable 3D animated animals delivering powerful sobriety messages',
    preview: 'linear-gradient(135deg, #FFB347 0%, #FF6B6B 100%)',
  },
  {
    id: 'iphone-mirror',
    emoji: '📱',
    label: 'iPhone Mirror Selfie',
    desc: 'Raw, real mirror selfies with sobriety text — UGC that feels human',
    preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    id: 'inspirational-sunsets',
    emoji: '🌅',
    label: 'Inspirational Sunsets',
    desc: 'Golden hour landscapes with bold sobriety quotes overlaid',
    preview: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
];

function CreateContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const niche = searchParams.get('niche') || 'general-sobriety';

  const [step, setStep] = useState<'style' | 'generating' | 'preview'>('style');
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [slideTexts, setSlideTexts] = useState<string[]>([]);
  const [storyTitle, setStoryTitle] = useState('');
  const [genProgress, setGenProgress] = useState(0);
  const [error, setError] = useState('');

  const activeStep = step === 'style' ? 2 : 3;

  async function generateCarousel(styleId: string) {
    setSelectedStyle(styleId);
    setStep('generating');
    setGenProgress(0);
    setError('');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche, styleId }),
      });
      if (!res.ok) throw new Error(await res.text());

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

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
                if (parsed.slideTexts) setSlideTexts(parsed.slideTexts);
                if (parsed.images) {
                  setImages(parsed.images);
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
    <div className="flex items-center justify-center gap-3 mb-8 text-sm">
      {[
        { num: 1, label: 'Niche' },
        { num: 2, label: 'Design Style' },
        { num: 3, label: 'Generate' },
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

  // Style selection
  if (step === 'style') {
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
          <p className="text-gray-500 mt-1">Choose a design style — clicking generates your 5-slide carousel instantly</p>
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
                    🎨 Click to generate 5 slides
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
        <p className="text-sm text-purple-400 mb-8">Creating 5 images with sobriety text overlays</p>

        <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${genProgress}%`, background: 'linear-gradient(90deg, #4A1A8A, #8B5DC8)' }}
          />
        </div>
        <p className="text-sm text-gray-400">
          {genProgress < 15 && 'Writing your sobriety story...'}
          {genProgress >= 15 && genProgress < 30 && 'Generating slide 1...'}
          {genProgress >= 30 && genProgress < 50 && 'Generating slide 2...'}
          {genProgress >= 50 && genProgress < 70 && 'Generating slides 3-4...'}
          {genProgress >= 70 && genProgress < 90 && 'Generating slide 5...'}
          {genProgress >= 90 && 'Finalizing...'}
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
          <p className="text-gray-500 text-sm mt-1">5 slides — {styleObj?.label} — {NICHE_LABELS[niche]}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { setStep('style'); setImages([]); setSlideTexts([]); setStoryTitle(''); }}
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
      <div className="grid grid-cols-5 gap-4 mb-8">
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
