KDM / DEADLY GAME LONG-TERM UPGRADE PACK V3

Upload this whole folder to:

docs/kdm-upgrade-plan/

This version contains two prompt sets:

1. prompts_codex/
   Use these with Codex. They are still careful, but assume Codex can handle multi-file patches.

2. prompts_fcc_claude_safe/
   Use these when you run out of Codex and use fcc-claude. These prompts are stricter, more explicit, and designed to prevent earlier weak-agent mistakes: broad rewrites, vague card wording, deleting legacy save support, changing too many files at once, and inventing mechanics.

Recommended order:
1. Upload docs and commit.
2. Run prompts in numerical order.
3. For each stage: one prompt, one patch, npm run build, npm run test, git status, commit.
4. Do not start intimacy until resource tags, Memory economy and innovation model are stable.

Current repo scan notes are in:
reference_docs/00_CURRENT_REPO_SCAN_AND_TWEAKS.txt

Core mechanical intent:
- Memory is earned from successful hunt returns: +1 Memory per returning living survivor.
- Retreat gives 0 Memory and should remain costly.
- Innovation costs 1 Memory + 1 Hide-slot resource + 1 Organ-slot resource + 1 Bone-slot resource.
- Six basic resources: bone, hide, organ, sinew, scrap, loveJuice.
- Sinew counts as Organ.
- Love Juice counts as Organ, is rarer, and may negate negative outcomes from one intimacy attempt when spent.
- Quarry resources remain their own resources but can have one or two materialTags.
- One multi-tag resource copy can fill only one payment slot.
