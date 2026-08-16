# SynSync Pro Evidence Synthesis - 2026-06-12

This synthesis incorporates the user-provided Perplexity deep-research pass from
2026-06-12. It is a claim-boundary document, not renderer proof. Audio
conformance remains covered by `docs/PROOF_OF_QUALITY.md` and the macOS verifier.

## Current Evidence Ledger

| Domain | Current Evidence Level | Claim Boundary |
| --- | --- | --- |
| Binaural beats for anxiety and pain | Level II | Meta-analyses support modest to medium effects, with heterogeneity and frequency/exposure dependence. Do not claim guaranteed cortical entrainment or medical treatment. |
| Binaural beats for sleep, attention, mood | Level III | Human evidence exists, but outcomes are less consistent than anxiety/pain. Keep UI language as supportive or associated, not therapeutic. |
| Monaural beats in music | Level III | One controlled study supports anxiety and mood benefit when beats are embedded in music; beats-only did not show the same effect in that source. |
| Isochronic 10 Hz alpha for stress/anxiety/depression symptoms in healthy adults | Level II upgrade candidate | A randomized single-blind clinical trial supports short-term self-report improvement in healthy adults. Limit this to 10 Hz alpha and non-clinical populations until more trials exist. |
| Other isochronic frequencies and indications | Level IV-V | Mechanistic and contextual unless specific trials are found. Avoid using the 10 Hz result to bless delta, theta, beta, or gamma isochronic claims. |
| Alpha-theta neurofeedback for addiction/PTSD | Level II with constraints | Foundational controlled studies and review support likely efficacy, but small samples and multi-component protocols prevent clean attribution to audio or neurofeedback alone. |
| SMR neurofeedback for inhibitory control | Level II | Double-blind/sham-controlled evidence supports SMR neurofeedback for inhibitory control. Consumer audio protocols should say they are inspired by SMR training, not equivalent to EEG neurofeedback. |
| 40 Hz auditory-only cognition/MCI | Level III | Protocols and qualitative/tolerability work are emerging. Keep auditory-only 40 Hz experimental and avoid AD treatment claims. |
| 40 Hz multimodal GENUS-style stimulation | Level II-III | Human audiovisual/tactile trials are stronger than audio-only evidence, but SynSync audio-only use cannot inherit disease-modification claims. |
| HRTF/spatial audio | Level IV safety/UX constraint | Good psychoacoustic basis; clinical claims are not established. Warn for vestibular sensitivity, dizziness, nausea, and sound-triggered vertigo conditions. |
| Transaural crosstalk cancellation | Level IV engineering constraint | Valid spatial-audio technique with sweet-spot, head-position, room, and gain-management constraints. It is not a clinical intervention. |
| Monroe/Gateway broad consciousness claims | Level V | Declassified/contextual material is not efficacy evidence. Separate Gateway context from clinical Hemi-Sync-style studies. |
| Hemi-Sync-style perioperative endpoints | Level II narrow-context candidate | Some surgical trials report opioid-sparing effects; another RCT found no effect on anesthetic depth. Keep claims narrow and endpoint-specific. |

## Sources Imported Into The App Reference Library

- Garcia-Argibay, Santed, and Reales 2019 binaural-beat meta-analysis, DOI `10.1007/s00423-018-1683-5`, PMID `30073406`.
- Ismail et al. 2024 binaural-beat psychiatric-disorders meta-analysis, DOI `10.2174/0118749445332258241004044234`.
- Binaural-beat EEG entrainment systematic review, PMCID `PMC10198548`.
- Kanzler et al. 2023 10 Hz acoustic neurostimulation RCT in healthy adults.
- Brazilian Registry trial `RBR-10yj42dj`.
- Sound and Music for Mild Cognitive Impairment protocol `NCT05064007`.
- Zhang et al. 2024 40 Hz music/sound acceptability study, PMID `38402805`.
- Chen et al. 2025 40 Hz multisensory review, DOI `10.1177/11795735251328029`.
- Peniston and Kulkosky 1989 alpha-theta alcohol-use study, DOI `10.1111/j.1530-0277.1989.tb00325.x`, PMID `2665099`.
- Sokhadze, Cannon, and Trudeau 2008 substance-use neurofeedback review, DOI `10.1007/s10484-007-9047-5`, PMID `18214670`.
- Dabu-Bondoc et al. 2003 Hemi-Sync anesthesia-depth RCT, PMID `12933400`.
- Jot 2000 transaural crosstalk-cancellation paper.
- Parodi and Rubak transaural CTC experiment, PMCID `PMC3561850`.

## Immediate Product Implications

1. Keep the release claim boundary: SynSync proves deterministic audio rendering,
   safety ceilings, and reproducible session records. It does not prove medical
   efficacy for every protocol.
2. Mark 10 Hz alpha isochronic stress-relief language as RCT-supported but
   non-clinical-population limited.
3. Keep 40 Hz audio-only protocols experimental, and prefer music-embedded or
   gentler 40 Hz presentations over raw pure-tone defaults where UX allows.
4. Keep HRTF and transaural controls framed as rendering-quality modes with
   vestibular/sweet-spot constraints.
5. Keep Monroe/Gateway language contextual unless a protocol is specifically
   describing narrow perioperative Hemi-Sync-style evidence.

## Source Holes Still Requiring Primary Fetch

- Full bibliographic details for `PMC12145584`, `S096522992500175X`,
  `PMC12597119`, `PMC12213757`, and `PMC11426047`.
- DOI, issue/pages, design details, and adverse-event text for Kanzler et al.
  2023 beyond the PDF summary.
- Primary full text for Kliempt et al. 1999 and Lewis/Osborn/Roth Hemi-Sync
  surgical studies.
- Primary paper for the 2017 military cardiovascular-stress Hemi-Sync claim.
- Independent safety references for audio-only seizure risk, migraine risk,
  pregnancy, implanted devices, and medication interactions.
