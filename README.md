# planned-transition-assessment-service

<!-- 561-group-standards:badges:start -->
[![Red Cup Engineering](https://img.shields.io/badge/561%20Group-Red%20Cup%20Engineering-c0392b)](https://github.com/red-cup-engineering)
[![License: MIT](https://img.shields.io/badge/license-MIT-c0392b)](LICENSE)
[![Indigenous data: CARE](https://img.shields.io/badge/Indigenous%20data-CARE-4b6f44)](https://github.com/red-cup-engineering/.github/blob/main/GOVERNANCE.md)
[![Tips welcome](https://img.shields.io/badge/tips-welcome-d4a017)](https://github.com/561-group/.github/blob/main/TIPS.md)
<!-- 561-group-standards:badges:end -->

Assess finite planned-transition eligibility under supplied observations, placement declarations and game materiality; effect authorization remains with the receiving host.

[Source assessment](src/assess-planned-transition.mjs) keeps each provider/patch
pair distinct, including names containing separators. Its gluing source names
encode the complete pair as a JSON array; the original provider and patch fields
remain available separately. Placement is lexical containment under supplied
declarations, including a declared filesystem root. It does not establish host
rights or authorize an effect.
