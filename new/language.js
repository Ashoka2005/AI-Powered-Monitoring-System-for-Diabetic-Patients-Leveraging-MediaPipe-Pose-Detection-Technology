// Language translations
const translations = {
  en: {
    nameLabel: "Full Name",
    ageLabel: "Age",
    weightLabel: "Weight (kg)",
    heightLabel: "Height (m)",
    durationLabel: "Exercise Duration",
    calcBMI: "Calculate BMI",
    suggestBtn: "Get Exercise Recommendations",
    startCamera: "📷 Start Camera",
    stopCamera: "🛑 Stop Camera",
    voiceOn: "🔊 Voice ON",
    voiceOff: "🔇 Voice OFF",
    selectExercise: "Select an exercise to begin",
    downloadReport: "📄 Download PDF Report"
  },
  kn: {
    nameLabel: "ಪೂರ್ಣ ಹೆಸರು",
    ageLabel: "ವಯಸ್ಸು",
    weightLabel: "ತೂಕ (ಕೆಜಿ)",
    heightLabel: "ಎತ್ತರ (ಮೀ)",
    durationLabel: "ವ್ಯಾಯಾಮದ ಅವಧಿ",
    calcBMI: "BMI ಲೆಕ್ಕಾಚಾರ",
    suggestBtn: "ವ್ಯಾಯಾಮ ಶಿಫಾರಸುಗಳನ್ನು ಪಡೆಯಿರಿ",
    startCamera: "📷 ಕ್ಯಾಮೆರಾ ಪ್ರಾರಂಭಿಸಿ",
    stopCamera: "🛑 ಕ್ಯಾಮೆರಾ ನಿಲ್ಲಿಸಿ",
    voiceOn: "🔊 ಧ್ವನಿ ಆನ್",
    voiceOff: "🔇 ಧ್ವನಿ ಆಫ್",
    selectExercise: "ಪ್ರಾರಂಭಿಸಲು ವ್ಯಾಯಾಮವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    downloadReport: "📄 PDF ವರದಿಯನ್ನು ಡೌನ್ಲೋಡ್ ಮಾಡಿ"
  }
};

let currentLanguage = 'en';
let voiceEnabled = true;
let lastSpeakTime = 0;
const SPEAK_COOLDOWN = 3000; // 3 seconds between voice instructions

// Update UI language
function updateLanguage(lang) {
  currentLanguage = lang;
  const t = translations[lang];
  
  document.getElementById('nameLabel').textContent = t.nameLabel;
  document.getElementById('ageLabel').textContent = t.ageLabel;
  document.getElementById('weightLabel').textContent = t.weightLabel;
  document.getElementById('heightLabel').textContent = t.heightLabel;
  document.getElementById('durationLabel').textContent = t.durationLabel;
  document.getElementById('calcBMI').textContent = t.calcBMI;
  document.getElementById('suggestBtn').textContent = t.suggestBtn;
  document.getElementById('startCamera').textContent = t.startCamera;
  
  const stopBtn = document.getElementById('stopCamera');
  if (stopBtn) stopBtn.textContent = t.stopCamera;
  
  const voiceBtn = document.getElementById('voiceToggle');
  if (voiceBtn) {
    voiceBtn.textContent = voiceEnabled ? t.voiceOn : t.voiceOff;
  }
}

// Text-to-Speech function
function speak(text, force = false) {
  if (!voiceEnabled && !force) return;
  
  const now = Date.now();
  if (!force && (now - lastSpeakTime < SPEAK_COOLDOWN)) {
    return; // Skip if too soon
  }
  
  lastSpeakTime = now;
  
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  utterance.pitch = 1.0;
  
  // Set voice based on language
  if (currentLanguage === 'kn') {
    utterance.lang = 'kn-IN';
    const voices = window.speechSynthesis.getVoices();
    const kannadaVoice = voices.find(v => v.lang.includes('kn'));
    if (kannadaVoice) utterance.voice = kannadaVoice;
  } else {
    utterance.lang = 'en-US';
  }
  
  window.speechSynthesis.speak(utterance);
}

// Get translated instruction
function getInstruction(asana, type) {
  if (!asana || !asana.instructions) return '';
  return asana.instructions[currentLanguage][type] || '';
}

// Get translated benefits
function getBenefits(asana) {
  if (!asana || !asana.benefits) return [];
  return asana.benefits[currentLanguage] || [];
}

// Language selector
document.getElementById('languageSelect').addEventListener('change', (e) => {
  updateLanguage(e.target.value);
});

// Voice toggle
function setupVoiceToggle() {
  const voiceBtn = document.getElementById('voiceToggle');
  if (!voiceBtn) return;
  
  voiceBtn.addEventListener('click', () => {
    voiceEnabled = !voiceEnabled;
    const t = translations[currentLanguage];
    voiceBtn.textContent = voiceEnabled ? t.voiceOn : t.voiceOff;
    voiceBtn.style.background = voiceEnabled 
      ? 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)'
      : 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)';
  });
}

// Initialize language on load
window.addEventListener('load', () => {
  updateLanguage('en');
  setupVoiceToggle();
  
  // Load voices
  window.speechSynthesis.getVoices();
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }
});