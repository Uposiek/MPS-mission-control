MPS Mission Control v3.1 — CACHE FIX

Problem: zainstalowana PWA potrafiła trzymać CSS ze starszej wersji. Efekt: wszystkie zakładki były renderowane jedna pod drugą, a dolny pasek nawigacji nie był widoczny.

Naprawa: v3.1 używa nowych nazw plików style-v31.css / app-v31.js / service-worker-v31.js, więc iOS nie może pomylić ich ze starym cache.

Wgraj do GŁÓWNEGO katalogu repo:
- index.html (zastąp stary)
- style-v31.css (nowy)
- app-v31.js (nowy)
- service-worker-v31.js (nowy)
- manifest.json (może zastąpić stary)

Starych style.css, app.js i service-worker.js nie musisz usuwać. Nowy index ich nie używa.

Po commicie:
1. odczekaj aż GitHub Pages zrobi deployment,
2. całkowicie zamknij MPS Control z przełącznika aplikacji,
3. uruchom ponownie,
4. na górze powinno być: PWA v3.1 CACHE FIX,
5. zakładki powinny być na stałe na dole ekranu.

Dane zapisane w localStorage pozostają — klucz danych nie został zmieniony.
