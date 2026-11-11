#!/usr/bin/env bash
# Controleert dat site/assets/js/formulier.js exact de vaste bouwsteen is (versie aanvraag.v1).
set -euo pipefail
cd "$(dirname "$0")/.."
verwacht=$(cat controle/formulier.sha256)
echt=$(sha256sum site/assets/js/formulier.js | cut -d' ' -f1)
if [ "$verwacht" = "$echt" ]; then echo "formulier: in orde"; else echo "formulier: AFWIJKEND van de bouwsteen"; exit 1; fi
