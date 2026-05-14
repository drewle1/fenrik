#!/bin/bash

# Quell- und Zielverzeichnis
SRC_DIR="./"
DST_DIR="../images"

# Zielverzeichnis erstellen, falls nicht vorhanden
mkdir -p "$DST_DIR"

# Alle PNGs durchgehen
for file in "$SRC_DIR"/*.png; do
    filename=$(basename "$file")
    base="${filename%.png}"   # entfernt .png sauber
    convert "$file" -quality 85 "$DST_DIR/$base.webp"
    echo "Konvertiert: $filename → $base.webp"
done

echo "Fertig!"
