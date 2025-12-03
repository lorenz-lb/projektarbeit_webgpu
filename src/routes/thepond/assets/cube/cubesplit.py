from PIL import Image, ImageDraw, ImageFont, ImageOps


def split_cubemap_t_layout_simple(input_image_path="cube.png"):
    """
    Teilt ein 4000x3000 Cubemap-Bild im T-Layout in 6 Bilder auf
    und speichert diese als up.png, left.png, etc., direkt im aktuellen Pfad.
    
    Layout Annahme: Liegendes T (4x3 Gitter, 1000x1000 Gesichter)
    [leer][UP][leer][leer]
    [LEFT][FRONT][RIGHT][BACK]
    [leer][DOWN][leer][leer]
    """
    
    # --- Konfiguration ---
    FACE_SIZE = 1000
    FULL_WIDTH = 4000
    FULL_HEIGHT = 3000
    
    # Die Koordinaten (Spalte, Zeile) und Namen der 6 Gesichter
    # (col_index, row_index, name)
    faces_data = [
        # Erste Zeile (oben)
        (1, 0, "up", 0),    
        # Zweite Zeile (Mitte) - die längste Reihe
        (0, 1, "left", 180), 
        (1, 1, "front",-90),
        (2, 1, "right",0),
        (3, 1, "back",90),  
        # Dritte Zeile (unten)
        (1, 2, "down", 0),  
    ]
    # --- Ende Konfiguration ---
    
    try:
        # Lade das Bild
        img = Image.open(input_image_path)
    except FileNotFoundError:
        print(f"Fehler: Die Datei '{input_image_path}' wurde nicht gefunden.")
        print("Stellen Sie sicher, dass das Bild 'cube.png' im selben Ordner wie das Skript liegt.")
        return
    except Exception as e:
        print(f"Fehler beim Laden des Bildes: {e}")
        return

    # Prüfe die Größe
    if img.size != (FULL_WIDTH, FULL_HEIGHT):
        print(f"Warnung: Bildgröße ist {img.size}, erwartet wurde ({FULL_WIDTH}, {FULL_HEIGHT}).")
        print("Die Aufteilung wird trotzdem versucht, basierend auf 1000x1000 Gesichtern.")
        
    print(f"Starte Aufteilung von '{input_image_path}'...")

    for col, row, name, rotation in faces_data:
        # Berechne die Bounding Box (links, oben, rechts, unten Koordinate)
        left = col * FACE_SIZE
        top = row * FACE_SIZE
        right = left + FACE_SIZE
        bottom = top + FACE_SIZE
        
        # Schneide das Teilbild aus (crop)
        face_img = img.crop((left, top, right, bottom))

 
        # 1. ImageDraw-Objekt erstellen
        draw = ImageDraw.Draw(face_img)
        
        # 2. Schriftart laden (optional)
        try:
            # Versucht, eine TrueType-Schriftart zu laden
            font = ImageFont.truetype("Roboto-Bold.ttf", 800) 
        except IOError:
            # Fallback, wenn die Schriftart nicht gefunden wird
            font = ImageFont.load_default()
        
        # 3. Text und Farbe definieren
        text = name.upper() + " 1"  # Verwendet den Gesichtsnamen (z.B. "up", "left") als Text
        fill_color = (255, 0, 0) # Rot
        
        # 4. Textgröße berechnen (für Zentrierung) - KORRIGIERTE VERSION
        # Die getbbox-Methode gibt (left, top, right, bottom) relativ zur Schriftgröße zurück.
        # Wir benötigen die Breite (right - left) und die Höhe (bottom - top).
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]

        # 5. Position für die Zentrierung berechnen (FACE_SIZE ist 1000)
        face_size = face_img.size[0] # face_img ist 1000x1000
        x = (face_size - text_width) / 2
        y = (face_size - text_height) / 2

        # 6. Text auf das Bild zeichnen
        # Beachte: draw.text ignoriert die bbox[0] und bbox[1] Offsets, daher können wir direkt x, y verwenden
        draw.text((x, y), text, font=font, fill=fill_color)
        
        # --- Ende Text Rendering ---


        
        # Erstelle den Ausgabepfad (speichert im aktuellen Pfad)
        output_path = f"{name}.png" 
        
        face_img = ImageOps.mirror(face_img)
        face_img = face_img.rotate(rotation)
        # Speichere das Teilbild
        # Speichere immer als PNG, um Qualität zu erhalten
        face_img.save(output_path, format="PNG") 
        
        print(f"Gespeichert: {output_path} (von Gitterposition [{col},{row}])")

    print("\nAufteilung erfolgreich abgeschlossen.")

# --- Anwendung ---
# Führt die Funktion mit der Standardeingabe "cube.png" aus
split_cubemap_t_layout_simple()
