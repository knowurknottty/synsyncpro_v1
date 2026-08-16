const firehorse2026 = {
  "protocolSuite": {
    "id": "firehorse2026",
    "title": "Fire Horse Nervous System Regulation Suite",
    "version": "1.0.0",
    "releaseDate": "2026-02-16",
    "culturalContext": "Chinese New Year 2026 transition from Wood Snake (Yin, introspection) to Fire Horse (Yang, bold action)",
    "duration": "28-day intensive cycle",
    "evidenceGrade": "C (TCM five-element + HRV), E (zodiac-specific)",
    "totalProtocols": 5,
    
    "protocols": [
      {
        "id": "firehorsemorning",
        "title": "Fire Horse Morning Activation – Harnessed Fire",
        "category": "HP",
        "evidenceLevel": "II-III",
        "duration": 1200,
        "culturalFramework": {
          "tradition": "TCM",
          "element": "Fire",
          "zodiacAlignment": "Fire Horse (Yang acceleration)",
          "organSystem": "Heart/Pericardium",
          "emotionalMapping": "Joy without overstimulation",
          "transitionMetaphor": "Snake stillness → Horse motion with regulated arousal"
        },
        "seasonalTiming": {
          "optimalPeriod": "Feb 17 – Mar 16, 2026 (first lunar month)",
          "circadianWindow": "06:00–09:00 local time",
          "lunarPhase": "Any (best: New to First Quarter for yang building)"
        },
        "usageGoal": "Transition from sleep into mobilized calm; prevent Fire Horse impulsivity by anchoring yang energy in SMR/alpha regulation",
        "algoDesc": "10–15 Hz SMR/low-beta for alert relaxation, paired with movement cues; builds yang momentum without sympathetic overwhelm",
        "researchContext": "SMR training reduces impulsivity (Arns 2009); Taiji/Baduanjin + five-element music improve HRV and emotion regulation (Frontiers 2025)",
        "phases": [
          {
            "duration": 180,
            "beat": 10.0,
            "carrier": 200,
            "noise": "pink",
            "noiseMix": 0.08,
            "isochronic": true,
            "harmonicStacking": true,
            "spatialMotion": "rotate",
            "stochastic": false,
            "overlays": [],
            "overlayMix": 0,
            "purpose": "Alpha grounding – gentle wake from Snake stillness"
          },
          {
            "duration": 600,
            "beat": {"start": 10, "end": 14},
            "carrier": 200,
            "noise": "pink",
            "noiseMix": 0.08,
            "isochronic": true,
            "harmonicStacking": true,
            "spatialMotion": "rotate",
            "overlays": [432],
            "overlayMix": 0.15,
            "purpose": "Alpha → SMR ramp – mobilization without anxiety"
          },
          {
            "duration": 300,
            "beat": 14.0,
            "carrier": 200,
            "noise": "white",
            "noiseMix": 0.05,
            "isochronic": true,
            "harmonicStacking": true,
            "spatialMotion": "rotate",
            "overlays": [432],
            "overlayMix": 0.15,
            "purpose": "Sustained SMR – Horse body with calm mind"
          },
          {
            "duration": 120,
            "beat": {"start": 14, "end": 10},
            "carrier": 200,
            "noise": "pink",
            "noiseMix": 0.08,
            "isochronic": true,
            "harmonicStacking": false,
            "spatialMotion": "fixed",
            "overlays": [],
            "overlayMix": 0,
            "purpose": "Return to alpha baseline – ready for action"
          }
        ],
        "breathwork": {
          "name": "Fire Horse Breath",
          "ratio": [4, 1, 6, 1],
          "cycle": 12,
          "description": "Short inhale (yang), brief hold, extended exhale (yin control), brief pause. Mirrors harnessed Horse energy.",
          "instruction": "Inhale power, exhale control. Feel chest open (Fire/Heart)."
        },
        "mantra": {
          "phonetic": "MOVE-WITH-CLARITY",
          "pronunciation": "Moov with Klar-it-ee",
          "tonality": "Confident, grounded",
          "meaning": "Snake wisdom guides Horse momentum",
          "repeatInterval": 12
        },
        "integrationProtocols": {
          "somaticAddons": [
            "HT7 (Shenmen) gentle pressure during final phase – calms Heart/Shen",
            "PC6 (Neiguan) tap 7× after session – locks in autonomic balance"
          ],
          "movementPairing": [
            "10–20 min Taiji or Baduanjin immediately after",
            "Brisk walking with open chest, loose shoulders",
            "Horse stance (Mabu) 3×30 sec for yang grounding"
          ],
          "journalPrompts": [
            "What Snake work (introspection, shadow) fuels today's Horse action?",
            "Where do I feel Fire rising? Is it mobilizing or agitating?"
          ]
        },
        "contraindications": ["Acute mania", "Uncontrolled hypertension"],
        "citations": [
          "Arns et al. 2009 - SMR reduces impulsivity",
          "Frontiers 2025 - Five-element music + mind-body exercise improves emotion regulation",
          "Cherry 2002 - TCM Heart-Fire emotional mapping"
        ],
        "expectedTimeline": "Day 1: Noticeable calm-alert shift. Week 2: Morning energy stable, less jittery. Week 4: Embodied yang regulation.",
        "frequencyOfUse": "Daily, 06:00–09:00 for 28 days. Reduce to 3–5×/week after Fire Horse month if stable.",
        "versionHistory": {
          "currentVersion": "1.0.0",
          "changeLog": ["2026-02-16: Initial Fire Horse suite release"],
          "deprecatedVersions": []
        },
        "personalizationParams": {
          "iapfAdjustable": true,
          "carrierRange": [180, 220],
          "intensityLevels": ["Standard (default)", "Athletic (faster ramps, stronger isochronic)"],
          "variantIDs": []
        },
        "trackingMetrics": {
          "preSessionBaseline": ["HRV (if available)", "Energy 1-10", "Anxiety 1-10"],
          "postSessionImmediate": ["Energy 1-10", "Anxiety 1-10", "Embodiment (grounded vs. jittery) 1-10"],
          "week1Targets": ["Energy +20–40%", "Anxiety stable or -10–20%"],
          "week4Targets": ["Stable morning energy without caffeine dependence", "HRV improvement +10–30%"],
          "biomarkerOptional": ["Morning cortisol (optional: should normalize, not spike)"]
        },
        "stackingRules": {
          "canStackWith": ["focusv4 (later in day)", "deepsleepv4 (evening)"],
          "cannotStackWith": ["moodelevator (redundant yang stimulation)", "Any other morning beta/gamma protocol same AM"],
          "minIntervalHours": 0,
          "maxPerDay": 1,
          "synergyMultiplier": 1.0
        },
        "advancedSafety": {
          "dissociationRisk": "low",
          "integrationWindowHours": 1,
          "mandatoryBreakDays": 0,
          "supervisionRecommended": false,
          "emergencyProtocol": "vagusnervereset (if overstimulated)"
        }
      },
      
      {
        "id": "firehorsemidday",
        "title": "Fire Horse Midday Heart-Fire Modulation",
        "category": "HP",
        "evidenceLevel": "II",
        "duration": 1500,
        "culturalFramework": {
          "tradition": "TCM",
          "element": "Fire (Heart/Small Intestine time 11:00-15:00 in organ clock)",
          "zodiacAlignment": "Fire Horse yang peak management",
          "organSystem": "Heart/Pericardium/Shen (mind-spirit)",
          "emotionalMapping": "Prevent Fire → anxiety, palpitations, irritability",
          "transitionMetaphor": "Water controls Fire – midday parasympathetic reset"
        },
        "seasonalTiming": {
          "optimalPeriod": "Feb 17 – Mar 16, 2026",
          "circadianWindow": "11:00–13:00 (Heart time in TCM organ clock)",
          "lunarPhase": "Any"
        },
        "usageGoal": "Vagal-leaning theta reset to prevent Fire Horse burnout; calm sympathetic drive before it tips into stress",
        "algoDesc": "5–6 Hz theta with vagal carrier tones; activates parasympathetic brake on yang excess",
        "researchContext": "Theta 5–6 Hz produces 40–60% anxiety reduction (Grade A, Garcia-Argibay 2019); HT7 acupressure improves HRV (Grade C, 2015 study)",
        "phases": [
          {
            "duration": 300,
            "beat": 8.0,
            "carrier": 180,
            "noise": "brown",
            "noiseMix": 0.1,
            "isochronic": false,
            "harmonicStacking": false,
            "spatialMotion": "fixed",
            "overlays": [],
            "overlayMix": 0,
            "purpose": "Alpha descent – prep for vagal activation"
          },
          {
            "duration": 600,
            "beat": {"start": 8, "end": 5.5},
            "carrier": 180,
            "noise": "brown",
            "noiseMix": 0.12,
            "isochronic": false,
            "harmonicStacking": false,
            "spatialMotion": "fixed",
            "overlays": [174],
            "overlayMix": 0.2,
            "purpose": "Alpha → theta – enter parasympathetic dominance"
          },
          {
            "duration": 480,
            "beat": 5.5,
            "carrier": 180,
            "noise": "brown",
            "noiseMix": 0.12,
            "isochronic": false,
            "harmonicStacking": false,
            "spatialMotion": "fixed",
            "overlays": [174, 396],
            "overlayMix": 0.25,
            "purpose": "Sustained theta – Heart-Fire cooling, fear extinction"
          },
          {
            "duration": 120,
            "beat": {"start": 5.5, "end": 8},
            "carrier": 180,
            "noise": "brown",
            "noiseMix": 0.1,
            "isochronic": false,
            "harmonicStacking": false,
            "spatialMotion": "fixed",
            "overlays": [],
            "overlayMix": 0,
            "purpose": "Gentle return – grounded, not groggy"
          }
        ],
        "breathwork": {
          "name": "Water Breath (to cool Fire)",
          "ratio": [4, 2, 8, 2],
          "cycle": 16,
          "description": "Box breath variation with extended exhale. Water (yin, exhale) controls Fire (yang, inhale).",
          "instruction": "Visualize cool water flowing through chest on exhale, calming heart flame."
        },
        "mantra": {
          "phonetic": "CALM-HEART",
          "pronunciation": "Cahm Hahrt",
          "tonality": "Soft, soothing",
          "meaning": "Strong heart, soft edges – courage without constant sympathetic activation",
          "repeatInterval": 10
        },
        "integrationProtocols": {
          "somaticAddons": [
            "HT7 (Shenmen) gentle pressure bilaterally during theta phase",
            "PC6 (Neiguan) gentle circular massage after session",
            "Place hand on heart center, feel rhythm slow"
          ],
          "movementPairing": [
            "Avoid intense exercise immediately after",
            "Gentle seated stretches or yin yoga if needed",
            "10-min walk in nature ideal"
          ],
          "journalPrompts": [
            "Where did I feel Fire becoming anxiety today?",
            "What does 'strong heart, soft edges' mean for my afternoon?"
          ]
        },
        "contraindications": ["Severe depression (may increase lethargy)", "Sleep apnea (daytime theta can worsen)"],
        "citations": [
          "Garcia-Argibay 2019 - Theta/vagal protocols reduce anxiety 40-60%",
          "HT7 HRV study 2015",
          "TCM Heart-Fire theory (Cherry 2002, traditional texts)"
        ],
        "expectedTimeline": "Session 1: 15–60% anxiety drop. Week 2: Afternoon energy more stable. Week 4: Embodied 'Water controls Fire' pattern.",
        "frequencyOfUse": "Daily, 11:00–13:00 for 28 days. Can use as-needed midday reset long-term.",
        "versionHistory": {
          "currentVersion": "1.0.0",
          "changeLog": ["2026-02-16: Initial release"],
          "deprecatedVersions": []
        },
        "personalizationParams": {
          "iapfAdjustable": true,
          "carrierRange": [160, 200],
          "intensityLevels": ["Standard"],
          "variantIDs": []
        },
        "trackingMetrics": {
          "preSessionBaseline": ["Anxiety 1-10", "Heart rate", "Energy 1-10"],
          "postSessionImmediate": ["Anxiety 1-10", "Heart rate (expect -10-20 bpm)", "Calm 1-10"],
          "week1Targets": ["Anxiety -20–40%", "Fewer afternoon stress spikes"],
          "week4Targets": ["Stable midday regulation", "HRV recovery visible"],
          "biomarkerOptional": ["HRV during session (should increase)", "Afternoon cortisol (should normalize)"]
        },
        "stackingRules": {
          "canStackWith": ["firehorsemorning (AM)", "firehorseevening (PM)"],
          "cannotStackWith": ["Any stimulating beta/gamma protocol within 2 hours"],
          "minIntervalHours": 2,
          "maxPerDay": 1,
          "synergyMultiplier": 1.2
        },
        "advancedSafety": {
          "dissociationRisk": "low",
          "integrationWindowHours": 0.5,
          "mandatoryBreakDays": 0,
          "supervisionRecommended": false,
          "emergencyProtocol": "None (benign; if grogginess, reduce frequency)"
        }
      },
      
      {
        "id": "firehorseevening",
        "title": "Fire Horse Evening Snake Descent – Deep Parasympathetic Reset",
        "category": "SR",
        "evidenceLevel": "II",
        "duration": 3000,
        "culturalFramework": {
          "tradition": "TCM",
          "element": "Water (evening yin restoration)",
          "zodiacAlignment": "Snake energy (stillness, consolidation, shadow integration)",
          "organSystem": "Kidney/Bladder (Water element, yin restoration)",
          "emotionalMapping": "Release Fire Horse volatility into deep rest",
          "transitionMetaphor": "Horse → Snake nightly – action consolidates in stillness"
        },
        "seasonalTiming": {
          "optimalPeriod": "Feb 17 – Mar 16, 2026 (and ongoing as foundational protocol)",
          "circadianWindow": "45–60 min before target sleep time",
          "lunarPhase": "Any (optimal: Full to New for yin deepening)"
        },
        "usageGoal": "Anchor Fire Horse volatility into consistent delta sleep; retrain brain for deep, restorative sleep over time",
        "algoDesc": "Beta→Alpha→Theta→Delta slow descent (8 Hz → 0.5 Hz); delta slow-oscillation stimulation improves SWS, memory consolidation, glymphatic clearance",
        "researchContext": "Delta entrainment improves slow-wave sleep 60–90 min (Grade A, Marshall 2006); sleep = neuroplasticity foundation (Grade A)",
        "phases": [
          {
            "duration": 300,
            "beat": 8.0,
            "carrier": 200,
            "noise": "pink",
            "noiseMix": 0.1,
            "isochronic": false,
            "harmonicStacking": false,
            "spatialMotion": "fixed",
            "overlays": [],
            "overlayMix": 0,
            "purpose": "Alpha entry – transition from waking"
          },
          {
            "duration": 600,
            "beat": {"start": 8, "end": 6},
            "carrier": 200,
            "noise": "pink",
            "noiseMix": 0.12,
            "isochronic": false,
            "harmonicStacking": false,
            "spatialMotion": "fixed",
            "overlays": [174],
            "overlayMix": 0.15,
            "purpose": "Alpha → theta descent – relaxation deepens"
          },
          {
            "duration": 900,
            "beat": {"start": 6, "end": 2},
            "carrier": 200,
            "noise": "brown",
            "noiseMix": 0.15,
            "isochronic": false,
            "harmonicStacking": false,
            "spatialMotion": "fixed",
            "overlays": [174, 396],
            "overlayMix": 0.2,
            "purpose": "Theta → delta ramp – enter sleep preparatory state"
          },
          {
            "duration": 1200,
            "beat": {"start": 2, "end": 0.5},
            "carrier": 200,
            "noise": "brown",
            "noiseMix": 0.18,
            "isochronic": false,
            "harmonicStacking": false,
            "spatialMotion": "fixed",
            "overlays": [174],
            "overlayMix": 0.25,
            "purpose": "Deep delta – slow-wave sleep induction, glymphatic activation"
          }
        ],
        "breathwork": {
          "name": "Snake Breath (4-7-8 variation)",
          "ratio": [4, 7, 8, 0],
          "cycle": 19,
          "description": "Classic relaxation breath. Extended hold + exhale activates vagus, mimics Snake stillness.",
          "instruction": "Breathe in power of day (4), hold integration (7), release completely (8). Embody Snake."
        },
        "mantra": {
          "phonetic": "RELEASE-AND-REST",
          "pronunciation": "Ree-lease and Rest",
          "tonality": "Whispered, fading",
          "meaning": "Fire Horse day dissolves into Snake night – action becomes wisdom",
          "repeatInterval": 15
        },
        "integrationProtocols": {
          "somaticAddons": [
            "KI1 (Yongquan, sole of foot) gentle massage – grounds Kidney Water energy",
            "Full body scan: release jaw, shoulders, hips"
          ],
          "movementPairing": [
            "No movement – lying down, lights dimmed",
            "Gentle yin stretches 10 min before session acceptable"
          ],
          "journalPrompts": [
            "What did I shed today (Snake question)?",
            "What Horse action am I consolidating in tonight's stillness?"
          ]
        },
        "contraindications": ["Sleep apnea (use with caution; consult sleep specialist)", "Narcolepsy"],
        "citations": [
          "Marshall et al. 2006 - Delta slow-oscillation improves memory consolidation",
          "SynSync Insomnia Core evidence base (Grade A-B)",
          "TCM Water-Kidney-yin restoration theory"
        ],
        "expectedTimeline": "Night 1: Sleep latency may reduce 10–30%. Week 2: Deeper, more restorative sleep. Week 4: Embodied nightly descent ritual.",
        "frequencyOfUse": "Nightly, 45–60 min before sleep, for 28 days minimum. Becomes permanent foundational protocol.",
        "versionHistory": {
          "currentVersion": "1.0.0",
          "changeLog": ["2026-02-16: Fire Horse evening variant of deepsleepv4"],
          "deprecatedVersions": []
        },
        "personalizationParams": {
          "iapfAdjustable": true,
          "carrierRange": [180, 220],
          "intensityLevels": ["Standard", "Deep (slower ramps, more delta time)"],
          "variantIDs": ["deepsleepv4 (base version)"]
        },
        "trackingMetrics": {
          "preSessionBaseline": ["Wakefulness 1-10", "Anxiety 1-10", "Time to fall asleep (estimate)"],
          "postSessionImmediate": ["N/A – asleep"],
          "week1Targets": ["Sleep latency -20–50%", "Fewer night wakings"],
          "week4Targets": ["Sleep latency <15 min", "Slow-wave sleep +60–90 min (if tracking)", "Morning energy +30–50%"],
          "biomarkerOptional": ["Sleep tracker SWS data", "Morning HRV (should improve)"]
        },
        "stackingRules": {
          "canStackWith": ["firehorsemorning (AM)", "firehorsemidday (midday)"],
          "cannotStackWith": ["Any stimulating protocol within 3 hours of bedtime"],
          "minIntervalHours": 3,
          "maxPerDay": 1,
          "synergyMultiplier": 1.5
        },
        "advancedSafety": {
          "dissociationRisk": "low",
          "integrationWindowHours": 0,
          "mandatoryBreakDays": 0,
          "supervisionRecommended": false,
          "emergencyProtocol": "None (if insomnia worsens, consult sleep specialist)"
        }
      },
      
      {
        "id": "snakesessionweekly",
        "title": "Snake Session – Shadow Work & Emotional Theta",
        "category": "EM",
        "evidenceLevel": "III",
        "duration": 1800,
        "culturalFramework": {
          "tradition": "TCM + Jungian shadow work",
          "element": "Yin (introspection, shedding, subconscious)",
          "zodiacAlignment": "Wood Snake 2025 residue – honor what was released",
          "organSystem": "Liver (Wood element, anger/frustration processing)",
          "emotionalMapping": "Process patterns/skins still being shed in Fire Horse year",
          "transitionMetaphor": "Snake molts skin; this session processes what you're still releasing"
        },
        "seasonalTiming": {
          "optimalPeriod": "Feb 17 – Mar 16, 2026 (1×/week throughout Fire Horse year)",
          "circadianWindow": "Afternoon (14:00–17:00) when energy dips allow introspection",
          "lunarPhase": "Waning Moon to New Moon (releasing energy)"
        },
        "usageGoal": "Deep emotional theta work paired with journaling; process Snake-year shadow material to prevent Fire Horse bypassing",
        "algoDesc": "5 Hz theta with emotional processing overlays; alpha-theta crossover state for subconscious access",
        "researchContext": "Emotional theta 5–7 Hz shows medium effect sizes for trauma/emotion processing (Grade C-D, Peniston protocol lineage)",
        "phases": [
          {
            "duration": 300,
            "beat": 10.0,
            "carrier": 180,
            "noise": "pink",
            "noiseMix": 0.1,
            "isochronic": false,
            "harmonicStacking": false,
            "spatialMotion": "fixed",
            "overlays": [],
            "overlayMix": 0,
            "purpose": "Alpha grounding – safe container for emotional work"
          },
          {
            "duration": 600,
            "beat": {"start": 10, "end": 5},
            "carrier": 180,
            "noise": "brown",
            "noiseMix": 0.12,
            "isochronic": false,
            "harmonicStacking": false,
            "spatialMotion": "rotate",
            "overlays": [396],
            "overlayMix": 0.2,
            "purpose": "Alpha → theta crossover – subconscious gate opens"
          },
          {
            "duration": 600,
            "beat": 5.0,
            "carrier": 180,
            "noise": "brown",
            "noiseMix": 0.15,
            "isochronic": false,
            "harmonicStacking": false,
            "spatialMotion": "rotate",
            "overlays": [396, 417],
            "overlayMix": 0.25,
            "purpose": "Sustained theta – emotional processing, memory reconsolidation"
          },
          {
            "duration": 300,
            "beat": {"start": 5, "end": 8},
            "carrier": 180,
            "noise": "pink",
            "noiseMix": 0.1,
            "isochronic": false,
            "harmonicStacking": false,
            "spatialMotion": "fixed",
            "overlays": [528],
            "overlayMix": 0.2,
            "purpose": "Theta → alpha return – integrate insights, close safely"
          }
        ],
        "breathwork": {
          "name": "Forgiveness Box Breath",
          "ratio": [5, 5, 5, 5],
          "cycle": 20,
          "description": "Equal parts breath – balanced witnessing of shadow material without overwhelm.",
          "instruction": "With each cycle: 'I release what no longer serves me.'"
        },
        "mantra": {
          "phonetic": "I-SHED-I-GROW",
          "pronunciation": "Eye Shed, Eye Grow",
          "tonality": "Neutral, witnessing",
          "meaning": "Snake teaches: what I release makes space for what I become",
          "repeatInterval": 15
        },
        "integrationProtocols": {
          "somaticAddons": [
            "LV3 (Taichong, top of foot) pressure – releases Liver qi stagnation, anger",
            "Place hand on belly, feel emotional waves without fixing"
          ],
          "movementPairing": [
            "After session: 15–30 min journaling (mandatory)",
            "Gentle shaking or dancing to discharge emotional residue",
            "Walk in nature to ground insights"
          ],
          "journalPrompts": [
            "What Snake-year pattern (introspection, shadow, wound) am I still shedding?",
            "What arose in theta? What wants to be released?",
            "How does this old skin make space for Fire Horse boldness?"
          ]
        },
        "contraindications": ["Active suicidal ideation", "Uncontrolled PTSD (requires trauma-informed support)", "Acute psychosis"],
        "citations": [
          "Peniston & Kulkosky 1989 - Alpha-theta protocol for trauma/addiction",
          "Emotional processing theta literature (Grade C-D)",
          "TCM Liver-Wood-anger processing theory"
        ],
        "expectedTimeline": "Session 1: Emotional material may surface. Week 4: Patterns clarify. Week 12: Integration visible in reduced reactivity.",
        "frequencyOfUse": "1×/week, ideally same day/time (e.g., every Sunday 15:00). Continue throughout Fire Horse year as needed.",
        "versionHistory": {
          "currentVersion": "1.0.0",
          "changeLog": ["2026-02-16: Snake session for Fire Horse suite"],
          "deprecatedVersions": []
        },
        "personalizationParams": {
          "iapfAdjustable": true,
          "carrierRange": [160, 200],
          "intensityLevels": ["Standard"],
          "variantIDs": ["neurorecovery (deeper trauma work)", "griefprocessor"]
        },
        "trackingMetrics": {
          "preSessionBaseline": ["Emotional activation 1-10", "Reactivity/triggers this week 1-10"],
          "postSessionImmediate": ["Emotional activation 1-10", "Insights gained (journal entry)", "Sense of release 1-10"],
          "week1Targets": ["Clarity on 1-2 patterns being released"],
          "week4Targets": ["Reduced reactivity to old triggers -20–40%", "Embodied 'shedding' felt-sense"],
          "biomarkerOptional": ["Weekly mood logs"]
        },
        "stackingRules": {
          "canStackWith": ["firehorseevening (later same day OK)"],
          "cannotStackWith": ["Any other deep emotional protocol same day"],
          "minIntervalHours": 6,
          "maxPerDay": 1,
          "synergyMultiplier": 1.0
        },
        "advancedSafety": {
          "dissociationRisk": "medium",
          "integrationWindowHours": 2,
          "mandatoryBreakDays": 6,
          "supervisionRecommended": true,
          "emergencyProtocol": "vagusnervereset (if overwhelmed); anxietyreliefv4 (if panic)"
        }
      },
      
      {
        "id": "horsesessionweekly",
        "title": "Horse Session – Bold Action & Theta-Gamma Insight",
        "category": "PF",
        "evidenceLevel": "II-III",
        "duration": 2400,
        "culturalFramework": {
          "tradition": "TCM + creative neuroscience",
          "element": "Fire (yang, visibility, bold action)",
          "zodiacAlignment": "Fire Horse 2026 peak expression",
          "organSystem": "Heart (courage, joy, connection)",
          "emotionalMapping": "Channeled boldness, creative insight, social dynamism",
          "transitionMetaphor": "Horse runs free – Snake wisdom guides the gallop"
        },
        "seasonalTiming": {
          "optimalPeriod": "Feb 17 – Mar 16, 2026 (1×/week throughout Fire Horse year)",
          "circadianWindow": "Morning (07:00–10:00) when yang energy peaks",
          "lunarPhase": "New Moon to Full Moon (building/action energy)"
        },
        "usageGoal": "Theta-gamma creative protocol for high-bandwidth idea generation + bold action planning; embody Fire Horse at its best",
        "algoDesc": "4–7 Hz theta baseline + 40 Hz gamma bursts; theta-gamma coupling for creative insight and idea binding",
        "researchContext": "Theta-gamma coupling associated with creative insight, memory binding (Grade B mechanistically)",
        "phases": [
          {
            "duration": 300,
            "beat": 10.0,
            "carrier": 220,
            "noise": "white",
            "noiseMix": 0.05,
            "isochronic": true,
            "harmonicStacking": true,
            "spatialMotion": "rotate",
            "overlays": [],
            "overlayMix": 0,
            "purpose": "Alpha priming – clear, focused entry"
          },
          {
            "duration": 600,
            "beat": {"start": 10, "end": 6},
            "carrier": 220,
            "noise": "white",
            "noiseMix": 0.05,
            "isochronic": true,
            "harmonicStacking": true,
            "spatialMotion": "rotate",
            "overlays": [432],
            "overlayMix": 0.1,
            "purpose": "Alpha → theta – creative receptivity opens"
          },
          {
            "duration": 900,
            "beat": 6.0,
            "carrier": 220,
            "noise": "pink",
            "noiseMix": 0.08,
            "isochronic": true,
            "harmonicStacking": true,
            "spatialMotion": "random",
            "overlays": [40, 432],
            "overlayMix": 0.3,
            "purpose": "Theta + gamma bursts – insight generation, pattern binding"
          },
          {
            "duration": 600,
            "beat": {"start": 6, "end": 10},
            "carrier": 220,
            "noise": "white",
            "noiseMix": 0.05,
            "isochronic": true,
            "harmonicStacking": false,
            "spatialMotion": "fixed",
            "overlays": [432],
            "overlayMix": 0.15,
            "purpose": "Theta → alpha return – capture insights, ready for action"
          }
        ],
        "breathwork": {
          "name": "Fire Horse Power Breath",
          "ratio": [4, 0, 4, 0],
          "cycle": 8,
          "description": "Fast, rhythmic breath – no holds. Mimics Horse gallop, builds energy.",
          "instruction": "Inhale power (4), exhale power (4). Feel Heart-Fire ignite creative courage."
        },
        "mantra": {
          "phonetic": "BOLD-AND-CLEAR",
          "pronunciation": "Bold and Kleer",
          "tonality": "Strong, declarative",
          "meaning": "Horse boldness + Snake clarity = unstoppable aligned action",
          "repeatInterval": 10
        },
        "integrationProtocols": {
          "somaticAddons": [
            "HT7 + PC6 bilateral tapping after session – locks in Heart coherence",
            "Stand in Horse stance 3×30 sec – embody yang power physically"
          ],
          "movementPairing": [
            "Immediately after: 25-min deep work sprint on bold project",
            "10-min consolidation walk + voice-memo insights",
            "Dance, run, or dynamic movement to discharge excess Fire"
          ],
          "journalPrompts": [
            "What bold Horse action did this session reveal?",
            "How does Snake wisdom (past introspection) guide this Fire Horse move?",
            "What am I ready to make visible/public this week?"
          ]
        },
        "contraindications": ["Acute mania", "Severe anxiety (use firehorsemidday first)"],
        "citations": [
          "Theta-gamma coupling creative insight literature (Grade B)",
          "Flow state theta + gamma research",
          "TCM Heart-Fire courage/joy mapping"
        ],
        "expectedTimeline": "Session 1: Noticeable creative flow + motivation spike. Week 4: Embodied 'Fire Horse boldness with Snake precision.' Week 12: Tangible external results from aligned action.",
        "frequencyOfUse": "1×/week, ideally same day/time (e.g., every Tuesday 08:00). Pair with major project/goal work.",
        "versionHistory": {
          "currentVersion": "1.0.0",
          "changeLog": ["2026-02-16: Horse session for Fire Horse suite"],
          "deprecatedVersions": []
        },
        "personalizationParams": {
          "iapfAdjustable": true,
          "carrierRange": [200, 240],
          "intensityLevels": ["Standard", "Athletic (stronger gamma bursts, faster pace)"],
          "variantIDs": ["creativeinsight", "flow3autotelic"]
        },
        "trackingMetrics": {
          "preSessionBaseline": ["Motivation 1-10", "Clarity on next bold move 1-10"],
          "postSessionImmediate": ["Motivation 1-10", "Creative insights (# of ideas)", "Readiness to act 1-10"],
          "week1Targets": ["1-3 actionable bold ideas per session"],
          "week4Targets": ["Tangible progress on Fire Horse goals (measurable outputs)", "Confidence +30–50%"],
          "biomarkerOptional": ["Weekly goal tracking (# of bold actions taken)"]
        },
        "stackingRules": {
          "canStackWith": ["firehorsemorning (same AM)", "focusv4 (for extended deep work)"],
          "cannotStackWith": ["snakesessionweekly (opposite energy; keep 3+ days apart)"],
          "minIntervalHours": 0,
          "maxPerDay": 1,
          "synergyMultiplier": 1.4
        },
        "advancedSafety": {
          "dissociationRisk": "low",
          "integrationWindowHours": 1,
          "mandatoryBreakDays": 6,
          "supervisionRecommended": false,
          "emergencyProtocol": "firehorsemidday or vagusnervereset (if overstimulated)"
        }
      }
    ]
  }
} as const;

export default firehorse2026;
