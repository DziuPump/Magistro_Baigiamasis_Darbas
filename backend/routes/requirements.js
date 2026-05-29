const express = require("express");
const router = express.Router();
const Requirement = require("../models/Requirement");

const OpenAI = require("openai");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// kosinusinio panasumo formule
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// funkcija vektorizavimui
function formatScenarioForEmbedding(scenario) {
  return `Title: ${scenario.title}
Preconditions: ${scenario.preconditions || "None"}
Steps: ${(scenario.steps || []).join(" ")}
Expected Result: ${scenario.expectedResult || ""}`.trim();
}

async function getEmbeddings(texts) {
  if (!texts || texts.length === 0) return [];
  const response = await openai.embeddings.create({
    model: "text-embedding-3-large",
    input: texts,
  });
  return response.data.map((d) => d.embedding);
}

function safeParseLLMResponse(text) {
  if (!text) throw new Error("LLM gražino tuscia teksta.");

  let cleanText = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleanText);
  } catch (e) {
    const start = cleanText.indexOf("{");
    const end = cleanText.lastIndexOf("}");

    if (start !== -1 && end !== -1 && end > start) {
      let jsonCandidate = cleanText.substring(start, end + 1);

      try {
        return JSON.parse(jsonCandidate);
      } catch (innerErr) {
        try {
          if (jsonCandidate.endsWith(","))
            jsonCandidate = jsonCandidate.slice(0, -1);

          const openBraces = (jsonCandidate.match(/{/g) || []).length;
          const closeBraces = (jsonCandidate.match(/}/g) || []).length;
          const openBrackets = (jsonCandidate.match(/\[/g) || []).length;
          const closeBrackets = (jsonCandidate.match(/]/g) || []).length;

          jsonCandidate += "]".repeat(
            Math.max(0, openBrackets - closeBrackets),
          );
          jsonCandidate += "}".repeat(Math.max(0, openBraces - closeBraces));

          return JSON.parse(jsonCandidate);
        } catch (finalErr) {
          console.error("Nepavyko pataisyti JSON:", jsonCandidate);
          throw new Error("JSON struktura sugadinta ir nepataisoma.");
        }
      }
    }
    throw new Error("Atsakyme nerasta JSON strukturos.");
  }
}

function buildFinalPrompt(requirement) {
  const acList =
    requirement.acceptanceCriteria && requirement.acceptanceCriteria.length > 0
      ? requirement.acceptanceCriteria
          .map((ac, i) => `${i + 1}. ${ac}`)
          .join("\n")
      : "No specific criteria provided.";

  if (requirement.nfrType === "Ground-Truth") {
    return `Act as a Senior QA Engineer specializing in Functional and System testing for desktop browsers.
Your goal is to generate test scenarios based on the provided browser feature requirement.

SYSTEM CONTEXT:
- System: ${requirement.context?.system || "N/A"}
- Platform: ${requirement.context?.platform || "N/A"}
- Architecture: ${requirement.context?.architecture || "N/A"}

INPUT REQUIREMENT:
- Title: ${requirement.title}
- Description: ${requirement.description}

ACCEPTANCE CRITERIA:
${acList}

Generate a comprehensive set of high-quality test scenarios using Black-Box testing techniques:
- Balanced Granularity: Generate scenarios that represent complete, meaningful user workflows. Avoid overly microscopic tests (e.g., do not write a test just for clicking a single button without a larger goal), but ensure distinct functionalities (e.g., adding vs. deleting) remain in separate tests.
- Exhaustive Coverage: Systematically cover all Acceptance Criteria. If a feature involves multiple locations (e.g., 4 UI locations), ensure synchronization is explicitly tested.
- User Flows & Edge Cases: Cover positive paths, negative paths (e.g., invalid inputs, canceling dialogs), and boundary conditions.

REQUIRED JSON SCHEMA:
{
  "testScenarios": [
    {
      "title": "[Technique Name] e.g. [Functional] Verify bookmark addition from main menu",
      "preconditions": "string",
      "steps": ["string"],
      "expectedResult": "string"
    }
  ]
}

FINAL COMMAND: Return valid JSON only. Do not include markdown code blocks.`;
  }

  return `Act as a senior QA engineer specializing in non-functional testing.
Your goal is to generate test scenarios based on the provided NFR (Non-Functional Requirement).

SYSTEM CONTEXT:
- System: ${requirement.context?.system || "N/A"}
- Platform: ${requirement.context?.platform || "N/A"}
- Architecture: ${requirement.context?.architecture || "N/A"}

INPUT REQUIREMENT:
- Title: ${requirement.title}
- Description: ${requirement.description}
- Standard/Regulation: ${requirement.standard || "N/A"}

ACCEPTANCE CRITERIA (Strict Numerical Boundaries):
${acList}

Generate a comprehensive set of high-quality test scenarios (typically 5-8, but more if the complexity requires it) using Black-Box techniques:
- Precision over Quantity: Focus on maximum coverage of all Acceptance Criteria.
- Strict BVA: For every numerical limit or timeframe (e.g., 120s, 900s), generate explicit test cases for (T-1, T, T+1).
- Equivalence Partitioning: Cover both valid and invalid partitions.
- Compliance: If a standard (like OWASP, PSD2, or ISO) is provided, ensure scenarios cover specific security/compliance controls.
- Technical Depth & Observability: Include specific technical steps (API calls, DB state checks) and specify the exact tools or methods for performance measurements
(e.g., XCode Instruments for iOS, k6/Gatling for API, gRPC interceptors, or DB trace logging).
- Statistical Significance: For any P95 or percentile-based metric, the test steps must include a high number of iterations (e.g., N=100+) to ensure statistical validity.

REQUIRED JSON SCHEMA:
{
  "testScenarios": [
    {
      "title": "[Technique Name] e.g. [BVA] Verify session timeout",
      "preconditions": "string",
      "steps": ["string"],
      "expectedResult": "string"
    }
  ]
}

FINAL COMMAND: Return valid JSON only. Do not include markdown code blocks.`;
}

//LLM ADAPTERS
async function generateWithOpenAI(model, prompt) {
  const start = Date.now();
  const completion = await openai.chat.completions.create({
    model,
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: "You are a senior QA engineer. Return ONLY raw JSON.",
      },
      { role: "user", content: prompt },
    ],
  });
  return {
    rawText: completion.choices[0].message.content,
    usage: {
      promptTokens: completion.usage.prompt_tokens,
      completionTokens: completion.usage.completion_tokens,
      totalTokens: completion.usage.total_tokens,
    },
    durationMs: Date.now() - start,
  };
}

async function generateWithGemini(modelName, prompt) {
  const start = Date.now();
  const geminiModel = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction:
      "You are a senior QA engineer. Your task is to generate high-quality test scenarios. You must return ONLY raw JSON that strictly follows the provided schema.",
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
    ],
  });

  const result = await geminiModel.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json",
      maxOutputTokens: 8192,
    },
  });

  const response = await result.response;
  const text = response.text();

  if (!text)
    throw new Error(
      "Gemini gražino tuscia atsakyma (galbut suveike saugumo filtrai)",
    );

  const usage = response.usageMetadata || {};
  return {
    rawText: text,
    usage: {
      promptTokens: usage.promptTokenCount || 0,
      completionTokens: usage.candidatesTokenCount || 0,
      totalTokens:
        (usage.promptTokenCount || 0) + (usage.candidatesTokenCount || 0),
    },
    durationMs: Date.now() - start,
  };
}

async function generateWithGroq(prompt) {
  const start = Date.now();
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: "You are a senior QA engineer. Return ONLY raw JSON.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  const json = await res.json();
  return {
    rawText: json.choices[0].message.content,
    usage: {
      promptTokens: json.usage?.prompt_tokens ?? 0,
      completionTokens: json.usage?.completion_tokens ?? 0,
      totalTokens: json.usage?.total_tokens ?? 0,
    },
    durationMs: Date.now() - start,
  };
}

//routes

router.get("/", async (req, res) => {
  const requirements = await Requirement.find().lean();
  requirements.sort(
    (a, b) =>
      Number(a.reqId.replace("REQ-", "")) - Number(b.reqId.replace("REQ-", "")),
  );
  res.json(requirements);
});

router.post("/", async (req, res) => {
  try {
    const {
      reqId,
      title,
      nfrType,
      description,
      context,
      standard,
      acceptanceCriteria,
    } = req.body;

    const existing = await Requirement.findOne({ reqId });
    if (existing) {
      return res.status(400).json({ error: `ID ${reqId} jau uzimtas.` });
    }

    const newReq = new Requirement({
      reqId,
      title,
      nfrType,
      description: description || "",
      context,
      standard,
      acceptanceCriteria,
      isDeleted: false,
      generations: [],
    });

    await newReq.save();
    res.status(201).json(newReq);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:reqId", async (req, res) => {
  try {
    const requirement = await Requirement.findOne({
      reqId: req.params.reqId,
    }).lean();

    if (!requirement) {
      return res.status(404).json({ error: "Reikalavimas nerastas" });
    }

    res.json(requirement);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:reqId/generate", async (req, res) => {
  const { reqId } = req.params;
  let { models } = req.body;
  if (typeof models === "string") models = [models];

  const requirement = await Requirement.findOne({
    reqId,
    isDeleted: { $ne: true },
  });
  if (!requirement) return res.status(404).json({ error: "Nerasta DB" });

  for (const m of models) {
    const idx = requirement.generations.findIndex((g) => g.model === m);
    if (idx !== -1) {
      requirement.generations[idx].status = "pending";
      requirement.generations[idx].errorMessage = "";
    } else {
      requirement.generations.push({ model: m, status: "pending" });
    }
  }

  await requirement.save();
  res.json(requirement);

  (async () => {
    for (const modelName of models) {
      try {
        console.log(`--- [START] REQ: ${reqId} | Modelis: ${modelName} ---`);

        await sleep(2500);

        const prompt = buildFinalPrompt(requirement);
        let result;

        if (modelName.startsWith("gpt-")) {
          result = await generateWithOpenAI(modelName, prompt);
        } else if (modelName.startsWith("gemini-")) {
          result = await generateWithGemini(modelName, prompt);
        } else if (modelName.startsWith("llama-")) {
          result = await generateWithGroq(prompt);
        } else {
          throw new Error(`Modelis ${modelName} nepalaikomas`);
        }

        const parsed = safeParseLLMResponse(result.rawText);

        await Requirement.updateOne(
          { reqId, "generations.model": modelName },
          {
            $set: {
              "generations.$.testScenarios": parsed.testScenarios,
              "generations.$.usage": result.usage,
              "generations.$.durationMs": result.durationMs,
              "generations.$.status": "done",
            },
          },
        );

        console.log(`--- [DONE] REQ: ${reqId} | Modelis: ${modelName} ---`);
      } catch (err) {
        console.error(`Klaida su ${modelName}:`, err.message);

        if (err.message.includes("429") || err.message.includes("quota")) {
          console.log("Aptiktas Rate Limit laukiama 10s");
          await sleep(10000);
        }

        await Requirement.updateOne(
          { reqId, "generations.model": modelName },
          {
            $set: {
              "generations.$.status": "error",
              "generations.$.errorMessage": err.message,
            },
          },
        );
      }
    }
  })();
});

// 5. IsVALYTI GENERACIJAS
router.delete("/:reqId/generations", async (req, res) => {
  try {
    const result = await Requirement.updateOne(
      { reqId: req.params.reqId },
      { $set: { generations: [] } },
    );
    res.json({ ok: true, modifiedCount: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. IsTRINTI VISa REIKALAVIMa
router.delete("/:reqId", async (req, res) => {
  try {
    await Requirement.updateOne(
      { reqId: req.params.reqId },
      { $set: { isDeleted: true } },
    );
    res.json({ ok: true, message: "Perkelta i siuksline" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:reqId/restore", async (req, res) => {
  try {
    const result = await Requirement.findOneAndUpdate(
      { reqId: req.params.reqId },
      { $set: { isDeleted: false } },
      { new: true },
    );
    if (!result) return res.status(404).json({ error: "Nerasta" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:reqId/force", async (req, res) => {
  try {
    const result = await Requirement.deleteOne({ reqId: req.params.reqId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Reikalavimas nerastas" });
    }

    res.json({ ok: true, message: "irasas pasalintas visam laikui" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:reqId", async (req, res) => {
  try {
    const { title, description, type } = req.body;
    const updated = await Requirement.findOneAndUpdate(
      { reqId: req.params.reqId },
      { $set: { title, description, type } },
      { new: true },
    );
    if (!updated) return res.status(404).json({ error: "Nerasta" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/admin/reset-stuck-generations", async (req, res) => {
  try {
    const result = await Requirement.updateMany(
      { "generations.status": { $in: ["pending", "generating"] } },
      {
        $set: {
          "generations.$[elem].status": "error",
          "generations.$[elem].errorMessage":
            "Server stopped or rate limit exceeded during process",
        },
      },
      { arrayFilters: [{ "elem.status": { $in: ["pending", "generating"] } }] },
    );
    res.json({
      message: "Sekmingai atstatyta",
      affected: result.modifiedCount,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// router.get("/admin/fix-db", async (req, res) => {
//   try {
//     const result = await Requirement.updateMany(
//       { isDeleted: { $exists: false } },
//       { $set: { isDeleted: false } }
//     );
//     res.json({ message: "DB atnaujinta", result });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

//vertinimas
router.post("/:reqId/evaluate/:modelName", async (req, res) => {
  try {
    const { reqId, modelName } = req.params;

    const requirement = await Requirement.findOne({ reqId });
    if (!requirement) {
      return res.status(404).json({ error: "Reikalavimas nerastas." });
    }

    const generation = requirement.generations.find(
      (g) => g.model === modelName,
    );
    if (
      !generation ||
      !generation.testScenarios ||
      generation.testScenarios.length === 0
    ) {
      return res.status(400).json({
        error: `Modelio ${modelName} generacija nerasta arba tuscia.`,
      });
    }

    console.log(
      `--- [EVALUATION START] REQ: ${reqId} | Model judged: ${modelName} ---`,
    );

    const evaluationResults = await runJudgeEvaluation(requirement, generation);

    await Requirement.updateOne(
      { reqId, "generations.model": modelName },
      {
        $set: {
          "generations.$.evaluation": {
            ...evaluationResults,
            evaluatedAt: new Date(),
          },
        },
      },
    );

    console.log(
      `--- [EVALUATION DONE] REQ: ${reqId} | Score: ${evaluationResults.totalAvg}/5 ---`,
    );

    res.json({
      success: true,
      model: modelName,
      evaluation: evaluationResults,
    });
  } catch (err) {
    console.error("Evaluation Error:", err.message);
    res
      .status(500)
      .json({ error: "Nepavyko atlikti vertinimo: " + err.message });
  }
});

router.post("/:reqId/evaluate-all", async (req, res) => {
  try {
    const { reqId } = req.params;
    console.log(`\n[BACKEND] Starting Bulk Audit for: ${reqId}`);

    const requirement = await Requirement.findOne({ reqId, isDeleted: false });
    if (!requirement) {
      return res.status(404).json({ error: "Requirement not found" });
    }

    const validGenerations = requirement.generations.filter(
      (g) => g.status === "done",
    );

    console.log(`Found ${validGenerations.length} models to evaluate.`);

    for (const gen of validGenerations) {
      console.log(`   -- Evaluating model: [${gen.model}] ...`);

      const results = await runJudgeEvaluation(requirement, gen);

      if (results) {
        await Requirement.updateOne(
          { reqId, "generations.model": gen.model },
          {
            $set: {
              "generations.$.evaluation": {
                ...results,
                evaluatedAt: new Date(),
              },
            },
          },
        );
        console.log(
          `   Done: [${gen.model}] score: ${results.scores.total}/10`,
        );
      }
    }

    console.log(`Bulk Audit finished for ${reqId}\n`);

    const updatedRequirement = await Requirement.findOne({ reqId });
    res.json(updatedRequirement);
  } catch (err) {
    console.error("Critical Audit Error:", err);
    res.status(500).json({ error: err.message });
  }
});

async function runJudgeEvaluation(requirement, generation) {
  const judgeModel = "gpt-5.2";
  const iterations = 3;
  const results = [];

  const prompt = `
    As an impartial Senior QA Auditor, evaluate the following TEST SCENARIOS against the provided NON-FUNCTIONAL REQUIREMENT (NFR).

    Focus on:
    technical correctness, non-functional test design quality, black-box testing principles, and real-world testability.
    Do NOT be influenced by formatting or wording style. Evaluate only the substance and testing value.

    ORIGINAL REQUIREMENT:
    Title: ${requirement.title}
    Description: ${requirement.description}
    AC: ${requirement.acceptanceCriteria.join(" | ")}
    Standard/Regulation: ${requirement.standard || "N/A"}
    Architecture: ${requirement.context?.architecture || "N/A"}

    TEST SCENARIOS (to be evaluated):
    ${JSON.stringify(generation.testScenarios)}

    EVALUATION RUBRIC (STRICT 1–5 SCALE)

    CORE TEST DESIGN QUALITY
    - [Coverage]: 
    5 = All ACs covered, including positive and negative paths.
    3 = All ACs mentioned, but some paths weak or superficial.
    1 = One or more ACs completely ignored.

    - [BVA]:
    5 = Explicit tests at n, n-1, and n+1.
    3 = Only exact limit (n) tested.
    1 = No real boundary testing.

    - [EP]:
    5 = Clear and meaningful equivalence classes (valid/invalid, ranges, formats, loads, states).
    3 = Some partitioning, but shallow or incomplete.
    1 = No real partitioning logic.

    TECHNICAL VALIDITY
    - [Logic]:
    5 = Steps are executable and realistic for the given architecture.
    3 = Minor technical inaccuracies.
    1 = Technically incorrect or not feasible.

    - [Verifiability]:
    5 = Clear measurable signals, metrics, tools, or observation points (e.g., logs, monitoring, response times, resource usage).
    3 = Measurable but vague.
    1 = Subjective or not realistically testable.

    NFR ALIGNMENT
    - [NFR-Focus]:
    5 = Scenarios strictly test non-functional properties (performance, security, reliability, usability).
    3 = Mixed functional + non-functional focus.
    1 = Mostly functional tests.

    TEST SUITE QUALITY
    - [Redundancy]:
    5 = Scenarios are unique and cover distinct aspects or limits.
    3 = Some partial overlap.
    1 = Many scenarios test essentially the same thing.

    Use a continuous scale from 1.0 to 5.0.
    Anchor points (1, 3, 5) describe reference levels. 
    If quality is between anchors, assign an intermediate decimal score (e.g., 2.4, 3.7, 4.2).

    RETURN ONLY VALID JSON:
    {
        "scores": {
            "coverage": 0,
            "bva": 0,
            "ep": 0,
            "logic": 0,
            "verifiability": 0,
            "nfrFocus": 0,
            "redundancy": 0
    },
        "justification": {
            "coverage": "Short technical explanation",
            "bva": "Short technical explanation",
            "ep": "Short technical explanation",
            "logic": "Short technical explanation",
            "verifiability": "Short technical explanation",
            "nfrFocus": "Short technical explanation",
            "redundancy": "Short technical explanation"
    },
        "missingParts": [
            "List the most critical missing scenarios, limits, or test aspects"
        ]
}
`;

  for (let i = 0; i < iterations; i++) {
    try {
      const result = await generateWithOpenAI(judgeModel, prompt);
      const parsed = safeParseLLMResponse(result.rawText);
      if (parsed && parsed.scores) {
        results.push(parsed);
      }
      console.log(`   - Iteration ${i + 1}/${iterations} completed.`);
    } catch (err) {
      console.error(`   - Audit iteration ${i + 1} failed:`, err.message);
    }
  }

  if (results.length === 0) return null;

  const criteriaKeys = Object.keys(results[0].scores);

  const avgScores = {};
  criteriaKeys.forEach((key) => {
    const sum = results.reduce((s, r) => s + (r.scores[key] || 0), 0);
    avgScores[key] = Number((sum / results.length).toFixed(2));
  });

  const totalAvg = Number(
    (
      Object.values(avgScores).reduce((a, b) => a + b, 0) / criteriaKeys.length
    ).toFixed(2),
  );

  const lastValidResponse = results[results.length - 1];

  return {
    scores: avgScores,
    totalAvg: totalAvg,
    justification: lastValidResponse.justification,
    missingParts: lastValidResponse.missingParts,
  };
}

router.post("/:reqId/calculate-similarity", async (req, res) => {
  try {
    const { reqId } = req.params;
    const THRESHOLD = 0.7;

    const requirement = await Requirement.findOne({ reqId, isDeleted: false });
    if (!requirement) return res.status(404).json({ error: "Nerasta DB" });

    if (requirement.nfrType !== "Ground-Truth") {
      return res.status(400).json({
        error: "Kosinusinis panasumas taikomas tik Ground-Truth moduliams.",
      });
    }

    const truthScenarios = requirement.groundTruthScenarios || [];
    if (truthScenarios.length === 0) {
      return res
        .status(400)
        .json({ error: "Nera etaloniniu (Truth) testu siam moduliui." });
    }

    console.log(`\n[SIMILARITY] Pradedamas skaiciavimas moduliui: ${reqId}`);

    const truthTexts = truthScenarios.map(formatScenarioForEmbedding);
    const truthEmbeddings = await getEmbeddings(truthTexts);

    const validGenerations = requirement.generations.filter(
      (g) => g.status === "done" && g.testScenarios?.length > 0,
    );
    const similarityResults = [];

    for (const gen of validGenerations) {
      console.log(`   -- Analizuojamas modelis: [${gen.model}]`);

      const genTexts = gen.testScenarios.map(formatScenarioForEmbedding);
      const genEmbeddings = await getEmbeddings(genTexts);

      let num_mat_uniq_truth = 0;
      let num_mat_uniq_gen = 0;

      for (const tEmb of truthEmbeddings) {
        const isMatched = genEmbeddings.some(
          (gEmb) => cosineSimilarity(tEmb, gEmb) >= THRESHOLD,
        );
        if (isMatched) num_mat_uniq_truth++;
      }

      for (const gEmb of genEmbeddings) {
        const isMatched = truthEmbeddings.some(
          (tEmb) => cosineSimilarity(gEmb, tEmb) >= THRESHOLD,
        );
        if (isMatched) num_mat_uniq_gen++;
      }

      const num_truth = truthScenarios.length;
      const num_gen_ts = gen.testScenarios.length;

      const recall = (num_mat_uniq_truth / num_truth).toFixed(2);

      const precision = (num_mat_uniq_gen / num_gen_ts).toFixed(2);

      const similarityMetrics = {
        num_truth,
        num_gen_ts,
        num_mat_uniq_truth,
        num_mat_uniq_gen,
        precision: parseFloat(precision),
        recall: parseFloat(recall),
      };

      await Requirement.updateOne(
        { reqId, "generations.model": gen.model },
        { $set: { "generations.$.similarityMetrics": similarityMetrics } },
      );

      similarityResults.push({ model: gen.model, metrics: similarityMetrics });
      console.log(
        `   -- [${gen.model}] Baigta. Recall: ${recall}, Precision: ${precision}`,
      );
    }

    res.json({
      message: "Kosinusinio panasumo skaiciavimas baigtas",
      results: similarityResults,
    });
  } catch (err) {
    console.error("Similarity Error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
