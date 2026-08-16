# Perplexity Follow-Up Prompt - Source Holes

Use this after the first deep-research pass. The goal is to resolve source holes
without inflating claim language.

```text
You are doing primary-source cleanup for SynSync Pro. Do not produce marketing
copy. Resolve only the source holes below and return source-faithful evidence
notes.

For each item:
- Find the primary source, not a blog or product page.
- Return full citation, DOI, PMID, PMCID, trial ID, patent number, or stable URL.
- Confirm study design, population, N, control/sham condition, blinding,
  intervention parameters, outcomes, adverse events, and limitations.
- State whether the source supports a direct protocol claim, an indirect
  mechanism claim, a safety constraint, or only background context.
- Recommend keep/upgrade/downgrade evidence status, with confidence.
- If the source cannot be found, say "No reliable primary source found" and list
  exact databases/search terms checked.

Source holes to resolve:
1. PMC12145584 - full citation and whether this is a meta-analysis, systematic
   review, or trial on binaural beats and anxiety.
2. ScienceDirect S096522992500175X - full citation and whether it is a
   perioperative binaural-beat meta-analysis; extract population, endpoints, and
   effect direction.
3. PMC12597119 - full citation and design for binaural beats, affective
   symptoms, and performance.
4. PMC12213757 - full citation and design for monaural beats embedded in music
   versus beats-only and pure-tone control.
5. PMC11426047 - full citation, sample size, and outcomes for SMR
   neurofeedback and inhibitory control.
6. Kanzler et al. 2023 acoustic neurostimulation RCT - DOI, issue/pages, exact
   N per arm, session schedule, control stimulus, DASS-21 outcomes, and adverse
   events.
7. Kliempt et al. 1999 Hemi-Sync anesthesia trial - primary full text, exact
   fentanyl dosing outcome, blinding, control arms, and risk of bias.
8. Lewis, Osborn, and Roth Hemi-Sync surgical studies - full citation(s), study
   population, opioid outcomes, and whether results differ by surgery type.
9. 2017 military cardiovascular-stress Hemi-Sync/binaural-beat paper - primary
   citation, PMID/DOI, intervention, physiological endpoints, and design quality.
10. Audio-only entrainment safety - primary or guideline-level evidence for
    seizure, migraine, pregnancy, implanted device, cardiac, vestibular, and
    psychoactive-medication cautions.

Output:
1. Resolved source table
2. Evidence-grade change recommendations
3. Claim-boundary text suitable for a product UI
4. Remaining missing-source list
```
