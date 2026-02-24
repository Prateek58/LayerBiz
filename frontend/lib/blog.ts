export interface BlogPost {
  id: number;
  title: string;
  date: string;
  readTime: string;
  excerpt: string;
  category: string;
  tags: string[];
}

export const posts: BlogPost[] = [
  {
    id: 1,
    title: "The Architecture of Zero-Latency Edge Systems",
    date: "Oct 24, 2023",
    readTime: "8 min read",
    excerpt: "Deep dive into how we achieved sub-50ms latency across global clusters for our DataLayer protocol.",
    category: "Engineering",
    tags: ["Rust", "Infrastructure", "Edge"]
  },
  {
    id: 2,
    title: "Why We Bet on React 19 for Our Enterprise Suite",
    date: "Nov 12, 2023",
    readTime: "5 min read",
    excerpt: "Exploring the performance gains and developer experience improvements in the latest React version.",
    category: "Frontend",
    tags: ["React", "Performance", "Typescript"]
  },
  {
    id: 3,
    title: "Securing Micro-SaaS: A Defense-in-Depth Approach",
    date: "Dec 05, 2023",
    readTime: "12 min read",
    excerpt: "How we implement end-to-end encryption and zero-trust principles in every product we build.",
    category: "Security",
    tags: ["Cybersecurity", "DevSecOps"]
  },
  {
    id: 4,
    title: "AI Beyond Chatbots: Building Task Orchestrators",
    date: "Jan 18, 2024",
    readTime: "10 min read",
    excerpt: "Designing LLM-powered agents that actually get work done in complex enterprise environments.",
    category: "AI",
    tags: ["LLM", "Python", "Automation"]
  }
];
