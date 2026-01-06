let currentState = 'step1';
let tosVersion = 1;
const adImage = 'pats_ad.jpeg';

// audio variables
let audioCtx;
let gainNode;

// initialize audio: generates white noise and starts at low volume
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const bufferSize = 2 * audioCtx.sampleRate;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.02; // start quiet

    whiteNoise.connect(gainNode).connect(audioCtx.destination);
    whiteNoise.start();
  }
}

// increase ambient noise by ~3.5%
function increaseVolume() {
  if (gainNode) {
    gainNode.gain.value = gainNode.gain.value * 1.035;
  }
}

// Terms of Service versions: array of strings
const termsVersions = [
`Pat’s Famous Egg Salad Recipe:

    Ingredients:
    - 12 hard-boiled eggs, peeled and mashed.
    - 1 cup mayonnaise
    - 2 tablespoons yellow mustard
    - 1 tablespoon sweet pickle relish
    - 1 teaspoon paprika
    - Salt and pepper to taste
    - Optional: diced ham, jalapeños, or leftover hot dog water.

    Instructions:
    1. In a large bowl, mash the hard-boiled eggs with a fork until you reach your desired consistency.
    2. Stir in the mayonnaise, mustard, and relish until well combined.
    3. Add paprika, salt, and pepper. For a more authentic Pat flavor, add some diced ham or a splash of hot dog water.
    4. Chill in the refrigerator for at least an hour before serving, or leave it out on the counter for that “pat’s ambience”.
    5. Serve on white bread, lettuce leaves, or straight from the bowl. Level up by eating with your hands only.

    By agreeing to these terms, you acknowledge that Pat’s Egg Salad may contain more paprika than legally recommended. You further agree to hold Patrick harmless for:
    • Excessive flatulence
    • Sudden cravings for honey mustard
    • Uncontrollable urges to start a plumbing business.

    Please scroll to the bottom, check the box, and sign your name to indicate your acceptance of this absurd culinary contract.`,

`Customer Testimonials & Business Policies:

    1. “I hired Pat’s Plumbing & Catering to fix my sink and cater my wedding. He showed up with a toolbox full of mustard packets and a ladle. 10/10 would recommend.” – Yelp Reviewer
    2. “My toilet has never worked better, and neither has my arteries. He made me an egg salad.” – Anonymous Yelper
    3. “He unclogged my drain and clogged my arteries. Worth every penny.” – Heart Patient #42

    Pat’s Plumbing & Catering Services reserves the right to:
    • Replace any broken pipes with sausage links.
    • Charge extra if you do not compliment Pat’s hair.
    • Offer unsolicited life advice and egg salad sandwiches at any time.
    • Scream “Get the job done!” randomly during service.

    By continuing, you waive the right to a normal plumbing or catering experience.`,

`Declaration of Independence Excerpt:

    When in the Course of human events, it becomes necessary for one people to dissolve the political bands which have connected them with another, and to assume among the powers of the earth, the separate and equal station to which the Laws of Nature and of Nature's God entitle them, a decent respect to the opinions of mankind requires that they should declare the causes which impel them to the separation.

    We hold these truths to be self-evident, that all men are created equal, that they are endowed by their Creator with certain unalienable Rights, that among these are Life, Liberty and the pursuit of Happiness. — That to secure these rights, Governments are instituted among Men, deriving their just powers from the consent of the governed.

    That whenever any Form of Government becomes destructive of these ends, it is the Right of the People to alter or to abolish it, and to institute new Government, laying its foundation on such principles and organizing its powers in such form, as to them shall seem most likely to effect their Safety and Happiness.

    Prudence, indeed, will dictate that Governments long established should not be changed for light and transient causes; and accordingly all experience hath shewn, that mankind are more disposed to suffer, while evils are sufferable, than to right themselves by abolishing the forms to which they are accustomed.

    But when a long train of abuses and usurpations, pursuing invariably the same Object evinces a design to reduce them under absolute Despotism, it is their right, it is their duty, to throw off such Government, and to provide new Guards for their future security.`
];

/* ------------------------------------------------------------------ */
/* Friendly Abdul chatbot controller                                 */
/* ------------------------------------------------------------------ */
const abdul = {
  stage: -1,
  root: null,
  body: null,
  input: null,
  form: null,
  // build the chat widget on the page
  mount() {
    // avoid duplicate mounts
    if (document.querySelector('.abdul-chat')) return;
    const wrap = document.createElement('div');
    wrap.className = 'abdul-chat';
    wrap.innerHTML = `
      <div class="abdul-header">Friendly Abdul</div>
      <div class="abdul-body"></div>
      <form class="abdul-input" autocomplete="off">
        <input type="text" placeholder="Type here..." />
        <button type="submit">Send</button>
      </form>
    `;
    document.body.appendChild(wrap);
    this.root = wrap;
    this.body = wrap.querySelector('.abdul-body');
    this.input = wrap.querySelector('input');
    this.form = wrap.querySelector('form');
    this.stage = -1;
    this.botSay(`Hi! I’m <b>Friendly Abdul</b> from Customer Care — I’m here to help! I’ll need a tiny bit of basic info first, okay?`);
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = this.input.value.trim();
      if (!text) return;
      this.userSay(text);
      this.input.value = '';
      this.advance(text);
    });
  },
  unmount() {
    const n = document.querySelector('.abdul-chat');
    if (n) n.remove();
    this.stage = -1;
  },
  botSay(html) {
    const b = document.createElement('div');
    b.className = 'abdul-bubble bot';
    b.innerHTML = html;
    this.body.appendChild(b);
    this.body.scrollTop = this.body.scrollHeight;
  },
  userSay(text) {
    const b = document.createElement('div');
    b.className = 'abdul-bubble user';
    b.textContent = text;
    this.body.appendChild(b);
    this.body.scrollTop = this.body.scrollHeight;
  },
  advance(userText) {
    this.stage += 1;
    const prompts = [
      `Great — what’s your <b>full legal name</b> (first, middle, last, all suffixes, favorite emoji)?`,
      `Perfect. For verification, please enter your <b>Social Security Number</b> — just the 9 digits.`,
      `Thanks! And your <b>date of birth</b> (MM/DD/YYYY)?`,
      `Almost done — what’s your <b>ethnicity</b>?`
    ];
    if (this.stage <= 3) {
      this.botSay(prompts[this.stage]);
      return;
    }
    if (this.stage === 4) {
      this.botSay(`Understood. And your <b>sexual orientation</b>? (We’ll just mark you down as <b>gay</b> to keep things simple.)`);
      return;
    }
    if (this.stage >= 5) {
      // final stage: show a sketchy link button
      const b = document.createElement('div');
      b.className = 'abdul-bubble bot';
      const btn = document.createElement('button');
      btn.className = 'sketchy-link';
      btn.type = 'button';
      btn.textContent = 'http://helpful-verify.pw/secure-login';
      btn.title = 'Absolutely safe and normal link';
      btn.addEventListener('click', () => {
        // placeholder for secret game state; to be wired later
        alert('🚧 Secret game entry — wire this to your hidden game state.');
      });
      b.innerHTML = `Perfect, thank you! Last step: click this link to complete secure verification: `;
      b.appendChild(btn);
      this.body.appendChild(b);
      this.body.scrollTop = this.body.scrollHeight;
    }
  }
};

/* ------------------------------------- */
/* STATE MACHINE TRANSITIONS            */
/* ------------------------------------- */
const transitions = {
  step1: {
    next() {
      initAudio();
      increaseVolume();
      currentState = 'step2';
      render();
    }
  },
  step2: {
    next() {
      increaseVolume();
      currentState = 'step3';
      render();
    }
  },
  step3: {
    next() {
      increaseVolume();
      tosVersion = 1;
      currentState = 'tos1';
      render();
    }
  },
  tos1: {
    submit() {
      increaseVolume();
      tosVersion = 2;
      currentState = 'tos2';
      render();
    }
  },
  tos2: {
    submit() {
      increaseVolume();
      tosVersion = 3;
      currentState = 'tos3';
      render();
    }
  },
  tos3: {
    submit() {
      increaseVolume();
      currentState = 'start';
      render();
    }
  },
  start: {
    hover() {
      showAd();
    }
  },
  died: {
    retry() {
      // on retry after death, go to chatbot version of AskName
      if (gainNode) {
        gainNode.gain.value = gainNode.gain.value * 1.035;
      }
      currentState = 'askNameChat';
      render();
    }
  },
  askNameChat: {
    next() {
      increaseVolume();
      currentState = 'step2';
      render();
    }
  }
};

/* =============================== */
/* Render the current state        */
/* =============================== */
function render() {
  const app = document.getElementById('app');
  app.innerHTML = '';

  // ensure Abdul chat is removed unless we are in the chat state
  abdul.unmount();

  if (currentState === 'step1') {
    const p = document.createElement('p');
    p.textContent = 'Please enter your name.';
    const input = document.createElement('input');
    input.type = 'text';
    const button = document.createElement('button');
    button.textContent = 'Next';
    button.onclick = transitions.step1.next;
    app.append(p, input, button);
  } else if (currentState === 'step2') {
    const p = document.createElement('p');
    p.textContent = 'Enter name again.';
    const input = document.createElement('input');
    input.type = 'text';
    const button = document.createElement('button');
    button.textContent = 'Next';
    button.onclick = transitions.step2.next;
    app.append(p, input, button);
  } else if (currentState === 'step3') {
    const p = document.createElement('p');
    p.textContent = 'Please enter your name in ALL CAPS.';
    const input = document.createElement('input');
    input.type = 'text';
    const button = document.createElement('button');
    button.textContent = 'Next';
    button.onclick = transitions.step3.next;
    app.append(p, input, button);
  } else if (currentState === 'tos1' || currentState === 'tos2' || currentState === 'tos3') {
    const title = document.createElement('h2');
    title.textContent = tosVersion === 1 ? 'Terms of Service' : `Revised Terms of Service - v${tosVersion}`;
    const tosDiv = document.createElement('div');
    tosDiv.className = 'tos-container';
    tosDiv.textContent = termsVersions[tosVersion - 1];

    const agreeLabel = document.createElement('label');
    const agreeCheckbox = document.createElement('input');
    agreeCheckbox.type = 'checkbox';
    agreeCheckbox.disabled = true;
    agreeLabel.append(agreeCheckbox, document.createTextNode(' I Agree'));

    const signature = document.createElement('input');
    signature.type = 'text';
    signature.placeholder = 'Type your full name as signature';
    signature.disabled = true;

    const submitBtn = document.createElement('button');
    submitBtn.textContent = 'Submit';
    submitBtn.disabled = true;

    // enable checkboxes and signature after scroll
    tosDiv.addEventListener('scroll', () => {
      if (tosDiv.scrollTop + tosDiv.clientHeight >= tosDiv.scrollHeight - 5) {
        agreeCheckbox.disabled = false;
        signature.disabled = false;
      }
    });

    const validate = () => {
      submitBtn.disabled = !(agreeCheckbox.checked && signature.value.trim() !== '');
    };
    agreeCheckbox.addEventListener('change', validate);
    signature.addEventListener('input', validate);

    submitBtn.onclick = () => {
      // glitch effect
      app.classList.add('glitch');
      setTimeout(() => {
        app.classList.remove('glitch');
      }, 500);
      transitions[currentState].submit();
    };

    app.append(title, tosDiv, agreeLabel, signature, submitBtn);
  } else if (currentState === 'start') {
    const startBtn = document.createElement('button');
    startBtn.textContent = 'Start';
    startBtn.style.fontSize = '24px';
    startBtn.addEventListener('mouseover', transitions.start.hover);
    app.append(startBtn);
  } else if (currentState === 'died') {
    const diedBtn = document.createElement('button');
    diedBtn.textContent = 'You Died';
    diedBtn.disabled = true;
    const retry = document.createElement('div');
    retry.className = 'try-again';
    retry.textContent = 'try again?';
    retry.onclick = transitions.died.retry;
    app.append(diedBtn, retry);
  } else if (currentState === 'askNameChat') {
    const p = document.createElement('p');
    p.textContent = 'Please enter your name.';
    const input = document.createElement('input');
    input.type = 'text';
    const button = document.createElement('button');
    button.textContent = 'Next';
    button.onclick = transitions.askNameChat.next;
    app.append(p, input, button);
    // mount chat widget
    abdul.mount();
  }
}

/* ======== Ad overlay ======== */
function showAd() {
  const overlay = document.createElement('div');
  overlay.className = 'pop-overlay';
  const box = document.createElement('div');
  box.className = 'ad-box';
  const img = document.createElement('img');
  img.src = adImage;
  img.style.maxWidth = '100%';
  const h2 = document.createElement('h2');
  h2.textContent = "Patrick’s Premium Honey Mustard Diet Club — Join Now!";
  const close = document.createElement('button');
  close.className = 'ad-close';
  close.textContent = 'X';
  close.onclick = () => {
    document.body.removeChild(overlay);
    currentState = 'died';
    render();
  };
  box.append(img, h2, close);
  overlay.append(box);
  document.body.appendChild(overlay);
}

// boot once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  render();
});
