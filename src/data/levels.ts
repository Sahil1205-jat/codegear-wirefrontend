import { Level } from '@/components/game/LevelMap';

export const initialLevels: Level[] = [
  { 
    id: 1, title: 'SYSTEM BOOT', description: 'Topic: Standard Output', status: 'unlocked', x: 50, expectedOutput: 'Hello Machine', 
    task: 'Every program begins with a greeting. Your first objective is to write data to the standard output buffer.\n\n**Mission:**\nPrint exactly `Hello Machine` to the terminal.' 
  },
  { 
    id: 2, title: 'DIAGNOSTIC PING', description: 'Topic: Standard Output', status: 'locked', x: 30, expectedOutput: 'Ping...', 
    task: 'Let\'s run a network diagnostic. The system needs to know we are alive.\n\n**Mission:**\nPrint exactly `Ping...` to the terminal.' 
  },
  { 
    id: 3, title: 'MULTI-LINE OUTPUT', description: 'Topic: Newlines', status: 'locked', x: 70, expectedOutput: 'Sys\nInit', 
    task: 'Often, data must be formatted across multiple lines using the newline character (`\\n` or `endl`).\n\n**Mission:**\nPrint `Sys` on the first line, and `Init` on the second line.' 
  },
  { 
    id: 4, title: 'CHARACTER ESCAPES', description: 'Topic: Escape Characters', status: 'locked', x: 40, expectedOutput: 'The system said "Hello"', 
    task: 'Quotes inside of strings will break your code unless you "escape" them using a backslash (`\\"`)!\n\n**Mission:**\nPrint exactly:\n`The system said "Hello"`' 
  },
  { 
    id: 5, title: 'RAW INTEGERS', description: 'Topic: Number Literals', status: 'locked', x: 60, expectedOutput: '404', 
    task: 'You can print raw numbers directly into the output stream without using string quotes.\n\n**Mission:**\nPrint the raw integer `404` to the terminal.' 
  },
  { 
    id: 6, title: 'INTEGER ALLOC', description: 'Topic: Variables', status: 'locked', x: 50, expectedOutput: '10', 
    task: 'Hardware needs data to process. You must allocate memory for an integer variable, assign it a value, and print it out.\n\n**Mission:**\n1. Declare an integer variable named `x`.\n2. Assign it the value `10`.\n3. Print the variable `x` to the console (do not print it in quotes!).' 
  },
  { 
    id: 7, title: 'RE-ALLOCATION', description: 'Topic: Variable Mutation', status: 'locked', x: 30, expectedOutput: '9600', 
    task: 'Variables can change (mutate) during execution.\n\n**Mission:**\n1. Declare an integer `baudRate = 1200`.\n2. On the next line, reassign `baudRate` to `9600`.\n3. Print `baudRate`.' 
  },
  { 
    id: 8, title: 'FLOATING POINT', description: 'Topic: Decimals', status: 'locked', x: 70, expectedOutput: '3.14', 
    task: 'Integers only hold whole numbers. To hold decimals, you must use a Floating Point variable (`float` or `double`).\n\n**Mission:**\n1. Declare a float/double named `pi` set to `3.14`.\n2. Print it.' 
  },
  { 
    id: 9, title: 'CHARACTER BUFFERS', description: 'Topic: Chars', status: 'locked', x: 40, expectedOutput: 'A', 
    task: 'A `char` data type holds exactly one character in memory, and uses single quotes (`\'A\'`).\n\n**Mission:**\n1. Declare a char named `grade` set to `\'A\'`.\n2. Print it.' 
  },
  { 
    id: 10, title: 'ALU: ADDITION', description: 'Topic: Arithmetic (+)', status: 'locked', x: 60, expectedOutput: '15', 
    task: 'The Arithmetic Logic Unit (ALU) performs math.\n\n**Mission:**\n1. Declare integer `a = 10`.\n2. Declare integer `b = 5`.\n3. Print the result of `a + b`.' 
  }
];
