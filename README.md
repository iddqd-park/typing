# Arcade Typing (실전 타자연습)

[한국어 문서](./README.ko.md)

**Arcade Typing** is a retro-style typing game designed to test your keyboard skills under pressure. It moves beyond simple practice, offering unique themes like "K-Memes" and "Complex Apartment Names" powered by a physics-based word drop engine.

# Our Philosophy
IDDQD Internet builds zero-DB, zero-signup tools powered by pure HTML/JS for instant browser execution. Even with AI features, we keep it stateless and record-free.

### [Play Arcade Typing](https://game.iddqd.kr/typing)

![Splash Screen](./splash.jpeg)

## Features
-   **Physics-Based Gameplay**: Words don't just fall; they collide, stack, and tumble, adding dynamic tension to the game.
-   **Retro Arcade Visuals**: Features CRT scanline effects, neon typography, and glitch aesthetics to recreate the 90s arcade vibe.
-   **Unique Themes**:
    -   **Trend Words**: Modern slang and internet buzzwords.
    -   **K-Meme Quotes**: Famous lines from Korean comics and memes (e.g., Kim Sung-mo).
    -   **Hell Apartment**: Absurdly long and complex Korean apartment names.
-   **Local Certificate System**: Upon game over, generate a downloadable "Keyboard Destruction Certificate" image directly in your browser.
-   **Procedural Audio**: Reactive sound effects generated via Web Audio API.

## Usage
**Objective**: Destroy falling words by typing them before they fill the screen!

1.  **Select Stage**: Choose a theme (New Trends, Memes, or Hell Apartments).
2.  **Type & Destroy**:
    -   Type the falling words exactly as shown.
    -   Press **Enter** to fire.
    -   **Tip**: Spaces can be ignored for faster typing!
3.  **Survival**: As you level up, words fall faster and pile up. If they reach the top, it's Game Over.
4.  **Result**: Check your score and generate your certificate.

## Tech Stack
-   **Frontend**: HTML5, CSS3, JavaScript (jQuery)
-   **UI**: Bootstrap 5
-   **Audio**: Web Audio API (Synthesized SFX) + HTML5 Audio (BGM)
-   **Physics**: Custom AABB Physics Logic
-   **Tools**: html2canvas (Certificate Generation)

# Contact & Author
Park Sil-jang
- Dev Team Lead at IDDQD Internet. E-solution & E-game Lead. Bushwhacking Code Shooter. Currently executing mandates as Choi’s Schemer.
- HQ (EN): https://en.iddqd.kr/
- GitHub: https://github.com/iddqd-park
