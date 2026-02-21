/**
 * Mock Data Module
 * Provides realistic mock data for UI development before WebSocket integration
 */

/** Default code templates for different languages */
export const CODE_TEMPLATES = {
    javascript: `// Welcome to Bootcamp IDE!
// Write your JavaScript code here

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Calculate first 10 fibonacci numbers
for (let i = 0; i < 10; i++) {
  console.log(\`fib(\${i}) = \${fibonacci(i)}\`);
}
`,
    python: `# Welcome to Bootcamp IDE!
# Write your Python code here

def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

# Calculate first 10 fibonacci numbers
for i in range(10):
    print(f"fib({i}) = {fibonacci(i)}")
`,
    java: `// Welcome to Bootcamp IDE!
// Write your Java code here

public class Main {
    public static int fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
    }

    public static void main(String[] args) {
        for (int i = 0; i < 10; i++) {
            System.out.println("fib(" + i + ") = " + fibonacci(i));
        }
    }
}
`,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Hello World</title>
</head>
<body>
  <h1>Hello, Bootcamp IDE!</h1>
  <p>Start building something amazing.</p>
</body>
</html>
`,
    css: `/* Global Styles */
body {
  font-family: 'Inter', sans-serif;
  background: #0f1419;
  color: #ffffff;
  margin: 0;
  padding: 20px;
}

h1 {
  color: #3b82f6;
}
`,
};

/** Mock student data with realistic names and statuses */
export const MOCK_STUDENTS = [
    {
        id: 'stu-001',
        name: 'Alice Chen',
        isOnline: true,
        lastActivity: '2 min ago',
        code: `function bubbleSort(arr) {\n  for (let i = 0; i < arr.length; i++) {\n    for (let j = 0; j < arr.length - i - 1; j++) {\n      if (arr[j] > arr[j + 1]) {\n        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];\n      }\n    }\n  }\n  return arr;\n}\n\nconsole.log(bubbleSort([5, 3, 8, 1, 2]));`,
        output: '[1, 2, 3, 5, 8]',
        outputPreview: '[1, 2, 3, 5, 8]',
        language: 'javascript',
    },
    {
        id: 'stu-002',
        name: 'Bob Martinez',
        isOnline: true,
        lastActivity: 'Just now',
        code: `const isPalindrome = (str) => {\n  const clean = str.toLowerCase().replace(/[^a-z]/g, '');\n  return clean === clean.split('').reverse().join('');\n};\n\nconsole.log(isPalindrome("racecar")); // true\nconsole.log(isPalindrome("hello"));   // false`,
        output: 'true\nfalse',
        outputPreview: 'true | false',
        language: 'javascript',
    },
    {
        id: 'stu-003',
        name: 'Carol Williams',
        isOnline: false,
        lastActivity: '15 min ago',
        code: `function factorial(n) {\n  if (n === 0) return 1;\n  return n * factorial(n - 1);\n}\n\nfor (let i = 1; i <= 5; i++) {\n  console.log(i + "! = " + factorial(i));\n}`,
        output: '1! = 1\n2! = 2\n3! = 6\n4! = 24\n5! = 120',
        outputPreview: '1! = 1 | 2! = 2 | 3! = 6...',
        language: 'javascript',
    },
    {
        id: 'stu-004',
        name: 'David Park',
        isOnline: true,
        lastActivity: '5 min ago',
        code: `class Stack {\n  constructor() {\n    this.items = [];\n  }\n  push(el) { this.items.push(el); }\n  pop() { return this.items.pop(); }\n  peek() { return this.items[this.items.length - 1]; }\n  isEmpty() { return this.items.length === 0; }\n}\n\nconst stack = new Stack();\nstack.push(10);\nstack.push(20);\nconsole.log(stack.peek()); // 20\nstack.pop();\nconsole.log(stack.peek()); // 10`,
        output: '20\n10',
        outputPreview: '20 | 10',
        language: 'javascript',
    },
    {
        id: 'stu-005',
        name: 'Ava Johnson',
        isOnline: true,
        lastActivity: '1 min ago',
        code: `const twoSum = (nums, target) => {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n};\n\nconsole.log(twoSum([2, 7, 11, 15], 9));`,
        output: '[0, 1]',
        outputPreview: '[0, 1]',
        language: 'javascript',
    },
    {
        id: 'stu-006',
        name: 'Ethan Brown',
        isOnline: true,
        lastActivity: '3 min ago',
        code: `function reverseLinkedList(head) {\n  let prev = null;\n  let current = head;\n  while (current) {\n    const next = current.next;\n    current.next = prev;\n    prev = current;\n    current = next;\n  }\n  return prev;\n}\n\nconsole.log("Linked list reversed!");`,
        output: 'Linked list reversed!',
        outputPreview: 'Linked list reversed!',
        language: 'javascript',
    },
    {
        id: 'stu-007',
        name: 'Fatima Al-Hassan',
        isOnline: false,
        lastActivity: '30 min ago',
        code: `// Still working on this...\nfunction mergeSort(arr) {\n  // TODO: implement\n  return arr;\n}`,
        output: '',
        outputPreview: 'No output yet',
        language: 'javascript',
    },
    {
        id: 'stu-008',
        name: 'George Kim',
        isOnline: true,
        lastActivity: 'Just now',
        code: `const debounce = (fn, delay) => {\n  let timer;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), delay);\n  };\n};\n\nconst log = debounce(console.log, 300);\nlog("Hello, debounced world!");`,
        output: 'Hello, debounced world!',
        outputPreview: 'Hello, debounced world!',
        language: 'javascript',
    },
];

/** Supported programming languages */
export const SUPPORTED_LANGUAGES = [
    { id: 'javascript', name: 'JavaScript', extension: '.js' },
    { id: 'python', name: 'Python', extension: '.py' },
    { id: 'java', name: 'Java', extension: '.java' },
    { id: 'html', name: 'HTML', extension: '.html' },
    { id: 'css', name: 'CSS', extension: '.css' },
    { id: 'typescript', name: 'TypeScript', extension: '.ts' },
];

/** Default font sizes for the editor */
export const FONT_SIZES = [12, 13, 14, 15, 16, 18, 20, 22, 24];
