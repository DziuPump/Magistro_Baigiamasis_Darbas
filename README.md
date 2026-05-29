# Magistro Baigiamasis Darbas

Projektui reikia Node.js, npm ir MongoDB duomenu bazes.

## Paleidimas

### 1. Backend

```bash
cd backend
npm install
```

Sukurkite `backend/.env` faila:

```env
MONGODB_URI=your_mongodb_connection_string
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
PORT=4000
```

Paleiskite backend serveri:

```bash
npm run dev
```

Backend veiks adresu:

```txt
http://localhost:4000
```

### 2. Frontend

Atsidarykite kita terminala:

```bash
cd llm-test-platform
npm install
npm run dev
```

Frontend veiks adresu:

```txt
http://localhost:5173
```

### 3. Naudojimas

Atidarykite narsykleje:

```txt
http://localhost:5173
```

Duomenys, kuriais paseedintas MongoDB yra backend/duomenys aplanke
