// Exercise Knowledge Base for Mobile App
// Contains all 15 exercises for 5 health conditions

export const knowledgeBase = {
  back_pain: {
    underweight: [
      {
        name: "Bhujangasana (Cobra Pose)",
        img: "../../imagex/Bhujangasana (Cobra Pose).jpg",
        angles: { shoulder: 160, elbow: 180, hip: 120 },
        tolerance: 15,
        benefits: {
          en: ["Strengthens spine and back muscles", "Improves flexibility of spine", "Relieves lower back pain", "Reduces stress and fatigue", "Improves blood circulation"],
          kn: ["ಬೆನ್ನೆಲಬು ಮತ್ತು ಬೆನ್ನು ಮಾಂಸಪೇಶಿಗಳನ್ನು ಬಲಪಡಿಸುತ್ತದೆ", "ಬೆನ್ನುಹುರಿಯ ನಮ್ಯತೆಯನ್ನು ಸುಧಾರಿಸುತ್ತದೆ", "ಕೆಳ ಬೆನ್ನು ನೋವನ್ನು ಕಡಿಮೆ ಮಾಡುತ್ತದೆ"]
        },
        instructions: {
          en: { start: "Lie on your stomach, place hands under shoulders", correct: "Perfect! Hold this position" },
          kn: { start: "ನಿಮ್ಮ ಹೊಟ್ಟೆಯ ಮೇಲೆ ಮಲಗಿ", correct: "ಚೆನ್ನಾಗಿದೆ!" }
        }
      }
    ],
    normal: [
      {
        name: "Cat-Cow Stretch",
        img: "../../imagex/Cat-Cow Stretch.gif",
        angles: { spine: 145 },
        tolerance: 15,
        benefits: {
          en: ["Improves spine flexibility", "Stretches back and neck muscles", "Relieves back pain"],
          kn: ["ಬೆನ್ನುಹುರಿಯ ನಮ್ಯತೆಯನ್ನು ಸುಧಾರಿಸುತ್ತದೆ", "ಬೆನ್ನು ಮತ್ತು ಕುತ್ತಿಗೆ ಸ್ನಾಯುಗಳನ್ನು ವಿಸ್ತರಿಸುತ್ತದೆ"]
        },
        instructions: {
          en: { start: "Start on hands and knees, spine neutral", correct: "Excellent flow!" },
          kn: { start: "ಕೈ ಮತ್ತು ಮೊಣಕಾಲುಗಳ ಮೇಲೆ ಪ್ರಾರಂಭಿಸಿ", correct: "ಅದ್ಭುತ!" }
        }
      }
    ],
    overweight: [
      {
        name: "Setu Bandhasana (Bridge Pose)",
        img: "../../imagex/Setu Bandhasana (Bridge Pose).gif",
        angles: { knee: 90, hip: 140 },
        tolerance: 15,
        benefits: {
          en: ["Strengthens back and leg muscles", "Reduces lower back pain", "Improves spine flexibility"],
          kn: ["ಬೆನ್ನು ಮತ್ತು ಕಾಲಿನ ಸ್ನಾಯುಗಳನ್ನು ಬಲಪಡಿಸುತ್ತದೆ", "ಕೆಳ ಬೆನ್ನು ನೋವನ್ನು ಕಡಿಮೆ ಮಾಡುತ್ತದೆ"]
        },
        instructions: {
          en: { start: "Lie on back, bend knees, feet flat on floor", correct: "Perfect bridge!" },
          kn: { start: "ಬೆನ್ನಿನ ಮೇಲೆ ಮಲಗಿ", correct: "ಪರಿಪೂರ್ಣ!" }
        }
      }
    ]
  },
  knee_pain: {
    underweight: [
      {
        name: "Standing Leg Raise",
        img: "../../imagex/Utthita Hasta Padangusthasana (Standing Leg Raise) - Copy.webp",
        angles: { hip: 150, knee: 170, ankle: 90 },
        tolerance: 15,
        benefits: {
          en: ["Strengthens quadriceps", "Improves knee stability", "Enhances balance"],
          kn: ["ತೊಡೆ ಸ್ನಾಯುಗಳನ್ನು ಬಲಪಡಿಸುತ್ತದೆ", "ಮೊಣಕಾಲು ಸ್ಥಿರತೆ"]
        },
        instructions: {
          en: { start: "Stand straight, hold support if needed", correct: "Excellent balance!" },
          kn: { start: "ನೇರವಾಗಿ ನಿಲ್ಲಿಸಿ", correct: "ಅದ್ಭುತ ಸಮತೋಲನ!" }
        }
      }
    ],
    normal: [
      {
        name: "Warrior II Pose",
        img: "../../imagex/Virabhadrasana II (Warrior II Pose).webp",
        angles: { knee: 90, hip: 100 },
        tolerance: 15,
        benefits: {
          en: ["Strengthens legs and knees", "Improves knee alignment", "Builds endurance"],
          kn: ["ಕಾಲುಗಳನ್ನು ಬಲಪಡಿಸುತ್ತದೆ", "ಮೊಣಕಾಲು ಜೋಡಣೆ"]
        },
        instructions: {
          en: { start: "Stand with feet wide, arms extended", correct: "Perfect warrior!" },
          kn: { start: "ಅಗಲವಾಗಿ ನಿಲ್ಲಿಸಿ", correct: "ಪರಿಪೂರ್ಣ!" }
        }
      }
    ],
    overweight: [
      {
        name: "Reclining Hand-to-Big-Toe",
        img: "../../imagex/Supta Padangusthasana (Reclining Hand-to-Big-Toe Pose) - Copy.jpg",
        angles: { hip: 120, knee: 160 },
        tolerance: 15,
        benefits: {
          en: ["Stretches hamstrings", "Relieves knee tension", "Improves circulation"],
          kn: ["ಹ್ಯಾಮ್‌ಸ್ಟ್ರಿಂಗ್ ವಿಸ್ತರಣೆ", "ಮೊಣಕಾಲು ಒತ್ತಡ ಕಡಿಮೆ"]
        },
        instructions: {
          en: { start: "Lie on back, extend one leg up", correct: "Great stretch!" },
          kn: { start: "ಬೆನ್ನಿನ ಮೇಲೆ ಮಲಗಿ", correct: "ಅದ್ಭುತ!" }
        }
      }
    ]
  },
  joint_pain: {
    underweight: [
      {
        name: "Cat-Cow Flow",
        img: "../../imagex/Marjaryasana-Bitilasana (Cat-Cow Flow) - Copy.webp",
        angles: { wrist: 90, shoulder: 120, spine: 145 },
        tolerance: 15,
        benefits: {
          en: ["Improves joint mobility", "Reduces stiffness", "Increases flexibility"],
          kn: ["ಕೀಲು ಚಲನೆ ಸುಧಾರಣೆ", "ಬಿಗುವು ಕಡಿಮೆ"]
        },
        instructions: {
          en: { start: "On hands and knees", correct: "Flowing beautifully!" },
          kn: { start: "ಕೈ ಮತ್ತು ಮೊಣಕಾಲುಗಳ ಮೇಲೆ", correct: "ಸುಂದರ!" }
        }
      }
    ],
    normal: [
      {
        name: "Thunderbolt Pose",
        img: "../../imagex/Vajrasana (Thunderbolt Pose).webp",
        angles: { knee: 110, hip: 150, ankle: 90 },
        tolerance: 15,
        benefits: {
          en: ["Relieves knee pain", "Improves digestion", "Calms nervous system"],
          kn: ["ಮೊಣಕಾಲು ನೋವು ಕಡಿಮೆ", "ಜೀರ್ಣಕ್ರಿಯೆ ಸುಧಾರಣೆ"]
        },
        instructions: {
          en: { start: "Kneel on floor, sit back on heels", correct: "Peaceful pose!" },
          kn: { start: "ಮಂಡಿಯೂರಿ", correct: "ಶಾಂತಿಯ ಭಂಗಿ!" }
        }
      }
    ],
    overweight: [
      {
        name: "Wind-Relieving Pose",
        img: "../../imagex/Pavanamuktasana (Wind-Relieving Pose).jpg",
        angles: { hip: 100, knee: 120 },
        tolerance: 15,
        benefits: {
          en: ["Hip mobilization", "Reduces stiffness", "Improves digestion"],
          kn: ["ಸೊಂಟ ಚಲನೆ", "ಬಿಗುವು ಕಡಿಮೆ"]
        },
        instructions: {
          en: { start: "Lie on back, pull knees to chest", correct: "Relaxing pose!" },
          kn: { start: "ಬೆನ್ನಿನ ಮೇಲೆ ಮಲಗಿ", correct: "ವಿಶ್ರಾಂತಿ!" }
        }
      }
    ]
  },
  obesity: {
    underweight: [
      {
        name: "Mountain Pose",
        img: "../../imagex/Tadasana (Mountain Pose).webp",
        angles: { shoulder: 180, hip: 180, knee: 180, ankle: 90 },
        tolerance: 15,
        benefits: {
          en: ["Improves posture", "Strengthens core", "Enhances awareness"],
          kn: ["ಭಂಗಿ ಸುಧಾರಣೆ", "ತೊಳೆ ಬಲವರ್ಧನೆ"]
        },
        instructions: {
          en: { start: "Stand tall, feet together", correct: "Strong mountain!" },
          kn: { start: "ಎತ್ತರವಾಗಿ ನಿಲ್ಲಿಸಿ", correct: "ಶಕ್ತಿಶಾಲಿ!" }
        }
      }
    ],
    normal: [
      {
        name: "Triangle Pose",
        img: "../../imagex/Trikonasana (Triangle Pose).webp",
        angles: { hip: 135, knee: 170, shoulder: 160 },
        tolerance: 15,
        benefits: {
          en: ["Stretches hips", "Strengthens legs", "Improves balance"],
          kn: ["ಸೊಂಟ ವಿಸ್ತರಣೆ", "ಕಾಲು ಬಲವರ್ಧನೆ"]
        },
        instructions: {
          en: { start: "Stand wide, extend arms", correct: "Beautiful triangle!" },
          kn: { start: "ಅಗಲವಾಗಿ ನಿಲ್ಲಿಸಿ", correct: "ಸುಂದರ!" }
        }
      }
    ],
    overweight: [
      {
        name: "Child's Pose",
        img: "../../imagex/Balasana (Child's Pose) - Copy.webp",
        angles: { hip: 100, knee: 130, shoulder: 150 },
        tolerance: 15,
        benefits: {
          en: ["Full-body stretch", "Relieves tension", "Promotes relaxation"],
          kn: ["ಪೂರ್ಣ ದೇಹ ವಿಸ್ತರಣೆ", "ಒತ್ತಡ ಕಡಿಮೆ"]
        },
        instructions: {
          en: { start: "Kneel, sit back, extend arms", correct: "Rest peacefully!" },
          kn: { start: "ಮಂಡಿಯೂರಿ", correct: "ಶಾಂತಿ!" }
        }
      }
    ]
  },
  diabetes: {
    underweight: [
      {
        name: "Seated Forward Bend",
        img: "../../imagex/Paschimottanasana (Seated Forward Bend).jpg",
        angles: { hip: 130, knee: 170, spine: 150 },
        tolerance: 15,
        benefits: {
          en: ["Stimulates pancreas", "Improves blood sugar", "Stretches spine"],
          kn: ["ಪ್ಯಾಂಕ್ರಿಯಾಸ್ ಉತ್ತೇಜನ", "ರಕ್ತದ ಸಕ್ಕರೆ ನಿಯಂತ್ರಣ"]
        },
        instructions: {
          en: { start: "Sit with legs extended", correct: "Deep stretch!" },
          kn: { start: "ಕಾಲುಗಳನ್ನು ಚಾಚಿ ಕುಳಿತು", correct: "ಆಳವಾದ ವಿಸ್ತರಣೆ!" }
        }
      }
    ],
    normal: [
      {
        name: "Bow Pose",
        img: "../../imagex/Dhanurasana (Bow Pose).jpeg",
        angles: { knee: 100, hip: 140, shoulder: 130 },
        tolerance: 15,
        benefits: {
          en: ["Massages pancreas", "Improves glucose control", "Strengthens back"],
          kn: ["ಪ್ಯಾಂಕ್ರಿಯಾಸ್ ಮಸಾಜ್", "ಗ್ಲೂಕೋಸ್ ನಿಯಂತ್ರಣ"]
        },
        instructions: {
          en: { start: "Lie on stomach, grab ankles", correct: "Beautiful bow!" },
          kn: { start: "ಹೊಟ್ಟೆಯ ಮೇಲೆ ಮಲಗಿ", correct: "ಸುಂದರ!" }
        }
      }
    ],
    overweight: [
      {
        name: "Fish Pose",
        img: "../../imagex/Matsyasana (Fish Pose) - Copy.webp",
        angles: { hip: 150, knee: 160, shoulder: 140 },
        tolerance: 15,
        benefits: {
          en: ["Stimulates thyroid", "Improves circulation", "Opens chest"],
          kn: ["ಥೈರಾಯ್ಡ್ ಉತ್ತೇಜನ", "ರಕ್ತಪರಿಚಲನೆ"]
        },
        instructions: {
          en: { start: "Lie on back, arch back", correct: "Graceful fish!" },
          kn: { start: "ಬೆನ್ನಿನ ಮೇಲೆ ಮಲಗಿ", correct: "ಸುಂದರ ಮೀನು!" }
        }
      }
    ]
  }
};

export const healthConditions = [
  { key: 'back_pain', label: 'Back Pain', icon: '🔙' },
  { key: 'knee_pain', label: 'Knee Pain', icon: '🦵' },
  { key: 'joint_pain', label: 'Joint Pain', icon: '🦴' },
  { key: 'obesity', label: 'Obesity', icon: '⚖️' },
  { key: 'diabetes', label: 'Diabetes', icon: '💉' }
];
