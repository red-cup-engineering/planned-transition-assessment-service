import { readFileSync } from "node:fs";
import { isAbsolute, resolve, sep } from "node:path";
import { retainedCarrier } from "@red-cup-engineering/computer-content-address-engineering-services-section/semiotic-content-address";
import { designFromActs } from "@red-cup-engineering/playing/structuring/concurrent-game/with-symmetry/ludicizing/design";
import { materialJudgment } from "@red-cup-engineering/playing/structuring/concurrent-game/with-symmetry/ludicizing/settling/incarnation";
import * as coordinationCohomology from "@red-cup-engineering/metrologic/articulation/predicating/positing/settling/analysis/coordination-cohomology";
import * as settlingAssociatedSheaf from "@red-cup-engineering/metrologic/articulation/predicating/positing/settling/analysis/settling-associated-sheaf";
import * as settlingCohomologyH1 from "@red-cup-engineering/metrologic/articulation/predicating/positing/settling/analysis/settling-cohomology-h1";

export const inputSchema = Object.freeze(JSON.parse(readFileSync(new URL("../content/schemas/input.schema.json", import.meta.url), "utf8")));
export const outputSchema = Object.freeze(JSON.parse(readFileSync(new URL("../content/schemas/output.schema.json", import.meta.url), "utf8")));
export const obstructionSchema = Object.freeze(JSON.parse(readFileSync(new URL("../content/schemas/obstruction.schema.json", import.meta.url), "utf8")));

const plain = (value) => value && typeof value === "object" && !Array.isArray(value);
const words = (value, label) => {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || item.length === 0)) throw new TypeError(`${label} must be an array of nonempty strings`);
  return [...new Set(value)];
};
const ratio = (numerator, denominator) => {
  let n = BigInt(numerator), d = BigInt(denominator);
  if (d === 0n) {
    if (n !== 0n) throw new RangeError("a nonzero response cannot have an empty referent");
    return Object.freeze({ numerator: "0", denominator: "1", referent: "empty-set" });
  }
  const gcd = (a, b) => b === 0n ? a : gcd(b, a % b);
  const g = gcd(n < 0n ? -n : n, d);
  n /= g; d /= g;
  return Object.freeze({ numerator: n.toString(), denominator: d.toString() });
};

function hasDirectedCycle(stages, dependencies) {
  const next = new Map(stages.map((stage) => [stage, []]));
  for (const edge of dependencies) next.get(edge.from)?.push(edge.to);
  const visiting = new Set(), visited = new Set();
  const visit = (stage) => {
    if (visiting.has(stage)) return true;
    if (visited.has(stage)) return false;
    visiting.add(stage);
    for (const successor of next.get(stage) ?? []) if (visit(successor)) return true;
    visiting.delete(stage); visited.add(stage); return false;
  };
  return stages.some(visit);
}

function componentCount(stages, dependencies) {
  const parent = new Map(stages.map((stage) => [stage, stage]));
  const find = (value) => {
    const p = parent.get(value);
    if (p === value) return value;
    const root = find(p); parent.set(value, root); return root;
  };
  for (const { from, to } of dependencies) {
    const a = find(from), b = find(to);
    if (a !== b) parent.set(a, b);
  }
  return new Set(stages.map(find)).size;
}

const proofCoefficient = Object.freeze({ witnessed: 1, obstructed: -1, propagating: 0, unknown: 0 });

function topologicalEvidence(observations) {
  const grouped = new Map();
  for (const observation of observations) {
    const key = `${observation.provider}\0${observation.patch}`;
    const group = grouped.get(key) ?? {
      name: `${observation.provider}#${observation.patch}`,
      provider: observation.provider,
      patch: observation.patch,
      observations: [],
    };
    if (group.observations.some(({ locus }) => locus === observation.locus)) {
      throw new TypeError("one provider patch may observe each proof locus exactly once");
    }
    group.observations.push(observation);
    grouped.set(key, group);
  }
  const cells = [...new Set(observations.map(({ locus }) => locus))];
  if (cells.length === 0 || grouped.size === 0) throw new TypeError("proof observations must supply at least one provider patch");
  const patches = [...grouped.values()].map((entry) => ({
    patch: settlingCohomologyH1.patch(entry.name, entry.observations.map(({ locus }) => locus)),
    section: settlingCohomologyH1.localSection(entry.name, settlingAssociatedSheaf.cochain(
      entry.observations.map(({ locus, status }) => ({ cell: locus, coefficient: proofCoefficient[status] })),
    )),
    source: Object.freeze({
      name: entry.name,
      provider: entry.provider,
      patch: entry.patch,
      evidence: Object.freeze(entry.observations.map(({ locus, evidence }) => ({ locus, evidence }))),
    }),
  }));
  const datum = settlingCohomologyH1.cech1(cells, patches.map(({ patch }) => patch), patches.map(({ section }) => section));
  const overlapAgreement = settlingCohomologyH1.cocycle(datum);
  if (!overlapAgreement) return Object.freeze({
    register: "finite-cech-gluing",
    overlapAgreement: false,
    globalSection: null,
    sources: Object.freeze(patches.map(({ source }) => source)),
  });
  const receipt = settlingCohomologyH1.gluingReceipt(datum);
  return Object.freeze({
    register: "finite-cech-gluing",
    overlapAgreement: true,
    globalSection: receipt.glued,
    coboundary: receipt.coboundary,
    separated: receipt.separated,
    sources: Object.freeze(patches.map(({ source }) => source)),
  });
}

function placed(effect, declarations) {
  if (!declarations.capabilities.includes(effect.capability)) return false;
  if (effect.target === undefined) return true;
  if (typeof effect.target !== "string" || !isAbsolute(effect.target)) throw new TypeError("effect.target must be an absolute declared path");
  const target = resolve(effect.target);
  return declarations.territories.some((root) => {
    const territory = resolve(root);
    return target === territory || target.startsWith(`${territory}${sep}`);
  });
}

function gameMateriality(effects, obligations) {
  const ids = [...new Set(effects.map(({ id }) => id))].sort();
  const loci = new Map(ids.map((id, index) => [id, String(index)]));
  const plan = designFromActs(new Map([["", "proponent"], ...ids.map((id) => [loci.get(id), "proponent"])]));
  const counter = designFromActs(new Map([["", "opponent"], ...obligations.filter((id) => loci.has(id)).map((id) => [loci.get(id), "opponent"])]));
  const judgment = materialJudgment(plan, [plan], [plan, counter]);
  const visited = new Set(["", ...obligations.filter((id) => loci.has(id)).map((id) => loci.get(id))]);
  const ballast = ids.filter((id) => !visited.has(loci.get(id)));
  return { material: judgment.kind === "game.incarnation.material:witness", ballast, judgment: judgment.kind };
}

/** Finite eligibility analysis under supplied observations and declarations.
 * No source proof, path ownership, issuer or effect authorization is received.
 */
export function assessPlannedTransition(input) {
  if (!plain(input)) throw new TypeError("planned transition request must be an object");
  input = retainedCarrier(input);
  for (const key of inputSchema.required) if (!Object.hasOwn(input, key)) throw new TypeError(`${key} is required`);
  if (!plain(input.plan) || !plain(input.transition) || !plain(input.declarations)) throw new TypeError("plan, transition, and declarations must be objects");
  const stages = words(input.plan.stages, "plan.stages");
  const requiredProofLoci = words(input.requiredProofLoci, "requiredProofLoci");
  const capabilities = words(input.declarations.capabilities, "declarations.capabilities");
  const territories = words(input.declarations.territories, "declarations.territories");
  if (territories.some((root) => !isAbsolute(root))) throw new TypeError("declared territories must be absolute paths");
  if (!Array.isArray(input.plan.dependencies) || !Array.isArray(input.effects) || !Array.isArray(input.observations)) throw new TypeError("dependencies, effects, and observations must be arrays");
  const dependencies = input.plan.dependencies.map((edge) => {
    if (!plain(edge) || !stages.includes(edge.from) || !stages.includes(edge.to)) throw new TypeError("each dependency must join declared stages");
    return { from: edge.from, to: edge.to };
  });
  const effects = input.effects.map((effect) => {
    if (!plain(effect) || typeof effect.id !== "string" || !effect.id || typeof effect.capability !== "string" || !effect.capability) throw new TypeError("each effect requires id and capability");
    return { id: effect.id, capability: effect.capability, ...(effect.target === undefined ? {} : { target: effect.target }) };
  });
  const proofObservations = input.observations.map((observation) => {
    if (!plain(observation) || typeof observation.locus !== "string" || observation.locus.length === 0
        || typeof observation.patch !== "string" || observation.patch.length === 0
        || typeof observation.provider !== "string" || observation.provider.length === 0
        || typeof observation.evidence !== "string" || observation.evidence.length === 0
        || !["witnessed", "propagating", "obstructed", "unknown"].includes(observation.status)) {
      throw new TypeError("each observation requires locus, status, provider, patch, and evidence");
    }
    return { ...observation };
  });
  const observations = new Map(requiredProofLoci.map((locus) => [locus, proofObservations.filter((observation) => observation.locus === locus)]));
  const declared = dependencies.some(({ from, to }) => from === input.transition.from && to === input.transition.to);
  const feedbackCycle = hasDirectedCycle(stages, dependencies);
  const nerve = coordinationCohomology.coverNerve(stages.length, dependencies.length, componentCount(stages, dependencies));
  const coordination = coordinationCohomology.coordinationCostReceipt(nerve);
  const gluing = topologicalEvidence(proofObservations);
  const missing = requiredProofLoci.filter((locus) => !(observations.get(locus) ?? []).some(({ status }) => status === "witnessed"));
  const propagating = requiredProofLoci.filter((locus) => (observations.get(locus) ?? []).some(({ status }) => status === "propagating"));
  const obstructed = requiredProofLoci.filter((locus) => (observations.get(locus) ?? []).some(({ status }) => status === "obstructed"));
  const misplaced = effects.filter((effect) => !placed(effect, { capabilities, territories })).map(({ id }) => id);
  const obligations = words(input.obligations ?? effects.map(({ id }) => id), "obligations");
  const materiality = gameMateriality(effects, obligations);
  const analysis = Object.freeze({
    local: { required: requiredProofLoci, missing },
    topological: {
      register: "dependency-nerve-and-finite-cech-gluing",
      declared,
      feedbackCycle,
      coordination: {
        h0Rank: String(coordination.h0Rank),
        h1Rank: String(coordination.h1Rank),
        coordinationCost: String(coordination.coordinationCost),
        coordinationFree: coordination.coordinationFree,
        authority: "coordination-cost-is-not-global-section-obstruction",
      },
      gluing,
    },
    kinetic: {
      propagating,
      obstructed,
      observations: proofObservations.map((observation) => ({ ...observation })),
      authority: "timestamps-are-evidence-not-deadlines",
    },
    placement: { misplaced, interpretation: "lexical-containment-under-supplied-declarations; no-source-or-host-rights-checked" },
    materiality,
  });
  const responsePair = Object.freeze({
    deficiency: ratio(missing.length, requiredProofLoci.length),
    redundancy: ratio(materiality.ballast.length, effects.length),
  });
  const obstruction = !declared ? { kind: "topological-obstruction", reason: "transition-not-declared" }
    : !gluing.overlapAgreement ? { kind: "topological-obstruction", reason: "local-sections-disagree-on-overlap" }
    : obstructed.length ? { kind: "proof-obstruction", loci: obstructed }
      : propagating.length ? { kind: "kinetic-obstruction", loci: propagating }
        : missing.length ? { kind: "local-obstruction", loci: missing }
          : misplaced.length ? { kind: "placement-obstruction", effects: misplaced }
            : !materiality.material ? { kind: "materiality-obstruction", effects: materiality.ballast }
              : null;
  const boundary = Object.freeze({ observations: "caller-supplied-statuses-and-source-references; not-verified-proof", effectAuthorization: "not-assessed", scientificTruth: "not-assessed" });
  return retainedCarrier(obstruction === null
    ? { type: outputSchema.properties.type.const, eligible: true, transition: input.transition, analysis, responsePair, boundary }
    : { type: obstructionSchema.properties.type.const, eligible: false, transition: input.transition, obstruction, analysis, responsePair, boundary });
}
