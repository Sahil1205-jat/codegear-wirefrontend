'use client';

import { useState } from 'react';
import { MotherboardMap } from '@/components/architecture/MotherboardMap';
import { Code2, ChevronDown, Cpu, Terminal, Play } from 'lucide-react';
import { Rnd } from 'react-rnd';

export default function Home() {
  const [executionState, setExecutionState] = useState<'idle' | 'compiling' | 'running' | 'completed'>('idle');
  const [dataBusActive, setDataBusActive] = useState(false);
  
  // Execution Engine State
  const [engine, setEngine] = useState<'local' | 'cloud'>('cloud');

  // Language menu state
  const [language, setLanguage] = useState<'c' | 'cpp' | 'java'>('cpp');
  const [menuOpen, setMenuOpen] = useState(false);
  const [code, setCode] = useState('#include <iostream>\n\nint main() {\n  std::cout << "Hello Machine\\n";\n  return 0;\n}');
  
  // Terminal output state
  const [output, setOutput] = useState<{ stdout: string; stderr: string; type: 'idle' | 'success' | 'error' }>({ stdout: '', stderr: '', type: 'idle' });

  // Window Z-Index and Minimization management for OS Desktop feel
  const [zIndices, setZIndices] = useState({ editor: 10, motherboard: 5, terminal: 15 });
  const [minimized, setMinimized] = useState({ editor: false, motherboard: false, terminal: false });

  const bringToFront = (win: keyof typeof zIndices) => {
    setZIndices(prev => {
      const maxZ = Math.max(...Object.values(prev));
      return { ...prev, [win]: maxZ + 1 };
    });
  };

  const toggleMinimize = (win: keyof typeof minimized) => {
    setMinimized(prev => ({ ...prev, [win]: !prev[win] }));
  };

  const simulateExecution = async () => {
    setExecutionState('compiling');
    setDataBusActive(true);
    setOutput({ stdout: '> Initiating compiler toolchain...\n> Allocating memory segments...\n', stderr: '', type: 'idle' });

    // Bring terminal to front and un-minimize it if it was hidden
    setMinimized(prev => ({ ...prev, terminal: false }));
    bringToFront('terminal');

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setExecutionState('running');
      setOutput(prev => ({ 
        ...prev, 
        stdout: prev.stdout + `> Execution started via ${engine === 'local' ? 'Local Docker Sandbox' : 'Cloud Compiler (Wandbox)'}...\n> Mounting volumes...\n` 
      }));

      let data;
      let isError = false;

      if (engine === 'local') {
        const response = await fetch('http://localhost:8080/api/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, language })
        });
        
        data = await response.json();
        isError = !response.ok || !!data.stderr;
      } else {
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

        const wandboxData = await response.json();
        isError = wandboxData.status !== '0' || !!wandboxData.compiler_error || !!wandboxData.program_error;
        
        data = {
          stdout: wandboxData.program_output || '',
          stderr: wandboxData.compiler_error || wandboxData.program_error || '',
          details: isError ? 'Compilation or Runtime error' : null
        };
      }
      
      setExecutionState('completed');
      setDataBusActive(false);

      if (data.details && !data.stdout && !data.stderr) {
        setOutput(prev => ({
          stdout: prev.stdout + '\n[Execution Halted]',
          stderr: data.details || 'Unknown Sandbox Error',
          type: 'error'
        }));
      } else {
        setOutput(prev => ({ 
          stdout: prev.stdout + '\n' + data.stdout + '\n\n[Process completed successfully]', 
          stderr: data.stderr, 
          type: isError ? 'error' : 'success' 
        }));
      }
      
    } catch (error: any) {
      setExecutionState('completed');
      setDataBusActive(false);
      setOutput(prev => ({
        stdout: prev.stdout + '\n[Critical System Failure]',
        stderr: error.message || 'Connection to execution engine refused.',
        type: 'error'
      }));
    }
  };

  const handleLanguageSelect = (lang: 'c' | 'cpp' | 'java') => {
    setLanguage(lang);
    setMenuOpen(false);
    if (lang === 'c') setCode('#include <stdio.h>\n\nint main() {\n  printf("Hello Machine\\n");\n  return 0;\n}');
    if (lang === 'cpp') setCode('#include <iostream>\n\nint main() {\n  std::cout << "Hello Machine\\n";\n  return 0;\n}');
    if (lang === 'java') setCode('class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello Machine");\n  }\n}');
    setOutput({ stdout: '', stderr: '', type: 'idle' });
  };

  const languageLabels = {
    c: 'C (GCC)',
    cpp: 'C++ (G++)',
    java: 'Java (OpenJDK)'
  };

  // Reusable Mac/Win11 Style Window Header
  const WindowHeader = ({ title, icon: Icon, windowKey }: { title: string, icon: any, windowKey: keyof typeof minimized }) => (
    <div className="window-drag-handle flex items-center justify-between px-4 py-3 bg-[#111113] border-b border-zinc-800/80 cursor-move rounded-t-xl select-none transition-colors hover:bg-[#18181b]">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-zinc-400" />
        <span className="font-mono text-[11px] text-zinc-300 font-bold tracking-widest uppercase">{title}</span>
      </div>
      <div className="flex gap-2">
        {/* Close Button (Acts as minimize for now) */}
        <button 
          onPointerDown={(e) => e.stopPropagation()} 
          onMouseDown={(e) => e.stopPropagation()} 
          onClick={() => toggleMinimize(windowKey)} 
          className="w-3 h-3 rounded-full bg-red-500/90 border border-red-600/50 hover:bg-red-500 transition-colors shadow-inner" 
          title="Close" 
        />
        {/* Minimize Button */}
        <button 
          onPointerDown={(e) => e.stopPropagation()} 
          onMouseDown={(e) => e.stopPropagation()} 
          onClick={() => toggleMinimize(windowKey)} 
          className="w-3 h-3 rounded-full bg-amber-500/90 border border-amber-600/50 hover:bg-amber-500 transition-colors shadow-inner" 
          title="Minimize" 
        />
        {/* Maximize Button (No-op) */}
        <button 
          onPointerDown={(e) => e.stopPropagation()} 
          onMouseDown={(e) => e.stopPropagation()} 
          className="w-3 h-3 rounded-full bg-emerald-500/90 border border-emerald-600/50 hover:bg-emerald-500 transition-colors shadow-inner" 
        />
      </div>
    </div>
  );

  const DockIcon = ({ windowKey, title, icon: Icon, isActive }: any) => (
    <button 
      onClick={() => {
        if (!isActive) toggleMinimize(windowKey);
        bringToFront(windowKey);
      }}
      className={`relative group flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-200 hover:-translate-y-3 hover:scale-110 ${isActive ? 'bg-zinc-800/80' : 'bg-zinc-900/50 hover:bg-zinc-800'}`}
      title={title}
    >
      <Icon className={`w-7 h-7 ${isActive ? 'text-blue-400' : 'text-zinc-400 group-hover:text-zinc-200'}`} />
      {isActive && <div className="absolute -bottom-2 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]"></div>}
    </button>
  );

  return (
    <main className="h-screen w-screen bg-black text-zinc-200 overflow-hidden relative" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #18181b 0%, #000 100%)' }}>
      
      {/* Background branding (Visible behind floating windows) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center opacity-[0.03] pointer-events-none select-none">
        <Cpu className="w-64 h-64 text-blue-500 mb-8" />
        <h1 className="text-9xl font-black tracking-tighter">CODE GEAR</h1>
      </div>

      {/* MOTHERBOARD WINDOW */}
      <Rnd
        default={{ x: 50, y: 50, width: 850, height: 650 }}
        minWidth={400}
        minHeight={300}
        bounds="parent"
        dragHandleClassName="window-drag-handle"
        style={{ zIndex: zIndices.motherboard, display: minimized.motherboard ? 'none' : 'flex' }}
        onMouseDown={() => bringToFront('motherboard')}
        className="flex-col bg-zinc-950 border border-zinc-800 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-md"
      >
        <WindowHeader title="HARDWARE_SANDBOX.exe" icon={Cpu} windowKey="motherboard" />
        <div className="flex-1 w-full h-full relative overflow-hidden bg-[#09090b] rounded-b-xl flex items-center justify-center">
          <MotherboardMap executionState={executionState} dataBusActive={dataBusActive} />
        </div>
      </Rnd>

      {/* EDITOR WINDOW */}
      <Rnd
        default={{ x: 950, y: 50, width: 500, height: 500 }}
        minWidth={350}
        minHeight={250}
        bounds="parent"
        dragHandleClassName="window-drag-handle"
        style={{ zIndex: zIndices.editor, display: minimized.editor ? 'none' : 'flex' }}
        onMouseDown={() => bringToFront('editor')}
        className="flex-col bg-zinc-950/95 border border-zinc-800 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-md"
      >
        <WindowHeader title="EDITOR.sys" icon={Code2} windowKey="editor" />
        
        {/* Editor Controls Toolbar */}
        <div className="flex items-center gap-2 p-2 border-b border-zinc-800/50 bg-[#09090b] shrink-0">
          <div className="relative flex-1">
            <button onClick={() => setMenuOpen(!menuOpen)} className="w-full flex items-center justify-between px-3 py-2 bg-[#18181b] border border-zinc-800 hover:border-zinc-600 rounded text-xs font-mono transition-all">
              <span className="text-zinc-200">{languageLabels[language]}</span>
              <ChevronDown className="w-3 h-3 text-zinc-500" />
            </button>
            {menuOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#18181b] border border-zinc-700 rounded z-50 shadow-xl overflow-hidden">
                {Object.entries(languageLabels).map(([key, label]) => (
                  <button key={key} onClick={() => handleLanguageSelect(key as any)} className="w-full text-left px-3 py-2.5 text-xs font-mono hover:bg-blue-600/20 text-zinc-300 border-l-2 border-transparent hover:border-blue-500 transition-all">
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button onClick={() => setEngine(engine === 'local' ? 'cloud' : 'local')} className="px-3 py-2 bg-[#18181b] border border-zinc-800 hover:border-zinc-600 text-zinc-400 rounded text-xs font-mono whitespace-nowrap transition-all" title="Toggle Engine">
            {engine === 'local' ? '🐳 Local Sandbox' : '☁️ Cloud Compiler'}
          </button>
          
          <button onClick={simulateExecution} disabled={executionState !== 'idle' && executionState !== 'completed'} className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-500 border border-emerald-500/20 hover:border-emerald-500/50 disabled:opacity-30 rounded text-xs font-mono font-bold whitespace-nowrap flex items-center gap-1.5 transition-all">
            <Play className="w-3 h-3" /> RUN
          </button>
        </div>

        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck="false"
          className="flex-1 w-full p-5 bg-transparent resize-none outline-none font-mono text-[13px] text-blue-50 placeholder:text-zinc-700 leading-relaxed selection:bg-blue-500/30 rounded-b-xl"
        />
      </Rnd>

      {/* TERMINAL WINDOW */}
      <Rnd
        default={{ x: 950, y: 580, width: 500, height: 300 }}
        minWidth={300}
        minHeight={150}
        bounds="parent"
        dragHandleClassName="window-drag-handle"
        style={{ zIndex: zIndices.terminal, display: minimized.terminal ? 'none' : 'flex' }}
        onMouseDown={() => bringToFront('terminal')}
        className="flex-col bg-[#050505]/98 border border-zinc-800 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-md"
      >
        <WindowHeader title="STDOUT_STREAM.log" icon={Terminal} windowKey="terminal" />
        <div className="flex-1 p-5 overflow-y-auto font-mono text-[13px] rounded-b-xl">
          {output.stderr && <div className="text-red-400 whitespace-pre-wrap mb-2">{output.stderr}</div>}
          <div className={`whitespace-pre-wrap ${output.type === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>
            {output.stdout || <span className="text-zinc-700 italic">Awaiting execution sequence...</span>}
          </div>
          {executionState !== 'completed' && executionState !== 'idle' && (
            <span className="inline-block w-2.5 h-4 bg-emerald-500 animate-pulse ml-1 align-middle"></span>
          )}
        </div>
      </Rnd>

      {/* MAC OS STYLE DOCK */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 p-3 bg-[#111113]/80 backdrop-blur-xl border border-zinc-700/30 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-[9999]">
        <DockIcon windowKey="motherboard" title="Motherboard Sandbox" icon={Cpu} isActive={!minimized.motherboard} />
        <DockIcon windowKey="editor" title="Editor.sys" icon={Code2} isActive={!minimized.editor} />
        <DockIcon windowKey="terminal" title="Terminal Output" icon={Terminal} isActive={!minimized.terminal} />
      </div>

    </main>
  );
}
