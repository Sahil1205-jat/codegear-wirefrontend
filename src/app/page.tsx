/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useRef, useEffect } from 'react';
import { LevelMap, Level } from '@/components/game/LevelMap';
import { Code2, Terminal, Play, LogIn, LogOut, Volume2, VolumeX, Target, ArrowLeft, Cpu } from 'lucide-react';
import { signIn, signOut, useSession } from 'next-auth/react';
import Editor from '@monaco-editor/react';
import { initialLevels } from '@/data/levels';
import { cModules, cppModules, javaModules, CourseModule } from '@/data/courses';

export default function Home() {
  const { data: session, status } = useSession();
  
  // Game State
  const [viewState, setViewState] = useState<'map' | 'level' | 'courses' | 'course-reading'>('map');
  const [activeCourseModules, setActiveCourseModules] = useState<CourseModule[]>([]);
  const [activeReadingModuleId, setActiveReadingModuleId] = useState<string | null>(null);
  const [activeLevel, setActiveLevel] = useState<Level | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [xp, setXp] = useState(0);
  const [levels, setLevels] = useState<Level[]>(initialLevels);

  // Sync Progress with Database
  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/progress')
        .then(res => res.json())
        .then(data => {
          if (data.xp !== undefined) {
            setXp(data.xp);
            if (data.completedLevels && data.completedLevels.length > 0) {
              setLevels(prev => prev.map(l => {
                if (data.completedLevels.includes(l.id)) return { ...l, status: 'completed' };
                // Unlock the level immediately after the highest completed one
                const maxCompleted = Math.max(...data.completedLevels);
                if (l.id === maxCompleted + 1) return { ...l, status: 'unlocked' };
                return { ...l, status: 'locked' };
              }));
            }
          }
        })
        .catch(console.error);
    }
  }, [status]);

  // Audio refs
  const successAudioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    successAudioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
  }, []);

  // Execution State
  const [executionState, setExecutionState] = useState<'idle' | 'compiling' | 'running' | 'completed'>('idle');
  const [executionEngine, setExecutionEngine] = useState<'wandbox' | 'docker'>('wandbox');
  const [dataBusActive, setDataBusActive] = useState(false);
  const [language, setLanguage] = useState<'c' | 'cpp' | 'java'>('cpp');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState<{ stdout: string; stderr: string; type: 'idle' | 'success' | 'error' | 'mission_passed' }>({ stdout: '', stderr: '', type: 'idle' });
  const [countdown, setCountdown] = useState<number | null>(null);

  // Countdown timer logic for auto-advancing levels
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      setCountdown(null);
      const nextLevel = levels.find(l => l.id === (activeLevel?.id || 0) + 1);
      if (nextLevel) handleSelectLevel(nextLevel);
      return;
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, activeLevel, levels]);

  const handleSelectLevel = (level: Level) => {
    setActiveLevel(level);
    setViewState('level');
    setOutput({ stdout: '', stderr: '', type: 'idle' });
    setCountdown(null);
    
    // Auto-fill boilerplate based on language
    const taskStr = level.task || '';
    const taskComment = taskStr.split('\n')[0];
    if (language === 'c') setCode(`#include <stdio.h>\n\nint main() {\n  // ${taskComment}\n  \n  return 0;\n}`);
    if (language === 'cpp') setCode(`#include <iostream>\n\nint main() {\n  // ${taskComment}\n  \n  return 0;\n}`);
    if (language === 'java') setCode(`class Main {\n  public static void main(String[] args) {\n    // ${taskComment}\n    \n  }\n}`);
  };

  const handleLanguageChange = (newLang: 'c' | 'cpp' | 'java') => {
    setLanguage(newLang);
    if (activeLevel) {
      const taskStr = activeLevel.task || '';
      const taskComment = taskStr.split('\n')[0];
      if (newLang === 'c') setCode(`#include <stdio.h>\n\nint main() {\n  // ${taskComment}\n  \n  return 0;\n}`);
      if (newLang === 'cpp') setCode(`#include <iostream>\n\nint main() {\n  // ${taskComment}\n  \n  return 0;\n}`);
      if (newLang === 'java') setCode(`class Main {\n  public static void main(String[] args) {\n    // ${taskComment}\n    \n  }\n}`);
    } else {
      // Fallback for empty sandbox
      if (newLang === 'c') setCode('#include <stdio.h>\n\nint main() {\n  printf("Hello\\n");\n  return 0;\n}');
      if (newLang === 'cpp') setCode('#include <iostream>\n\nint main() {\n  std::cout << "Hello\\n";\n  return 0;\n}');
      if (newLang === 'java') setCode('class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello");\n  }\n}');
    }
  };

  const simulateExecution = async () => {
    setExecutionState('compiling');
    setDataBusActive(true);
    setCountdown(null);
    setOutput({ stdout: '> Initiating compiler toolchain...\n> Allocating memory segments...\n', stderr: '', type: 'idle' });

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setExecutionState('running');
      
      let outStr = '';
      let isError = false;
      let stderrMsg = '';

      if (executionEngine === 'wandbox') {
        setOutput(prev => ({ ...prev, stdout: prev.stdout + `> Execution started via Cloud API (Wandbox)...\n> Serverless container initiated...\n` }));
        
        const wandboxLangMap: Record<string, string> = {
          'c': 'gcc-head-c',
          'cpp': 'gcc-head',
          'java': 'openjdk-jdk-22+36'
        };

        const response = await fetch('https://wandbox.org/api/compile.json', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: language === 'java' ? code.replace(/public\s+class/, 'class') : code,
            compiler: wandboxLangMap[language]
          })
        });

        const data = await response.json();
        isError = data.status !== '0' || !!data.compiler_error || !!data.program_error;
        outStr = data.program_output?.trim() || '';
        stderrMsg = data.compiler_error || data.program_error || '';

      } else {
        // DOCKER LOCAL HARDWARE ENGINE
        setOutput(prev => ({ ...prev, stdout: prev.stdout + `> Routing to Local Hardware Docker Engine...\n> Building isolated Linux container...\n` }));
        
        const response = await fetch('http://localhost:3001/api/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, language })
        });

        const data = await response.json();
        
        if (!response.ok) {
          isError = true;
          stderrMsg = data.error || data.details || 'Unknown Hardware Error';
        } else {
          isError = !!data.stderr;
          outStr = data.stdout?.trim() || '';
          stderrMsg = data.stderr || '';
        }
      }

      setExecutionState('completed');
      setDataBusActive(false);

      let missionPassed = false;
      
      if (activeLevel && !isError && outStr.includes(activeLevel.expectedOutput || '')) {
        missionPassed = true;
      }

      if (missionPassed && activeLevel) {
        if (soundEnabled && successAudioRef.current) successAudioRef.current.play().catch(e => console.log(e));
        
        setXp(prev => prev + 100);
        setLevels(prev => prev.map(l => {
          if (l.id === activeLevel.id) return { ...l, status: 'completed' };
          if (l.id === activeLevel.id + 1 && l.status === 'locked') return { ...l, status: 'unlocked' };
          return l;
        }));

        // Start countdown to next level if one exists
        const nextLevelExists = levels.some(l => l.id === activeLevel.id + 1);
        if (nextLevelExists) {
          setCountdown(5);
        }

        // Save progress to database
        const updatedXp = xp + 100;
        const currentCompleted = levels.filter(l => l.status === 'completed').map(l => l.id);
        if (!currentCompleted.includes(activeLevel.id)) {
          currentCompleted.push(activeLevel.id);
        }
        
        fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ xp: updatedXp, completedLevels: currentCompleted })
        }).catch(console.error);
      }

      setOutput({ 
        stdout: outStr, 
        stderr: stderrMsg, 
        type: missionPassed ? 'mission_passed' : (isError ? 'error' : 'success') 
      });
      
    } catch (error: unknown) {
      setExecutionState('completed');
      setDataBusActive(false);
      setOutput({ stdout: '', stderr: 'Critical System Failure: Connection refused. Is your backend server running?', type: 'error' });
    }
  };

  // --- RENDERING ---

  if (status === 'loading') {
    return <div className="flex h-screen w-screen items-center justify-center bg-black text-emerald-500 font-mono animate-pulse">Initializing System...</div>;
  }

  if (status === 'unauthenticated') {
    return (
      <main className="flex h-screen w-screen items-center justify-center bg-black" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #18181b 0%, #000 100%)' }}>
        <div className="w-[450px] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col p-10 text-center items-center">
          <img src="/logo.png" alt="Code Gear Logo" className="w-32 h-32 mb-4 object-contain shadow-blue-500/20 drop-shadow-2xl animate-pulse" />
          <h2 className="text-3xl font-black font-mono text-zinc-100 mb-3 tracking-tight">CODE GEAR</h2>
          <p className="text-zinc-500 text-sm mb-10 leading-relaxed">Authenticate your biological signature to access the hardware engineering missions.</p>
          <button onClick={() => signIn('google')} className="flex items-center gap-3 px-8 py-4 bg-white text-black hover:bg-zinc-200 rounded-xl font-bold transition-all w-full justify-center">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col h-screen w-screen bg-[#0a0a0c] text-zinc-200 overflow-hidden font-sans">
      
      {/* GLOBAL NAVBAR */}
      <nav className="h-14 border-b border-zinc-800/80 bg-[#111113] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-blue-400 font-black font-mono tracking-widest text-lg pr-4 border-r border-zinc-800">
            <img src="/logo.png" alt="Code Gear" className="w-8 h-8 object-contain" /> CODE GEAR
          </div>
          
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setViewState('map')} 
              className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${viewState === 'map' || viewState === 'level' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white hover:bg-zinc-800/50'}`}
            >
              Campaign Map
            </button>
            <button 
              onClick={() => setViewState('courses')} 
              className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${viewState === 'courses' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white hover:bg-zinc-800/50'}`}
            >
              Courses
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 rounded-md border border-yellow-500/20">
            <Target className="w-4 h-4 text-yellow-500" />
            <span className="font-mono text-sm font-bold text-yellow-500">{xp} XP</span>
          </div>
          <button onClick={() => setSoundEnabled(!soundEnabled)} className="text-zinc-400 hover:text-emerald-400 p-2 transition-colors">
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <div className="w-px h-6 bg-zinc-800"></div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-zinc-400">{session?.user?.name}</span>
            <img src={session?.user?.image || ''} alt="Profile" className="w-8 h-8 rounded-full border border-zinc-700" />
            <button onClick={() => signOut()} className="text-zinc-500 hover:text-red-400 p-1" title="Log Out"><LogOut className="w-4 h-4" /></button>
          </div>
        </div>
      </nav>

      {/* VIEW STATE: LEVEL MAP */}
      {viewState === 'map' && (
        <div className="flex-1 overflow-hidden relative">
          <LevelMap levels={levels} onSelectLevel={handleSelectLevel} />
        </div>
      )}

      {/* VIEW STATE: COURSES */}
      {viewState === 'courses' && (
        <div className="flex-1 overflow-y-auto bg-[#0a0a0c] p-10">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-black font-mono text-white mb-2 tracking-tight">TRAINING COURSES</h1>
            <p className="text-zinc-400 mb-12">Select a language bootcamp to master the fundamentals before entering the campaign.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Course Card 1 */}
              <div className="bg-[#111114] border border-zinc-800 rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-all group cursor-pointer">
                <div className="h-32 bg-emerald-500/10 flex items-center justify-center border-b border-zinc-800/50 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111114] to-transparent z-10"></div>
                  <span className="text-7xl font-black text-emerald-500/20 group-hover:text-emerald-500/40 transition-colors z-0">C</span>
                </div>
                <div className="p-6">
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">Systems Level</div>
                  <h3 className="text-xl font-bold text-white mb-2">C Language Bootcamp</h3>
                  <p className="text-sm text-zinc-500 mb-6 leading-relaxed">Master memory management, pointers, and the raw power of the C programming language from the ground up.</p>
                  <button 
                    onClick={() => {
                      setActiveCourseModules(cModules);
                      setViewState('course-reading');
                    }}
                    className="w-full py-3 bg-zinc-900 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors text-sm"
                  >
                    Read Notes
                  </button>
                </div>
              </div>

              {/* Course Card 2 */}
              <div className="bg-[#111114] border border-zinc-800 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all group cursor-pointer">
                <div className="h-32 bg-blue-500/10 flex items-center justify-center border-b border-zinc-800/50 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111114] to-transparent z-10"></div>
                  <span className="text-7xl font-black text-blue-500/20 group-hover:text-blue-500/40 transition-colors z-0">C++</span>
                </div>
                <div className="p-6">
                  <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">Object Oriented</div>
                  <h3 className="text-xl font-bold text-white mb-2">C++ Masterclass</h3>
                  <p className="text-sm text-zinc-500 mb-6 leading-relaxed">Dive into classes, standard template libraries (STL), and advanced object-oriented architectures.</p>
                  <button 
                    onClick={() => {
                      setActiveCourseModules(cppModules);
                      setViewState('course-reading');
                    }}
                    className="w-full py-3 bg-zinc-900 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors text-sm"
                  >
                    Read Notes
                  </button>
                </div>
              </div>

              {/* Course Card 3 */}
              <div className="bg-[#111114] border border-zinc-800 rounded-2xl overflow-hidden hover:border-orange-500/50 transition-all group cursor-pointer">
                <div className="h-32 bg-orange-500/10 flex items-center justify-center border-b border-zinc-800/50 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111114] to-transparent z-10"></div>
                  <span className="text-7xl font-black text-orange-500/20 group-hover:text-orange-500/40 transition-colors z-0">JAVA</span>
                </div>
                <div className="p-6">
                  <div className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-2">Enterprise</div>
                  <h3 className="text-xl font-bold text-white mb-2">Java Fundamentals</h3>
                  <p className="text-sm text-zinc-500 mb-6 leading-relaxed">Learn the JVM, garbage collection, and how to build highly scalable enterprise-level applications.</p>
                  <button 
                    onClick={() => {
                      setActiveCourseModules(javaModules);
                      setViewState('course-reading');
                    }}
                    className="w-full py-3 bg-zinc-900 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors text-sm"
                  >
                    Read Notes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW STATE: COURSE READING */}
      {viewState === 'course-reading' && (
        <div className="flex-1 overflow-y-auto bg-[#0a0a0c] p-10">
          <div className="max-w-4xl mx-auto">
            <button onClick={() => setViewState('courses')} className="mb-8 text-zinc-500 hover:text-white flex items-center gap-2 font-bold uppercase text-xs tracking-wider transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Courses
            </button>
            <div className="space-y-8">
              {activeCourseModules.map((module) => (
                <div key={module.id} className="bg-[#111114] border border-zinc-800 p-8 rounded-2xl">
                  <h2 className="text-2xl font-black text-white mb-6 tracking-tight">{module.title}</h2>
                  <div className="prose prose-invert prose-emerald prose-pre:bg-black/50 prose-pre:border prose-pre:border-zinc-800/50 max-w-none">
                    {/* Hacky markdown renderer for the \n\n and Code Blocks */}
                    {module.content.split('\n\n').map((paragraph, idx) => {
                      if (paragraph.startsWith('```')) {
                        const lines = paragraph.split('\n');
                        const code = lines.slice(1, lines.length - 1).join('\n');
                        return (
                          <pre key={idx} className="p-4 bg-black border border-zinc-800 rounded-lg overflow-x-auto text-sm text-emerald-400 font-mono my-4">
                            <code>{code}</code>
                          </pre>
                        );
                      }
                      if (paragraph.startsWith('### ')) {
                        return <h3 key={idx} className="text-lg font-bold text-zinc-200 mt-6 mb-2">{paragraph.replace('### ', '')}</h3>;
                      }
                      if (paragraph.startsWith('- ')) {
                        return (
                          <ul key={idx} className="list-disc pl-5 space-y-2 text-zinc-400">
                            {paragraph.split('\n').map((item, i) => (
                              <li key={i}>{item.replace('- ', '')}</li>
                            ))}
                          </ul>
                        );
                      }
                      return <p key={idx} className="text-zinc-400 leading-relaxed">{paragraph}</p>;
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW STATE: LEETCODE STYLE LEVEL */}
      {viewState === 'level' && activeLevel && (
        <div className="flex-1 flex overflow-hidden">
          
          {/* LEFT PANEL: Problem Description */}
          <div className="w-1/3 flex flex-col border-r border-zinc-800 bg-[#0d0d12] overflow-y-auto">
            <div className="p-6 flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs font-mono font-bold rounded">Level {activeLevel.id}</span>
                <h1 className="text-xl font-black tracking-tight">{activeLevel.title}</h1>
              </div>
              <div className="prose prose-invert prose-sm">
                <p className="text-zinc-400 whitespace-pre-wrap leading-relaxed">{activeLevel.task}</p>
              </div>
              <div className="mt-8 p-4 bg-black/40 rounded-lg border border-zinc-800/50">
                <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Expected Standard Output</div>
                <div className="font-mono text-emerald-400">{activeLevel.expectedOutput}</div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Editor & Terminal */}
          <div className="w-2/3 flex flex-col bg-[#050505]">
            
            {/* Editor Toolbar */}
            <div className="h-12 border-b border-zinc-800 flex items-center justify-between px-4 bg-[#0a0a0c]">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-zinc-500" />
                  <select 
                    value={language} 
                    onChange={(e) => handleLanguageChange(e.target.value as 'c' | 'cpp' | 'java')}
                    className="bg-transparent text-sm font-bold font-mono text-zinc-300 outline-none border-none cursor-pointer"
                  >
                    <option value="cpp">C++ (G++)</option>
                    <option value="c">C (GCC)</option>
                    <option value="java">Java (OpenJDK)</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2 border-l border-zinc-800 pl-6">
                  <Cpu className="w-4 h-4 text-zinc-500" />
                  <select 
                    value={executionEngine} 
                    onChange={(e) => setExecutionEngine(e.target.value as 'wandbox' | 'docker')}
                    className="bg-transparent text-sm font-bold font-mono text-zinc-400 outline-none border-none cursor-pointer"
                  >
                    <option value="wandbox">Cloud API (Wandbox)</option>
                    <option value="docker">Local Hardware (Docker)</option>
                  </select>
                </div>
              </div>

              <button 
                onClick={simulateExecution} 
                disabled={executionState === 'compiling' || executionState === 'running'}
                className="flex items-center gap-2 px-5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-sm transition-colors disabled:opacity-50"
              >
                <Play className="w-4 h-4" /> Run Code
              </button>
            </div>

            {/* Mission Passed Overlay */}
            {countdown !== null && (
              <div className="bg-emerald-500/20 border-b border-emerald-500/30 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center animate-bounce">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-emerald-400">MISSION ACCOMPLISHED</h3>
                    <p className="text-xs text-emerald-500/80 font-mono">Auto-advancing to next level in {countdown}s...</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setCountdown(null);
                    const nextLevel = levels.find(l => l.id === (activeLevel?.id || 0) + 1);
                    if (nextLevel) handleSelectLevel(nextLevel);
                  }}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm rounded shadow-lg transition-all"
                >
                  Next Level Now
                </button>
              </div>
            )}

            {/* VS Code Monaco Editor Core */}
            <div className="flex-1 w-full bg-[#1e1e1e] relative">
              <Editor
                height="100%"
                language={language === 'c' ? 'c' : language === 'cpp' ? 'cpp' : 'java'}
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  fontLigatures: true,
                  wordWrap: 'on',
                  padding: { top: 24, bottom: 24 },
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                  cursorBlinking: 'smooth',
                  cursorSmoothCaretAnimation: 'on',
                  formatOnPaste: true,
                  lineHeight: 24,
                }}
                loading={
                  <div className="flex h-full w-full items-center justify-center bg-[#1e1e1e]">
                    <div className="flex items-center gap-3 text-zinc-500 font-mono animate-pulse">
                      <Cpu className="w-5 h-5" /> Booting Engine Core...
                    </div>
                  </div>
                }
              />
            </div>

            {/* Terminal Output */}
            <div className="h-64 border-t border-zinc-800 bg-[#000000] flex flex-col">
              <div className="h-8 border-b border-zinc-900 flex items-center px-4 bg-[#050505]">
                <Terminal className="w-3.5 h-3.5 text-zinc-500 mr-2" />
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">Test Results</span>
              </div>
              <div className="flex-1 p-4 overflow-y-auto font-mono text-sm">
                {output.type === 'mission_passed' && (
                  <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-400 font-bold">
                    Mission Accomplished! Output strictly matched requirements.
                  </div>
                )}
                {output.stderr && <div className="text-red-400 whitespace-pre-wrap mb-2">{output.stderr}</div>}
                <div className={`whitespace-pre-wrap ${output.type === 'error' ? 'text-red-400' : 'text-zinc-300'}`}>
                  {output.stdout || <span className="text-zinc-700 italic">Run your code to view standard output...</span>}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </main>
  );
}
