// ===== Global state & helpers =====
const ambientAudio = document.getElementById("ambientAudio");
const voiceToggle  = document.getElementById("voiceToggle");
const titleEl      = document.getElementById("title");
const storyEl      = document.getElementById("storyText");
const buttonsEl    = document.getElementById("buttonsContainer");
const gameWrap     = document.getElementById("gameContainer");

let soundEnabled = false;
let narrationUtterance = null;
let currentStage = "intro";

// ===== Stage data =====
const STAGES = {
  intro: {
    bg: "assets/intro.jpg",
    title: "Museum Riddles",
    text: `A Game Of Knowledge And Adventure`,
    buttons: [
      { label: "Start", action: () => {
          enableSound();
          playAmbient();
          speak(STAGES.intro.title);
          buttonsEl.innerHTML = "";
          const contBtn = document.createElement("button");
          contBtn.textContent = "Continue";
          contBtn.addEventListener("click", () => goTo("role"));
          buttonsEl.appendChild(contBtn);
      }}
    ]
  },

  role: {
    bg: "assets/role-selection.png",
    title: "Menu",
    text: `Are you ready to solve all the riddles?`,
    buttons: [
      { label: "Start Game", action: () => goTo("lore") },
      { label: "Instructions", action: () => goTo("instructions") }
    ]
  },

  lore: {
    bg: "assets/lore-keeper.png",
    title: "START THE GAME",
    text: `Press Explore Via AR and open your camera. Scan the statue of Hercules to meet the archeologist.`,
    buttons: [
      { label: "Explore via AR", action: () => {
          stopAmbient();
          window.open(`ar.html?from=${currentStage}`, "_blank");
      }},
      { label: "Finish Task", action: () => goTo("end") },
      { label: "Back", action: () => goTo("role") }
    ]
  },

  instructions: {
    bg: "assets/instructions.png",
    title: "How to Play",
    text: `
      • Scan the statue of <b>Hercules</b> to start the experience.<br>
      • Solve the explorer's riddles to find the exhibits.<br>
      • Each exhibit reveals the next riddle.<br>
      • Solve all the riddles to finish the game.<br>
    `,
    buttons: [
      { label: "Back", action: () => goTo("role") }
    ]
  },

  // ——— Minimal edits so the end "has meaning" ———
  end: {
  bg: "assets/olympus.jpg",
  title: "The end",
  text: `<b>Great Job.</b><br>You found all the treasures.<br>`,
  buttons: [
    { label: "Play Again", action: () => goTo("intro", true) }
  ]
}
};

// ===== Sound / Narration =====
function enableSound() {
  soundEnabled = true;
  voiceToggle.classList.add("active");
  voiceToggle.textContent = "🔊";
}

function disableSound() {
  soundEnabled = false;
  voiceToggle.classList.remove("active");
  voiceToggle.textContent = "🔇";
  cancelNarration();
  stopAmbient();
}

function playAmbient() {
  if (!soundEnabled) return;
  ambientAudio.volume = 0.3;
  ambientAudio.play().catch(() => {});
}

function stopAmbient() { ambientAudio.pause(); }

function cancelNarration() {
  try {
    if (speechSynthesis.speaking || speechSynthesis.pending) speechSynthesis.cancel();
  } catch {}
}

function speak(text) {
  cancelNarration();
  if (!soundEnabled) return;
  let plainText = text.replace(/<a[^>]*>.*?<\/a>/gi, "");
  plainText = plainText.replace(/(<([^>]+)>)/gi, "");
  plainText = plainText.replace(/&[a-z]+;/gi, " ");
  plainText = plainText.replace(/\s+/g, " ").trim();
  const u = new SpeechSynthesisUtterance(plainText);
  u.lang = "en-GB";
  u.rate = 1.05;
  u.pitch = 1.0;
  narrationUtterance = u;
  speechSynthesis.speak(u);
}

voiceToggle.addEventListener("click", () => {
  if (soundEnabled) {
    disableSound();
  } else {
    enableSound();
    playAmbient();
  }
});

// ===== Navigation =====
function goTo(stage, resetAll = false) {
  // If called as Restart with resetAll=true, do a soft reset so the action έχει νόημα
  if (resetAll === true) {
    cancelNarration();
    stopAmbient();
    disableSound();               // επιστρέφει το σύστημα σε «σίγαση»
    try { history.replaceState({}, "", location.pathname); } catch {}
  }

  currentStage = stage;
  const s = STAGES[stage];
  if (!s) return;

  if (s.bg) gameWrap.style.backgroundImage = `url('${s.bg}')`;
  titleEl.textContent = s.title || "";
  storyEl.innerHTML = s.text || "";

  buttonsEl.innerHTML = "";
  (s.buttons || []).forEach(b => {
    const btn = document.createElement("button");
    btn.textContent = b.label;
    btn.addEventListener("click", b.action);
    buttonsEl.appendChild(btn);
  });

  if (soundEnabled) speak(s.text || "");
}

// ===== Init =====
window.addEventListener("load", () => {
  const params = new URLSearchParams(window.location.search);
  const section = params.get("section");
  if (section && STAGES[section]) {
    goTo(section);
  } else {
    goTo("intro");
  }
});
