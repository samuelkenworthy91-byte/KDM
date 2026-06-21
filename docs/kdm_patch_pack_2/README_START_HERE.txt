KDM PATCH PACK 2 — HIDDEN SYSTEMS, CAMPAIGN PRINCIPLES, EVENTS, NEMESIS, PASSIVES, AND PROGRESS TRANSPARENCY

Purpose:
This pack is designed to stop KDM systems drifting apart. Every rule should have:
- real data
- real resolver logic
- visible preview/UI explanation
- tests proving the UI text and runtime behaviour match

Run order:
1. Run 00_PREPARE_BRANCH_AND_VALIDATE.txt first.
2. Then run one prompt at a time, in numbered order.
3. After each patch, run:
   npm run build
   npm run test
   git status
4. Stop if a patch rewrites App.jsx or combatLogic.js broadly.
5. Stop if a patch changes only text but not runtime behaviour.
6. Commit only once that patch passes.
7. Do not merge/publish the whole pack until each patch has been playtested.

Recommended branch:
upgrade/patch-pack-2-principles-passives

Current known reference commit when this pack was written:
e22f8dffcbe8d64e1320cb739a40718273ccb197

Important:
The current named-mechanics/card-truth patch should land first if it has not already landed. This pack assumes that future work follows the same rule:
CARD TEXT = PREVIEW = RUNTIME EFFECT = TESTS.
