# Software Design Document (SDD)
## AI RPG Campaign Master Agent

**Version:** 1.0  
**Date:** 2026-05-14  
**Language:** Python  
**Supported Systems:** D&D 5e, Tormenta20

---

## 1. Overview

This document describes the design of an AI agent capable of leading RPG campaigns in the style of a human Game Master (GM / Dungeon Master). The agent supports two RPG rule systems: **Dungeons & Dragons 5th Edition** and **Tormenta20** (Brazil's most played RPG, set in the world of Arton).

The agent acts as a DM/GM: it narrates the story, manages NPCs, enforces game rules, resolves dice rolls, tracks player character state, and advances the campaign narrative based on player input.

---

## 2. Goals and Non-Goals

### Goals
- Support multi-turn, stateful RPG sessions via natural language
- Enforce game mechanics for D&D 5e and Tormenta20 (dice rolls, ability checks, combat, leveling)
- Manage campaign state: quest progress, NPCs, world map, player characters
- Generate contextually coherent narrative, encounters, and dialogue
- Integrate with GitHub Copilot (via OpenAI-compatible API) or Google Gemini as LLM backend

### Non-Goals
- 18+ content, gore, explicit violence or sexual content (enforced via system prompt guardrails)
- Real-time multiplayer synchronization (out of scope for v1)
- Voice interface (text only in v1)

---

## 3. System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        RPG Agent (Python)                        │
│                                                                  │
│  ┌──────────────┐   ┌───────────────┐   ┌────────────────────┐  │
│  │  CLI / API   │──▶│  Agent Core   │──▶│   LLM Backend      │  │
│  │  Interface   │   │  (Orchestrator│   │ (Copilot / Gemini) │  │
│  └──────────────┘   │   Loop)       │   └────────────────────┘  │
│                     └───────┬───────┘                           │
│                             │                                    │
│          ┌──────────────────┼──────────────────┐                │
│          ▼                  ▼                  ▼                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  Rules       │  │  State       │  │  Narrative            │   │
│  │  Engine      │  │  Manager     │  │  Generator            │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
│          │                  │                  │                 │
│          └──────────────────▼──────────────────┘                │
│                      ┌──────────────┐                           │
│                      │  Persistence │                           │
│                      │  Layer (JSON)│                           │
│                      └──────────────┘                           │
└──────────────────────────────────────────────────────────────────┘
```

---

## 4. Component Descriptions

### 4.1 CLI / API Interface (`interface/`)
- Accepts player text input
- Displays GM narrative output
- Supports session start, resume, and save commands
- Entry point: `main.py`

### 4.2 Agent Core — Orchestrator Loop (`agent/core.py`)
- Central control loop that processes each player turn
- Calls Rules Engine to validate/resolve mechanics
- Calls Narrative Generator to produce DM text
- Passes prompt + context to LLM Backend
- Detects intent: narrative action, combat, skill check, rest, trade, etc.

### 4.3 Rules Engine (`rules/`)
- Submodules per system: `rules/dnd5e/` and `rules/tormenta20/`
- Handles:
  - Dice rolling simulation (`dice.py`)
  - Ability checks and saving throws
  - Combat resolution (initiative, attack rolls, damage, death saves)
  - Experience points and level-up logic
  - Spell slot / mana tracking
  - Character creation validation

**D&D 5e key mechanics modeled:**
- 6 ability scores (STR, DEX, CON, INT, WIS, CHA)
- Proficiency bonus, advantage/disadvantage
- d20-based skill checks with Difficulty Class (DC)
- HP, hit dice, death saving throws (3 successes/failures)
- XP-based leveling (20 levels)

**Tormenta20 key mechanics modeled:**
- Same 6 attributes (mirrored from D&D but locally tuned)
- Triumphs and Failures (critical rolls)
- Mana Points (MP) for spells instead of spell slots
- "Tormenta" — a supernatural storm that corrupts; thematic campaign element
- Character classes (Bárbaro, Bardo, Clérigo, Druida, Guerreiro, Ladino, Mago, Paladino, etc.)
- Distinções (prestige-like specializations)

### 4.4 State Manager (`state/manager.py`)
Tracks all mutable campaign state:

```python
@dataclass
class CampaignState:
    system: str              # "dnd5e" or "tormenta20"
    session_id: str
    players: List[Character]
    npcs: Dict[str, NPC]
    current_scene: Scene
    quest_log: List[Quest]
    world_flags: Dict[str, Any]   # doors opened, enemies defeated, etc.
    turn_history: List[Turn]       # last N turns for LLM context window
```

### 4.5 Narrative Generator (`narrative/generator.py`)
- Constructs the prompt sent to the LLM
- Injects:
  - System persona prompt (GM role, tone, content guardrails)
  - Current scene description
  - Relevant NPC states
  - Recent turn history (sliding context window)
  - Rules Engine output (dice results, outcomes)
- Formats LLM response for display

**System prompt template (excerpt):**
```
You are a Game Master running a {system} campaign. 
Maintain a heroic adventure tone suitable for all ages (no graphic violence or adult content).
The players' actions are: {player_input}
Current scene: {scene_description}
Dice outcome: {dice_result}
Continue the narrative:
```

### 4.6 LLM Backend (`llm/`)
Abstracted interface with two implementations:

```python
class LLMBackend(ABC):
    @abstractmethod
    def complete(self, prompt: str, history: List[dict]) -> str: ...

class CopilotBackend(LLMBackend):   # llm/copilot.py
    # Uses OpenAI-compatible API (github.com/copilot endpoint)

class GeminiBackend(LLMBackend):    # llm/gemini.py
    # Uses google-generativeai SDK
```

Configuration selects the backend via `config.yaml`.

### 4.7 Persistence Layer (`storage/`)
- Session state saved as JSON files: `sessions/{session_id}.json`
- Character sheets: `characters/{name}.json`
- Campaign templates: `campaigns/dnd5e/` and `campaigns/tormenta20/`

---

## 5. Data Models

### Character
```python
@dataclass
class Character:
    name: str
    race: str
    char_class: str
    level: int
    hp: int
    max_hp: int
    ability_scores: Dict[str, int]   # STR, DEX, CON, INT, WIS, CHA
    skills: Dict[str, int]
    inventory: List[Item]
    xp: int
    system: str                       # "dnd5e" or "tormenta20"
    # tormenta20-specific
    mp: Optional[int] = None
    max_mp: Optional[int] = None
```

### Scene
```python
@dataclass
class Scene:
    location: str
    description: str
    active_npcs: List[str]
    available_exits: List[str]
    in_combat: bool
    combat_state: Optional[CombatState] = None
```

### Turn
```python
@dataclass
class Turn:
    player_input: str
    dice_rolls: List[DiceRoll]
    rules_outcome: str
    gm_narrative: str
    timestamp: str
```

---

## 6. Key Workflows

### 6.1 Session Start
```
1. Player selects system (D&D 5e or Tormenta20)
2. Player creates or loads character
3. Agent loads campaign template or generates new scenario
4. State Manager initializes CampaignState
5. Narrative Generator produces opening scene
6. LLM Backend generates GM welcome narrative
```

### 6.2 Normal Turn
```
1. Player types action (e.g. "I try to pick the lock")
2. Agent Core detects action type → skill check
3. Rules Engine: determine relevant skill (Thieves' Tools / Destreza)
4. Rules Engine: roll d20 + modifier vs DC
5. State Manager: update state if lock opened
6. Narrative Generator: build prompt with roll result
7. LLM Backend: generate narrative response
8. Output to player
9. State Manager: append Turn to history, save session
```

### 6.3 Combat Turn
```
1. Agent or player triggers combat
2. Rules Engine: roll initiative for all parties
3. For each combatant in initiative order:
   a. Announce whose turn it is
   b. Player declares action or Agent decides NPC action
   c. Rules Engine: resolve attack roll, damage, status effects
   d. State Manager: update HP, status
   e. Narrative Generator: describe the action
4. Check win/loss conditions
5. Handle death saving throws if HP = 0
6. Post-combat: distribute XP, loot
```

### 6.4 Level Up
```
1. Rules Engine detects XP threshold crossed
2. Notify player
3. Player selects new abilities/spells per system rules
4. State Manager: update character stats
5. Narrative Generator: announce level up in-narrative
```

---

## 7. Edge Cases and Mitigations

| Edge Case | Description | Mitigation |
|-----------|-------------|------------|
| Ambiguous player input | "I attack" without specifying target | Agent asks clarifying question before resolving |
| Player attempts impossible action | "I fly across the ocean without a spell" | Rules Engine rejects; Narrative explains why |
| Out-of-bounds content request | Player tries to steer narrative to 18+ content | System prompt guardrail + content classifier filter |
| LLM context overflow | Long sessions exceed token limit | Sliding window: keep last 20 turns + scene summary |
| Player character death | HP reaches 0 with failed death saves | Offer resurrection mechanics per system rules; or offer new character creation |
| Rule system conflict | Player invokes D&D rule in Tormenta20 session | Rules Engine scoped by `system` flag; rejects cross-system rules |
| Inconsistent NPC behavior | LLM generates NPC acting out of character | NPC personality stored in State; injected into every prompt |
| Save file corruption | JSON malformed on disk | Validate schema on load; fallback to last known good backup |
| Player disconnection / crash | Session interrupted mid-turn | Auto-save after each turn to `sessions/{id}.json` |
| Multiple players (future) | Single agent, multiple players | v1 assumes solo or single-user; v2 will multiplex turns |

---

## 8. Content Safety

The agent enforces a **PG-13 content policy**:

- System prompt explicitly instructs LLM: no graphic gore, no sexual content, heroic adventure tone
- A lightweight content classifier runs on both player input and LLM output before display
- If a violation is detected: the agent redirects the narrative ("The scene shifts to...") rather than hard-refusing, to maintain game flow

---

## 9. Project Structure

```
rpg_agent/
├── main.py                  # Entry point
├── config.yaml              # LLM backend selection, system settings
├── agent/
│   └── core.py              # Orchestrator loop
├── llm/
│   ├── base.py              # Abstract LLMBackend
│   ├── copilot.py           # GitHub Copilot backend
│   └── gemini.py            # Google Gemini backend
├── rules/
│   ├── dice.py              # Dice simulation (d4, d6, d8, d10, d12, d20, d100)
│   ├── dnd5e/
│   │   ├── combat.py
│   │   ├── skills.py
│   │   └── leveling.py
│   └── tormenta20/
│       ├── combat.py
│       ├── skills.py
│       └── leveling.py
├── state/
│   ├── manager.py           # CampaignState, Character, Scene models
│   └── models.py            # Dataclasses
├── narrative/
│   └── generator.py         # Prompt construction
├── storage/
│   ├── session_store.py     # Load/save JSON sessions
│   └── sessions/            # Runtime session files
├── campaigns/
│   ├── dnd5e/               # Starter campaign templates
│   └── tormenta20/          # Starter campaign templates (world of Arton)
└── tests/
    ├── test_rules_dnd5e.py
    ├── test_rules_tormenta20.py
    ├── test_state_manager.py
    └── test_narrative_generator.py
```

---

## 10. Technology Stack

| Component | Technology |
|-----------|-----------|
| Language | Python 3.11+ |
| LLM (primary) | GitHub Copilot API (OpenAI-compatible) |
| LLM (alternative) | Google Gemini via `google-generativeai` |
| Data serialization | `dataclasses` + `json` |
| Configuration | `PyYAML` |
| CLI | `rich` (terminal formatting) |
| Testing | `pytest` |
| Dependency management | `pip` + `requirements.txt` |

---

## 11. Implementation Tasks (Backlog)

### Phase 1 — Foundation
- [ ] `dice.py`: implement `roll(notation: str) -> DiceRoll` (e.g. `"2d6+3"`)
- [ ] `state/models.py`: define all dataclasses
- [ ] `state/manager.py`: implement load/save/update
- [ ] `storage/session_store.py`: JSON persistence with schema validation
- [ ] `llm/base.py`: abstract backend interface
- [ ] `llm/copilot.py`: OpenAI-compatible Copilot integration
- [ ] `llm/gemini.py`: Gemini integration via SDK

### Phase 2 — Rules Engines
- [ ] D&D 5e: ability checks, saving throws, combat (initiative, attack, damage, death saves)
- [ ] D&D 5e: XP thresholds and level-up logic
- [ ] Tormenta20: same mechanics with MP system and Triumph/Failure rules
- [ ] Tormenta20: Tormenta corruption mechanic (optional campaign element)

### Phase 3 — Narrative
- [ ] `narrative/generator.py`: sliding context window prompt builder
- [ ] System prompt templates for D&D and Tormenta20 tone/world
- [ ] Content safety filter (input + output)
- [ ] NPC personality injection

### Phase 4 — Interface & Polish
- [ ] `main.py`: CLI loop with `rich` formatting
- [ ] Campaign template loader (D&D starter dungeon, Tormenta20 starter Arton adventure)
- [ ] Character creation wizard (interactive CLI)
- [ ] Session resume from saved JSON

### Phase 5 — Testing & Review
- [ ] Unit tests for all Rules Engine functions
- [ ] Integration test: full 5-turn session simulation
- [ ] Edge case tests: death, overflow context, content filter
- [ ] Self-criticism review against constraints (see Section 12)

---

## 12. Self-Criticism Review

| Constraint / Criteria | Status | Notes |
|-----------------------|--------|-------|
| Python as language | Compliant | All components designed in Python |
| D&D rules referenced | Compliant | D&D 5e SRD mechanics modeled (ability scores, d20 system, XP, HP) |
| Tormenta20 rules referenced | Compliant | Tormenta20 mechanics modeled (MP, classes, Distinções, Arton world) |
| No 18+ / gore / violence | Compliant | System prompt guardrail + content classifier enforced |
| Structural design created | Compliant | Architecture diagram + component descriptions provided |
| Basic LLM access components | Compliant | Copilot and Gemini backends designed with abstraction layer |
| SDD in markdown | Compliant | This document |
| All steps and tasks listed | Compliant | Section 11 provides full phased backlog |
| Self-criticism task | Compliant | This section (12) |

**Gaps identified:**
- Tormenta20 rules are less formally documented than D&D 5e; the Rules Engine for T20 will require more iteration during implementation against the actual Tormenta20 core rulebook
- The content classifier is noted as "lightweight" — in v1 this will be a keyword/pattern match; a proper ML classifier should be considered for v2
- Multiplayer is deferred to v2; the state model supports it (players is a `List[Character]`) but the turn orchestration loop does not

---

*End of document*
