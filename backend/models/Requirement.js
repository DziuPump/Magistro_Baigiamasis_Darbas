const mongoose = require("mongoose");

const GenerationSchema = new mongoose.Schema(
  {
    model: {
      type: String,
      required: true,
    },

    augmentedRequirement: String,

    testScenarios: [
      {
        title: String,
        preconditions: String,
        steps: [String],
        expectedResult: String,
      },
    ],

    evaluation: {
      scores: {
        coverage: Number,
        bva: Number,
        ep: Number,
        logic: Number,
        verifiability: Number,
        nfrFocus: Number,
        redundancy: Number,
      },
      totalAvg: Number,
      justification: {
        coverage: String,
        bva: String,
        ep: String,
        logic: String,
        verifiability: String,
        nfrFocus: String,
        redundancy: String,
      },
      missingParts: [String],
      evaluatedAt: Date,
    },

    similarityMetrics: {
      num_truth: Number,
      num_gen_ts: Number,
      num_mat_uniq_truth: Number,
      num_mat_uniq_gen: Number,
      precision: Number,
      recall: Number,
    },

    durationMs: Number,

    status: {
      type: String,
      enum: ["pending", "generating", "done", "error"],
      default: "pending",
    },

    errorMessage: String,

    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const RequirementSchema = new mongoose.Schema(
  {
    reqId: { type: String, required: true, unique: true, index: true },
    nfrType: String,
    title: String,
    description: String,

    context: {
      system: String,
      architecture: String,
      platform: String,
    },
    standard: String,
    acceptanceCriteria: [String],

    groundTruthScenarios: [
      {
        title: String,
        preconditions: String,
        steps: [String],
        expectedResult: String,
      },
    ],

    isDeleted: { type: Boolean, default: false },
    augmented: { type: Boolean, default: false },
    generations: [GenerationSchema],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Requirement", RequirementSchema);
