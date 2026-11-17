# Astra Survival

[Play Astra Survival](https://arthamegayasa.github.io/astra-survival/)

The sky broke. The pieces kept us. Now we keep the light.

Choose a Vanguard, Ranger or Oracle and survive twenty Pulses across Lantern Market, Chapel of Ash and the Last Vineyard. Your weapon fires automatically. Move through the arena, collect Glint from the fallen, and unleash your class Rite when enemies close in.

## How to play

- Use WASD or the arrows to move, Space to cast your Rite, and Escape to pause. Keyboard bindings, sound levels and reduced effects are available under Settings.
- On a touchscreen, use the left stick and the Rite button. Landscape gives the arena more room.
- Between Pulses, choose earned level upgrades, spend Glint in the Glazier's shop, or reroll the stock. Copies improve an item up to tier III. Two different items with the same tag activate their synergy.
- Defeat the bosses on Pulses 7, 14 and 20. Silt earned at the end of an expedition unlocks new Keepsakes in the Archives. Victories open higher threat levels.
- The game saves locally at the beginning of every Pulse and after shop decisions. Select **Continue** on the title screen to return. Leaving explicitly abandons the expedition.

## Development

Serve the repository root over HTTP. For example, run `python -m http.server 8000` and open `http://localhost:8000`. Run the regression suite with `npm test`.

The game uses native JavaScript modules, fixed-step simulation, a Canvas pixel-art diorama and an original synthesized Web Audio score. The release has no external runtime dependencies. [Asset credits](docs/credits.md).
