# Terminology Alignment Report

This pack aligns game-facing gear data with the current GitHub repo vocabulary.

## Repo-facing quarry/source terms

|oldSourceTerm|canonicalQuarryId|canonicalQuarryName|canonicalCraftingLocationId|canonicalCraftingLocationName|
|---|---|---|---|---|
|White Lion|paleHuntLion|Pale Hunt Lion|lionTrophyHall|Lion Trophy Hall|
|Screaming Antelope|wailingAntelope|Wailing Antelope|antelopeLarder|Antelope Larder|
|Phoenix|ashPhoenix|Ash Phoenix|phoenixPyre|Phoenix Pyre|
|Gorm|bloatedGodling|Bloated Godling|stormShrine|Storm Shrine|
|Crimson Crocodile|crimsonCrocodile|Crimson Crocodile|redTannery|Red Tannery|
|Frogdog|frogdog|Frogdog|wetYard|Wet Yard|
|Spidicules|silkMatriarch|Silk Matriarch|silkLoom|Silk Loom|
|Spurkulese|silkMatriarch|Silk Matriarch|silkLoom|Silk Loom|
|Rose Knight|bloomKnight|Bloom Knight|duelistGarden|Duelist Garden|
|Dung Beetle Knight|chitinCrusader|Chitin Crusader|chitinFoundry|Chitin Foundry|
|Dragon King|drakeEmperor|Drake Emperor|crystalForge|Crystal Forge|
|Sunstalker|sunSovereign|Sun Sovereign|shellSanctum|Shell Sanctum|
|Sky Reef|sunSovereign|Sun Sovereign|shellSanctum|Shell Sanctum|
|Slenderman|shadowStalker|Shadow Stalker|shadowArchive|Shadow Archive|
|Lonely Tree/Light|strainPack|Strain Pack|curioArchive|Curio Archive|
|Green Armor|chitinCrusader|Chitin Crusader|armourDoctrine|Armour Doctrine|
|Promo/Anywhere||Settlement|settlement|Settlement|
|Settlement||Settlement|settlement|Settlement|

## Resource replacement rules

Unsupported/old resource IDs from earlier source material were replaced with IDs that exist in the current repo resource registry.

See `resource_replacements_to_repo_terms.csv` for row-level replacements.

## Important note

The columns `originalKdmName`, `kdmMonsterOrEventSource`, `kdmSettlementLocationOrSource`, `sourceUrl` and similar audit/provenance fields may still contain old reference terms. These are not intended for game UI or implementation. Game-facing fields are the `our*`, `canonical*`, card text and package fields.
