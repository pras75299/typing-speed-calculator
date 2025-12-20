-- Seed code snippets for typing practice in different programming languages
-- Character counts optimized for testing: 100-400 characters

-- JavaScript Code Snippets (Default)
INSERT INTO texts (content, difficulty_level, word_count, character_count, language, is_active) VALUES
-- Easy JavaScript (100-200 characters)
('function greet(name) {\n  return `Hello, ${name}!`;\n}\n\nconst message = greet("World");\nconsole.log(message);', 'easy', 15, 110, 'javascript', true),
('const numbers = [1, 2, 3, 4, 5];\nconst doubled = numbers.map(n => n * 2);\nconsole.log(doubled);', 'easy', 15, 120, 'javascript', true),
('function add(a, b) {\n  return a + b;\n}\n\nconst result = add(5, 3);\nconsole.log(result);', 'easy', 15, 115, 'javascript', true),
('const user = {\n  name: "John",\n  age: 30,\n  city: "New York"\n};\nconsole.log(user.name);', 'easy', 15, 130, 'javascript', true),
('for (let i = 0; i < 5; i++) {\n  console.log(`Count: ${i}`);\n}', 'easy', 12, 75, 'javascript', true),

-- Medium JavaScript (150-300 characters)
('function calculateTotal(items) {\n  return items.reduce((sum, item) => {\n    return sum + item.price * item.quantity;\n  }, 0);\n}\n\nconst cart = [\n  { price: 10, quantity: 2 },\n  { price: 5, quantity: 3 }\n];\nconsole.log(calculateTotal(cart));', 'medium', 30, 280, 'javascript', true),
('async function fetchUserData(userId) {\n  try {\n    const response = await fetch(`/api/users/${userId}`);\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error("Error:", error);\n    return null;\n  }\n}', 'medium', 28, 260, 'javascript', true),
('class Calculator {\n  constructor() {\n    this.result = 0;\n  }\n  \n  add(value) {\n    this.result += value;\n    return this;\n  }\n  \n  multiply(value) {\n    this.result *= value;\n    return this;\n  }\n}', 'medium', 25, 240, 'javascript', true),
('const users = users.filter(user => user.active)\n  .map(user => ({\n    id: user.id,\n    name: user.name.toUpperCase(),\n    email: user.email\n  }))\n  .sort((a, b) => a.name.localeCompare(b.name));', 'medium', 30, 270, 'javascript', true),

-- Hard JavaScript (200-400 characters)
('function debounce(func, wait) {\n  let timeout;\n  return function executedFunction(...args) {\n    const later = () => {\n      clearTimeout(timeout);\n      func(...args);\n    };\n    clearTimeout(timeout);\n    timeout = setTimeout(later, wait);\n  };\n}\n\nconst handleSearch = debounce((query) => {\n  console.log("Searching for:", query);\n}, 300);', 'hard', 40, 380, 'javascript', true),
('class EventEmitter {\n  constructor() {\n    this.events = {};\n  }\n  \n  on(event, callback) {\n    if (!this.events[event]) {\n      this.events[event] = [];\n    }\n    this.events[event].push(callback);\n  }\n  \n  emit(event, data) {\n    if (this.events[event]) {\n      this.events[event].forEach(callback => callback(data));\n    }\n  }\n}', 'hard', 45, 390, 'javascript', true),

-- Python Code Snippets
('def greet(name):\n    return f"Hello, {name}!"\n\nmessage = greet("World")\nprint(message)', 'easy', 12, 110, 'python', true),
('numbers = [1, 2, 3, 4, 5]\ndoubled = [n * 2 for n in numbers]\nprint(doubled)', 'easy', 12, 95, 'python', true),
('def add(a, b):\n    return a + b\n\nresult = add(5, 3)\nprint(result)', 'easy', 12, 85, 'python', true),
('class Calculator:\n    def __init__(self):\n        self.result = 0\n    \n    def add(self, value):\n        self.result += value\n        return self', 'medium', 20, 180, 'python', true),
('def calculate_total(items):\n    return sum(item["price"] * item["quantity"] \n               for item in items)\n\ncart = [{"price": 10, "quantity": 2},\n        {"price": 5, "quantity": 3}]\nprint(calculate_total(cart))', 'medium', 28, 260, 'python', true),
('async def fetch_user_data(user_id):\n    try:\n        async with aiohttp.ClientSession() as session:\n            async with session.get(f"/api/users/{user_id}") as response:\n                return await response.json()\n    except Exception as e:\n        print(f"Error: {e}")\n        return None', 'hard', 35, 320, 'python', true),

-- Java Code Snippets
('public class Greeter {\n    public String greet(String name) {\n        return "Hello, " + name + "!";\n    }\n}', 'easy', 15, 120, 'java', true),
('public class Calculator {\n    private int result = 0;\n    \n    public Calculator add(int value) {\n        this.result += value;\n        return this;\n    }\n}', 'medium', 20, 180, 'java', true),
('public class UserService {\n    public List<User> getActiveUsers(List<User> users) {\n        return users.stream()\n            .filter(User::isActive)\n            .map(u -> new User(u.getId(), u.getName().toUpperCase()))\n            .collect(Collectors.toList());\n    }\n}', 'hard', 35, 340, 'java', true),

-- TypeScript Code Snippets
('interface User {\n  id: number;\n  name: string;\n  email: string;\n}\n\nfunction greet(user: User): string {\n  return `Hello, ${user.name}!`;\n}', 'easy', 18, 150, 'typescript', true),
('type Callback<T> = (data: T) => void;\n\nclass EventEmitter<T> {\n  private events: Map<string, Callback<T>[]> = new Map();\n  \n  on(event: string, callback: Callback<T>): void {\n    if (!this.events.has(event)) {\n      this.events.set(event, []);\n    }\n    this.events.get(event)!.push(callback);\n  }\n}', 'hard', 40, 380, 'typescript', true),

-- C++ Code Snippets
('#include <iostream>\n#include <vector>\n\nint main() {\n    std::vector<int> numbers = {1, 2, 3, 4, 5};\n    for (int n : numbers) {\n        std::cout << n * 2 << std::endl;\n    }\n    return 0;\n}', 'medium', 25, 240, 'cpp', true),

-- Go Code Snippets
('package main\n\nimport "fmt"\n\nfunc greet(name string) string {\n    return fmt.Sprintf("Hello, %s!", name)\n}\n\nfunc main() {\n    message := greet("World")\n    fmt.Println(message)\n}', 'medium', 22, 220, 'go', true)
ON CONFLICT DO NOTHING;

-- Update word_count and character_count for existing texts
UPDATE texts SET 
    word_count = (SELECT array_length(string_to_array(content, ' '), 1)),
    character_count = LENGTH(content)
WHERE word_count IS NULL OR character_count IS NULL;
