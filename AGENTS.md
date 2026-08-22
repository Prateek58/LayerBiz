# LayerBiz Agent Instructions (AGENTS.md)

This file defines the core behavioral rules and standards for all AI pair programming assistants working on the LayerBiz codebase.

---

## 1. Technical Writing & Blog Content Standards
* **No Emojis**: Strictly avoid emojis (no ❌, ✅, 🚀, ✨, 📚, 🔥, etc.) in blog articles, markdown files, and documentation. Maintain an authentic, rigorous, publication-grade tone.
* **Standard Markdown Tables Over ASCII Art**:
  * **Never** use raw ASCII drawing boxes (`┌───`, `│`, `└───`, `+---+`) for architectures, comparisons, or data models (they wrap and break on web/mobile screens).
  * **Always** format architectural models, comparisons, and feature breakdowns as standard GitHub-Flavored Markdown (GFM) tables:
    ```markdown
    | Layer / Component | Technology / Stack | Primary Responsibility |
    | :--- | :--- | :--- |
    | **1. Edge Perimeter** | Cloudflare / TLS 1.3 | Rate Limiting & Geo-Blocking |
    | **2. Ingestion Traps** | Invisible Honeypots | Sub-Second Anti-Spam Defense |
    ```
* **Step-by-Step Flow Lists for Sequences**:
  * For multi-step execution flows, pipelines, or state machines, use clean bolded numbered lists:
    ```markdown
    1. **Plan Phase**: Deconstruct high-level intent into sequential sub-tasks.
    2. **Tool Execution**: Programmatically interact with external services.
    3. **Self-Reflection**: Validate tool responses against assertions.
    4. **State Commit**: Persist verified outcomes to durable storage.
    ```
* **Code Quality in Markdown**: Always specify syntax languages for code blocks (e.g. ````typescript````, ````json````, ````rust````). Use single backticks (`` `item` ``) for inline symbols.

---

## 2. Architecture & CMS Standards
* **Slug Identifiers**: Always use semantic slugs (`uid`) for blog posts and dynamic pages. Never bind frontend routing to ephemeral numeric IDs in Strapi v5.
* **Smart Fallbacks**: Maintain fallback cascades for SEO (`post.metaTitle || post.title`, `post.metaDescription || post.excerpt`).
* **Clean Code**: No temporary hacks or symptom-masking. Identify and fix root causes directly.
* **Zero Secrets in Code**: Keep all credentials, tokens, and keys in `.env` files. Never commit secrets to the repository.
