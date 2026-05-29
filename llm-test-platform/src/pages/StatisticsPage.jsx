import React, { useState, useMemo } from "react";
import { useRequirements } from "../context/RequirementsContext";
import { MODEL_PRICING } from "../components/pricing";
import { useNavigate } from "react-router-dom";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from "recharts";

export default function StatisticsPage() {
  const { requirements, loading } = useRequirements();
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState("ALL");

  const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE"];

  const statsData = useMemo(() => {
    if (loading || !requirements) {
      return {
        statsByModel: {},
        radarData: [],
        barData: [],
        firefoxData: [],
        nfrTypes: ["ALL"],
      };
    }

    const stats = {};
    const criteriaSums = {};
    const firefoxStats = {};
    const typesSet = new Set(["ALL"]);

    requirements.forEach((req) => {
      if (req.isDeleted) return;
      if (req.nfrType) typesSet.add(req.nfrType);
      if (req.nfrType === "Ground-Truth") {
        (req.generations || []).forEach((gen) => {
          if (gen.status !== "done" || !gen.similarityMetrics) return;
          const m = gen.model;
          if (!firefoxStats[m]) {
            firefoxStats[m] = {
              count: 0,
              totalRecall: 0,
              totalPrecision: 0,
              totalNumTruth: 0,
              totalNumGen: 0,
              totalMatTruth: 0,
              totalMatGen: 0,
            };
          }
          firefoxStats[m].count += 1;
          firefoxStats[m].totalRecall += gen.similarityMetrics.recall;
          firefoxStats[m].totalPrecision += gen.similarityMetrics.precision;
          firefoxStats[m].totalNumTruth += gen.similarityMetrics.num_truth || 0;
          firefoxStats[m].totalNumGen += gen.similarityMetrics.num_gen_ts || 0;
          firefoxStats[m].totalMatTruth +=
            gen.similarityMetrics.num_mat_uniq_truth || 0;
          firefoxStats[m].totalMatGen +=
            gen.similarityMetrics.num_mat_uniq_gen || 0;
        });
      }

      // NFR statistika
      if (req.nfrType !== "Ground-Truth") {
        if (filterType !== "ALL" && req.nfrType !== filterType) return;

        (req.generations || []).forEach((gen) => {
          if (gen.status !== "done") return;

          const m = gen.model;
          if (!stats[m]) {
            stats[m] = {
              count: 0,
              totalScenarios: 0,
              totalCost: 0,
              totalDurationMs: 0,
              totalAvg: 0,
              evalCount: 0,
            };
            criteriaSums[m] = {
              coverage: 0,
              bva: 0,
              ep: 0,
              logic: 0,
              verifiability: 0,
              nfrFocus: 0,
              redundancy: 0,
            };
          }

          stats[m].count += 1;
          stats[m].totalScenarios += (gen.testScenarios || []).length;
          stats[m].totalDurationMs += gen.durationMs || 0;

          const pricing = MODEL_PRICING[m] || { inputPer1M: 0, outputPer1M: 0 };
          const cost =
            ((gen.usage?.promptTokens || 0) / 1000000) * pricing.inputPer1M +
            ((gen.usage?.completionTokens || 0) / 1000000) *
              pricing.outputPer1M;
          stats[m].totalCost += cost;

          if (gen.evaluation?.scores) {
            stats[m].totalAvg += gen.evaluation.totalAvg || 0;
            stats[m].evalCount += 1;
            Object.keys(criteriaSums[m]).forEach((key) => {
              criteriaSums[m][key] += gen.evaluation.scores[key] || 0;
            });
          }
        });
      }
    });

    // RadarChart duomenys
    const metricsDef = [
      { key: "coverage", full: "Coverage" },
      { key: "bva", full: "BVA" },
      { key: "ep", full: "EP" },
      { key: "logic", full: "Logic" },
      { key: "verifiability", full: "Verify" },
      { key: "nfrFocus", full: "NFR Focus" },
      { key: "redundancy", full: "Redundancy" },
    ];

    const radarArray = metricsDef.map((m) => {
      const row = { subject: m.full };
      Object.keys(criteriaSums).forEach((modelName) => {
        const avg =
          stats[modelName].evalCount > 0
            ? (
                criteriaSums[modelName][m.key] / stats[modelName].evalCount
              ).toFixed(2)
            : 0;
        row[modelName] = parseFloat(avg);
      });
      return row;
    });

    // BarChart duomenys (NFR)
    const barArray = Object.keys(stats)
      .map((modelName, idx) => {
        const s = stats[modelName];
        const avgScore = s.evalCount > 0 ? s.totalAvg / s.evalCount : 0;
        return {
          name: modelName,
          avgScore: parseFloat(avgScore.toFixed(2)),
          color: colors[idx % colors.length],
        };
      })
      .sort((a, b) => b.avgScore - a.avgScore);

    // Firefox Ground-Truth duomenys
    const firefoxArray = Object.keys(firefoxStats)
      .map((modelName) => {
        const fs = firefoxStats[modelName];
        return {
          name: modelName,
          Recall: parseFloat(
            ((fs.totalMatTruth / fs.totalNumTruth) * 100).toFixed(1),
          ),
          Precision: parseFloat(
            ((fs.totalMatGen / fs.totalNumGen) * 100).toFixed(1),
          ),
          totalNumTruth: fs.totalNumTruth,
          totalNumGen: fs.totalNumGen,
          totalMatTruth: fs.totalMatTruth,
          totalMatGen: fs.totalMatGen,
        };
      })
      .sort((a, b) => b.Recall - a.Recall);

    return {
      statsByModel: stats,
      radarData: radarArray,
      barData: barArray,
      firefoxData: firefoxArray,
      nfrTypes: Array.from(typesSet).filter((t) => t !== "Ground-Truth"),
    };
  }, [requirements, loading, filterType]);

  const { statsByModel, radarData, barData, firefoxData, nfrTypes } = statsData;
  const modelKeys = Object.keys(statsByModel);

  if (loading) {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
          fontFamily: "sans-serif",
        }}
      >
        <p>Kraunama analitika...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "40px auto",
        padding: "0 20px",
        fontFamily: "sans-serif",
      }}
    >
      <button
        onClick={() => navigate(-1)}
        style={{
          marginBottom: "20px",
          padding: "8px 16px",
          cursor: "pointer",
          borderRadius: "6px",
          border: "1px solid #ddd",
          background: "#fff",
        }}
      >
        ← Grįžti į sąrašą
      </button>

      {/* --- FIREFOX GROUND-TRUTH ANALITIKA --- */}
      {firefoxData.length > 0 && (
        <div style={{ marginBottom: "60px" }}>
          <div
            style={{
              borderBottom: "2px solid #f97316",
              paddingBottom: "10px",
              marginBottom: "20px",
            }}
          >
            <h2 style={{ margin: 0, color: "#c2410c", fontWeight: 800 }}>
              🦊 Firefox Tyrimas (Kosinusinis Panašumas)
            </h2>
            <p
              style={{
                margin: "5px 0 0 0",
                color: "#64748b",
                fontSize: "14px",
              }}
            >
              Modelių sugeneruotų testų atitikimas realiems Mozilla QA
              inžinierių testams.
            </p>
          </div>

          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "16px",
              border: "1px solid #fed7aa",
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)",
              height: "400px",
              marginBottom: "20px",
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={firefoxData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#475569", fontSize: 12, fontWeight: 600 }}
                />
                <YAxis
                  domain={[0, 100]}
                  tickFormatter={(tick) => `${tick}%`}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value, name) => [`${value}%`, name]}
                  cursor={{ fill: "#fff7ed" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #fed7aa",
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: "20px" }} />
                <Bar
                  dataKey="Recall"
                  fill="#f97316"
                  radius={[4, 4, 0, 0]}
                  name="Recall (Aprėptis)"
                />
                <Bar
                  dataKey="Precision"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  name="Precision (Tikslumas)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* NAUJA LENTELĖ: ABSOLIUTŪS SKAIČIAI */}
          <div
            style={{
              overflowX: "auto",
              boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
              borderRadius: "12px",
              border: "1px solid #fed7aa",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                backgroundColor: "white",
                fontSize: "14px",
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "#fff7ed",
                    borderBottom: "2px solid #fdba74",
                  }}
                >
                  <th
                    style={{
                      padding: "12px 15px",
                      textAlign: "left",
                      color: "#9a3412",
                    }}
                  >
                    Modelis
                  </th>
                  <th
                    style={{
                      padding: "12px 15px",
                      color: "#9a3412",
                      title: "num_gen_ts",
                    }}
                  >
                    Sugeneruota Testų
                  </th>
                  <th
                    style={{
                      padding: "12px 15px",
                      color: "#9a3412",
                      title: "num_truth",
                    }}
                  >
                    Realių Etalonų (Total)
                  </th>
                  <th
                    style={{
                      padding: "12px 15px",
                      color: "#9a3412",
                      title: "num_mat_uniq_truth",
                    }}
                  >
                    Atspėta Etalonų
                  </th>
                  <th
                    style={{
                      padding: "12px 15px",
                      color: "#9a3412",
                      title: "num_mat_uniq_gen",
                    }}
                  >
                    Teisingi Sugeneruoti
                  </th>
                </tr>
              </thead>
              <tbody>
                {firefoxData.map((row) => (
                  <tr
                    key={row.name}
                    style={{
                      borderTop: "1px solid #ffedd5",
                      textAlign: "center",
                    }}
                  >
                    <td
                      style={{
                        padding: "12px 15px",
                        textAlign: "left",
                        fontWeight: "700",
                        color: "#1e293b",
                      }}
                    >
                      {row.name}
                    </td>
                    <td
                      style={{
                        padding: "12px 15px",
                        fontWeight: "600",
                        color: "#475569",
                      }}
                    >
                      {row.totalNumGen}
                    </td>
                    <td style={{ padding: "12px 15px", color: "#64748b" }}>
                      {row.totalNumTruth}
                    </td>
                    <td
                      style={{
                        padding: "12px 15px",
                        color: "#ea580c",
                        fontWeight: "bold",
                      }}
                    >
                      {row.totalMatTruth}
                    </td>
                    <td
                      style={{
                        padding: "12px 15px",
                        color: "#2563eb",
                        fontWeight: "bold",
                      }}
                    >
                      {row.totalMatGen}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* NFR SINTETINE ANALITIKA*/}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "2px solid #3b82f6",
            paddingBottom: "10px",
            marginBottom: "20px",
          }}
        >
          <div>
            <h2 style={{ margin: 0, color: "#1d4ed8", fontWeight: 800 }}>
              🤖 NFR Tyrimas (LLM-as-a-Judge)
            </h2>
            <p
              style={{
                margin: "5px 0 0 0",
                color: "#64748b",
                fontSize: "14px",
              }}
            >
              Nefunkcinių reikalavimų teorinis vertinimas 1-5 balų skalėje.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "14px", color: "#666" }}>Filtras:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                outline: "none",
              }}
            >
              <option value="ALL">Visi NFR tipai</option>
              {nfrTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "30px",
            marginBottom: "40px",
          }}
        >
          {/* Radar Chart */}
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "16px",
              border: "1px solid #eee",
              height: "450px",
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)",
            }}
          >
            <h3
              style={{
                textAlign: "center",
                fontSize: "15px",
                color: "#475569",
                marginBottom: "10px",
              }}
            >
              Palyginimas pagal QA kriterijus
            </h3>
            <ResponsiveContainer width="100%" height="90%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 5]}
                  tick={{ fontSize: 10 }}
                />
                {modelKeys.map((model, idx) => (
                  <Radar
                    key={model}
                    name={model}
                    dataKey={model}
                    stroke={colors[idx % colors.length]}
                    fill={colors[idx % colors.length]}
                    fillOpacity={0.25}
                  />
                ))}
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "16px",
              border: "1px solid #eee",
              minHeight: "300px",
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)",
            }}
          >
            <h3
              style={{
                textAlign: "center",
                fontSize: "15px",
                color: "#475569",
                marginBottom: "20px",
              }}
            >
              Bendras modelių vidurkis (Total Score)
            </h3>
            <div
              style={{ height: barData.length * 60 + 40, minHeight: "200px" }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  layout="vertical"
                  margin={{ left: 40, right: 60, top: 5, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis type="number" domain={[0, 5]} hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 12, fontWeight: 700, fill: "#1e293b" }}
                    width={120}
                  />
                  <Tooltip cursor={{ fill: "#f8fafc" }} />
                  <Bar
                    dataKey="avgScore"
                    radius={[0, 6, 6, 0]}
                    barSize={30}
                    label={{
                      position: "right",
                      fill: "#2563eb",
                      fontWeight: 800,
                      fontSize: 13,
                      offset: 10,
                    }}
                  >
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* LENTELE NFR */}
        <div
          style={{
            overflowX: "auto",
            boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
            borderRadius: "12px",
            border: "1px solid #eee",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "white",
              fontSize: "14px",
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "#f8fafc",
                  borderBottom: "2px solid #edf2f7",
                }}
              >
                <th style={{ padding: "15px", textAlign: "left" }}>Modelis</th>
                <th style={{ padding: "15px" }}>Apdorota</th>
                <th style={{ padding: "15px" }}>Vid. Scenarijų</th>
                <th style={{ padding: "15px" }}>Vid. Score</th>
                <th style={{ padding: "15px" }}>
                  Efektyvumas (Kaina/1.0 Score)
                </th>
                <th style={{ padding: "15px" }}>Vid. Trukmė</th>
              </tr>
            </thead>
            <tbody>
              {modelKeys.length > 0 ? (
                modelKeys.map((model) => {
                  const s = statsByModel[model];
                  const avgScore =
                    s.evalCount > 0 ? s.totalAvg / s.evalCount : 0;
                  const costPerScore =
                    avgScore > 0 ? s.totalCost / s.count / avgScore : 0;
                  return (
                    <tr
                      key={model}
                      style={{
                        borderTop: "1px solid #f1f5f9",
                        textAlign: "center",
                      }}
                    >
                      <td
                        style={{
                          padding: "15px",
                          textAlign: "left",
                          fontWeight: "700",
                          color: "#1e293b",
                        }}
                      >
                        {model}
                      </td>
                      <td style={{ padding: "15px" }}>{s.count}</td>
                      <td style={{ padding: "15px" }}>
                        {(s.totalScenarios / s.count).toFixed(1)}
                      </td>
                      <td
                        style={{
                          padding: "15px",
                          color: "#2563eb",
                          fontWeight: "bold",
                        }}
                      >
                        {avgScore.toFixed(2)} / 5
                      </td>
                      <td style={{ padding: "15px", color: "#64748b" }}>
                        {costPerScore > 0
                          ? `$${costPerScore.toFixed(5)}`
                          : "N/A"}
                      </td>
                      <td style={{ padding: "15px" }}>
                        {(s.totalDurationMs / s.count / 1000).toFixed(1)}s
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" style={{ padding: "30px", color: "#94a3b8" }}>
                    Nėra duomenų pagal šį filtrą.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
