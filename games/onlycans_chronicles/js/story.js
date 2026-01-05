/* story.js — content/data only.
   Edit this file to expand the narrative without touching the engine.
*/
const GAME_DATA = {
  assets: {
    images: {
      logo: "assets/images/logo.png",
      bg_dojo: "assets/images/bg_dojo.png",
      bg_breakroom: "assets/images/bg_breakroom.png",
      bg_neon_alley: "assets/images/bg_neon_alley.png",
      bg_phone: "assets/images/bg_phone.png",

      jason: "assets/images/jason.png",
      david: "assets/images/david.png",
      priscilla: "assets/images/priscilla.png",
    },
    audio: {
      music: {
        menu: "assets/audio/menu_theme.mp3",
        dojo: "assets/audio/mood_dojo.mp3",
        breakroom: "assets/audio/mood_breakroom.mp3",
        heart: "assets/audio/mood_heart.mp3",
      },
      sfx: {
        click: "assets/audio/sfx_click.mp3",
        punch: "assets/audio/sfx_punch.mp3",
        slap: "assets/audio/sfx_slap.mp3",
        kiss: "assets/audio/sfx_kiss.mp3",
        laugh: "assets/audio/sfx_laugh.mp3",
        cry: "assets/audio/sfx_cry.mp3",

        heart8: "assets/audio/sfx_heart8.mp3",
        punch8: "assets/audio/sfx_punch8.mp3",
        tear8: "assets/audio/sfx_tear8.mp3",
      }
    },
    videos: {
      gm_screen: "assets/videos/gm_gamescreen.webm"
    }
  },

  characters: {
    NARRATOR: { name: "Narrator", portrait: null, side: "none" },
    JASON: { name: "Jason", portrait: "jason", side: "left" },
    DAVID: { name: "David", portrait: "david", side: "right" },
    PRISCILLA: { name: "Priscilla", portrait: "priscilla", side: "right" },
  },

  startNode: "n_start",

  // Starting stats. Tweak these to change the "default vibe".
  initialState: {
    stats: { respect: 45, tension: 25, spark: 0 },
  },

  nodes: {
    n_start: {
      scene: { bg: "bg_dojo", video: "gm_screen", music: "dojo" },
      portraits: { left: "JASON", right: "DAVID" },
      speaker: "NARRATOR",
      text: "The neon sign outside **Dojo Suki Suki** buzzes. The scent of sweat and cum hangs in the air.\n\n" +
        "It’s late. Jason is sick, gay, and looking for a fight.\n\n" +
        "Inside, poorly made hip hop music blares from a cheap Bluetooth speaker, and David is practicing his jujitsu moves.",
      choices: [
        { text: "Step into the dojo.", next: "n_david_intro", effects: [{ type: "sfx", name: "click" }] },
        { text: "Turn around and go home to cry like a pussy about dead dad.", next: "end_escape", effects: [{ type: "stat", name: "respect", delta: +5 }] },
      ]
    },

    n_david_intro: {
      scene: { bg: "bg_dojo", music: "dojo" },
      speaker: "DAVID",
      text: "David stands on the mats in brand-new gear like it’s armor. He’s looking as stupid as he sounds.\n\n" +
        "“You gonna **stand there** or kiss me?”",
      choices: [
        { text: "Jason: “Relax. I’m here to… uh… talk.”", next: "n_jason_opening", effects: [{ type: "stat", name: "respect", delta: +3 }] },
        { text: "Jason: “Nice dojo. Smells like B.O. and cum. That all from you, bro?”", next: "n_mock_dj", effects: [{ type: "stat", name: "tension", delta: +12 }, { type: "sfx", name: "laugh" }] },
        { text: "Jason: “Your girl Priscilla texted me.”", next: "n_priscilla_grenade", effects: [{ type: "stat", name: "tension", delta: +8 }, { type: "stat", name: "spark", delta: +2 }] },
        { text: "Jason: “You're looking cute in that gi?”", next: "n_breakroom_talk", effects: [{ type: "stat", name: "respect", delta: +6 }] },
      ]
    },

    n_jason_opening: {
      scene: { bg: "bg_dojo", music: "dojo" },
      speaker: "JASON",
      text: "Jason tries to look confident. The cum stains on his shirt make it hard to believe.\n\n" +
        "“Look, I’m not here to start anything. Unless you threaten to kick my ass again bro.”",
      choices: [
        { text: "Ask about cum smell in the dojo (unexpected concern).", next: "n_ask_jiu", effects: [{ type: "stat", name: "respect", delta: +10 }] },
        { text: "Take shirt off and flex (habit).", next: "n_joke_anyway", effects: [{ type: "stat", name: "tension", delta: +6 }, { type: "sfx", name: "laugh" }] },
        { text: "Bring up Priscilla and David looking like a Cuck (chaos).", next: "n_priscilla_grenade", effects: [{ type: "stat", name: "tension", delta: +6 }] },
      ]
    },

    n_mock_dj: {
      scene: { bg: "bg_dojo", music: "dojo" },
      speaker: "DAVID",
      text: "David’s voice cracks a little when he steps forward to answer Jason’s insult.\n\n" +
        "“Say that again and I’ll show you what it’s like to be on the receiving end.”",
      choices: [
        { text: "Double down. “I wouldn’t even play this shit if I were gay.”", next: "n_double_down", effects: [{ type: "stat", name: "tension", delta: +18 }] },
        { text: "Backpedal hard. “Kidding. I’m just sad my dad is dead.”", next: "n_apologize", effects: [{ type: "stat", name: "tension", delta: -10 }, { type: "stat", name: "respect", delta: +8 }] },
        { text: "Change the subject: “So… you ever spar with anyone while covered in baby oil?”", next: "n_ask_jiu", effects: [{ type: "stat", name: "respect", delta: +5 }] },
      ]
    },

    n_joke_anyway: {
      speaker: "JASON",
      text: "Jason’s now shirtless. His mildly overweight torso glistens from the sweat he accumulated from walking in.\n\n" +
        "“Looking a little scared, bro. This is what 38 and gay looks like.”\n\n" +
        "David chuckles and returns to practicing his jujitsu moves. Ignoring Jason’s insult.",
      choices: [
        { text: "Jason: “I’ll show you what these fat tits can do.”", next: "n_double_down", effects: [{ type: "stat", name: "tension", delta: +12 }] },
        { text: "Jason: “Okay okay, I’m sorry. I’m just sick and gay”", next: "n_apologize", effects: [{ type: "stat", name: "respect", delta: +6 }, { type: "stat", name: "tension", delta: -6 }] },
      ]
    },

    n_double_down: {
      speaker: "DAVID",
      text: "David steps closer. Too close.\n\n" +
        "“You think I’m a joke? Put your phone down and **try not to die** for 60 seconds.”",
      choices: [
        { text: "Accept the challenge. “Fine. One minute, I've got to grease these tits up more.”", next: "n_roll_start", effects: [{ type: "stat", name: "tension", delta: +6 }, { type: "sfx", name: "click" }] },
        { text: "Refuse. “Nope. I'd rather cry alone in the locker room.”", next: "end_beatdown", effects: [{ type: "stat", name: "tension", delta: +10 }] },
        { text: "Try diplomacy: “I’m not here to beef, bro. I'm just here to wrestle shirtless with you.”", next: "n_breakroom_talk", effects: [{ type: "stat", name: "respect", delta: +6 }, { type: "stat", name: "tension", delta: -6 }] },
      ]
    },

    n_apologize: {
      speaker: "JASON",
      text: "David forms prayer hands and bows.\n\n" +
        "“I knew my moves would be too gay for you to handle, bro.”",
      choices: [
        { text: "Ask about naked jujitsu.", next: "n_ask_jiu", effects: [{ type: "stat", name: "respect", delta: +8 }] },
        { text: "Ask if Priscilla is okay with Gay Jujitsu.", next: "n_priscilla_soft", effects: [{ type: "stat", name: "respect", delta: +4 }, { type: "stat", name: "spark", delta: +2 }] },
        { text: "Ask about cum smell in the dojo.", next: "n_breakroom_talk", effects: [{ type: "stat", name: "respect", delta: +6 }] },
      ]
    },

    n_ask_jiu: {
      speaker: "DAVID",
      text: "David’s posture shifts from “let’s make out” to “I’m a faggot”.\n\n" +
        "“Yeah. I started recently. It’s real. It’s not like your fantasy football thing. We all listen to shitty music and suck dick.”",
      choices: [
        { text: "Jason: “Show me one move. I’ll be respectful.”", next: "n_roll_start", effects: [{ type: "stat", name: "respect", delta: +6 }] },
        { text: "Jason: “Okay but… does it teach anger management?”", next: "n_breakroom_talk", effects: [{ type: "stat", name: "respect", delta: +4 }] },
        { text: "Jason: “Cool. Still think your music is cursed though.”", next: "n_double_down", effects: [{ type: "stat", name: "tension", delta: +10 }, { type: "sfx", name: "laugh" }] },
      ]
    },

    n_breakroom_talk: {
      scene: { bg: "bg_breakroom", music: "breakroom" },
      speaker: "DAVID",
      text: "For a second, the dojo vibe flickers into the work breakroom: flickering lights, sad vending machines, and the smell of microwaved regret.\n\n" +
        "David exhales. “I’m underpaid. I do the work of three people. And everyone thinks it’s funny.”",
      choices: [
        { text: "Jason: “Yeah… that’s fair. I’ve been kind of a jerk.”", next: "n_truce_seed", effects: [{ type: "stat", name: "respect", delta: +15 }] },
        { text: "Jason: “Welcome to adulthood, kid.” (condescending)", next: "n_david_spike", effects: [{ type: "stat", name: "tension", delta: +15 }] },
        { text: "Jason: “Want me to talk to the boss with you?”", next: "n_truce_seed", effects: [{ type: "stat", name: "respect", delta: +10 }, { type: "stat", name: "spark", delta: +2 }] },
      ]
    },

    n_david_spike: {
      speaker: "DAVID",
      text: "David’s face tightens.\n\n" +
        "“Don’t call me ‘kid’ like you’re some wise elder. You live with your mom.”",
      choices: [
        { text: "Jason: “Fair. I deserved that.”", next: "n_truce_seed", effects: [{ type: "stat", name: "respect", delta: +6 }, { type: "stat", name: "tension", delta: -8 }] },
        { text: "Jason: “At least my music isn’t illegal.”", next: "n_double_down", effects: [{ type: "stat", name: "tension", delta: +12 }, { type: "sfx", name: "laugh" }] },
      ]
    },

    n_priscilla_grenade: {
      scene: { bg: "bg_phone", music: "breakroom" },
      speaker: "DAVID",
      text: "The name **Priscilla** hits the room like someone dropped a cymbal.\n\n" +
        "David’s eyes dart to your pocket. “She texting you right now?”",
      choices: [
        { text: "Show the phone. “We’re friends. That’s it.”", next: "n_priscilla_show_text", effects: [{ type: "stat", name: "tension", delta: +6 }, { type: "stat", name: "spark", delta: +4 }] },
        { text: "Hide the phone. “Nope.” (lie badly)", next: "n_priscilla_hide", effects: [{ type: "stat", name: "tension", delta: +10 }] },
        { text: "Call Priscilla on speaker (maximum chaos).", next: "n_priscilla_call", effects: [{ type: "stat", name: "tension", delta: +8 }, { type: "sfx", name: "click" }] },
      ]
    },

    n_priscilla_soft: {
      scene: { bg: "bg_phone", music: "breakroom" },
      speaker: "JASON",
      text: "Jason chooses the careful tone… the one he usually saves for angry teenagers and IRS letters.\n\n" +
        "“About Priscilla… I didn’t mean to rub anything in your face.”",
      choices: [
        { text: "David: “You did. But… go on.”", next: "n_priscilla_show_text", effects: [{ type: "stat", name: "respect", delta: +6 }] },
        { text: "Jason: “Let’s not talk about her. Let’s talk about you.”", next: "n_truce_seed", effects: [{ type: "stat", name: "spark", delta: +4 }, { type: "stat", name: "tension", delta: -6 }] },
      ]
    },

    n_priscilla_show_text: {
      speaker: "JASON",
      text: "You hold up your phone.\n\n" +
        "Text from Priscilla: “**u at the dojo??** 👀”\n\n" +
        "Jason: “See? She texts everyone like that. It’s… her brand.”",
      choices: [
        { text: "David: “She’s doing it on purpose.”", next: "n_priscilla_jealous", effects: [{ type: "stat", name: "tension", delta: +10 }] },
        { text: "Jason: “I’ll set boundaries.”", next: "n_boundary", effects: [{ type: "stat", name: "respect", delta: +10 }, { type: "stat", name: "tension", delta: -8 }] },
        { text: "Jason: “Look, she’s my friend. You don’t get to police it.”", next: "n_david_spike2", effects: [{ type: "stat", name: "tension", delta: +12 }] },
      ]
    },

    n_priscilla_hide: {
      speaker: "DAVID",
      text: "David narrows his eyes.\n\n" +
        "“Your face just did that thing where it lies.”\n\n" +
        "He steps closer. “Hand me the phone.”",
      choices: [
        { text: "Hand it over. (Fine.)", next: "n_priscilla_show_text", effects: [{ type: "stat", name: "respect", delta: +4 }, { type: "stat", name: "tension", delta: -4 }] },
        { text: "Nope. “Touch my phone and I’ll cry.”", next: "n_roll_start", effects: [{ type: "stat", name: "tension", delta: +8 }] },
      ]
    },

    n_priscilla_call: {
      speaker: "PRISCILLA",
      text: "Priscilla answers immediately, like she was waiting with the phone already in her hand.\n\n" +
        "“Baaabes. Is David there too? Put me on speaker.”",
      choices: [
        { text: "Jason: “No.” (firm boundaries)", next: "n_boundary", effects: [{ type: "stat", name: "respect", delta: +12 }] },
        { text: "Jason: “Yep. You’re on speaker.” (chaos)", next: "n_priscilla_jealous", effects: [{ type: "stat", name: "tension", delta: +18 }, { type: "sfx", name: "laugh" }] },
        { text: "Hang up. Pretend the call dropped. (coward magic)", next: "n_truce_seed", effects: [{ type: "stat", name: "tension", delta: -6 }, { type: "stat", name: "respect", delta: +4 }] },
      ]
    },

    n_boundary: {
      speaker: "JASON",
      text: "Jason types with the determination of a man trying to survive a group chat.\n\n" +
        "Message to Priscilla: “Hey. I’m busy. Please don’t stir stuff up.”\n\n" +
        "Jason: “There. Boundaries. Like a grown-up.”",
      choices: [
        { text: "David seems surprised. Keep talking.", next: "n_truce_seed", effects: [{ type: "stat", name: "spark", delta: +6 }, { type: "particles", kind: "heart", count: 16 }, { type: "sfx", name: "heart8" }] },
        { text: "Switch to jujitsu. “Now fold me, sensei.”", next: "n_roll_start", effects: [{ type: "stat", name: "respect", delta: +4 }] },
      ]
    },

    n_david_spike2: {
      speaker: "DAVID",
      text: "David laughs once. Not happy.\n\n" +
        "“You don’t get to act righteous about her. You’re part of the whole mess.”",
      choices: [
        { text: "Jason: “You’re right. I’m sorry.”", next: "n_truce_seed", effects: [{ type: "stat", name: "respect", delta: +10 }, { type: "stat", name: "tension", delta: -10 }] },
        { text: "Jason: “Mess? I’m a **vibe**.” (no you’re not)", next: "n_double_down", effects: [{ type: "stat", name: "tension", delta: +12 }] },
      ]
    },

    n_priscilla_jealous: {
      speaker: "DAVID",
      text: "David’s jaw tightens.\n\n" +
        "“She’s playing games. And you’re letting her.”\n\n" +
        "He points at the mats. “Roll. Now.”",
      choices: [
        { text: "Roll. “Fine.”", next: "n_roll_start", effects: [{ type: "stat", name: "tension", delta: +8 }] },
        { text: "Defuse: “Okay. Deep breath. She’s not worth this.”", next: "n_truce_seed", effects: [{ type: "stat", name: "respect", delta: +8 }, { type: "stat", name: "tension", delta: -10 }] },
        { text: "Mock him. “Still obsessed, huh?”", next: "end_beatdown", effects: [{ type: "stat", name: "tension", delta: +20 }] },
      ]
    },

    n_roll_start: {
      scene: { bg: "bg_dojo", music: "dojo" },
      speaker: "NARRATOR",
      text: "You step onto the mats.\n\n" +
        "David circles like he’s seen exactly two jujitsu videos and took them personally.\n\n" +
        "Jason’s brain: **this is a bad idea.**\n" +
        "Jason’s mouth: “I’m built different.”",
      choices: [
        { text: "Let David demonstrate (try to learn).", next: "n_roll_close", effects: [{ type: "stat", name: "respect", delta: +6 }] },
        { text: "Try to ‘win’ immediately (you won’t).", next: "n_roll_fail", effects: [{ type: "stat", name: "tension", delta: +10 }] },
        { text: "Crack a joke mid-roll. (dangerous)", next: "n_roll_joke", effects: [{ type: "stat", name: "tension", delta: +6 }, { type: "sfx", name: "laugh" }] },
      ]
    },

    n_roll_fail: {
      speaker: "NARRATOR",
      text: "Jason lunges.\n\n" +
        "David pivots.\n\n" +
        "Gravity votes against you.\n\n" +
        "You land with the elegance of a dropped couch.",
      choices: [
        { text: "Tap. Immediately. Preserve your spine.", next: "n_after_tap", effects: [{ type: "sfx", name: "punch" }, { type: "particles", kind: "tear", count: 18 }, { type: "sfx", name: "tear8" }, { type: "stat", name: "tension", delta: +6 }] },
        { text: "Refuse to tap (heroic stupidity).", next: "end_beatdown", effects: [{ type: "stat", name: "tension", delta: +20 }] },
      ]
    },

    n_roll_joke: {
      speaker: "JASON",
      text: "David catches your sleeve.\n\n" +
        "Jason blurts, “So is this the part where we… cuddle competitively?”",
      choices: [
        { text: "David: “Shut up.” (he is blushing a little)", next: "n_roll_close", effects: [{ type: "stat", name: "spark", delta: +8 }, { type: "stat", name: "tension", delta: -4 }] },
        { text: "David: “You talk too much.” (he cranks harder)", next: "n_roll_fail", effects: [{ type: "stat", name: "tension", delta: +10 }] },
      ]
    },

    n_roll_close: {
      speaker: "NARRATOR",
      text: "David demonstrates a simple control position. It’s… effective.\n\n" +
        "You’re face-to-face. Too close. Like a rom-com, except everyone is sweaty and making questionable life choices.\n\n" +
        "David: “Breathe. Don’t panic.”",
      choices: [
        { text: "Jason: “I’m not panicking. This is my normal face.”", next: "n_after_tap", effects: [{ type: "stat", name: "respect", delta: +6 }] },
        { text: "Jason panics a little (but honest).", next: "n_after_tap", effects: [{ type: "stat", name: "spark", delta: +6 }] },
        { text: "Get weird and flirt back. (dangerous, hilarious)", next: "n_heart_turn", requires: { stat: "spark", gte: 18 }, effects: [{ type: "stat", name: "spark", delta: +6 }, { type: "particles", kind: "heart", count: 22 }, { type: "sfx", name: "heart8" }] },
      ]
    },

    n_after_tap: {
      speaker: "DAVID",
      text: "David releases and offers a hand up.\n\n" +
        "“You’re not totally hopeless. Just… loud.”\n\n" +
        "For a second, he looks less angry — more… tired.\n\n" +
        "David: “Why do you act like everything’s a joke?”",
      choices: [
        { text: "Jason opens up: sobriety, dad stuff, life pressures.", next: "n_open_up", effects: [{ type: "stat", name: "respect", delta: +12 }, { type: "stat", name: "spark", delta: +4 }] },
        { text: "Jason deflects with humor (classic).", next: "n_deflect", effects: [{ type: "stat", name: "tension", delta: +4 }, { type: "sfx", name: "laugh" }] },
        { text: "Jason gets defensive. “Because it is.”", next: "n_defensive", effects: [{ type: "stat", name: "tension", delta: +10 }] },
      ]
    },

    n_open_up: {
      scene: { bg: "bg_dojo", music: "heart" },
      speaker: "JASON",
      text: "Jason surprises himself.\n\n" +
        "“I’m seven years sober. I’ve got a sixteen-year-old at home. I’m trying to be a good dad… even when I screw up everything else.”\n\n" +
        "He scratches his beard. “Jokes are… cheaper than therapy.”",
      choices: [
        { text: "David softens. Keep going.", next: "n_david_soften", effects: [{ type: "stat", name: "respect", delta: +10 }, { type: "stat", name: "tension", delta: -8 }] },
        { text: "Bail out of feelings: “Anyway! Punch me again.”", next: "n_truce_seed", effects: [{ type: "stat", name: "respect", delta: +4 }, { type: "sfx", name: "laugh" }] },
      ]
    },

    n_david_soften: {
      speaker: "DAVID",
      text: "David looks at you like he’s re-scanning a barcode he thought was fake.\n\n" +
        "“I didn’t know that.”\n\n" +
        "He hesitates. “I… overreact a lot. I’m working on it.”\n\n" +
        "Then, very quietly: “You smell like laundry soap.”",
      choices: [
        { text: "Jason: “That’s my mom’s detergent. Don’t judge me.”", next: "n_heart_turn", effects: [{ type: "stat", name: "spark", delta: +6 }, { type: "particles", kind: "heart", count: 12 }] },
        { text: "Jason: “Thanks? I think?”", next: "n_truce_seed", effects: [{ type: "stat", name: "respect", delta: +6 }] },
        { text: "Jason: “Are you flirting with me right now?”", next: "n_heart_turn", effects: [{ type: "stat", name: "spark", delta: +10 }, { type: "particles", kind: "heart", count: 18 }, { type: "sfx", name: "heart8" }] },
      ]
    },

    n_deflect: {
      speaker: "JASON",
      text: "Jason shrugs.\n\n" +
        "“Because if I take life seriously I’ll have to schedule my breakdown, and I’m booked.”",
      choices: [
        { text: "David sighs. “You’re impossible.”", next: "n_truce_seed", effects: [{ type: "stat", name: "respect", delta: +4 }, { type: "stat", name: "tension", delta: -2 }] },
        { text: "David snaps. “You’re avoiding.”", next: "n_defensive", effects: [{ type: "stat", name: "tension", delta: +8 }] },
      ]
    },

    n_defensive: {
      speaker: "DAVID",
      text: "David’s temper flickers.\n\n" +
        "“You want to clown me, clown your life, clown everything… and then act surprised when people don’t like you.”",
      choices: [
        { text: "Jason apologizes and tries again.", next: "n_open_up", effects: [{ type: "stat", name: "respect", delta: +6 }, { type: "stat", name: "tension", delta: -6 }] },
        { text: "Jason squares up. “Okay. Let’s go.”", next: "end_beatdown", effects: [{ type: "stat", name: "tension", delta: +18 }] },
        { text: "Jason walks out. “I can’t do this tonight.”", next: "end_escape", effects: [{ type: "stat", name: "respect", delta: +2 }] },
      ]
    },

    n_truce_seed: {
      scene: { bg: "bg_dojo", music: "dojo" },
      speaker: "DAVID",
      text: "The vibe settles.\n\n" +
        "David: “Look… I don’t have to hate you. But you have to stop poking me like I’m a zoo animal.”\n\n" +
        "Jason: “Fair.”",
      choices: [
        { text: "Offer a truce and a fresh start.", next: "end_truce", effects: [{ type: "stat", name: "respect", delta: +6 }] },
        { text: "Ask David to teach you properly (get in shape for real).", next: "end_membership", requires: { stat: "respect", gte: 55 }, effects: [{ type: "stat", name: "respect", delta: +10 }] },
        { text: "Tell him you’re done talking about Priscilla forever.", next: "end_teamup", requires: { stat: "respect", gte: 50 }, effects: [{ type: "stat", name: "respect", delta: +6 }] },
        { text: "One more joke. Just one. (you cannot help yourself)", next: "end_beatdown", effects: [{ type: "stat", name: "tension", delta: +20 }, { type: "sfx", name: "laugh" }] },
      ]
    },

    n_heart_turn: {
      scene: { bg: "bg_dojo", music: "heart" },
      speaker: "NARRATOR",
      text: "The dojo’s neon hum turns softer, like the building itself is eavesdropping.\n\n" +
        "David stands close. Jason’s brain tries to file the moment under “Nope.”\n\n" +
        "Unfortunately, the filing cabinet is on fire.",
      choices: [
        { text: "Lean in. (softcore, fade-to-neon)", next: "end_neon_heart", requires: { stat: "spark", gte: 20, stat2: "tension", lte2: 60 }, effects: [{ type: "sfx", name: "kiss" }, { type: "particles", kind: "heart", count: 36 }, { type: "sfx", name: "heart8" }] },
        { text: "Back away, awkward but respectful.", next: "end_truce", effects: [{ type: "stat", name: "respect", delta: +6 }] },
        { text: "Crack a joke to survive your own emotions.", next: "end_membership", effects: [{ type: "stat", name: "respect", delta: +8 }, { type: "sfx", name: "laugh" }] },
      ]
    },

    /* ENDINGS */
    end_escape: {
      scene: { bg: "bg_neon_alley", music: "breakroom" },
      speaker: "NARRATOR",
      end: {
        title: "Strategic Retreat",
        text: "Jason turns around and leaves.\n\n" +
          "Outside, the neon alley is quiet. Peaceful. Slightly haunted.\n\n" +
          "You live to make dumb choices another day."
      }
    },

    end_beatdown: {
      scene: { bg: "bg_dojo", music: "dojo" },
      speaker: "NARRATOR",
      onEnter: [
        { type: "sfx", name: "punch" },
        { type: "particles", kind: "punch", count: 28 },
        { type: "sfx", name: "punch8" },
        { type: "sfx", name: "cry" },
        { type: "particles", kind: "tear", count: 22 },
        { type: "sfx", name: "tear8" },
      ],
      end: {
        title: "Jason’s Demise (Mostly Ego)",
        text: "David catches you in something that feels legal in a dojo but illegal in polite society.\n\n" +
          "Jason taps like a woodpecker with anxiety.\n\n" +
          "David: “Next time, don’t talk trash.”\n\n" +
          "Jason: “Next time I’m bringing bubble wrap.”"
      }
    },

    end_truce: {
      scene: { bg: "bg_dojo", music: "dojo" },
      speaker: "NARRATOR",
      end: {
        title: "Truce on the Mats",
        text: "You and David don’t become best friends.\n\n" +
          "But you stop being enemies.\n\n" +
          "Sometimes that’s the real fantasy ending."
      }
    },

    end_membership: {
      scene: { bg: "bg_dojo", music: "dojo" },
      speaker: "NARRATOR",
      end: {
        title: "Dojo Membership (Financially Questionable)",
        text: "Jason signs up for lessons.\n\n" +
          "David acts smug for exactly eight seconds, then immediately becomes a terrifyingly enthusiastic coach.\n\n" +
          "Jason’s abs file a formal complaint."
      }
    },

    end_teamup: {
      scene: { bg: "bg_phone", music: "breakroom" },
      speaker: "NARRATOR",
      end: {
        title: "Two Dudes vs. Chaos",
        text: "You and David agree on one thing: Priscilla thrives on drama.\n\n" +
          "You both set boundaries.\n\n" +
          "The dojo becomes a sacred space: no texting, no triangles, just terrible music and slightly better life choices."
      }
    },

    end_neon_heart: {
      scene: { bg: "bg_dojo", music: "heart" },
      speaker: "NARRATOR",
      end: {
        title: "Neon Heartbeat",
        text: "Jason leans in like a man stepping onto ice he did not test.\n\n" +
          "David meets him halfway.\n\n" +
          "The dojo sign outside buzzes brighter, like it’s cheering.\n\n" +
          "No one speaks about it at work.\n\n" +
          "At least… not yet."
      }
    },
  }
};
