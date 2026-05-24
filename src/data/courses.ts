export interface CourseModule {
  id: string;
  title: string;
  content: string;
}

export const cModules: CourseModule[] = [
  {
    id: 'c_1',
    title: '1. The C compilation Pipeline',
    content: 'C is a compiled language, meaning the code you write (source code) cannot be executed directly by the computer. It must pass through a strict 4-step pipeline to become a binary executable.\n\n### The 4 Steps:\n- **Preprocessing**: Handles `#include` and `#define` macros. It essentially pastes header files directly into your source code.\n- **Compilation**: Translates the preprocessed code into Assembly language.\n- **Assembly**: Translates Assembly into Machine Code (Object files, `.o` or `.obj`).\n- **Linking**: Combines your object files with standard C libraries (like `stdio.h`) to create the final executable file.'
  },
  {
    id: 'c_2',
    title: '2. Basic Syntax & Standard I/O',
    content: 'Every C program requires a specific structure. Execution always begins at the `main()` function.\n\n```c\n#include <stdio.h>\n\nint main() {\n    int level = 1;\n    printf("Booting Level %d...\\n", level);\n    return 0;\n}\n```\n\n### Key Concepts:\n- `#include <stdio.h>`: The Standard Input/Output library. Without this, you cannot use `printf`.\n- `printf()`: The primary way to output text. It supports format specifiers like `%d` (integer), `%f` (float), and `%s` (string).\n- `\\n`: The newline character. C does not automatically break lines for you.'
  },
  {
    id: 'c_3',
    title: '3. Data Types & Memory Bounds',
    content: 'C is statically typed. You must declare the type of every variable before compiling. Because C is "close to the metal", data types directly correspond to bytes in RAM.\n\n### Core Types:\n- `char`: 1 byte. Stores a single character like \'A\'.\n- `int`: Usually 4 bytes. Stores whole numbers.\n- `float`: 4 bytes. Stores decimal numbers.\n- `double`: 8 bytes. High-precision decimal numbers.\n\n```c\nint health = 100;\nchar grade = \'A\';\nfloat accuracy = 98.5f;\n```'
  },
  {
    id: 'c_4',
    title: '4. The Power of Pointers',
    content: 'This is what makes C so powerful (and dangerous). A **pointer** is simply a variable that stores the *memory address* of another variable, rather than storing a value directly.\n\n```c\nint ammo = 30;\nint *ammo_ptr = &ammo;\n\nprintf("Ammo Address: %p\\n", ammo_ptr);\nprintf("Ammo Value: %d\\n", *ammo_ptr);\n```\n\n### Pointer Mechanics:\n- `&` (Address-of Operator): Gets the physical RAM address of a variable.\n- `*` (Dereference Operator): Goes to the address stored in the pointer and interacts with the actual data there.'
  },
  {
    id: 'c_5',
    title: '5. Manual Memory Allocation',
    content: 'Unlike Java or Python, C has no Garbage Collector. If you need dynamic memory (memory whose size is determined at runtime), you must ask the OS for it, and you must explicitly give it back.\n\n```c\n#include <stdlib.h>\n\nint main() {\n    // Allocate memory for 10 integers\n    int *arr = (int *)malloc(10 * sizeof(int));\n    \n    // Use the memory...\n    arr[0] = 50;\n    \n    // You MUST free it to prevent memory leaks!\n    free(arr);\n    return 0;\n}\n```\n\n### The Functions:\n- `malloc(size)`: Requests a block of raw bytes.\n- `free(pointer)`: Releases the memory block back to the operating system.'
  }
];

export const cppModules: CourseModule[] = [
  {
    id: 'cpp_1',
    title: '1. The C++ Evolution',
    content: 'C++ was built in 1985 as an extension to C, originally called "C with Classes". It adds Object-Oriented Programming (OOP) and extreme performance optimizations.\n\n### Why C++?\n- Almost all major game engines (Unreal, Frostbite) are built in C++.\n- High-frequency trading algorithms rely on its nanosecond execution speed.\n- It retains all the raw memory power of C, but adds high-level safety features.'
  },
  {
    id: 'cpp_2',
    title: '2. Namespaces & I/O Streams',
    content: 'C++ completely overhauls how input and output are handled, replacing `printf` with Streams.\n\n```cpp\n#include <iostream>\n\nint main() {\n    std::cout << "Engine Online" << std::endl;\n    return 0;\n}\n```\n\n### Breakdown:\n- `std::cout`: "Standard Character Output". Represents the console.\n- `<<`: The insertion operator. It "pushes" data into the output stream.\n- `std::endl`: Pushes a newline character and flushes the stream buffer.\n- `std::`: This is a namespace. It prevents naming collisions if two libraries both have a `cout` object.'
  },
  {
    id: 'cpp_3',
    title: '3. Pass-by-Reference',
    content: 'While C only has Pointers, C++ introduces **References**. A reference is an alias for an existing variable. It behaves like a pointer, but with much safer syntax.\n\n```cpp\nvoid heal(int& player_hp) {\n    player_hp += 50; // Directly modifies original variable!\n}\n\nint main() {\n    int hp = 10;\n    heal(hp);\n    // hp is now 60\n}\n```\n\n### Why use references?\n- They are guaranteed to never be `null`.\n- They don\'t require the `*` dereference syntax everywhere.\n- They avoid copying large amounts of data when passing massive objects into functions.'
  },
  {
    id: 'cpp_4',
    title: '4. Classes & Encapsulation',
    content: 'C++ allows you to bundle data and functions together into a single blueprint called a `class`.\n\n```cpp\nclass Weapon {\nprivate:\n    int ammo;\npublic:\n    Weapon() { ammo = 30; } // Constructor\n    void shoot() {\n        if (ammo > 0) ammo--;\n    }\n};\n```\n\n### Access Modifiers:\n- `private`: Data cannot be accessed outside the class. This protects the internal state (Encapsulation).\n- `public`: Methods that external code is allowed to call.\n- **Constructors**: Special functions that run automatically when the object is instantiated to set up initial state.'
  },
  {
    id: 'cpp_5',
    title: '5. The Standard Template Library (STL)',
    content: 'C++ comes with the STL, a massive library of heavily-optimized data structures. You rarely need to build your own dynamic arrays or linked lists from scratch.\n\n```cpp\n#include <iostream>\n#include <vector>\n\nint main() {\n    std::vector<int> scores;\n    scores.push_back(100);\n    scores.push_back(200);\n    \n    for(int s : scores) {\n        std::cout << s << "\\n";\n    }\n}\n```\n\n### The Vector:\n- `std::vector` is a dynamic array. It automatically resizes itself when it runs out of space, handling all the nasty `malloc` and `free` operations behind the scenes for you!'
  }
];

export const javaModules: CourseModule[] = [
  {
    id: 'java_1',
    title: '1. The Java Virtual Machine (JVM)',
    content: 'Java is famous for the phrase "Write Once, Run Anywhere". \n\nInstead of compiling directly to hardware machine code like C/C++, Java code is compiled into an intermediate language called **Bytecode** (`.class` files).\n\n### The Architecture:\n- When you run a Java program, the **JVM** reads the Bytecode and translates it into the local machine code (Windows, Mac, or Linux) in real-time.\n- This makes Java universally portable, but slightly slower to boot up than C++.'
  },
  {
    id: 'java_2',
    title: '2. Pure Object-Orientation',
    content: 'Unlike C++, Java is *strictly* object-oriented. Absolutely everything must exist inside a Class. There are no global variables or standalone functions.\n\n```java\npublic class Server {\n    public static void main(String[] args) {\n        System.out.println("Server Started.");\n    }\n}\n```\n\n### Breakdown:\n- The file must be named `Server.java` to match the public class name.\n- `public static void main`: The entry point. It is `static` because the JVM must call it before any objects of the `Server` class are instantiated.'
  },
  {
    id: 'java_3',
    title: '3. Reference Types vs Primitives',
    content: 'Java divides data into two distinct categories: Primitives and References.\n\n### Primitives (Fast, Stored on Stack):\n- `int`, `double`, `boolean`, `char`\n- These hold their values directly.\n\n### References (Stored on Heap):\n- `String`, Arrays, and any Objects (e.g., `Scanner`, `Player`)\n- When you pass an Object to a function, you are passing a *reference* to the memory location, not a copy of the object.\n\n```java\nString name = new String("Agent");\n```\nThe `new` keyword is used to allocate memory on the Heap for a Reference Type.'
  },
  {
    id: 'java_4',
    title: '4. The Garbage Collector',
    content: 'In C/C++, you must manually `free()` or `delete` memory. In Java, this is entirely automated by the **Garbage Collector (GC)**.\n\n### How it works:\n- When an object is created with `new`, it lives on the Heap.\n- The JVM tracks how many active references point to that object.\n- If a variable goes out of scope and the reference count drops to 0, the Garbage Collector detects that the object is "unreachable" and automatically deletes it from RAM to free up space.\n\n*Warning:* While the GC prevents memory leaks, it can cause unpredictable micro-stutters when it runs, which is why Java is rarely used for AAA game engines.'
  },
  {
    id: 'java_5',
    title: '5. Interfaces & Polymorphism',
    content: 'Java enforces strong architectural design. An `interface` is a strict contract that dictates what methods a class MUST implement.\n\n```java\ninterface Damagable {\n    void takeDamage(int amount);\n}\n\nclass Enemy implements Damagable {\n    public void takeDamage(int amount) {\n        // Implementation required!\n    }\n}\n```\n\n### Why use Interfaces?\n- It allows **Polymorphism**. You can write a function that takes a `Damagable` object, and pass it a `Player`, an `Enemy`, or a `DestructibleWall` without caring what the actual object is, as long as it signed the contract!'
  }
];
