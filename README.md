Here is the **README.md in normal chat**, clean and ready to copy:

---

# 📌 Loan Compass — AI-Powered Loan Comparison & Chat Assistant

Loan Compass is an intelligent loan comparison platform built using **Next.js**, **Supabase**, and **Google Gemini AI**. It helps users explore loan products and chat with an AI assistant while maintaining secure authentication, persisted chat history, and smooth UI experiences.

---

## 🚀 Tech Stack

### **Frontend**

* Next.js 14 (App Router)
* React + TypeScript
* Tailwind CSS
* ShadCN/UI Components
* Framer Motion
* Custom Hooks (useChatHistory, useAnonId, useDebounce)
* LocalStorage fallback chat system

### **Backend**

* Next.js API Route Handlers
* Supabase Postgres
* Supabase Auth
* `@supabase/ssr` for server-side auth
* Google Gemini 2.5 Flash API
* In-memory rate limiter

---

## 📁 Folder Structure

```
app
 ├─ api
 │   ├─ ai/ask/route.ts
 │   ├─ auth
 │   ├─ chat
 │   └─ products
 │
 ├─ components
 │   ├─ ui (AuthModel, ChatSheet)
 │   ├─ Filters.tsx
 │   ├─ Navbar.tsx
 │   └─ ProductCard.tsx
 │
 ├─ products
 │   ├─ page.tsx
 │   └─ ProductsClient.tsx
 │
 ├─ globals.css
 ├─ layout.tsx
 ├─ page.tsx
 ├─ ProductListClient.tsx
 │
 ├─ components  
 ├─ hooks  
 ├─ lib  
   ├─ supabase (server client + RLS)
   ├─ ai.ts
   ├─ apiClient.ts
   ├─ getBadges.ts
   ├─ matching.ts
   ├─ rateLimiter.ts
   ├─ schemas.ts
   ├─ superbase_client.ts
   ├─ useDebounce.ts
   └─ utils.ts
```

---

## 🔐 Authentication Flow

### ✔ Supabase Auth

* Email + password
* Login popup component (`AuthModel.tsx`)
* Server-side auth using `@supabase/ssr`
* Session checks in API routes

### ✔ Anonymous Support

A UUID is generated using `useAnonId()` and stored in LocalStorage until login.

This allows:

* Chat without login
* Chat history persistence
* Migration to real user after login

---

## 💬 AI Chat Features

* Chat drawer UI (`ChatSheet.tsx`)
* History sync on load
* Stores messages in:

  * Supabase DB (logged-in users)
  * LocalStorage (anonymous users)

AI uses Gemini:

```ts
model.generateContent({
  contents: [{ role: "user", parts: [{ text: prompt }] }],
});
```

---

## 💾 Chat History Persistence

### Logged In Users

Stored in DB with `user_id`.

### Anonymous Users

Stored using `anon_id`.

### LocalStorage Fallback

Key format:

```
loan_compass_chat_history:PRODUCT_ID
```

---

## 🧱 Database Schema (Supabase)

```sql
CREATE TABLE ai_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  anon_id TEXT,
  product_id TEXT NOT NULL,
  role TEXT CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 📡 API Routes

### **POST /api/ai/ask**

* Stores user message
* Calls Gemini
* Stores AI reply
* Returns result

### **GET /api/chat/history**

Returns chat messages based on:

* user_id
* anon_id

---

## 🔧 Rate Limiting

Defined in `lib/rateLimiter.ts`.

Supports:

* User-based rate limits
* IP-based fallback

---

## ⚙️ Environment Variables

`.env.local`

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

GEMINI_API_KEY=
```

---

## 🏗️ Local Development

```
npm install
npm run dev
```

---

## 🛣 Roadmap

* [ ] AI streaming responses
* [ ] Loan calculator
* [ ] Multi-step chat flows
* [ ] Admin analytics
* [ ] PWA version
* [ ] Multi-language support

---

If you want —
✅ version with badges,
✅ screenshots,
✅ deployment instructions,
just tell me!
