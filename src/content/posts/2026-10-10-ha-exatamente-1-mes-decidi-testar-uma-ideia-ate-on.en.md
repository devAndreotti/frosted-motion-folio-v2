---
title: "Memory Apartment: Developing a Psychological Horror Game in Godot 4"
date: 2026-10-10
time: "16:19"
description: "From narrative to technical architecture: how I am building a 3D psychological horror game set in 2003 with Godot 4, Blender and diegetic UI."
tags: [godot, gamedev, indiegame, blender, horror]
draft: false
source: cf0eb6b98df8
---

*Originally published on [LinkedIn](https://www.linkedin.com/feed/update/urn:li:activity:7512846421105139712/) on 10/10/2026.*

I decided to test an idea that seemed improbable: how far could I go building an original 3D game by combining modern developer workflows, generative AI tools for fast prototyping, and open-source game engines.

What began as a weekend experiment has turned into my most ambitious project: **Memory Apartment**.

## The meeting ground of narrative and engineering

Before entering Computer Science college, writing fiction was one of my central creative outlets. I created intricate stories, characters, and settings that usually ended up locked away in notebooks.

As my technical background matured, I realized programming allowed me to turn these narratives into interactive worlds:

> Instead of simply reading about a dark corridor or a phone ringing in the dead of night, the player has to take the step, open the door, and face the stillness of the room.

## The premise of Edifício Primavera

The narrative puts you in the shoes of a software developer working remotely from home in early 2003:

- A new political administration takes power amid social tension and censorship;
- You move into apartment 17 of Edifício Primavera;
- While trying to sustain your delivery routine, subtle spatial anomalies stack up: doors looping back into the same room, unaddressed envelopes, and cassette recordings carrying your own voice.

## Inventory System and diegetic interface

To deepen the vintage early-2000s atmosphere, I avoided generic floating HUD menus. The inventory was built as a physical diegetic interface inspired by *Zero Parades*, where objects carry tactile weight and technical descriptions:

```gdscript
# Gerenciamento de itens inspecionáveis no inventário diegético
func inspect_item(item_resource: ItemData) -> void:
    viewport_3d_preview.display_mesh(item_resource.mesh)
    audio_player.play_sfx(item_resource.handling_sound)
    item_label.text = item_resource.item_name
```

Over 200 assets have already been modeled and rendered in Blender to feed this inventory system: vintage keys, technical programming manuals, 3.5-inch floppy disks, and handwritten memos.

## The simulated personal computer

Because the story takes place in October 2003, a central gameplay mechanic is the protagonist's CRT monitor workstation. I built an in-game interface simulating an era-accurate operating system (inspired by Windows XP), featuring command prompts, chat clients, and text editors the player operates to uncover corporate conspiracies.

There is still a long roadmap of physics tuning, lighting passes, and testing ahead, but uniting storytelling, shaders, procedural sound, and code inside Godot 4 has rekindled the pure craft of worldbuilding.

---

### Mídia da publicação

![Mídia do post no LinkedIn](/blog/ha-exatamente-1-mes-decidi-testar-uma-ideia-ate-on/midia-1.jpg)
