import assert from "node:assert/strict";
import test from "node:test";
import { assessPlannedTransition } from "../src/assess-planned-transition.mjs";

function request(overrides = {}) {
  return {
    plan: { stages: ["plan", "execute"], dependencies: [{ from: "plan", to: "execute" }] },
    transition: { from: "plan", to: "execute" },
    effects: [{ id: "write-source", capability: "software-engineering", target: "/workspace/cell/src/index.mjs" }],
    obligations: ["write-source"],
    requiredProofLoci: ["incumbent-observed", "provider-bound"],
    observations: [
      { locus: "incumbent-observed", status: "witnessed", provider: "urn:monitor", patch: "planning-view", evidence: "ni:///sha-256;planning", observedAt: "2026-07-25T00:00:00.000Z" },
      { locus: "incumbent-observed", status: "witnessed", provider: "urn:executor", patch: "execution-view", evidence: "ni:///sha-256;execution-material", observedAt: "2026-07-25T00:00:01.000Z" },
      { locus: "provider-bound", status: "witnessed", provider: "urn:executor", patch: "execution-view", evidence: "ni:///sha-256;execution-provider", observedAt: "2026-07-25T00:00:01.000Z" },
    ],
    declarations: { capabilities: ["software-engineering"], territories: ["/workspace/cell"] },
    ...overrides,
  };
}

test("is eligible under placed, material, permeable plan transition", () => {
  const result = assessPlannedTransition(request());
  assert.equal(result.eligible, true);
  assert.equal(result.analysis.materiality.judgment, "game.incarnation.material:witness");
  assert.deepEqual(result.responsePair, {
    deficiency: { numerator: "0", denominator: "1" },
    redundancy: { numerator: "0", denominator: "1" },
  });
  assert.equal(result.analysis.kinetic.authority, "timestamps-are-evidence-not-deadlines");
});

test("a propagating proof pore refuses kinetically without a timer", () => {
  const input = request();
  input.observations = input.observations.map((observation) => observation.locus === "incumbent-observed"
    ? { ...observation, status: "propagating", observedAt: "2026-07-01T00:00:00.000Z" }
    : observation);
  const result = assessPlannedTransition(input);
  assert.equal(result.eligible, false);
  assert.equal(result.obstruction.kind, "kinetic-obstruction");
  assert.deepEqual(result.responsePair.deficiency, { numerator: "1", denominator: "2" });
});

test("an unobserved incumbent prevents declared eligibility", () => {
  const input = request();
  input.observations = input.observations.filter(({ locus }) => locus !== "incumbent-observed");
  const result = assessPlannedTransition(input);
  assert.equal(result.eligible, false);
  assert.deepEqual(result.obstruction, { kind: "local-obstruction", loci: ["incumbent-observed"] });
});

test("incarnation exposes a proposed effect that answers no obligation as ballast", () => {
  const input = request({
    effects: [
      { id: "write-source", capability: "software-engineering", target: "/workspace/cell/src/index.mjs" },
      { id: "publish-socially", capability: "activitypub-publication" },
    ],
    declarations: { capabilities: ["software-engineering", "activitypub-publication"], territories: ["/workspace/cell"] },
  });
  const result = assessPlannedTransition(input);
  assert.equal(result.eligible, false);
  assert.deepEqual(result.obstruction, { kind: "materiality-obstruction", effects: ["publish-socially"] });
  assert.deepEqual(result.responsePair.redundancy, { numerator: "1", denominator: "2" });
});

test("a feedback cycle is coordination cost and consistent local views still glue", () => {
  const cyclic = request({ plan: { stages: ["plan", "execute"], dependencies: [{ from: "plan", to: "execute" }, { from: "execute", to: "plan" }] } });
  const result = assessPlannedTransition(cyclic);
  assert.equal(result.eligible, true);
  assert.equal(result.analysis.topological.feedbackCycle, true);
  assert.equal(result.analysis.topological.coordination.h1Rank, "1");
  assert.equal(result.analysis.topological.gluing.overlapAgreement, true);
});

test("disagreement on an overlap is a witnessed topological obstruction", () => {
  const input = request();
  input.observations[1].status = "obstructed";
  const result = assessPlannedTransition(input);
  assert.equal(result.eligible, false);
  assert.deepEqual(result.obstruction, { kind: "topological-obstruction", reason: "local-sections-disagree-on-overlap" });
  assert.equal(result.analysis.topological.gluing.overlapAgreement, false);
});

test("effects outside placement declarations remain a separate obstruction", () => {
  const escaped = request({ effects: [{ id: "write-source", capability: "software-engineering", target: "/other/index.mjs" }] });
  assert.deepEqual(assessPlannedTransition(escaped).obstruction, { kind: "placement-obstruction", effects: ["write-source"] });
});
