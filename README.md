# ⚡ Code Gear & Wear — UI / Web OS

*"Understand the machine. AI lives in the system, not in your brain."*

Welcome to the frontend repository of **Code Gear & Wear**. This is a highly interactive, Next.js-powered educational platform designed to visualize how C, C++, and Java code physically executes on computer hardware. 

The UI ditches the traditional "boring IDE" look and replaces it with a fully draggable, resizable OS-style desktop window manager and a live Motherboard map.

## ✨ Features

- **🪟 Floating Window Manager:** Built with `react-rnd`, featuring macOS/Win11 style traffic-light buttons, dynamic Z-index focusing, and full minimization into a frosted-glass bottom Dock.
- **🖥️ Hardware Visualizer:** A `react-konva` powered interactive motherboard that simulates data movement across the System Bus, RAM, and CPU during code compilation and execution.
- **☁️ Dual Execution Engines:** 
  - **Local Sandbox Mode:** Connects to our custom Docker backend for absolute hardware-level execution.
  - **Cloud Compiler API:** Connects directly to the Wandbox public API, allowing serverless code execution directly from the browser!
- **🎨 Hardcore Aesthetics:** Built using TailwindCSS and Framer Motion to create a sleek, dark-mode, engineering-focused UI.

## 🚀 Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000` in your browser.

## 🛠️ Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS + Framer Motion
- **Canvas/Graphics:** React-Konva
- **Window Management:** react-rnd
- **Icons:** Lucide React

## 🌐 Deployment
This frontend is completely ready to be deployed to **Vercel**. Since it supports the Cloud Compiler API out-of-the-box, you do not need the backend running to host this on the internet!
