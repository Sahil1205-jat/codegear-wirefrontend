

(async () => {
  const payload = {
    compiler: 'openjdk-jdk-22+36',
    code: 'public class Main { public static void main(String[] args) { System.out.println("Hello from files"); } }',
    "options": "",
    "compiler-option-raw": "-d .",
    "runtime-option-raw": "Main"
  };

  const res = await fetch('https://wandbox.org/api/compile.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  console.log(await res.json());
})();
