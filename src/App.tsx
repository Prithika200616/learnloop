import { useMemo, useState } from 'react';
import {
  ArrowRight,
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  CircleHelp,
  Compass,
  Flame,
  Focus,
  Gem,
  Lightbulb,
  Menu,
  Orbit,
  Play,
  Plus,
  RotateCcw,
  Save,
  Sparkles,
  Star,
  Target,
  Trash2,
  WandSparkles,
  X,
  Zap,
} from 'lucide-react';

type Category = 'Space' | 'Creativity' | 'Nature';
type View = 'home' | 'quests' | 'forge' | 'log' | 'badges';

type Quest = {
  id: string;
  category: Category;
  title: string;
  kicker: string;
  description: string;
  lesson: string[];
  question: string;
  options: string[];
  answer: number;
  xp: number;
  duration: string;
};

type LogEntry = {
  id: string;
  title: string;
  category: string;
  xp: number;
  date: string;
};

type FusionIdea = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  savedAt: string;
};

const quests: Quest[] = [
  {
    id: 'tidal-lock',
    category: 'Space',
    title: 'Why the Moon keeps one face',
    kicker: 'A quiet cosmic rhythm',
    description: 'Orbit, gravity, and the slow dance that makes a familiar face.',
    lesson: [
      'Look at the Moon on any clear night and you are seeing the same broad side that people saw thousands of years ago. It is not standing still — it is spinning.',
      'The Moon rotates once in the same amount of time it takes to orbit Earth: about 27 days. Gravity gradually synchronized those two rhythms, a process called tidal locking.',
    ],
    question: 'What makes the Moon appear to keep the same face toward Earth?',
    options: ['It does not rotate at all', 'Its rotation and orbit take the same time', 'Clouds hide its other side', 'Earth spins at the same speed'],
    answer: 1,
    xp: 60,
    duration: '4 min',
  },
  {
    id: 'creative-constraints',
    category: 'Creativity',
    title: 'The useful power of limits',
    kicker: 'Make a smaller canvas',
    description: 'Why a handful of rules can give imagination somewhere to land.',
    lesson: [
      'A blank page can feel enormous because every possible choice is waiting. A constraint narrows the doorway: use only two colors, write ten words, or draw without lifting the pen.',
      'Limits reduce decision fatigue and invite playful problem-solving. The point is not to make the work smaller — it is to make the next move visible.',
    ],
    question: 'Why can a creative constraint help you begin?',
    options: ['It removes the need for ideas', 'It guarantees a perfect result', 'It narrows choices so a next move appears', 'It makes the work take longer'],
    answer: 2,
    xp: 60,
    duration: '3 min',
  },
  {
    id: 'forest-network',
    category: 'Nature',
    title: 'The forest under the forest',
    kicker: 'A neighborhood of roots',
    description: 'Meet the fungal threads that help trees trade, signal, and survive.',
    lesson: [
      'Beneath a forest floor, hair-thin fungal threads wrap around tree roots. This partnership is called mycorrhiza. The fungi gather hard-to-reach minerals while the trees share sugars made from sunlight.',
      'Those threads can connect many plants. Scientists are still mapping the details, but the picture is clear: a forest is less a collection of solo trees and more a living neighborhood with quiet exchanges.',
    ],
    question: 'What do mycorrhizal fungi commonly exchange with trees?',
    options: ['Minerals for sugars', 'Seeds for sunlight', 'Water for leaves', 'Bark for pollen'],
    answer: 0,
    xp: 60,
    duration: '4 min',
  },
];

const categories: Category[] = ['Space', 'Creativity', 'Nature'];
const categoryStyle: Record<Category, { icon: typeof Orbit; color: string; tint: string }> = {
  Space: { icon: Orbit, color: '#bca0ed', tint: 'rgba(188,160,237,.12)' },
  Creativity: { icon: Lightbulb, color: '#f2b391', tint: 'rgba(242,179,145,.12)' },
  Nature: { icon: Sparkles, color: '#90d6cf', tint: 'rgba(144,214,207,.12)' },
};
const storageKeys = { xp: 'learnloop-xp', completed: 'learnloop-completed', log: 'learnloop-log', ideas: 'learnloop-ideas', bonus: 'learnloop-bonus' };

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

function NavItem({ icon: Icon, label, active, onClick, count }: { icon: typeof Compass; label: string; active: boolean; onClick: () => void; count?: number }) {
  return (
    <button type="button" onClick={onClick} aria-current={active ? 'page' : undefined} className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${active ? 'bg-[#3a3157] text-[#fbf5ec]' : 'text-[#a9a1bb] hover:bg-[#292443] hover:text-[#eee5d8]'}`}>
      <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
      <span className="flex-1">{label}</span>
      {count !== undefined && <span className="rounded-full bg-[#51436c] px-2 py-0.5 text-[11px] text-[#e7dafa]">{count}</span>}
    </button>
  );
}

function CategoryPill({ category }: { category: Category }) {
  const style = categoryStyle[category];
  const Icon = style.icon;
  return <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium" style={{ color: style.color, background: style.tint }}><Icon size={12} />{category}</span>;
}

function ProgressRing({ value, size = 86 }: { value: number; size?: number }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="40" cy="40" r={radius} fill="none" stroke="rgba(188,160,237,.13)" strokeWidth="7" />
        <circle cx="40" cy="40" r={radius} fill="none" stroke="#bca0ed" strokeWidth="7" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference - (circumference * Math.min(value, 100)) / 100} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-[#f9f0e5]">{value}%</span>
    </div>
  );
}

function App() {
  const [view, setView] = useState<View>('home');
  const [mobileNav, setMobileNav] = useState(false);
  const [xp, setXp] = useState(() => readStorage(storageKeys.xp, 0));
  const [completed, setCompleted] = useState<string[]>(() => readStorage(storageKeys.completed, []));
  const [log, setLog] = useState<LogEntry[]>(() => readStorage(storageKeys.log, []));
  const [ideas, setIdeas] = useState<FusionIdea[]>(() => readStorage(storageKeys.ideas, []));
  const [bonusDone, setBonusDone] = useState(() => readStorage(storageKeys.bonus, false));
  const [filter, setFilter] = useState<'All' | Category>('All');
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [lessonStep, setLessonStep] = useState(0);
  const [quizChoice, setQuizChoice] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [toast, setToast] = useState('');
  const [forgePrompt, setForgePrompt] = useState('');
  const [generatedIdeas, setGeneratedIdeas] = useState<FusionIdea[]>([]);
  const [confirmReset, setConfirmReset] = useState(false);

  const level = Math.floor(xp / 250) + 1;
  const levelStart = (level - 1) * 250;
  const levelProgress = Math.round(((xp - levelStart) / 250) * 100);
  const filteredQuests = useMemo(() => filter === 'All' ? quests : quests.filter((quest) => quest.category === filter), [filter]);
  const completedCount = completed.length;
  const hasStarted = xp > 0 || completedCount > 0 || bonusDone || ideas.length > 0;
  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  };

  const addXP = (amount: number, title: string, category: string) => {
    const nextXP = xp + amount;
    const entry: LogEntry = { id: `${Date.now()}-${title}`, title, category, xp: amount, date: new Date().toISOString() };
    setXp(nextXP);
    setLog((current) => {
      const next = [entry, ...current];
      writeStorage(storageKeys.log, next);
      return next;
    });
    writeStorage(storageKeys.xp, nextXP);
  };

  const startQuest = (quest: Quest) => {
    setSelectedQuest(quest);
    setLessonStep(0);
    setQuizChoice(null);
    setQuizSubmitted(false);
  };

  const completeQuest = () => {
    if (!selectedQuest || completed.includes(selectedQuest.id)) {
      setSelectedQuest(null);
      return;
    }
    const nextCompleted = [...completed, selectedQuest.id];
    setCompleted(nextCompleted);
    writeStorage(storageKeys.completed, nextCompleted);
    addXP(selectedQuest.xp, selectedQuest.title, selectedQuest.category);
    setSelectedQuest(null);
    showToast(`Quest complete. +${selectedQuest.xp} XP added to your journey.`);
  };

  const claimBonus = () => {
    if (bonusDone) return;
    setBonusDone(true);
    writeStorage(storageKeys.bonus, true);
    addXP(40, 'Invisible systems bonus mission', 'Bonus mission');
    showToast('Bonus mission complete. +40 XP');
  };

  const generateIdeas = () => {
    const prompt = forgePrompt.trim() || 'your everyday curiosity';
    const seeds = [
      { title: `A field guide to ${prompt}`, description: `Turn ${prompt} into a tiny collection of observations, sketches, and questions you can revisit on a walk.`, tags: ['observe', 'make'] },
      { title: `The ${prompt} sound map`, description: `Pair a scientific detail about ${prompt} with a short listening experiment and a hand-drawn map of what changes.`, tags: ['listen', 'connect'] },
      { title: `${prompt}, explained through a room`, description: `Design a room where each object reveals one hidden idea about ${prompt}. Give every corner a clue.`, tags: ['imagine', 'explain'] },
    ];
    const created = seeds.map((seed, index) => ({ ...seed, id: `${Date.now()}-${index}`, savedAt: new Date().toISOString() }));
    setGeneratedIdeas(created);
    showToast('Three new sparks are ready to explore.');
  };

  const saveIdea = (idea: FusionIdea) => {
    if (ideas.some((saved) => saved.id === idea.id)) return;
    const nextIdeas = [idea, ...ideas];
    setIdeas(nextIdeas);
    writeStorage(storageKeys.ideas, nextIdeas);
    addXP(180, `Curiosity Forge: ${idea.title}`, 'Curiosity Forge');
    showToast('Saved to your Forge. +180 XP');
  };

  const deleteIdea = (id: string) => {
    const nextIdeas = ideas.filter((idea) => idea.id !== id);
    setIdeas(nextIdeas);
    writeStorage(storageKeys.ideas, nextIdeas);
  };

  const resetJourney = () => {
    Object.values(storageKeys).forEach((key) => localStorage.removeItem(key));
    setXp(0); setCompleted([]); setLog([]); setIdeas([]); setBonusDone(false); setGeneratedIdeas([]); setConfirmReset(false);
    showToast('A fresh page is waiting for you.');
  };

  const changeView = (nextView: View) => {
    setView(nextView);
    setMobileNav(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-[100dvh] bg-[#110f22] text-[#f6f0e7]">
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col border-r border-[#28213f] bg-[#16132a] px-4 py-5 transition-transform duration-300 lg:translate-x-0 ${mobileNav ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 px-2">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-[#bca0ed] text-[#181329]">
            <Orbit size={22} strokeWidth={2.3} />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[#f2b391]" />
          </div>
          <div><p className="text-[17px] font-semibold tracking-[-.03em]">LearnLoop</p><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#938aa9]">curiosity playground</p></div>
        </div>
        <div className="mt-12 px-2"><p className="eyebrow mb-3">Your orbit</p><nav className="space-y-1">
          <NavItem icon={Compass} label="Today" active={view === 'home'} onClick={() => changeView('home')} />
          <NavItem icon={BookOpen} label="Quest shelf" active={view === 'quests'} onClick={() => changeView('quests')} count={quests.length - completedCount} />
          <NavItem icon={WandSparkles} label="Curiosity Forge" active={view === 'forge'} onClick={() => changeView('forge')} />
          <NavItem icon={Focus} label="Learning log" active={view === 'log'} onClick={() => changeView('log')} />
          <NavItem icon={Award} label="Badges" active={view === 'badges'} onClick={() => changeView('badges')} />
        </nav></div>
        <div className="mt-auto rounded-2xl border border-[#383052] bg-[#201b39] p-4">
          <div className="mb-3 flex items-center justify-between"><span className="eyebrow">Current level</span><span className="font-mono text-xs text-[#bca0ed]">LVL {level}</span></div>
          <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-[#332a4a]"><div className="h-full rounded-full bg-[#bca0ed] transition-all duration-500" style={{ width: `${levelProgress}%` }} /></div>
          <p className="text-xs text-[#aba2bd]">{Math.max(0, 250 - (xp - levelStart))} XP to level {level + 1}</p>
        </div>
        <button type="button" onClick={() => setConfirmReset(true)} className="mt-4 flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-[#8e879d] transition hover:bg-[#292443] hover:text-[#f2b391]"><RotateCcw size={14} /> Reset journey</button>
      </aside>
      {mobileNav && <button type="button" aria-label="Close navigation" onClick={() => setMobileNav(false)} className="fixed inset-0 z-30 bg-[#070611]/70 lg:hidden" />}

      <main className="min-h-[100dvh] lg:pl-[248px]">
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-[#28213f] bg-[#110f22]/90 px-5 backdrop-blur-xl sm:px-8 lg:px-12">
          <button type="button" aria-label="Open navigation" onClick={() => setMobileNav(true)} className="rounded-lg p-2 text-[#b4abc3] hover:bg-[#292443] lg:hidden"><Menu size={21} /></button>
          <div className="hidden text-sm text-[#a59caf] sm:block">{view === 'home' ? 'A little learning, whenever you arrive.' : view === 'quests' ? 'Choose a thread to follow.' : view === 'forge' ? 'Where unrelated ideas meet.' : view === 'log' ? 'Small steps, kept close.' : 'Proof that you kept wondering.'}</div>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-[#3b3154] bg-[#1d1933] px-3 py-1.5"><Zap size={14} className="text-[#f2b391]" fill="currentColor" /><span className="font-mono text-xs text-[#f3d6c7]">{xp.toLocaleString()} XP</span></div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#5b4b76] bg-[#342b4e] text-xs font-semibold text-[#e4d5f7]" aria-label={`Level ${level}`}>{level}</div>
          </div>
        </header>

        <div className="mx-auto max-w-[1280px] px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
          {view === 'home' && <Dashboard hasStarted={hasStarted} level={level} levelProgress={levelProgress} completedCount={completedCount} log={log} startQuest={startQuest} changeView={changeView} bonusDone={bonusDone} claimBonus={claimBonus} />}
          {view === 'quests' && <QuestShelf completed={completed} filter={filter} setFilter={setFilter} filteredQuests={filteredQuests} startQuest={startQuest} />}
          {view === 'forge' && <Forge forgePrompt={forgePrompt} setForgePrompt={setForgePrompt} generateIdeas={generateIdeas} generatedIdeas={generatedIdeas} ideas={ideas} saveIdea={saveIdea} deleteIdea={deleteIdea} />}
          {view === 'log' && <LearningLog log={log} changeView={changeView} />}
          {view === 'badges' && <Badges completedCount={completedCount} bonusDone={bonusDone} ideas={ideas} xp={xp} />}
        </div>
      </main>

      {selectedQuest && <QuestModal quest={selectedQuest} step={lessonStep} setStep={setLessonStep} choice={quizChoice} setChoice={setQuizChoice} submitted={quizSubmitted} submit={() => setQuizSubmitted(true)} close={() => setSelectedQuest(null)} complete={completeQuest} completed={completed.includes(selectedQuest.id)} />}
      {confirmReset && <ConfirmReset close={() => setConfirmReset(false)} reset={resetJourney} />}
      {toast && <div role="status" className="pop-in fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full border border-[#604f7d] bg-[#2b2446] px-5 py-3 text-sm text-[#f7eee5] shadow-2xl">{toast}</div>}
    </div>
  );
}

function Dashboard({ hasStarted, level, levelProgress, completedCount, log, startQuest, changeView, bonusDone, claimBonus }: { hasStarted: boolean; level: number; levelProgress: number; completedCount: number; log: LogEntry[]; startQuest: (quest: Quest) => void; changeView: (view: View) => void; bonusDone: boolean; claimBonus: () => void }) {
  const dayKeys = [...new Set(log.map((entry) => {
    const day = new Date(entry.date);
    return new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime();
  }))].sort((a, b) => b - a);
  let currentStreak = dayKeys.length ? 1 : 0;
  for (let index = 1; index < dayKeys.length; index += 1) {
    if (dayKeys[index - 1] - dayKeys[index] === 86400000) currentStreak += 1;
    else break;
  }
  return (
    <div className="page-in space-y-10">
      <section className="relative overflow-hidden rounded-[28px] border border-[#3a2d53] bg-[linear-gradient(116deg,#282044_0%,#201a39_62%,#302344_100%)] px-6 py-8 sm:px-10 sm:py-11">
        <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full border border-[#a28bd0]/15" /><div className="pointer-events-none absolute right-14 top-5 h-36 w-36 rounded-full border border-[#e7b092]/10" />
        <Star className="star absolute right-28 top-24 text-[#f2b391]" size={11} fill="currentColor" /><Star className="star absolute right-16 top-12 text-[#bca0ed]" size={7} fill="currentColor" /><Star className="star absolute right-44 top-10 text-[#90d6cf]" size={8} fill="currentColor" />
        <div className="relative max-w-[650px]">
          <p className="eyebrow mb-4">{hasStarted ? 'Welcome back, curious human' : 'Your first loop starts here'}</p>
          <h1 className="max-w-[590px] text-[clamp(2.35rem,5vw,4.25rem)] font-semibold leading-[.98] tracking-[-.065em] text-[#fbf5ec]">{hasStarted ? 'Keep a little room for wonder.' : 'Collect tiny adventures.'}</h1>
          <p className="mt-5 max-w-[510px] text-[15px] leading-7 text-[#b8aec8]">{hasStarted ? `You are on level ${level}, with ${completedCount} ${completedCount === 1 ? 'quest' : 'quests'} in your pocket. Pick up the next thread when you are ready.` : 'Learn one surprising thing, test it, and leave with a question that follows you around.'}</p>
          <button type="button" onClick={() => startQuest(quests[completedCount % quests.length])} className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#bca0ed] px-5 py-3 text-sm font-semibold text-[#1c1630] transition hover:-translate-y-0.5 hover:bg-[#cfbaf1] active:translate-y-0"><Play size={15} fill="currentColor" /> {hasStarted ? 'Continue exploring' : 'Take the first quest'} <ArrowRight size={15} /></button>
        </div>
        <div className="relative mt-9 flex items-center gap-4 border-t border-[#655477]/35 pt-5 sm:absolute sm:bottom-9 sm:right-10 sm:mt-0 sm:border-0 sm:pt-0"><ProgressRing value={levelProgress} /><div><p className="eyebrow mb-1">Level {level}</p><p className="text-sm text-[#e5dbec]">{250 - Math.round((levelProgress / 100) * 250)} XP until next orbit</p></div></div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard icon={Flame} label="Current streak" value={currentStreak ? `${currentStreak} ${currentStreak === 1 ? 'day' : 'days'}` : 'Not started'} note={currentStreak ? 'Keep a thread going.' : 'A fresh start counts.'} accent="#f2b391" />
        <StatCard icon={Target} label="Quests explored" value={`${completedCount} / ${quests.length}`} note={completedCount ? 'You are building a trail.' : 'One is waiting for you.'} accent="#90d6cf" />
        <StatCard icon={Gem} label="XP collected" value={String(Number(localStorage.getItem(storageKeys.xp) || 0))} note="Every question adds up." accent="#bca0ed" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div>
          <div className="mb-4 flex items-end justify-between"><div><p className="eyebrow mb-2">Pick a thread</p><h2 className="text-2xl font-semibold tracking-[-.04em]">A few places to wander</h2></div><button type="button" onClick={() => changeView('quests')} className="hidden items-center gap-1 text-sm text-[#bca0ed] hover:text-[#ddcef4] sm:flex">View shelf <ArrowRight size={14} /></button></div>
          <div className="grid gap-3 sm:grid-cols-3">{quests.map((quest, index) => <QuestMini key={quest.id} quest={quest} index={index} startQuest={startQuest} />)}</div>
        </div>
        <BonusCard done={bonusDone} claim={claimBonus} />
      </section>

      <section className="glass-panel flex flex-col gap-5 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-4"><div className="rounded-xl bg-[#3c3154] p-3 text-[#f2b391]"><WandSparkles size={21} /></div><div><p className="eyebrow mb-1">Curiosity Forge</p><h2 className="text-lg font-medium">What happens when two unrelated things meet?</h2><p className="mt-1 text-sm text-[#aaa0b9]">Fuse a question with a medium and make a new path.</p></div></div>
        <button type="button" onClick={() => changeView('forge')} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-[#5a4b77] px-4 py-2.5 text-sm text-[#dfd2eb] transition hover:bg-[#3c3154]">Open the Forge <ArrowRight size={15} /></button>
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, note, accent }: { icon: typeof Flame; label: string; value: string; note: string; accent: string }) {
  return <div className="glass-panel rounded-2xl p-5"><div className="mb-5 flex items-center justify-between"><span className="text-sm text-[#a9a0b6]">{label}</span><Icon size={18} style={{ color: accent }} /></div><p className="text-[27px] font-semibold tracking-[-.04em]">{value}</p><p className="mt-1 text-xs text-[#878097]">{note}</p></div>;
}

function QuestMini({ quest, index, startQuest }: { quest: Quest; index: number; startQuest: (quest: Quest) => void }) {
  const style = categoryStyle[quest.category]; const Icon = style.icon;
  return <article className="group rounded-2xl border border-[#332a4a] bg-[#1c1831] p-4 transition hover:-translate-y-1 hover:border-[#5c4c78]"><div className="mb-8 flex items-start justify-between"><span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ color: style.color, background: style.tint }}><Icon size={18} /></span><span className="font-mono text-[10px] text-[#7f768f]">0{index + 1}</span></div><CategoryPill category={quest.category} /><h3 className="mt-3 min-h-[48px] text-base font-medium leading-6">{quest.title}</h3><p className="mt-2 text-xs text-[#938a9e]">{quest.duration} · +{quest.xp} XP</p><button type="button" onClick={() => startQuest(quest)} className="mt-4 flex items-center gap-1 text-xs font-medium text-[#c6b0ed] opacity-75 transition group-hover:opacity-100">Explore <ArrowRight size={13} /></button></article>;
}

function BonusCard({ done, claim }: { done: boolean; claim: () => void }) {
  return <div className={`rounded-2xl border p-5 ${done ? 'border-[#527771] bg-[#1b302f]' : 'border-[#604c59] bg-[linear-gradient(145deg,#2b203b,#261b32)]'}`}><div className="mb-5 flex items-center justify-between"><span className="eyebrow text-[#f2b391]">Bonus mission</span><span className="rounded-full bg-[#4b3545] px-2.5 py-1 font-mono text-[11px] text-[#f2c5ab]">+40 XP</span></div><div className="flex gap-3"><div className={`mt-0.5 rounded-lg p-2 ${done ? 'bg-[#32514d] text-[#90d6cf]' : 'bg-[#49364c] text-[#f2b391]'}`}><CircleHelp size={20} /></div><div><h3 className="font-medium">{done ? 'You noticed the invisible.' : 'Find an invisible system'}</h3><p className="mt-2 text-sm leading-6 text-[#aea1b2]">{done ? 'Small systems are everywhere. Keep your eyes open.' : 'Notice one hidden rule shaping your day. Name it, then ask who benefits from it.'}</p></div></div><button type="button" disabled={done} onClick={claim} className={`mt-5 w-full rounded-xl py-2.5 text-sm font-medium transition ${done ? 'cursor-default bg-[#31504d] text-[#9bd7d0]' : 'bg-[#e3a382] text-[#26192b] hover:bg-[#f2b391]'}`}>{done ? 'Mission complete' : 'Mark mission complete'}</button></div>;
}

function QuestShelf({ completed, filter, setFilter, filteredQuests, startQuest }: { completed: string[]; filter: 'All' | Category; setFilter: (filter: 'All' | Category) => void; filteredQuests: Quest[]; startQuest: (quest: Quest) => void }) {
  return <div className="page-in"><div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="eyebrow mb-2">Quest shelf</p><h1 className="text-4xl font-semibold tracking-[-.055em]">Follow your curiosity.</h1><p className="mt-3 max-w-lg text-sm leading-6 text-[#a79db3]">Short lessons, one good question, and a small reward for paying attention.</p></div><div className="flex gap-2 rounded-xl bg-[#1b1730] p-1" role="group" aria-label="Filter quests">{(['All', ...categories] as const).map((item) => <button type="button" key={item} onClick={() => setFilter(item)} className={`rounded-lg px-3 py-2 text-xs transition ${filter === item ? 'bg-[#4a3b64] text-[#f8efe7]' : 'text-[#938a9e] hover:text-[#eee4da]'}`}>{item}</button>)}</div></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filteredQuests.map((quest) => <QuestCard key={quest.id} quest={quest} done={completed.includes(quest.id)} startQuest={startQuest} />)}</div></div>;
}

function QuestCard({ quest, done, startQuest }: { quest: Quest; done: boolean; startQuest: (quest: Quest) => void }) {
  const style = categoryStyle[quest.category]; const Icon = style.icon;
  return <article className="group relative overflow-hidden rounded-2xl border border-[#382e50] bg-[#1c1831] p-6 transition hover:-translate-y-1 hover:border-[#675482]"><div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full opacity-30" style={{ background: style.tint }} /><div className="relative flex items-start justify-between"><div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ color: style.color, background: style.tint }}><Icon size={21} /></div>{done ? <span className="flex items-center gap-1 rounded-full bg-[#274641] px-2.5 py-1 text-[11px] text-[#9ddbd1]"><Check size={12} /> Explored</span> : <span className="font-mono text-xs text-[#81778f]">+{quest.xp} XP</span>}</div><CategoryPill category={quest.category} /><h2 className="mt-4 text-xl font-medium tracking-[-.025em]">{quest.title}</h2><p className="mt-2 min-h-[48px] text-sm leading-6 text-[#a59aae]">{quest.description}</p><div className="mt-6 flex items-center justify-between border-t border-[#302746] pt-4"><span className="text-xs text-[#83798f]">{quest.duration} lesson + knowledge check</span><button type="button" onClick={() => startQuest(quest)} className="inline-flex items-center gap-1.5 text-sm font-medium text-[#c6b0ed]">{done ? 'Replay' : 'Begin'} <ArrowRight size={15} /></button></div></article>;
}

function QuestModal({ quest, step, setStep, choice, setChoice, submitted, submit, close, complete, completed }: { quest: Quest; step: number; setStep: (step: number) => void; choice: number | null; setChoice: (choice: number) => void; submitted: boolean; submit: () => void; close: () => void; complete: () => void; completed: boolean }) {
  const isQuiz = step === quest.lesson.length;
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#090713]/75 p-0 backdrop-blur-sm sm:items-center sm:p-5"><section role="dialog" aria-modal="true" aria-labelledby="quest-title" className="page-in max-h-[92dvh] w-full max-w-[600px] overflow-y-auto rounded-t-[26px] border border-[#4a3b63] bg-[#201b38] p-6 shadow-2xl sm:rounded-[26px] sm:p-8"><div className="mb-7 flex items-start justify-between"><div><CategoryPill category={quest.category} /><p className="eyebrow mt-4">Quest {isQuiz ? 'knowledge check' : `${step + 1} of ${quest.lesson.length}`}</p><h2 id="quest-title" className="mt-2 text-2xl font-semibold tracking-[-.04em]">{quest.title}</h2></div><button type="button" onClick={close} aria-label="Close quest" className="rounded-full p-2 text-[#9c91aa] hover:bg-[#332a4b] hover:text-[#f5ece3]"><X size={19} /></button></div>{!isQuiz ? <div><div className="mb-8 rounded-2xl bg-[#2b2447] p-5"><BookOpen className="mb-5 text-[#bca0ed]" size={21} /><p className="text-[17px] leading-8 text-[#e9dfd9]">{quest.lesson[step]}</p></div><div className="flex justify-end"><button type="button" onClick={() => setStep(step + 1)} className="inline-flex items-center gap-2 rounded-full bg-[#bca0ed] px-5 py-3 text-sm font-semibold text-[#1c1630]">{step === quest.lesson.length - 1 ? 'Take the check' : 'Keep reading'} <ArrowRight size={15} /></button></div></div> : <div><div className="mb-6 rounded-2xl border border-[#45365e] bg-[#2a2344] p-5"><CircleHelp className="mb-4 text-[#f2b391]" size={21} /><p className="text-lg leading-7 text-[#f2e8e0]">{quest.question}</p></div><div className="space-y-2.5">{quest.options.map((option, index) => <button type="button" disabled={submitted} onClick={() => setChoice(index)} key={option} className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm transition ${choice === index ? 'border-[#bca0ed] bg-[#3e3157] text-[#fbf4ec]' : 'border-[#403455] bg-[#251f3e] text-[#b2a8bb] hover:border-[#66527d]'} ${submitted && index === quest.answer ? 'border-[#6aa49b] bg-[#284541] text-[#bce4dc]' : ''}`}><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current font-mono text-[11px]">{String.fromCharCode(65 + index)}</span>{option}{submitted && index === quest.answer && <CheckCircle2 className="ml-auto" size={17} />}</button>)}</div>{submitted ? <div className={`mt-5 rounded-xl p-4 text-sm leading-6 ${choice === quest.answer ? 'bg-[#294a44] text-[#bce4dc]' : 'bg-[#47313b] text-[#f1c5b5]'}`}>{choice === quest.answer ? 'That is it. You spotted the thread.' : `Not quite — the answer is “${quest.options[quest.answer]}”. The useful part is noticing what to look for next time.`}</div> : null}<div className="mt-6 flex justify-end">{!submitted ? <button type="button" disabled={choice === null} onClick={submit} className="rounded-full bg-[#bca0ed] px-5 py-3 text-sm font-semibold text-[#1c1630] disabled:cursor-not-allowed disabled:opacity-40">Check answer</button> : <button type="button" onClick={complete} className="inline-flex items-center gap-2 rounded-full bg-[#e3a382] px-5 py-3 text-sm font-semibold text-[#26192b]">{completed ? 'Close lesson' : `Collect +${quest.xp} XP`} <Zap size={15} fill="currentColor" /></button>}</div></div>}</section></div>;
}

function Forge({ forgePrompt, setForgePrompt, generateIdeas, generatedIdeas, ideas, saveIdea, deleteIdea }: { forgePrompt: string; setForgePrompt: (value: string) => void; generateIdeas: () => void; generatedIdeas: FusionIdea[]; ideas: FusionIdea[]; saveIdea: (idea: FusionIdea) => void; deleteIdea: (id: string) => void }) {
  return <div className="page-in"><div className="mb-8 max-w-2xl"><p className="eyebrow mb-2">Curiosity Forge</p><h1 className="text-4xl font-semibold tracking-[-.055em]">Make a strange connection.</h1><p className="mt-3 text-sm leading-6 text-[#a79db3]">Give the Forge a subject you cannot stop thinking about. It will cross-pollinate it with a medium, a place, or a question.</p></div><div className="rounded-2xl border border-[#4c3b63] bg-[linear-gradient(130deg,#2b2146,#211a39)] p-5 sm:p-7"><div className="mb-4 flex items-center gap-3"><div className="rounded-xl bg-[#493b61] p-2.5 text-[#f2b391]"><WandSparkles size={20} /></div><div><p className="font-medium">Start with a spark</p><p className="text-xs text-[#9d92a9]">One word is enough.</p></div></div><div className="flex flex-col gap-3 sm:flex-row"><input aria-label="Your curiosity spark" value={forgePrompt} onChange={(event) => setForgePrompt(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') generateIdeas(); }} placeholder="e.g. moths, public benches, the color blue" className="min-h-12 flex-1 rounded-xl border border-[#5b496f] bg-[#19152d] px-4 text-sm text-[#f7eee5] placeholder:text-[#71687e]" /><button type="button" onClick={generateIdeas} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#f0b08c] px-5 text-sm font-semibold text-[#281a2c] transition hover:bg-[#f5c0a1]"><Sparkles size={16} /> Fuse ideas</button></div></div>{generatedIdeas.length > 0 && <div className="mt-9"><div className="mb-4 flex items-end justify-between"><div><p className="eyebrow mb-1">Fresh from the furnace</p><h2 className="text-xl font-medium">Three paths you could take</h2></div><span className="font-mono text-xs text-[#9c91aa]">save one · +180 XP</span></div><div className="grid gap-3 lg:grid-cols-3">{generatedIdeas.map((idea) => <IdeaCard key={idea.id} idea={idea} saved={ideas.some((saved) => saved.id === idea.id)} save={() => saveIdea(idea)} />)}</div></div>}<div className="mt-11"><div className="mb-4 flex items-end justify-between"><div><p className="eyebrow mb-1">Your saved sparks</p><h2 className="text-xl font-medium">Ideas worth keeping close</h2></div><span className="text-xs text-[#81778e]">{ideas.length} saved</span></div>{ideas.length === 0 ? <div className="rounded-2xl border border-dashed border-[#423554] bg-[#19152c] px-6 py-12 text-center"><Save className="mx-auto mb-3 text-[#665779]" size={23} /><p className="text-sm text-[#bbb0c2]">Nothing saved yet.</p><p className="mt-1 text-xs text-[#7f758d]">The best idea is usually one you can return to.</p></div> : <div className="space-y-2">{ideas.map((idea) => <div key={idea.id} className="flex items-center justify-between gap-4 rounded-xl border border-[#342b4a] bg-[#1c1831] px-4 py-3"><div className="min-w-0"><p className="truncate text-sm font-medium">{idea.title}</p><p className="mt-1 truncate text-xs text-[#958a9f]">{idea.description}</p></div><button type="button" aria-label={`Delete ${idea.title}`} onClick={() => deleteIdea(idea.id)} className="shrink-0 rounded-lg p-2 text-[#8f8197] hover:bg-[#392739] hover:text-[#e7a991]"><Trash2 size={16} /></button></div>)}</div>}</div></div>;
}

function IdeaCard({ idea, saved, save }: { idea: FusionIdea; saved: boolean; save: () => void }) {
  return <article className="rounded-2xl border border-[#47385e] bg-[#231c3c] p-5"><div className="mb-5 flex items-center justify-between"><span className="rounded-full bg-[#403358] px-2 py-1 font-mono text-[10px] text-[#c6b1e7]">FUSION</span><Lightbulb size={17} className="text-[#f2b391]" /></div><h3 className="text-lg font-medium leading-6">{idea.title}</h3><p className="mt-3 min-h-[72px] text-sm leading-6 text-[#a89caf]">{idea.description}</p><div className="mt-4 flex flex-wrap gap-1.5">{idea.tags.map((tag) => <span key={tag} className="rounded-md bg-[#312747] px-2 py-1 text-[10px] text-[#aaa0bb]">#{tag}</span>)}</div><button type="button" disabled={saved} onClick={save} className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium ${saved ? 'bg-[#31504d] text-[#9bd7d0]' : 'bg-[#bca0ed] text-[#201833] hover:bg-[#d1bdf1]'}`}>{saved ? <><Check size={15} /> Saved</> : <><Plus size={15} /> Save idea</>}</button></article>;
}

function LearningLog({ log, changeView }: { log: LogEntry[]; changeView: (view: View) => void }) {
  return <div className="page-in"><div className="mb-8"><p className="eyebrow mb-2">Learning log</p><h1 className="text-4xl font-semibold tracking-[-.055em]">A trail of tiny discoveries.</h1><p className="mt-3 text-sm text-[#a79db3]">Everything you complete stays here, locally on this device.</p></div>{log.length === 0 ? <div className="rounded-2xl border border-dashed border-[#423554] bg-[#19152c] px-6 py-16 text-center"><Focus className="mx-auto mb-4 text-[#756485]" size={28} /><h2 className="text-lg font-medium">Your trail begins with one question.</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#8f849c]">Finish a quest or save a Forge idea and the moment will land here.</p><button type="button" onClick={() => changeView('quests')} className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#bca0ed] px-4 py-2.5 text-sm font-semibold text-[#201833]">Browse quests <ArrowRight size={15} /></button></div> : <div className="max-w-3xl space-y-2">{log.map((entry, index) => <article key={entry.id} className="flex items-center gap-4 rounded-2xl border border-[#342b4a] bg-[#1c1831] p-4 sm:p-5"><div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#32274b] text-[#bca0ed]">{index === 0 ? <Sparkles size={18} /> : <CheckCircle2 size={18} />}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{entry.title}</p><p className="mt-1 text-xs text-[#8f849c]">{entry.category} · {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p></div><span className="shrink-0 font-mono text-xs text-[#e5b79d]">+{entry.xp} XP</span></article>)}</div>}</div>;
}

function Badges({ completedCount, bonusDone, ideas, xp }: { completedCount: number; bonusDone: boolean; ideas: FusionIdea[]; xp: number }) {
  const badges = [{ title: 'First orbit', detail: 'Complete your first quest', icon: Orbit, earned: completedCount >= 1, color: '#bca0ed' }, { title: 'Thread finder', detail: 'Explore all three quest worlds', icon: Compass, earned: completedCount >= 3, color: '#90d6cf' }, { title: 'Invisible, noticed', detail: 'Finish the bonus mission', icon: CircleHelp, earned: bonusDone, color: '#f2b391' }, { title: 'Idea alchemist', detail: 'Save a Curiosity Forge idea', icon: WandSparkles, earned: ideas.length >= 1, color: '#dfbc78' }, { title: 'Wonder in motion', detail: 'Collect 500 XP', icon: Zap, earned: xp >= 500, color: '#e6938f' }]; 
  return <div className="page-in"><div className="mb-8"><p className="eyebrow mb-2">Badges</p><h1 className="text-4xl font-semibold tracking-[-.055em]">Proof you kept wondering.</h1><p className="mt-3 text-sm text-[#a79db3]">No perfect scores here. Just evidence of paying attention.</p></div><div className="grid max-w-4xl gap-3 sm:grid-cols-2">{badges.map((badge) => { const Icon = badge.icon; return <article key={badge.title} className={`flex items-center gap-4 rounded-2xl border p-5 ${badge.earned ? 'border-[#4c4162] bg-[#211b39]' : 'border-[#302741] bg-[#18142b] opacity-60'}`}><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl" style={{ color: badge.earned ? badge.color : '#73697e', background: badge.earned ? `${badge.color}18` : '#282139' }}><Icon size={22} /></div><div className="flex-1"><h2 className="font-medium">{badge.title}</h2><p className="mt-1 text-xs text-[#958a9f]">{badge.detail}</p></div>{badge.earned ? <CheckCircle2 size={18} className="text-[#90d6cf]" /> : <span className="font-mono text-[10px] text-[#73697e]">LOCKED</span>}</article>; })}</div></div>;
}

function ConfirmReset({ close, reset }: { close: () => void; reset: () => void }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#090713]/75 p-5 backdrop-blur-sm"><section role="dialog" aria-modal="true" aria-labelledby="reset-title" className="pop-in w-full max-w-sm rounded-2xl border border-[#4c3b63] bg-[#241e3d] p-6 shadow-2xl"><div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#49313d] text-[#edaa91]"><RotateCcw size={20} /></div><h2 id="reset-title" className="text-xl font-semibold">Start over?</h2><p className="mt-2 text-sm leading-6 text-[#aca1b3]">This clears your XP, completed quests, saved ideas, and learning log from this device.</p><div className="mt-7 flex gap-2"><button type="button" onClick={close} className="flex-1 rounded-xl border border-[#504267] px-4 py-2.5 text-sm text-[#cfc3d3] hover:bg-[#332a4b]">Keep journey</button><button type="button" onClick={reset} className="flex-1 rounded-xl bg-[#d88f83] px-4 py-2.5 text-sm font-semibold text-[#291825] hover:bg-[#e6a095]">Reset it</button></div></section></div>;
}

export default App;
