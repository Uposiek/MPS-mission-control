MPS MISSION CONTROL — LIVE v6.2 PL / EN
MPS BADGE + REBUILD 2026 BUILD SHEET

NOWOŚCI
=======
1. Nagłówek "Odbiór Mazdy" zastąpiony znaczkiem MPS z grafiki użytkownika.
2. GARAŻ -> REMONT 2026 // BUILD SHEET.
3. Lista remontowa została zasiana automatycznie do IndexedDB przy pierwszym
   uruchomieniu v6.2 — nie trzeba wpisywać 53 pozycji ręcznie.
4. Pozycje można:
   - filtrować,
   - wyszukiwać,
   - edytować,
   - usuwać,
   - dodawać,
   - oznaczyć hurtowo jako ZAMONTOWANE,
   - eksportować do CSV.
5. Wszystkie kwoty z listy warsztatu są zapisane jako NETTO.

KONTROLA SUM
============
Części / obróbka / materiały: 36,575.00 PLN netto
Robocizna:                     8,550.00 PLN netto
Łącznie:                       45,125.00 PLN netto
Zaliczka:                      20,000.00 PLN
Pozostało po zaliczce:         25,125.00 PLN

Zaliczka NIE jest traktowana jako ujemny koszt auta — to tylko rozliczenie płatności.

DANE
====
Ta wersja używa TEJ SAMEJ bazy IndexedDB:
MPSMissionControl_v6

Czyli aktualizacja z v6/v6.1 nie kasuje tankowań, serwisów ani innych danych.
Nowe pole Build Sheet zostanie dodane do istniejącej bazy.

PODMIANA NA GITHUBIE
====================
Wrzuć do root repo MPS-mission-control:
- index.html
- style-v62.css
- app-v62.js
- i18n-v62.js
- sw-v62.js
- manifest.json
- mps-badge.png
- icon-192.png
- icon-512.png
- apple-touch-icon.png

Starych style-v61.css / app-v61.js / i18n-v61.js / sw-v61.js nie musisz usuwać.
Nowy index.html ich nie używa.

Po Commit changes:
1. Poczekaj na GitHub Pages deployment.
2. Zamknij całkowicie PWA MPS Control.
3. Uruchom ponownie.
4. Nagłówek powinien pokazać chromowany znaczek MPS.
5. GARAŻ -> REMONT 2026 // BUILD SHEET.
