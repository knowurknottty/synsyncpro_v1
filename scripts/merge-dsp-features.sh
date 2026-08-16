#!/bin/bash
# scripts/merge-dsp-features.sh [Established]
#
# Run from repo root after `git fetch origin` to merge DSP feature branches
# sequentially with automated conflict checks.
#
# Usage: bash scripts/merge-dsp-features.sh

set -e

BRANCHES=(
  "feature/core-dsp-foundation"
  "feature/psychoacoustic-optimization"
  "feature/multi-layer-entrainment"
  "feature/spatial-audio-immersion"
)

git checkout main
git pull origin main

for branch in "${BRANCHES[@]}"; do
  echo "Merging $branch..."
  git merge --no-ff origin/"$branch" || {
    echo "Conflict in $branch. Files:"
    git diff --name-only --diff-filter=U
    git merge --abort
    read -p "Resolve manually then press Enter to continue..."
  }
  git commit -m "Merge $branch: $(git log -1 --format=%s origin/$branch)"
done

git push origin main
echo "All DSP features merged."
