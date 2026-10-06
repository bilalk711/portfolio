// Grounded in Bilal_Kazmi_Senior_Full_Stack_AI_Engineer_Resume.pdf.
export const profile = {
  name: "Bilal Kazmi",
  role: "Senior Full Stack Engineer · AI Applications",
  email: "bilalkazmi0711@gmail.com",
  headline: ["From idea", "to production."],
  summary: "Have a product in mind? I turn ideas into reliable web applications, SaaS platforms and AI features—from the first prototype to production.",
  experience: "5+ years of professional experience",
  focus: ["Full Stack", "Applied AI", "SaaS"],
  stack: ["Next.js", "React", "TypeScript", "Python", "Node.js"],
  about: "I’m a Senior Full Stack Engineer with 5+ years of experience building production web applications and AI features with React, TypeScript, Node.js, Python and AWS.",
  aboutDetail: "I’ve delivered PWAs serving 1,000+ daily users, integrated Gemini Vision into receipt workflows and independently built a voice-cloning SaaS. I can help you shape the architecture, build the product, connect AI where it adds value and ship with testing and production monitoring.",
  services: [
    { tag: "FULL STACK", name: "Production-ready web applications", detail: "Frontend applications, backend services, REST APIs and third-party integrations using TypeScript, React, Next.js, Node.js and Python." },
    { tag: "APPLIED AI", name: "AI that works inside your product", detail: "AI agents, chatbots, RAG pipelines, LLM integrations, voice AI and automation workflows, from prototype to production." },
    { tag: "SAAS", name: "Complete products, built to ship", detail: "SaaS platforms with reliable integrations, SQL and NoSQL databases, cloud deployment on AWS or GCP, testing and production setup." },
  ],
  projects: [
    { name: "CloneVoicePrompt", category: "VOICE AI · SAAS", role: "Founder & Full Stack Engineer", description: "Built and deployed a voice-cloning SaaS with queued GPU inference workers. Optimized Qwen3-TTS with CUDA graphs and chunked generation to make audio generation faster and more economical.", outcome: "≈82% lower GPU cost", detail: "RunPod GPU cost for approximately 60 minutes of audio fell from about $0.50 to $0.09. Inference runtime improved from 1–2× to 0.3–0.5× generated audio duration.", url: "https://clonevoiceprompt.online", tags: ["AI", "Web apps"], stack: ["Next.js", "Node.js", "MongoDB", "Redis / BullMQ", "Qwen3-TTS"] },
    { name: "Dubicars Listing Flow", category: "WEB APPLICATION", role: "Frontend Engineer", description: "Built a multi-step React flow that guides private sellers through vehicle details and multiple photo uploads, integrated into the existing Laravel platform.", outcome: "A complete seller journey", detail: "The listing flow collects make, model, year and mileage, then handles car-photo uploads to guide users through creating their advertisement.", url: "https://www.dubicars.com/sell-your-car", tags: ["Web apps"], stack: ["React", "Laravel integration", "Multi-step forms"] },
    { name: "Receipt Scan API", category: "VISION AI · AUTOMATION", role: "Backend & AI Engineer · JALTech", description: "Built a Firebase Functions API using Gemini Vision to process approximately 1,000 receipts per day, with transactional updates for concurrent requests.", outcome: "≈1,000 receipts per day", detail: "Optimized image processing and compression, Google Cloud Storage, Gemini API requests and receipt output. Related Almarai receipt workflows reduced review time from approximately 10 minutes to 1 minute.", url: null, tags: ["AI"], stack: ["Gemini Vision", "Firebase Functions", "Cloud Storage"] },
    { name: "Internal Knowledge Assistant", category: "RAG · AI APPLICATION", role: "Senior Full Stack Engineer · JALTech", description: "Developed a RAG assistant for internal knowledge retrieval and contextual responses, helping teams find relevant information through a conversational interface.", outcome: "Context-aware knowledge retrieval", detail: "A retrieval-augmented generation assistant built for internal use. The implementation combines knowledge retrieval with contextual responses.", url: null, tags: ["AI"], stack: ["RAG", "Embeddings", "Vector search"] },
  ],
};
