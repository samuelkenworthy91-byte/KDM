
import re
import json

file_path = '/workspaces/KDM/original_hunt_event_node_design_pack_reviewed_locked_choices.txt'
with open(file_path, 'r') as f:
    content = f.read()

# find the first occurrence of 001.
match = re.search(r'001\. ', content)
if match:
    content = content[match.start():]

# Split by event numbers followed by a dot and a space at the start of a line
# Using a lookahead to keep the separator
events_raw = re.split(r'\n(?=[0-9]{3}\. )', content)

parsed_events = []

for raw in events_raw:
    lines = [l.strip() for l in raw.strip().split('\n')]
    if not lines: continue
    
    event = {}
    name_match = re.match(r'[0-9]{3}\. (.*)', lines[0])
    if name_match:
        event['name'] = name_match.group(1)
    
    i = 1
    while i < len(lines):
        line = lines[i]
        if line.startswith('sourceSeed:'):
            event['sourceSeed'] = line.replace('sourceSeed:', '').strip()
        elif line.startswith('suggestedId:'):
            event['id'] = line.replace('suggestedId:', '').strip()
        elif line.startswith('section:'):
            event['section'] = line.replace('section:', '').strip()
        elif line.startswith('mode:'):
            event['mode'] = line.replace('mode:', '').strip()
        elif line.startswith('description:'):
            event['description'] = line.replace('description:', '').strip()
        elif line.startswith('autoOutcome:'):
            auto_outcome = {}
            i += 1
            while i < len(lines):
                subline = lines[i].strip()
                if not subline or re.match(r'^\d+\.', subline) or subline.startswith('sourceSeed') or subline.startswith('suggestedId') or subline.startswith('section') or subline.startswith('mode') or subline.startswith('description'):
                    break
                if subline.startswith('outcomeText:'):
                    auto_outcome['outcomeText'] = subline.replace('outcomeText:', '').strip()
                elif subline.startswith('effects:'):
                    effects_str = subline.replace('effects:', '').strip()
                    try:
                        auto_outcome['effects'] = json.loads(effects_str)
                    except:
                        auto_outcome['effects'] = effects_str
                i += 1
            event['autoOutcome'] = auto_outcome
            continue
        elif line.startswith('choices:'):
            choices = []
            i += 1
            current_choice = None
            while i < len(lines):
                subline = lines[i].strip()
                if not subline: 
                    i += 1
                    continue
                
                # Check if we hit next event or other top-level fields (though shouldn't happen inside choices)
                if re.match(r'^[0-9]{3}\. ', subline): break
                
                choice_id_match = re.match(r'^\d+\. id: (.*)', subline)
                if choice_id_match:
                    if current_choice:
                        choices.append(current_choice)
                    current_choice = {'id': choice_id_match.group(1)}
                elif subline.startswith('text:'):
                    if current_choice is not None:
                        current_choice['text'] = subline.replace('text:', '').strip()
                elif subline.startswith('outcomeText:'):
                    if current_choice is not None:
                        current_choice['outcomeText'] = subline.replace('outcomeText:', '').strip()
                elif subline.startswith('effects:'):
                    if current_choice is not None:
                        effects_str = subline.replace('effects:', '').strip()
                        try:
                            current_choice['effects'] = json.loads(effects_str)
                        except:
                            current_choice['effects'] = effects_str
                elif subline.startswith('lockedUnless:'):
                    if current_choice is not None:
                        lu_str = subline.replace('lockedUnless:', '').strip()
                        try:
                            current_choice['lockedUnless'] = json.loads(lu_str)
                        except:
                            current_choice['lockedUnless'] = lu_str
                elif subline.startswith('lockedText:'):
                    if current_choice is not None:
                        current_choice['lockedText'] = subline.replace('lockedText:', '').strip()
                i += 1
            if current_choice:
                choices.append(current_choice)
            event['choices'] = choices
            continue
        i += 1
    parsed_events.append(event)

print(json.dumps(parsed_events, indent=2))
