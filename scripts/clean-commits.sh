#!/bin/bash
#
# Remove Co-Authored-By lines from all commit messages.
#
# This rewrites git history. After running:
#   git push --force origin main
#
# WARNING: This invalidates all existing clones. Only run pre-release.
#
set -e

echo "Commits with Co-Authored-By before cleanup:"
git log --all --format="%H %s" | while read hash rest; do
    if git log --format="%B" -1 "$hash" | grep -qi "co-authored"; then
        echo "  $hash $rest"
    fi
done

echo ""
echo "Rewriting commit messages..."

FILTER_BRANCH_SQUELCH_WARNING=1 git filter-branch --force --msg-filter '
sed "/^Co-Authored-By:.*$/d; /^[[:space:]]*$/{ N; /^\n$/d; }"
' -- --all

echo ""
echo "Done. Verify with:"
echo "  git log --all --format=\"%B\" | grep -ci co-authored"
echo ""
echo "If satisfied, force push:"
echo "  git push --force origin main"
