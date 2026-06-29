#!/bin/sh
# QuickBeak installer (free single-file build) - macOS / Linux
# Usage:  curl -fsSL https://quickbeak.com/install.sh | sh
#
# What it does (no sudo, all in your home dir):
#   1. Downloads QuickBeak.html from quickbeak.com
#   2. Saves it to ~/.local/share/QuickBeak  (or ~/Applications/QuickBeak on macOS)
#   3. Opens the app in your default browser
#
# It does NOT install services or need root. Read this script before piping it
# to sh - good practice for any 'curl | sh' one-liner.
#
# (c) 2026 Kuan Zhe Huang. QuickBeak is source-available, no-redistribution.

set -eu

BASE_URL="${QUICKBEAK_BASE_URL:-https://quickbeak.com}"
FILE="QuickBeak.html"

case "$(uname -s)" in
  Darwin) DIR="$HOME/Applications/QuickBeak" ;;
  *)      DIR="$HOME/.local/share/QuickBeak" ;;
esac
DEST="$DIR/$FILE"

echo ""
echo "QuickBeak installer"
echo "-------------------"
mkdir -p "$DIR"

echo "  Downloading $BASE_URL/$FILE"
if command -v curl >/dev/null 2>&1; then
  curl -fsSL "$BASE_URL/$FILE" -o "$DEST"
elif command -v wget >/dev/null 2>&1; then
  wget -qO "$DEST" "$BASE_URL/$FILE"
else
  echo "  Need curl or wget. Install one and retry." >&2
  exit 1
fi

if [ ! -s "$DEST" ]; then
  echo "  Download looks empty or failed." >&2
  echo "  Download $FILE manually from $BASE_URL" >&2
  exit 1
fi
echo "  Saved to $DEST"

echo "  Opening QuickBeak..."
case "$(uname -s)" in
  Darwin) open "$DEST" 2>/dev/null || true ;;
  *)      (xdg-open "$DEST" >/dev/null 2>&1 || true) ;;
esac

echo ""
echo "  QuickBeak installed."
echo "  File: $DEST"
echo "  To update later, run the same one-liner again."
