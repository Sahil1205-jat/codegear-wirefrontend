'use client';

import React, { useState, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Line, Group, Circle } from 'react-konva';

interface MotherboardProps {
  executionState: 'idle' | 'compiling' | 'running' | 'completed';
  dataBusActive: boolean;
}

export const MotherboardMap: React.FC<MotherboardProps> = ({ executionState, dataBusActive }) => {
  // Aesthetic definitions: Minimalist hardcore dark-mode
  const THEME = {
    pcb: '#09090b',         // Zinc-950 (Main motherboard background)
    traceIdle: '#27272a',   // Zinc-800 (Inactive copper traces)
    traceActive: '#10b981', // Emerald-500 (Active data transfer)
    cpuCore: '#18181b',     // Zinc-900 
    cpuBorder: '#3b82f6',   // Blue-500 (Processing status)
    ramChip: '#18181b',
    ramBorder: '#8b5cf6',   // Violet-500 (Memory state)
    text: '#e4e4e7',        // Zinc-200
  };

  const [pulsePos, setPulsePos] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting until mount to render canvas
  useEffect(() => {
    setMounted(true);
  }, []);

  // Hardware clock cycle simulation for data bus animation using pure requestAnimationFrame
  useEffect(() => {
    let animFrame: number;
    if (dataBusActive) {
      const animate = () => {
        // Moves the data packet along the 300px physical distance between CPU and RAM
        setPulsePos((prev) => (prev >= 250 ? 0 : prev + 6));
        animFrame = requestAnimationFrame(animate);
      };
      animFrame = requestAnimationFrame(animate);
    } else {
      setPulsePos(0); // Reset hardware bus state
    }
    return () => cancelAnimationFrame(animFrame);
  }, [dataBusActive]);

  if (!mounted) return <div className="w-full h-full bg-zinc-950 rounded-xl" />;

  return (
    <div className="w-full h-full bg-zinc-950 rounded-xl overflow-hidden shadow-2xl border border-zinc-800 flex justify-center items-center">
      <Stage width={800} height={600}>
        <Layer>
          {/* PCB Surface */}
          <Rect width={800} height={600} fill={THEME.pcb} />

          {/* System Bus (Connecting CPU to RAM) */}
          {/* A physical bus representing the pathway for data/address/control signals */}
          <Line
            points={[250, 300, 500, 300]}
            stroke={dataBusActive ? THEME.traceActive : THEME.traceIdle}
            strokeWidth={12}
            lineCap="round"
            shadowBlur={dataBusActive ? 20 : 0}
            shadowColor={THEME.traceActive}
          />

          {/* Data Transfer Packet */}
          {dataBusActive && (
            <Circle
              x={250 + pulsePos}
              y={300}
              radius={6}
              fill="#ffffff"
              shadowBlur={15}
              shadowColor="#ffffff"
            />
          )}

          {/* CPU Complex Block */}
          <Group x={50} y={200}>
            {/* Silicon Die */}
            <Rect
              width={200}
              height={220}
              fill={THEME.cpuCore}
              stroke={executionState === 'running' ? THEME.cpuBorder : THEME.traceIdle}
              strokeWidth={4}
              cornerRadius={8}
              shadowBlur={executionState === 'running' ? 25 : 0}
              shadowColor={THEME.cpuBorder}
            />
            <Text x={15} y={15} text="CPU [PROCESSOR]" fontSize={18} fontFamily="monospace" fill={THEME.text} fontStyle="bold" />
            
            {/* ALU (Arithmetic Logic Unit) Representation */}
            <Rect x={15} y={50} width={170} height={60} fill="#27272a" cornerRadius={4} />
            <Text x={25} y={70} text="ALU" fontSize={16} fontFamily="monospace" fill={THEME.text} />
            
            {/* L1 Cache / Registers Representation */}
            <Rect x={15} y={125} width={170} height={70} fill="#27272a" cornerRadius={4} />
            <Text x={25} y={135} text="REGISTERS (L1)" fontSize={14} fontFamily="monospace" fill="#a1a1aa" />
            <Line points={[25, 160, 170, 160]} stroke="#3f3f46" strokeWidth={2} />
            <Line points={[25, 175, 170, 175]} stroke="#3f3f46" strokeWidth={2} />
          </Group>

          {/* Memory Controller / RAM Array Block */}
          <Group x={500} y={100}>
            <Rect
              width={220}
              height={400}
              fill={THEME.ramChip}
              stroke={executionState === 'compiling' ? THEME.ramBorder : THEME.traceIdle}
              strokeWidth={4}
              cornerRadius={8}
              shadowBlur={executionState === 'compiling' ? 25 : 0}
              shadowColor={THEME.ramBorder}
            />
            <Text x={15} y={15} text="RAM [MEMORY]" fontSize={18} fontFamily="monospace" fill={THEME.text} fontStyle="bold" />
            
            {/* Memory Banks (Visualizing hexadecimal addressing) */}
            {[0, 1, 2, 3, 4, 5, 6, 7].map((bank) => (
              <Group key={bank} y={50 + bank * 40}>
                <Rect x={15} width={190} height={25} fill="#27272a" cornerRadius={3} />
                <Text x={25} y={7} text={`0x000${bank}F`} fontSize={12} fontFamily="monospace" fill="#71717a" />
                {/* Simulated bits flipping inside memory registers */}
                <Rect x={100} y={7} width={8} height={12} fill="#3f3f46" />
                <Rect x={115} y={7} width={8} height={12} fill="#3f3f46" />
                <Rect x={130} y={7} width={8} height={12} fill="#10b981" shadowBlur={10} shadowColor="#10b981" opacity={Math.random() > 0.5 ? 1 : 0} />
              </Group>
            ))}
          </Group>
        </Layer>
      </Stage>
    </div>
  );
};
