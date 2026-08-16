
import React, { useState, useMemo } from 'react';
import { ArrowUpDown, Activity, Layers, Brain } from 'lucide-react';

const ComparisonChart: React.FC = () => {
  const [sortBy, setSortBy] = useState('name');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterEvidence, setFilterEvidence] = useState('all');

  const sessions = [
    { name: 'Anxiety Relief v4', level: 'II', technique: 'Theta relaxation with harmonics', duration: 20, evidence: 'EVIDENCE', brainwave: 'Theta', category: 'Wellness', benefits: ['Stress reduction', 'Relaxation', 'Emotional balance'] },
    { name: 'Deep Sleep Optimization v4', level: 'II', technique: 'Progressive delta entrainment', duration: 25, evidence: 'EVIDENCE', brainwave: 'Delta', category: 'Sleep', benefits: ['Better sleep', 'Recovery', 'Deep rest'] },
    { name: 'Focused Attention v4', level: 'II', technique: 'Beta wave optimization', duration: 25, evidence: 'EVIDENCE', brainwave: 'Beta', category: 'Performance', benefits: ['Enhanced focus', 'Productivity', 'Mental clarity'] },
    { name: 'Learning Consolidation v4', level: 'II', technique: '5 Hz theta for memory', duration: 20, evidence: 'EVIDENCE', brainwave: 'Theta', category: 'Learning', benefits: ['Memory enhancement', 'Learning speed', 'Retention'] },
    { name: 'Peak Performance Gamma v4', level: 'II', technique: 'Theta-gamma coupling', duration: 40, evidence: 'EVIDENCE', brainwave: 'Gamma', category: 'Performance', benefits: ['Peak performance', 'Flow state', 'Cognitive enhancement'] },
    { name: 'Vagus Nerve Reset', level: 'II', technique: 'Polyvagal stimulation', duration: 15, evidence: 'EVIDENCE', brainwave: 'Mixed', category: 'Wellness', benefits: ['Nervous system reset', 'Calm', 'Resilience'] },
    { name: 'Hemispheric Erasure', level: 'III', technique: 'Rapid lateral switching', duration: 10, evidence: 'RESEARCH', brainwave: 'Mixed', category: 'Advanced', benefits: ['Brain integration', 'Pattern breaking', 'Neuroplasticity'] },
    { name: 'Meditation Deepening v4', level: 'III', technique: 'Alpha-theta transition', duration: 30, evidence: 'EVIDENCE', brainwave: 'Alpha-Theta', category: 'Meditation', benefits: ['Deep meditation', 'Insight', 'Consciousness expansion'] },
    { name: 'NeuroFocus 10: Somatic Suspension', level: 'III-IV', technique: 'Mind Awake / Body Asleep State', duration: 30, evidence: 'RESEARCH', brainwave: 'Theta', category: 'Advanced', benefits: ['Mind-body separation', 'Deep exploration', 'OBE prep'] },
    { name: 'NeuroFocus 12: Spatial Expansion', level: 'III-IV', technique: 'Expanded Awareness outside the physical', duration: 30, evidence: 'RESEARCH', brainwave: 'Theta', category: 'Advanced', benefits: ['Expanded awareness', 'Non-physical exploration', 'Consciousness'] },
    { name: 'Remote Viewing', level: 'III-IV', technique: 'Stargate Protocol', duration: 25, evidence: 'RESEARCH', brainwave: 'Theta', category: 'Advanced', benefits: ['Remote perception', 'PSI abilities', 'Information access'] },
    { name: 'Schumann Sync', level: 'III-IV', technique: '7.83Hz Earth Resonance', duration: 30, evidence: 'RESEARCH', brainwave: 'Theta', category: 'Advanced', benefits: ['Earth resonance', 'Grounding', 'Natural rhythm'] },
    { name: 'Lucid Dreaming Gateway', level: 'III', technique: 'WILD Technique Support', duration: 60, evidence: 'RESEARCH', brainwave: 'Alpha-Theta + 40Hz', category: 'Sleep', benefits: ['Lucid dreaming', 'Dream control', 'Consciousness exploration'] },
    { name: 'CE-5 Contact Vector', level: 'V', technique: 'Coherent Thought Sequencing', duration: 30, evidence: 'SPECULATIVE', brainwave: 'Theta + 432Hz', category: 'Speculative', benefits: ['Telepathic receptivity', 'Vectoring', 'Contact'] },
    { name: 'Portal I: Megalithic', level: 'V', technique: '111Hz Resonance', duration: 40, evidence: 'SPECULATIVE', brainwave: 'Epsilon', category: 'Speculative', benefits: ['Right temporal activation', 'Trance', 'Gateway'] },
    { name: 'Portal II: Crystalline', level: 'V', technique: '523Hz High Light', duration: 25, evidence: 'SPECULATIVE', brainwave: 'Hyper-Gamma', category: 'Speculative', benefits: ['Ascension', 'Clarity', 'High frequency'] }
  ];

  const filteredAndSorted = useMemo(() => {
    let result = [...sessions];
    if (filterLevel !== 'all') result = result.filter(s => s.level === filterLevel);
    if (filterEvidence !== 'all') result = result.filter(s => s.evidence === filterEvidence);
    result.sort((a, b) => {
      switch(sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'duration': return a.duration - b.duration;
        case 'level': return a.level.localeCompare(b.level);
        default: return 0;
      }
    });
    return result;
  }, [sortBy, filterLevel, filterEvidence]);

  const getBrainwaveColor = (brainwave: string) => {
    const colors: Record<string, string> = { 'Delta': 'bg-purple-900/50 text-purple-300 border-purple-700', 'Theta': 'bg-cyan-900/50 text-cyan-300 border-cyan-700', 'Alpha': 'bg-green-900/50 text-green-300 border-green-700', 'Alpha-Theta': 'bg-teal-900/50 text-teal-300 border-teal-700', 'Beta': 'bg-yellow-900/50 text-yellow-300 border-yellow-700', 'Gamma': 'bg-red-900/50 text-red-300 border-red-700', 'Mixed': 'bg-indigo-900/50 text-indigo-300 border-indigo-700', 'Alpha-Theta + 40Hz': 'bg-pink-900/50 text-pink-300 border-pink-700' };
    return colors[brainwave] || 'bg-gray-800 text-gray-400';
  };

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = { 'II': 'border-blue-500 text-blue-400 bg-blue-500/10', 'III': 'border-purple-500 text-purple-400 bg-purple-500/10', 'III-IV': 'border-pink-500 text-pink-400 bg-pink-500/10', 'V': 'border-neuro-accent text-neuro-accent bg-neuro-accent/10' };
    return colors[level] || 'border-gray-600 text-gray-400';
  };

  return (
    <div className="w-full bg-neuro-900/50 border border-neuro-700/50 rounded-2xl p-6 md:p-8 shadow-xl backdrop-blur-sm">
      <div className="text-center mb-10 border-b border-neuro-700/50 pb-8">
        <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">Protocol Comparison Library</h2>
        <p className="text-gray-400">Explore the specifications of all SynSync sessions</p>
      </div>

      <div className="flex flex-wrap gap-4 mb-8 bg-neuro-800/30 p-4 rounded-xl border border-neuro-700/30">
        <div className="flex flex-col gap-1 min-w-[140px] flex-1">
          <label className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1"><ArrowUpDown className="w-3 h-3"/> Sort by</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-neuro-900 border border-neuro-700 text-gray-200 text-sm rounded-lg p-2.5 focus:ring-neuro-500 focus:border-neuro-500 block w-full">
            <option value="name">Name</option><option value="duration">Duration</option><option value="level">Level</option>
          </select>
        </div>
        <div className="flex flex-col gap-1 min-w-[140px] flex-1">
          <label className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1"><Layers className="w-3 h-3"/> Filter Level</label>
          <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)} className="bg-neuro-900 border border-neuro-700 text-gray-200 text-sm rounded-lg p-2.5 focus:ring-neuro-500 focus:border-neuro-500 block w-full">
            <option value="all">All Levels</option><option value="II">Level II (Foundational)</option><option value="III">Level III (Advanced)</option><option value="III-IV">Level III-IV (Deep)</option><option value="V">Level V (Speculative)</option>
          </select>
        </div>
        <div className="flex flex-col gap-1 min-w-[140px] flex-1">
          <label className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1"><Activity className="w-3 h-3"/> Evidence</label>
          <select value={filterEvidence} onChange={(e) => setFilterEvidence(e.target.value)} className="bg-neuro-900 border border-neuro-700 text-gray-200 text-sm rounded-lg p-2.5 focus:ring-neuro-500 focus:border-neuro-500 block w-full">
            <option value="all">All Types</option><option value="EVIDENCE">Clinical Evidence</option><option value="RESEARCH">Research Based</option><option value="SPECULATIVE">Experimental</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-neuro-700/50 shadow-inner bg-neuro-900/30 max-h-[600px] overflow-y-auto custom-scrollbar">
        <table className="w-full text-sm text-left text-gray-400 border-collapse">
          <thead className="text-xs text-neuro-400 uppercase bg-neuro-800/90 backdrop-blur border-b border-neuro-700 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 font-bold">Session Name</th>
              <th className="px-6 py-4 font-bold">Level</th>
              <th className="px-6 py-4 font-bold">Brainwave</th>
              <th className="px-6 py-4 font-bold">Duration</th>
              <th className="px-6 py-4 font-bold">Technique</th>
              <th className="px-6 py-4 font-bold">Type</th>
              <th className="px-6 py-4 font-bold">Key Benefits</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSorted.map((session, idx) => (
              <tr key={idx} className="border-b border-neuro-800/50 hover:bg-white/5 transition-colors even:bg-white/[0.02]">
                <td className="px-6 py-4 font-medium text-gray-200">{session.name}</td>
                <td className="px-6 py-4"><span className={`px-2.5 py-0.5 rounded border text-[10px] font-bold whitespace-nowrap ${getLevelColor(session.level)}`}>{session.level}</span></td>
                <td className="px-6 py-4"><span className={`px-2.5 py-0.5 rounded border text-[10px] font-bold whitespace-nowrap ${getBrainwaveColor(session.brainwave)}`}>{session.brainwave}</span></td>
                <td className="px-6 py-4"><div className="flex items-baseline gap-1"><span className="text-white font-mono">{session.duration}</span><span className="text-[10px]">min</span></div></td>
                <td className="px-6 py-4 text-xs">{session.technique}</td>
                <td className="px-6 py-4"><span className={`text-[10px] uppercase font-bold tracking-wider ${session.evidence === 'EVIDENCE' ? 'text-green-400' : session.evidence === 'RESEARCH' ? 'text-blue-400' : 'text-purple-400'}`}>{session.evidence}</span></td>
                <td className="px-6 py-4"><div className="flex flex-wrap gap-1">{session.benefits.slice(0, 2).map((benefit, i) => (<span key={i} className="px-2 py-0.5 bg-white/5 rounded text-[10px] text-gray-300 border border-white/10">{benefit}</span>))}</div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComparisonChart;