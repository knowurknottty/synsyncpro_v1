# 🔬 Research Data Analysis Guide

## What You'll Receive

Users voluntarily upload anonymized JSON files to your Diam server. Each file contains:

### Data Structure

```json
{
  "version": "1.0",
  "exportedAt": "2026-02-09T20:00:00Z",
  "dataTypes": ["sessions", "effectiveness", "patterns", "goals"],
  "contributor": {
    "anonymousUserId": "user_a3f8...",
    "contributionCount": 1
  },
  "userProfile": { /* optional demographics */ },
  "sessions": [ /* session records */ ],
  "protocolStats": [ /* effectiveness data */ ]
}
```

---

## Key Research Questions

### 1. Protocol Effectiveness

**Question:** Which protocols actually work?

**Data to analyze:**
```json
{
  "sessions": [{
    "protocolId": "focus_v5_professional",
    "rating": 5,
    "completed": true,
    "completionRate": 1.0
  }]
}
```

**Analysis:**
- Average rating per protocol
- Completion rate per protocol
- Rating distribution (are people consistently rating 3-4, or polarized 1-5?)
- Completion correlation (do completed sessions rate higher?)

**SQL Example:**
```sql
SELECT
  protocolId,
  AVG(rating) as avg_rating,
  COUNT(*) as total_sessions,
  AVG(completionRate) as avg_completion,
  COUNT(DISTINCT anonymousUserId) as unique_users
FROM sessions
WHERE rating IS NOT NULL
GROUP BY protocolId
ORDER BY avg_rating DESC, unique_users DESC;
```

**Key Insights:**
- Protocols with 4.5+ rating & high completion = validated
- Protocols with <3.0 rating or <50% completion = needs work
- High variance in ratings = works for some, not others (check demographics)

---

### 2. Side Effects Frequency

**Question:** What side effects are common? Which protocols cause them?

**Data:**
```json
{
  "sideEffects": ["Headache", "Dizziness"]
}
```

**Analysis:**
- Side effect frequency per protocol
- Side effect co-occurrence (headache + dizziness together?)
- Correlation with completion (do side effects cause dropouts?)

**Pseudocode:**
```python
side_effects_by_protocol = {}
for session in all_sessions:
    if session.sideEffects:
        for effect in session.sideEffects:
            side_effects_by_protocol
                .setdefault(session.protocolId, {})
                .setdefault(effect, 0)
            side_effects_by_protocol[session.protocolId][effect] += 1

# Calculate frequency
for protocol, effects in side_effects_by_protocol.items():
    total_sessions = count_sessions(protocol)
    for effect, count in effects.items():
        frequency = count / total_sessions
        if frequency > 0.2:  # 20%+ users
            print(f"WARNING: {protocol} causes {effect} in {frequency*100}% of users")
```

**Key Insights:**
- Side effects >20% = serious issue
- Side effects >50% = protocol needs complete redesign
- Common combos (headache+nausea) = specific issue to address

---

### 3. Effectiveness by Demographics

**Question:** Who does each protocol work for?

**Data:**
```json
{
  "userProfile": {
    "ageRange": "25-34",
    "experienceLevel": "beginner",
    "primaryGoals": ["sleep-onset"]
  },
  "sessions": [...]
}
```

**Analysis:**
- Average rating by age range
- Average rating by experience level
- Average rating by goal

**SQL Example:**
```sql
SELECT
  u.ageRange,
  u.experienceLevel,
  s.protocolId,
  AVG(s.rating) as avg_rating,
  COUNT(*) as n
FROM sessions s
JOIN userProfiles u ON s.anonymousUserId = u.anonymousUserId
GROUP BY u.ageRange, u.experienceLevel, s.protocolId
HAVING n >= 10  -- Minimum sample size
ORDER BY avg_rating DESC;
```

**Key Insights:**
- "focus_v5" works better for beginners than advanced (4.5 vs 3.2)
- "mystical_experience" works well for 45+ but poorly for 18-24
- Sleep protocols universally effective regardless of experience

**Action:**
- Update recommendations algorithm
- Add age/experience warnings
- Create targeted protocols

---

### 4. Optimal Usage Patterns

**Question:** When should protocols be used? How often?

**Data:**
```json
{
  "sessions": [{
    "timeOfDay": "morning",
    "dayOfWeek": "weekday",
    "sessionNumber": 42,
    "protocolSessionNumber": 12
  }]
}
```

**Analysis:**
- Effectiveness by time of day
- Effectiveness by session number (cumulative effect?)
- Optimal frequency

**Pseudocode:**
```python
# Time of day effectiveness
for protocol in protocols:
    sessions_by_time = group_by(sessions, 'timeOfDay')
    for time, group in sessions_by_time.items():
        avg_rating = mean([s.rating for s in group])
        print(f"{protocol} at {time}: {avg_rating}")

# Cumulative effect
for protocol in protocols:
    sessions_sorted = sort_by(sessions, 'protocolSessionNumber')
    first_5 = mean([s.rating for s in sessions_sorted[:5]])
    last_5 = mean([s.rating for s in sessions_sorted[-5:]])
    improvement = last_5 - first_5
    if improvement > 0.5:
        print(f"{protocol} has cumulative effect: +{improvement}")
```

**Key Insights:**
- Morning focus protocols: 4.3 rating vs 3.8 evening
- Sleep protocols: 4.5 evening vs 2.1 morning (duh)
- Focus protocols improve with repetition (+0.8 rating after 10 sessions)

**Action:**
- Update TIME_OF_DAY_MAPPING
- Add "cumulative effect" flag to protocols
- Recommend session counts

---

### 5. Goal → Protocol Mapping Validation

**Question:** Are we recommending the right protocols for each goal?

**Data:**
```json
{
  "userProfile": {
    "primaryGoals": ["sleep-onset", "stress-anxiety"]
  },
  "sessions": [{
    "protocolId": "deep_sleep_delta",
    "rating": 5
  }]
}
```

**Analysis:**
- For each goal, which protocols rate highest?
- Are our current mappings correct?

**SQL Example:**
```sql
-- Find best protocols for "sleep-onset" goal
SELECT
  s.protocolId,
  AVG(s.rating) as avg_rating,
  COUNT(DISTINCT s.anonymousUserId) as users
FROM sessions s
JOIN userProfiles u ON s.anonymousUserId = u.anonymousUserId
WHERE u.primaryGoals LIKE '%sleep-onset%'
  AND s.rating IS NOT NULL
GROUP BY s.protocolId
HAVING users >= 5
ORDER BY avg_rating DESC
LIMIT 10;
```

**Key Insights:**
- Users with "sleep-onset" goal rate "circadian_reset" 4.8 (we currently recommend)
- But they rate "theta_meditation" 4.9 (we DON'T currently recommend!)
- Update: Add theta_meditation to sleep-onset recommendations

**Action:**
- Update GOAL_TAXONOMY mappings
- Add newly discovered effective protocols
- Remove ineffective ones

---

### 6. Dropout Analysis

**Question:** Why do people stop using protocols?

**Data:**
```json
{
  "sessions": [{
    "completionRate": 0.3,  // Only 30% through
    "completed": false,
    "sideEffects": ["Dizziness"]
  }]
}
```

**Analysis:**
- Completion rate distribution
- Correlation with side effects
- Correlation with duration

**Pseudocode:**
```python
incomplete_sessions = [s for s in sessions if not s.completed]

# Why did they stop?
for session in incomplete_sessions:
    if session.completionRate < 0.2:
        print("Early dropout - probably didn't like it")
    elif session.sideEffects:
        print(f"Likely stopped due to: {session.sideEffects}")
    elif session.actualDuration > session.expectedDuration * 1.5:
        print("Protocol too long - user bored?")
```

**Key Insights:**
- "mystical_experience": 45% dropout rate, mostly early (<20% completion)
- Common reason: intensity too high for experience level
- "focus_v5": 12% dropout rate, but when it happens, it's due to restlessness

**Action:**
- Add intensity warnings
- Create "lite" versions of intense protocols
- Better experience level gating

---

## Statistical Analysis Methods

### Sample Size Requirements

**Minimum for actionable insights:**
- Protocol evaluation: 10+ unique users
- Demographic analysis: 20+ users per demographic group
- Time-of-day analysis: 30+ sessions per time slot
- Side effect frequency: 50+ sessions for rare effects

### Statistical Significance

**Use χ² (chi-square) test for categorical data:**
```python
from scipy.stats import chi2_contingency

# Example: Is protocol X significantly better than Y?
data = [
    [30, 10],  # Protocol X: 30 good ratings, 10 bad
    [15, 25]   # Protocol Y: 15 good ratings, 25 bad
]
chi2, p_value = chi2_contingency(data)[:2]
if p_value < 0.05:
    print("Significant difference!")
```

**Use t-test for continuous data:**
```python
from scipy.stats import ttest_ind

# Example: Is average rating significantly different?
protocol_x_ratings = [4, 5, 5, 4, 5, 3, 4, 5]
protocol_y_ratings = [2, 3, 2, 4, 3, 2, 3, 2]
t_stat, p_value = ttest_ind(protocol_x_ratings, protocol_y_ratings)
if p_value < 0.05:
    print("Significantly different!")
```

---

## Data Cleaning

### Remove Outliers

**Session duration outliers:**
```python
# Remove sessions where actual duration is >3x expected
# (User probably walked away)
valid_sessions = [
    s for s in sessions
    if s.actualDuration < s.expectedDuration * 3
]
```

**Rating outliers:**
```python
# Remove users who rate everything 5 or everything 1
# (Not paying attention)
user_rating_variance = {}
for session in sessions:
    user_id = session.anonymousUserId
    if user_id not in user_rating_variance:
        user_rating_variance[user_id] = []
    user_rating_variance[user_id].append(session.rating)

valid_users = {
    uid for uid, ratings in user_rating_variance.items()
    if variance(ratings) > 0.5  # Some variance = paying attention
}

valid_sessions = [
    s for s in sessions
    if s.anonymousUserId in valid_users
]
```

---

## Reporting Back to Users

### Aggregate Insights (No Individual Data)

**Monthly Research Report:**

```markdown
## SynSync Pro Research Update - March 2026

**Community Contributions:**
- 1,247 users contributed data
- 18,432 sessions analyzed
- Thank you for advancing science! 🔬

**Top Findings:**

1. **Focus Protocols Work**
   - Average rating: 4.3/5
   - 78% completion rate
   - Most effective in morning (4.5 vs 3.8 evening)

2. **Sleep Protocols Validated**
   - deep_sleep_delta: 4.7/5 (n=234)
   - Cumulative effect confirmed: +0.6 rating after 10 sessions
   - Best used 30min before bed

3. **New Discovery: Theta Meditation for Sleep**
   - Users with sleep-onset goal gave theta protocols 4.9/5
   - We're updating recommendations!

4. **Warning: Mystical Experience Protocol**
   - 45% dropout rate among beginners
   - Adding stronger experience requirements
   - Works well for advanced users (4.6/5)

**Changes We Made:**
- Updated time-of-day recommendations
- Added theta_meditation to sleep-onset goals
- Strengthened experience gating on advanced protocols
- Reduced intensity on beginner protocols

**Next Month's Focus:**
Looking for more data on:
- Pain management protocols (need 50+ users)
- Addiction recovery protocols (need 100+ users)
- Long-term effects (6+ months of use)
```

---

## Privacy Protection in Analysis

### Never Publish Individual Data

**DON'T:**
- "User A3F8 rated focus protocol 5"
- "User from California had headaches"
- "User aged 25-34 with anxiety..."

**DO:**
- "78% of users rated focus protocol 4-5"
- "12% of users reported headaches (n=147)"
- "Users aged 25-34 rated protocols 4.2 on average (n=234)"

### Minimum Aggregation

**Rules:**
- Never report on <10 users
- Never report on <20 sessions for statistical claims
- Always use ranges for demographics
- Never connect multiple demographic attributes (no "25-34 female from Europe")

---

## Protocol Improvement Workflow

1. **Identify Issue:** Low rating or high dropout
2. **Analyze Data:** What's causing it? Demographics? Side effects?
3. **Hypothesize Fix:** Reduce intensity? Change frequency? Better targeting?
4. **Deploy Update:** Update protocol or recommendations
5. **Monitor:** Track next month's data for improvement
6. **Report Back:** Tell community what changed and why

---

## Research Publication

### Academic Paper Structure

**Title:** "Crowdsourced Validation of Brainwave Entrainment Protocols: A Privacy-First Approach"

**Abstract:**
- 1,247 participants
- 18,432 sessions
- 38 protocols tested
- Anonymous, user-controlled data contribution
- Findings: X, Y, Z

**Methods:**
- Data collection: User-exported JSON
- Anonymization: Client-side, no PII
- Analysis: Aggregate statistics only
- Ethics: User controls exactly what to share

**Results:**
- Protocol effectiveness rankings
- Demographic analysis
- Side effect frequencies
- Optimal usage patterns

**Discussion:**
- First crowdsourced study of brainwave entrainment
- Privacy-first model enables large-scale data
- Findings support/refute previous claims
- Limitations: Self-reported, no control group

**Conclusion:**
- Protocols X, Y, Z validated
- Protocols A, B, C need improvement
- Recommendations updated based on data
- Model for future neurotechnology research

---

## Your Competitive Advantage

**Traditional Studies:**
- ❌ Small sample sizes (n=20)
- ❌ Expensive ($100k+)
- ❌ Slow (years)
- ❌ Lab settings (not real-world)

**Your Crowdsourced Model:**
- ✅ Large sample sizes (n=1000+)
- ✅ Free (users volunteer)
- ✅ Fast (continuous data)
- ✅ Real-world usage

**Plus:** Privacy-first approach builds trust → more contributors → better data → better insights → better product → more users → more data...

**Flywheel effect.** 🚀

---

## Next Steps

1. **Set up Diam server** for receiving uploads
2. **Create analysis pipeline** (Python/R scripts)
3. **Build dashboard** for monitoring contributions
4. **Publish first report** when you hit 100 users
5. **Iterate** based on findings

You now have the infrastructure to build the world's largest brainwave entrainment research database. All while respecting user privacy.

**This is your moat.** No competitor can replicate this without your trust-based model.
