#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { assessPlannedTransition } from "../src/assess-planned-transition.mjs";

const source = process.argv[2] ? readFileSync(process.argv[2], "utf8") : readFileSync(0, "utf8");
process.stdout.write(`${JSON.stringify(assessPlannedTransition(JSON.parse(source)), null, 2)}\n`);
