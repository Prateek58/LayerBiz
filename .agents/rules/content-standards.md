# Content & Engineering Rules for LayerBiz

## 1. Professional Technical Writing Standards (No AI Clichés / Emojis)
- **Zero Emojis in Content**: Do not use emojis (such as ❌, ✅, 🚀, ✨, 📚, 🔥, ⚡, 💡) in blog posts, technical documentation, or commit messages. Content must maintain a serious, publication-grade engineering tone.
- **Standard Markdown Tables (GFM) Over ASCII Art**:
  - Never draw raw ASCII boxes (`┌───`, `│`, `└───`, `+---+`) for architectures, comparisons, or data models.
  - Always use clean 2-to-4 column standard Markdown tables with aligned headers (`| :--- | :--- | :--- |`).
- **Structured Numbered Flow Lists**:
  - For sequential architectures, pipelines, or state machine phases, format as numbered bold lists (`1. **Phase Name**: Description`).
- **Human-Centric & Authoritative Tone**: Focus on architectural rationale, trade-offs, benchmarks, and concrete code examples. Avoid marketing hype, excessive adjectives, and formulaic AI intros/outros.

## 2. Headless CMS & Data Integrity Rules
- **Slug-Based Identity**: Always use semantic slugs (`uid`) for public-facing URLs and routes; never rely on ephemeral numeric database IDs.
- **Smart Fallbacks**: Maintain optional override fields with clean fallback cascades so content remains functional if metadata is omitted.
- **Zero Hardcoded Secrets**: Keep all tokens, database credentials, and SMTP passwords strictly in `.env.local` / `.env.production`.

## 3. Engineering Precision
- Always diagnose and fix root causes rather than applying superficial UI or silent catch workarounds.
- Verify production builds (`npm run build`) after modifying metadata, routes, or layout components.
