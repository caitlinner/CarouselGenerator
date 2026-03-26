'use client';

import Link from 'next/link';

const NICHES = [
  { id: 'general-sobriety', emoji: '🌻', label: 'General Sobriety', desc: 'Recovery journeys, sober milestones, healing', color: '#F5A623' },
  { id: 'alcohol', emoji: '🍷', label: 'Alcohol', desc: 'Breaking free from drinking, sober curious', color: '#8B5DC8' },
  { id: 'gambling', emoji: '🎰', label: 'Gambling', desc: 'Financial ruin, addiction cycles, recovery', color: '#E8734A' },
  { id: 'meth', emoji: '💊', label: 'Meth', desc: 'Destruction, transformation, rebuilding', color: '#DC2626' },
  { id: 'heroin', emoji: '🩸', label: 'Heroin', desc: 'Rock bottom, survival, coming back to life', color: '#7C3AED' },
  { id: 'mdma', emoji: '💜', label: 'MDMA', desc: 'Party culture exit, brain recovery, real joy', color: '#EC4899' },
  { id: 'cannabis', emoji: '🍃', label: 'Cannabis', desc: 'Clarity after quitting, motivation return', color: '#16A34A' },
  { id: 'cocaine', emoji: '❄️', label: 'Cocaine', desc: 'The lie of confidence, financial drain, sobriety', color: '#0EA5E9' },
  { id: 'fentanyl', emoji: '⚠️', label: 'Fentanyl', desc: 'Survival stories, awareness, losing friends', color: '#F59E0B' },
];

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-3" style={{ color: '#4A1A8A' }}>
          🌻 Sunflower Carousel Generator
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto">
          Pick an addiction niche → choose a text &amp; design style → get 7 AI images that tell a sobriety story. Ready to post.
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 mb-10 text-sm flex-wrap">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full font-medium text-white" style={{ background: '#4A1A8A' }}>
          <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">1</span>
          Pick Niche
        </div>
        <div className="w-8 h-px bg-gray-300" />
        <div className="flex items-center gap-2 px-4 py-2 rounded-full text-gray-400 bg-gray-100">
          <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">2</span>
          Text Style
        </div>
        <div className="w-8 h-px bg-gray-300" />
        <div className="flex items-center gap-2 px-4 py-2 rounded-full text-gray-400 bg-gray-100">
          <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">3</span>
          Design Style
        </div>
        <div className="w-8 h-px bg-gray-300" />
        <div className="flex items-center gap-2 px-4 py-2 rounded-full text-gray-400 bg-gray-100">
          <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">4</span>
          Generate
        </div>
      </div>

      <h2 className="text-lg font-bold mb-4" style={{ color: '#4A1A8A' }}>Choose Your Niche</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {NICHES.map(n => (
          <Link
            key={n.id}
            href={`/create?niche=${n.id}`}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all group cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full" style={{ background: n.color }} />
            <div className="pl-3">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-2xl">{n.emoji}</span>
                <span className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">{n.label}</span>
              </div>
              <div className="text-sm text-gray-500">{n.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
