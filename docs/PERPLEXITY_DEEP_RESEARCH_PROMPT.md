# Perplexity Deep Research Prompt

Use this prompt to fill documentation and citation gaps without weakening the
project's receipts-not-claims posture.

```text
You are doing source-finding and evidence synthesis for SynSync Pro, a
deterministic neuroacoustic protocol library. Do not write marketing copy and
do not infer efficacy beyond the sources.

Goal:
For each protocol/topic I provide, gather peer-reviewed papers, clinical
studies, reviews, patents, declassified documents, or authoritative safety
references that support or constrain the protocol's evidence level, mechanism,
contraindications, and claim boundaries.

For every source, return:
- Full citation in APA or Vancouver style.
- DOI, PMID, PMCID, patent number, government document identifier, or stable URL.
- Study type: RCT, controlled trial, cohort, case series, review, meta-analysis,
  patent, declassified/government record, theoretical paper, or non-clinical
  context.
- Population and sample size where applicable.
- Frequency/stimulation parameters used, including carrier, beat, modulation,
  duration, sessions, and delivery method when reported.
- Outcomes measured and direction of effect.
- Safety findings, adverse events, contraindications, and exclusion criteria.
- Whether the source directly supports a protocol claim, indirectly supports a
  mechanism, only provides background context, or argues against/limits a claim.
- Evidence grade recommendation using:
  Level I: multiple high-quality RCTs or meta-analysis
  Level II: at least one RCT or multiple controlled human studies
  Level III: preliminary human evidence or strong adjacent clinical evidence
  Level IV: mechanistic, pilot, animal, patent, or contextual evidence
  Level V: speculative/theoretical with no direct human evidence
- Confidence: high, medium, or low, with a one-sentence reason.

Hard rules:
- If no reliable source exists, say "No reliable source found" and explain the
  search terms/databases checked.
- Separate audio-rendering facts from clinical/therapeutic claims.
- Separate binaural, monaural, isochronic, HRTF/spatial, and transaural speaker
  evidence when possible.
- Do not use blogs, sales pages, wellness marketing, unsourced claims, or
  anonymous summaries as evidence.
- Prefer PubMed, PMC, Crossref, Cochrane, IEEE/ACM, Google Patents/USPTO, CIA
  Reading Room, NIH, FDA, CDC, epilepsy foundations, and university sources.
- Flag any seizure, migraine, vestibular, psychiatric, cardiac, medication, or
  pregnancy cautions explicitly.
- Do not change the assigned protocol evidence level unless the sources justify
  it; instead recommend "keep", "upgrade candidate", or "downgrade candidate".

Output format:
1. Executive summary table
2. Source table
3. Protocol-by-protocol evidence notes
4. Contraindications and safety notes
5. Claim-boundary wording suitable for a product UI
6. Missing-source list and suggested next searches

Initial topics to investigate:
- Binaural beat evidence for pain, anxiety, sleep, attention, and mood.
- Isochronic and monaural entrainment evidence, separated from binaural evidence.
- Alpha-theta protocols for addiction recovery, including Peniston/Kulkosky and
  later replications or critiques.
- SMR neurofeedback literature relevant to impulse control and motor inhibition.
- 40 Hz gamma auditory stimulation, cognition, attention, and Alzheimer's-related
  literature, distinguishing auditory-only from visual or multimodal stimulation.
- Auditory steady-state response and frequency-following response safety.
- Photosensitive epilepsy and auditory/visual entrainment contraindications.
- HRTF spatial audio and motion/vestibular sensitivity risks.
- Transaural crosstalk cancellation: psychoacoustic validity, limitations, and
  any safety or listening-position constraints.
- Monroe/Gateway/Hemi-Sync references: separate declassified/contextual material
  from clinical efficacy evidence.
```
