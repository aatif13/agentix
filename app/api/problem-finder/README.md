# Problem Finder AI - Module Overview

The **Problem Finder AI** is a specialized module in the AGENTIX platform designed to identify high-impact, location-specific business and startup opportunities. It combines real-world geographic data with AI-powered analysis to ensure all generated problems are factually grounded and actionable.

---

## 🛠 Key Features

### 1. Real-World Context Injection
The module doesn't rely solely on the LLM's internal training data. Before generating problems, it performs live research using:
*   **Nominatim (OpenStreetMap) API**: Fetches geographic metadata like population, place type, and precise coordinates for the targeted district.
*   **Wikipedia API**: Retrieves the latest descriptive summaries and historical context for the location.
*   **Resilience**: The fetch operations run in parallel (`Promise.allSettled`). If an API fails or returns no data, the system gracefully falls back to a second Wikipedia search (District + State) or continues with its internal knowledge to ensure zero downtime.

### 2. Fact-Based Prompting
Fetched data is injected into a **Location Context** block within the Groq prompt. This forces the AI to:
*   Reference specific local demographics.
*   Address infrastructure gaps mentioned in real-world documentation.
*   Ground the "Severity" of problems in actual economic or population density data.

### 3. Strict Data Integrity
The module uses a specialized Mongoose model (**ProblemFinderResult**) with a strict sub-schema. Every problem generated must contain exactly these 6 fields:
*   `title`: Specific and local.
*   `severity`: Enum-validated (**High**, **Medium**, **Low**) at the database level.
*   `affectedGroup`: Targeted community or demographic.
*   `reason`: Clear explanation of the local conditions causing the issue.
*   `startupOpportunity`: A direct business idea to solve the problem.
*   `monetization`: How the startup will generate revenue in that specific locale.

### 4. Optimized AI Settings
*   **LLM**: `llama-3.3-70b-versatile` (via Groq SDK).
*   **Temperature**: Reduced to **0.4** to prioritize factual accuracy and logical consistency over creative randomness.

---

## 🏗 Technical Flow

1.  **Auth & Input**: Validates user session and the selected Domain/Sub-Domain.
2.  **Parallel Research**: Fetches Wikipedia and Nominatim data in parallel.
3.  **Context Construction**: Builds a facts-based string for the prompt.
4.  **AI Inference**: Groq generates exactly 5 problems using the research-grounded prompt.
5.  **Validation**: Ensures the JSON output matches the strict 6-field schema.
6.  **Persistence**: Saves the result to MongoDB for history retrieval.

---

## 📁 Key Files
*   `models/ProblemFinderResult.ts`: Defines the strict schema and TypeScript interfaces.
*   `app/api/problem-finder/generate/route.ts`: Core backend logic for research, prompting, and generation.
*   `app/api/problem-finder/history/route.ts`: API for retrieving user-specific problem history.
