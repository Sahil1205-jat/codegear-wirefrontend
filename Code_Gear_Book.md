# ⚡ Code Gear: The Complete Architecture Book

*Written for Sahil Sepat — The Architect.*

---

## 📖 Preface: The Vision
**Code Gear & Wear** started as an ambitious idea to bridge the gap between software programming and hardware execution. The initial vision was to build a "Web OS" — a browser-based operating system featuring draggable windows, a terminal, and a live interactive Motherboard visualization (built with `react-konva`). The goal was to let users write C, C++, or Java code and physically watch the data move from the CPU, across the Data Bus, and into RAM.

However, as the platform evolved, the vision sharpened. To make the learning process truly addictive, we pivoted the architecture from a Sandbox Simulation to a **Highly Gamified Esports Learning Engine**. 

We ripped out the complex desktop simulation and replaced it with a hyper-focused, Candy Crush-style progression map paired with a sleek, LeetCode-style code editor. Code Gear was no longer just a simulator; it became a full-blown video game for engineers.

---

## 🏗️ Chapter 1: The Core Technologies
To build a highly responsive, web-based coding game, we utilized a modern, bleeding-edge tech stack:

- **Framework:** Next.js 15 (App Router) for Server-Side Rendering and fast API routes.
- **Styling:** Tailwind CSS + Framer Motion. We used a dark, neon-accented "Cyberpunk/Esports" aesthetic (zinc blacks, emerald greens, and pulsing blues).
- **Authentication:** NextAuth.js. We implemented a secure, biological-themed Google OAuth login system.
- **Database:** Prisma ORM. We initially built a local SQLite file (`dev.db`), and later upgraded the schema to support PostgreSQL for serverless Vercel deployment.
- **Execution Engine:** Wandbox API. Instead of hosting our own heavy Docker containers, we securely routed user code to Wandbox's cloud compiler, allowing us to compile C (GCC), C++ (G++), and Java (OpenJDK) in milliseconds directly from the browser.

---

## 🎮 Chapter 2: The Gamification Engine (Campaign Map)
The heart of Code Gear is the **Campaign Map**.

Instead of dropping a student into a blank editor, we guide them through a linear, 45-level-per-phase roadmap.

### The Mechanics:
1. **The Map UI (`LevelMap.tsx`)**: 
   We built a beautiful SVG-based map featuring a pulsing, animated spline curve that connects level nodes. Locked nodes are greyed out, while completed nodes glow with a green checkmark.
2. **The LeetCode Split-Pane**:
   When a node is clicked, the UI splits perfectly in half. 
   - **The Left Panel** displays the mission briefing, lore, and the *Expected Standard Output*.
   - **The Right Panel** contains the code editor and the test terminal.
3. **The Auto-Validation Loop**:
   When the user clicks "Run Code", the platform sends the code to Wandbox. The resulting `stdout` is intercepted and strictly matched against the `expectedOutput`. If it matches, the platform triggers a success sound, awards **100 XP**, displays an "Auto-Advancing" countdown overlay, and automatically pushes the user to the next level.

---

## 📚 Chapter 3: The Reading Flowcharts (Courses)
While the Campaign Map forces students to write code, we realized they needed a place to actually learn the theory first.

We created the **Training Courses** hub. Instead of traditional, boring text walls, we designed a **Split-Pane Flowchart UI**:
1. **The Tech Tree (Left Panel)**: 
   Modules are displayed as a vertical tech tree connected by a solid line. When a user clicks a node, it highlights with a glowing aura.
2. **The Markdown Reader (Right Panel)**:
   The selected module's content is rendered dynamically. We built a custom markdown parser that natively intercepts `\n\n`, `###`, bullet points, and code blocks (```` ````), wrapping them in beautiful Tailwind UI components. 

The courses include highly detailed curriculums for:
- **C Bootcamp**: Memory Management, `malloc()`, Pointers, and Compilation Pipelines.
- **C++ Masterclass**: OOP, References, `std::cout`, and the Standard Template Library (STL).
- **Java Fundamentals**: The JVM, Garbage Collection, and Reference vs Primitive memory models.

---

## 💾 Chapter 4: State Persistence & The Database
A game is pointless if it doesn't save your score. We built a robust persistence layer to track user progress permanently.

1. **The Schema (`schema.prisma`)**:
   We tied NextAuth's default User schema to our game mechanics by adding two critical fields:
   - `xp (Int)`: Tracks the total experience points earned.
   - `completedLevels (String)`: A stringified JSON array (e.g., `"[1, 2, 3]"`).
2. **The Synchronization Hook (`/api/progress`)**:
   Every time the game boots up, `page.tsx` fires a `GET` request to the database to pull the user's XP and completed levels, dynamically unlocking the Campaign Map.
3. **The Upsert Safety Net**:
   Because NextAuth creates the user profile asynchronously, we wrote an `upsert` mechanism in the API. If the API tries to update a user's XP but their profile hasn't been fully instantiated in the DB yet, Prisma will safely `create` the profile on the fly, preventing fatal 500 Server Crashes.

---

## 🚀 Chapter 5: The Deployment Pipeline
Code Gear is fully architected for serverless cloud deployment.

Because local file-based databases (SQLite) are wiped clean every time a serverless function spins down, the architecture was explicitly upgraded:
1. **Prisma Provider**: Swapped to `postgresql`.
2. **Supabase Integration**: The `.env` variables were routed to a live Supabase PostgreSQL cluster (with URL-encoded passwords to prevent parsing crashes).
3. **Vercel**: The frontend is fully optimized for Vercel, requiring nothing but the `DATABASE_URL` and `GOOGLE_CLIENT_ID` to go live to the world.

---

## 🔮 Epilogue: The Future of Code Gear
What started as a Sandbox has become a highly scalable Education Platform. Because the curriculum is completely decoupled into `src/data/levels.ts` and `src/data/courses.ts`, adding hundreds of new levels, missions, and language bootcamps requires zero UI changes—just adding data to the arrays.

**The Machine is built. The engine is running. The game has begun.**
