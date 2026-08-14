const knowledgeBase = {
  back_pain: {
    underweight: [
      {
        name: "Bhujangasana (Cobra Pose)",
        img: "imagex/Bhujangasana (Cobra Pose).jpg",
        fallback_img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=400&fit=crop&q=80",
        angles: {
          shoulder: 160,
          elbow: 180,
          hip: 120,
        },
        tolerance: 15,
        benefits: {
          en: [
            "Strengthens spine and back muscles",
            "Improves flexibility of spine",
            "Relieves lower back pain",
            "Reduces stress and fatigue",
            "Improves blood circulation"
          ],
          kn: [
            "ಬೆನ್ನೆಲಬು ಮತ್ತು ಬೆನ್ನು ಮಾಂಸಪೇಶಿಗಳನ್ನು ಬಲಪಡಿಸುತ್ತದೆ",
            "ಬೆನ್ನುಹುರಿಯ ನಮ್ಯತೆಯನ್ನು ಸುಧಾರಿಸುತ್ತದೆ",
            "ಕೆಳ ಬೆನ್ನು ನೋವನ್ನು ಕಡಿಮೆ ಮಾಡುತ್ತದೆ",
            "ಒತ್ತಡ ಮತ್ತು ಆಯಾಸವನ್ನು ಕಡಿಮೆ ಮಾಡುತ್ತದೆ",
            "ರಕ್ತ ಪರಿಚಲನೆಯನ್ನು ಸುಧಾರಿಸುತ್ತದೆ"
          ]
        },
        instructions: {
          en: {
            start: "Lie on your stomach, place hands under shoulders",
            correct: "Perfect! Hold this position",
            adjust_shoulder: "Push chest forward more",
            adjust_elbow: "Straighten your arms",
            adjust_hip: "Keep hips on the ground"
          },
          kn: {
            start: "ನಿಮ್ಮ ಹೊಟ್ಟೆಯ ಮೇಲೆ ಮಲಗಿ, ಭುಜಗಳ ಕೆಳಗೆ ಕೈಗಳನ್ನು ಇರಿಸಿ",
            correct: "ಚೆನ್ನಾಗಿದೆ! ಈ ಸ್ಥಾನವನ್ನು ಹಿಡಿದುಕೊಳ್ಳಿ",
            adjust_shoulder: "ಎದೆಯನ್ನು ಹೆಚ್ಚು ಮುಂದಕ್ಕೆ ತಳ್ಳಿ",
            adjust_elbow: "ನಿಮ್ಮ ತೋಳುಗಳನ್ನು ನೇರಗೊಳಿಸಿ",
            adjust_hip: "ಸೊಂಟವನ್ನು ನೆಲದ ಮೇಲೆ ಇರಿಸಿ"
          }
        }
      },
    ],
    normal: [
      {
        name: "Cat-Cow Stretch",
        img: "imagex/Cat-Cow Stretch.gif",
        fallback_img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop&q=80",
        angles: { spine: 145 },
        tolerance: 15,
        benefits: {
          en: [
            "Improves spine flexibility",
            "Stretches back and neck muscles",
            "Relieves back pain and tension",
            "Improves posture",
            "Massages internal organs"
          ],
          kn: [
            "ಬೆನ್ನುಹುರಿಯ ನಮ್ಯತೆಯನ್ನು ಸುಧಾರಿಸುತ್ತದೆ",
            "ಬೆನ್ನು ಮತ್ತು ಕುತ್ತಿಗೆ ಸ್ನಾಯುಗಳನ್ನು ವಿಸ್ತರಿಸುತ್ತದೆ",
            "ಬೆನ್ನು ನೋವು ಮತ್ತು ಒತ್ತಡವನ್ನು ಕಡಿಮೆ ಮಾಡುತ್ತದೆ",
            "ಭಂಗಿಯನ್ನು ಸುಧಾರಿಸುತ್ತದೆ",
            "ಆಂತರಿಕ ಅಂಗಗಳಿಗೆ ಮಸಾಜ್ ನೀಡುತ್ತದೆ"
          ]
        },
        instructions: {
          en: {
            start: "Start on hands and knees, spine neutral",
            correct: "Excellent flow! Keep moving",
            adjust_spine: "Arch your back more",
            cow: "Cow pose - drop belly, lift chest",
            cat: "Cat pose - round your back"
          },
          kn: {
            start: "ಕೈ ಮತ್ತು ಮೊಣಕಾಲುಗಳ ಮೇಲೆ ಪ್ರಾರಂಭಿಸಿ",
            correct: "ಅದ್ಭುತ! ಮುಂದುವರಿಸಿ",
            adjust_spine: "ನಿಮ್ಮ ಬೆನ್ನನ್ನು ಹೆಚ್ಚು ಬಾಗಿಸಿ",
            cow: "ಹಸುವಿನ ಭಂಗಿ - ಹೊಟ್ಟೆ ಕೆಳಗೆ, ಎದೆ ಮೇಲೆ",
            cat: "ಬೆಕ್ಕಿನ ಭಂಗಿ - ಬೆನ್ನು ದುಂಡಾಗಿಸಿ"
          }
        }
      },
    ],
    overweight: [
      {
        name: "Setu Bandhasana (Bridge Pose)",
        img: "imagex/Setu Bandhasana (Bridge Pose).gif",
        fallback_img: "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=600&h=400&fit=crop&q=80",
        angles: { knee: 90, hip: 140 },
        tolerance: 15,
        benefits: {
          en: [
            "Strengthens back and leg muscles",
            "Reduces lower back pain",
            "Improves spine flexibility",
            "Helps with digestion",
            "Reduces stress and anxiety"
          ],
          kn: [
            "ಬೆನ್ನು ಮತ್ತು ಕಾಲಿನ ಸ್ನಾಯುಗಳನ್ನು ಬಲಪಡಿಸುತ್ತದೆ",
            "ಕೆಳ ಬೆನ್ನು ನೋವನ್ನು ಕಡಿಮೆ ಮಾಡುತ್ತದೆ",
            "ಬೆನ್ನುಹುರಿಯ ನಮ್ಯತೆಯನ್ನು ಸುಧಾರಿಸುತ್ತದೆ",
            "ಜೀರ್ಣಕ್ರಿಯೆಗೆ ಸಹಾಯ ಮಾಡುತ್ತದೆ",
            "ಒತ್ತಡ ಮತ್ತು ಆತಂಕವನ್ನು ಕಡಿಮೆ ಮಾಡುತ್ತದೆ"
          ]
        },
        instructions: {
          en: {
            start: "Lie on back, bend knees, feet flat on floor",
            correct: "Perfect bridge! Hold steady",
            adjust_knee: "Bend knees to 90 degrees",
            adjust_hip: "Lift hips higher",
            feet: "Keep feet hip-width apart"
          },
          kn: {
            start: "ಬೆನ್ನಿನ ಮೇಲೆ ಮಲಗಿ, ಮೊಣಕಾಲು ಬಾಗಿಸಿ",
            correct: "ಪರಿಪೂರ್ಣ! ಸ್ಥಿರವಾಗಿ ಹಿಡಿದುಕೊಳ್ಳಿ",
            adjust_knee: "ಮೊಣಕಾಲನ್ನು 90 ಡಿಗ್ರಿಗೆ ಬಾಗಿಸಿ",
            adjust_hip: "ಸೊಂಟವನ್ನು ಹೆಚ್ಚು ಎತ್ತಿ",
            feet: "ಪಾದಗಳನ್ನು ಸೊಂಟದ ಅಗಲದಲ್ಲಿ ಇರಿಸಿ"
          }
        }
      },
    ],
  },
  
  knee_pain: {
    underweight: [
      {
        name: "Utthita Hasta Padangusthasana (Standing Leg Raise)",
        img: "imagex/Utthita Hasta Padangusthasana (Standing Leg Raise) - Copy.webp",
        fallback_img: "https://images.unsplash.com/photo-1573361467587-2e48dbf9d907?w=600&h=400&fit=crop&q=80",
        angles: {
          hip: 150,
          knee: 170,
          ankle: 90,
        },
        tolerance: 15,
        benefits: {
          en: [
            "Strengthens quadriceps and hamstrings",
            "Improves knee stability",
            "Enhances balance and coordination",
            "Increases leg muscle strength",
            "Improves hip flexibility"
          ],
          kn: [
            "ತೊಡೆ ಮತ್ತು ಹ್ಯಾಮ್‌ಸ್ಟ್ರಿಂಗ್‌ಗಳನ್ನು ಬಲಪಡಿಸುತ್ತದೆ",
            "ಮೊಣಕಾಲು ಸ್ಥಿರತೆಯನ್ನು ಸುಧಾರಿಸುತ್ತದೆ",
            "ಸಮತೋಲನ ಮತ್ತು ಸಮನ್ವಯವನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ",
            "ಕಾಲಿನ ಸ್ನಾಯುಗಳ ಶಕ್ತಿಯನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ",
            "ಸೊಂಟದ ನಮ್ಯತೆಯನ್ನು ಸುಧಾರಿಸುತ್ತದೆ"
          ]
        },
        instructions: {
          en: {
            start: "Stand straight, hold support if needed",
            correct: "Excellent balance! Hold position",
            adjust_hip: "Lift leg higher from hip",
            adjust_knee: "Keep supporting leg slightly bent",
            adjust_ankle: "Flex your foot"
          },
          kn: {
            start: "ನೇರವಾಗಿ ನಿಲ್ಲಿಸಿ, ಅಗತ್ಯವಿದ್ದರೆ ಆಧಾರ ಹಿಡಿಯಿರಿ",
            correct: "ಅದ್ಭುತ ಸಮತೋಲನ! ಹಿಡಿದುಕೊಳ್ಳಿ",
            adjust_hip: "ಸೊಂಟದಿಂದ ಕಾಲನ್ನು ಹೆಚ್ಚು ಎತ್ತಿ",
            adjust_knee: "ಆಧಾರ ಕಾಲನ್ನು ಸ್ವಲ್ಪ ಬಾಗಿಸಿ",
            adjust_ankle: "ನಿಮ್ಮ ಪಾದವನ್ನು ಬಾಗಿಸಿ"
          }
        }
      },
    ],
    normal: [
      {
        name: "Virabhadrasana II (Warrior II Pose)",
        img: "imagex/Virabhadrasana II (Warrior II Pose).webp",
        fallback_img: "https://images.unsplash.com/photo-1573361467587-2e48dbf9d907?w=600&h=400&fit=crop&q=80",
        angles: { knee: 90, hip: 100 },
        tolerance: 15,
        benefits: {
          en: [
            "Strengthens legs and knees",
            "Improves knee alignment",
            "Builds leg endurance",
            "Opens hips and groin",
            "Enhances focus and stability"
          ],
          kn: [
            "ಕಾಲುಗಳು ಮತ್ತು ಮೊಣಕಾಲುಗಳನ್ನು ಬಲಪಡಿಸುತ್ತದೆ",
            "ಮೊಣಕಾಲು ಜೋಡಣೆಯನ್ನು ಸುಧಾರಿಸುತ್ತದೆ",
            "ಕಾಲಿನ ಸಹನೆಯನ್ನು ನಿರ್ಮಿಸುತ್ತದೆ",
            "ಸೊಂಟ ಮತ್ತು ಗ್ರೋಯಿನ್ ತೆರೆಯುತ್ತದೆ",
            "ಗಮನ ಮತ್ತು ಸ್ಥಿರತೆಯನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ"
          ]
        },
        instructions: {
          en: {
            start: "Stand with feet wide, arms extended",
            correct: "Perfect warrior pose! Hold strong",
            adjust_knee: "Bend front knee to 90 degrees",
            adjust_hip: "Open hips to the side",
            arms: "Extend arms parallel to floor"
          },
          kn: {
            start: "ಅಗಲವಾಗಿ ಕಾಲುಗಳನ್ನು ನಿಲ್ಲಿಸಿ, ತೋಳುಗಳನ್ನು ಚಾಚಿ",
            correct: "ಪರಿಪೂರ್ಣ ಯೋಧ ಭಂಗಿ! ಹಿಡಿದುಕೊಳ್ಳಿ",
            adjust_knee: "ಮುಂಭಾಗದ ಮೊಣಕಾಲನ್ನು 90 ಡಿಗ್ರಿಗೆ ಬಾಗಿಸಿ",
            adjust_hip: "ಸೊಂಟವನ್ನು ಪಕ್ಕಕ್ಕೆ ತೆರೆಯಿರಿ",
            arms: "ತೋಳುಗಳನ್ನು ನೆಲಕ್ಕೆ ಸಮಾಂತರವಾಗಿ ಚಾಚಿ"
          }
        }
      },
    ],
    overweight: [
      {
        name: "Supta Padangusthasana (Reclining Hand-to-Big-Toe Pose)",
        img: "imagex/Supta Padangusthasana (Reclining Hand-to-Big-Toe Pose) - Copy.jpg",
        fallback_img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop&q=80",
        angles: { hip: 120, knee: 160 },
        tolerance: 15,
        benefits: {
          en: [
            "Stretches hamstrings gently",
            "Relieves knee tension",
            "Improves leg circulation",
            "Reduces lower body stiffness",
            "Calms the mind"
          ],
          kn: [
            "ಹ್ಯಾಮ್‌ಸ್ಟ್ರಿಂಗ್‌ಗಳನ್ನು ಸೌಮ್ಯವಾಗಿ ವಿಸ್ತರಿಸುತ್ತದೆ",
            "ಮೊಣಕಾಲು ಒತ್ತಡವನ್ನು ಕಡಿಮೆ ಮಾಡುತ್ತದೆ",
            "ಕಾಲಿನ ರಕ್ತಪರಿಚಲನೆಯನ್ನು ಸುಧಾರಿಸುತ್ತದೆ",
            "ಕೆಳಗಿನ ದೇಹದ ಬಿಗುವನ್ನು ಕಡಿಮೆ ಮಾಡುತ್ತದೆ",
            "ಮನಸ್ಸನ್ನು ಶಾಂತಗೊಳಿಸುತ್ತದೆ"
          ]
        },
        instructions: {
          en: {
            start: "Lie on back, extend one leg up",
            correct: "Great stretch! Breathe deeply",
            adjust_hip: "Keep opposite hip grounded",
            adjust_knee: "Straighten raised leg more",
            breathe: "Breathe smoothly and deeply"
          },
          kn: {
            start: "ಬೆನ್ನಿನ ಮೇಲೆ ಮಲಗಿ, ಒಂದು ಕಾಲನ್ನು ಮೇಲೆ ಚಾಚಿ",
            correct: "ಅದ್ಭುತ ವಿಸ್ತರಣೆ! ಆಳವಾಗಿ ಉಸಿರಾಡಿ",
            adjust_hip: "ವಿರುದ್ಧ ಸೊಂಟವನ್ನು ನೆಲದಲ್ಲಿ ಇರಿಸಿ",
            adjust_knee: "ಎತ್ತಿದ ಕಾಲನ್ನು ಹೆಚ್ಚು ನೇರಗೊಳಿಸಿ",
            breathe: "ಸುಗಮವಾಗಿ ಮತ್ತು ಆಳವಾಗಿ ಉಸಿರಾಡಿ"
          }
        }
      },
    ],
  },
  
  joint_pain: {
    underweight: [
      {
        name: "Marjaryasana-Bitilasana (Cat-Cow Flow)",
        img: "imagex/Marjaryasana-Bitilasana (Cat-Cow Flow) - Copy.webp",
        fallback_img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=400&fit=crop&q=80",
        angles: {
          wrist: 90,
          shoulder: 120,
          spine: 145,
        },
        tolerance: 15,
        benefits: {
          en: [
            "Improves joint mobility",
            "Reduces stiffness in wrists and shoulders",
            "Increases spinal flexibility",
            "Gentle warm-up for joints",
            "Relieves tension"
          ],
          kn: [
            "ಕೀಲುಗಳ ಚಲನೆಯನ್ನು ಸುಧಾರಿಸುತ್ತದೆ",
            "ಕೈಬೆರಳು ಮತ್ತು ಭುಜಗಳ ಬಿಗುವನ್ನು ಕಡಿಮೆ ಮಾಡುತ್ತದೆ",
            "ಬೆನ್ನುಹುರಿಯ ನಮ್ಯತೆಯನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ",
            "ಕೀಲುಗಳಿಗೆ ಸೌಮ್ಯವಾದ ವಾರ್ಮ್-ಅಪ್",
            "ಒತ್ತಡವನ್ನು ಕಡಿಮೆ ಮಾಡುತ್ತದೆ"
          ]
        },
        instructions: {
          en: {
            start: "On hands and knees, wrists under shoulders",
            correct: "Flowing beautifully! Keep moving",
            adjust_wrist: "Press palms firmly into mat",
            adjust_shoulder: "Roll shoulders away from ears",
            adjust_spine: "Move through full range of motion"
          },
          kn: {
            start: "ಕೈ ಮತ್ತು ಮೊಣಕಾಲುಗಳ ಮೇಲೆ, ಭುಜಗಳ ಕೆಳಗೆ ಕೈಬೆರಳುಗಳು",
            correct: "ಸುಂದರವಾಗಿ ಹರಿಯುತ್ತಿದೆ! ಮುಂದುವರಿಸಿ",
            adjust_wrist: "ಅಂಗೈಗಳನ್ನು ಚಾಪೆಯಲ್ಲಿ ಗಟ್ಟಿಯಾಗಿ ಒತ್ತಿ",
            adjust_shoulder: "ಭುಜಗಳನ್ನು ಕಿವಿಗಳಿಂದ ದೂರಕ್ಕೆ ತಿರುಗಿಸಿ",
            adjust_spine: "ಪೂರ್ಣ ಶ್ರೇಣಿಯ ಚಲನೆಯ ಮೂಲಕ ಚಲಿಸಿ"
          }
        }
      },
    ],
    normal: [
      {
        name: "Vajrasana (Thunderbolt Pose)",
        img: "imagex/Vajrasana (Thunderbolt Pose).webp",
        fallback_img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=400&fit=crop&q=80",
        angles: { knee: 110, hip: 150, ankle: 90 },
        tolerance: 15,
        benefits: {
          en: [
            "Relieves knee and ankle pain",
            "Improves digestion",
            "Strengthens pelvic muscles",
            "Calms the nervous system",
            "Reduces joint inflammation"
          ],
          kn: [
            "ಮೊಣಕಾಲು ಮತ್ತು ಗಂಟು ನೋವನ್ನು ಕಡಿಮೆ ಮಾಡುತ್ತದೆ",
            "ಜೀರ್ಣಕ್ರಿಯೆಯನ್ನು ಸುಧಾರಿಸುತ್ತದೆ",
            "ಶ್ರೋಣಿಯ ಸ್ನಾಯುಗಳನ್ನು ಬಲಪಡಿಸುತ್ತದೆ",
            "ನರಮಂಡಲವನ್ನು ಶಾಂತಗೊಳಿಸುತ್ತದೆ",
            "ಕೀಲು ಉರಿಯೂತವನ್ನು ಕಡಿಮೆ ಮಾಡುತ್ತದೆ"
          ]
        },
        instructions: {
          en: {
            start: "Kneel on floor, sit back on heels",
            correct: "Peaceful pose! Relax and breathe",
            adjust_knee: "Keep knees together",
            adjust_hip: "Sit fully on your heels",
            adjust_ankle: "Point toes backward"
          },
          kn: {
            start: "ನೆಲದ ಮೇಲೆ ಮಂಡಿಯೂರಿ, ಹಿಮ್ಮಡಿಗಳ ಮೇಲೆ ಕುಳಿತುಕೊಳ್ಳಿ",
            correct: "ಶಾಂತಿಯ ಭಂಗಿ! ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ ಮತ್ತು ಉಸಿರಾಡಿ",
            adjust_knee: "ಮೊಣಕಾಲುಗಳನ್ನು ಒಟ್ಟಿಗೆ ಇರಿಸಿ",
            adjust_hip: "ನಿಮ್ಮ ಹಿಮ್ಮಡಿಗಳ ಮೇಲೆ ಪೂರ್ತಿಯಾಗಿ ಕುಳಿತುಕೊಳ್ಳಿ",
            adjust_ankle: "ಬೆರಳುಗಳನ್ನು ಹಿಂದಕ್ಕೆ ತಿರುಗಿಸಿ"
          }
        }
      },
    ],
    overweight: [
      {
        name: "Pavanamuktasana (Wind-Relieving Pose)",
        img: "imagex/Pavanamuktasana (Wind-Relieving Pose).jpg",
        fallback_img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=400&fit=crop&q=80",
        angles: { hip: 100, knee: 120 },
        tolerance: 15,
        benefits: {
          en: [
            "Gentle hip and knee mobilization",
            "Reduces lower body stiffness",
            "Improves digestion",
            "Relieves lower back pressure",
            "Enhances joint lubrication"
          ],
          kn: [
            "ಸೌಮ್ಯವಾದ ಸೊಂಟ ಮತ್ತು ಮೊಣಕಾಲು ಚಲನೆ",
            "ಕೆಳಗಿನ ದೇಹದ ಬಿಗುವನ್ನು ಕಡಿಮೆ ಮಾಡುತ್ತದೆ",
            "ಜೀರ್ಣಕ್ರಿಯೆಯನ್ನು ಸುಧಾರಿಸುತ್ತದೆ",
            "ಕೆಳ ಬೆನ್ನು ಒತ್ತಡವನ್ನು ಕಡಿಮೆ ಮಾಡುತ್ತದೆ",
            "ಕೀಲುಗಳ ಲೂಬ್ರಿಕೇಷನ್ ಅನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ"
          ]
        },
        instructions: {
          en: {
            start: "Lie on back, pull knees to chest",
            correct: "Relaxing pose! Breathe deeply",
            adjust_hip: "Bring knees closer to chest",
            adjust_knee: "Hold knees comfortably",
            relax: "Rock gently side to side"
          },
          kn: {
            start: "ಬೆನ್ನಿನ ಮೇಲೆ ಮಲಗಿ, ಮೊಣಕಾಲುಗಳನ್ನು ಎದೆಯ ಕಡೆಗೆ ಎಳೆಯಿರಿ",
            correct: "ವಿಶ್ರಾಂತಿ ಭಂಗಿ! ಆಳವಾಗಿ ಉಸಿರಾಡಿ",
            adjust_hip: "ಮೊಣಕಾಲುಗಳನ್ನು ಎದೆಯ ಹತ್ತಿರ ತನ್ನಿ",
            adjust_knee: "ಮೊಣಕಾಲುಗಳನ್ನು ಆರಾಮದಾಯಕವಾಗಿ ಹಿಡಿಯಿರಿ",
            relax: "ಸೌಮ್ಯವಾಗಿ ಒಂದು ಬದಿಯಿಂದ ಇನ್ನೊಂದು ಬದಿಗೆ ಆಡಿಸಿ"
          }
        }
      },
    ],
  },
  
  obesity: {
    underweight: [
      {
        name: "Tadasana (Mountain Pose)",
        img: "imagex/Tadasana (Mountain Pose).webp",
        fallback_img: "https://images.unsplash.com/photo-1573361467587-2e48dbf9d907?w=600&h=400&fit=crop&q=80",
        angles: {
          shoulder: 180,
          hip: 180,
          knee: 180,
          ankle: 90,
        },
        tolerance: 15,
        benefits: {
          en: [
            "Improves posture and alignment",
            "Strengthens core muscles",
            "Enhances body awareness",
            "Builds foundation for other poses",
            "Promotes mindful breathing"
          ],
          kn: [
            "ಭಂಗಿ ಮತ್ತು ಜೋಡಣೆಯನ್ನು ಸುಧಾರಿಸುತ್ತದೆ",
            "ತೊಳೆ ಸ್ನಾಯುಗಳನ್ನು ಬಲಪಡಿಸುತ್ತದೆ",
            "ದೇಹದ ಪ್ರಜ್ಞೆಯನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ",
            "ಇತರ ಭಂಗಿಗಳಿಗೆ ಆಧಾರವನ್ನು ನಿರ್ಮಿಸುತ್ತದೆ",
            "ಪ್ರಜ್ಞಾಪೂರ್ವಕ ಉಸಿರಾಟವನ್ನು ಪ್ರೋತ್ಸಾಹಿಸುತ್ತದೆ"
          ]
        },
        instructions: {
          en: {
            start: "Stand tall, feet together, arms at sides",
            correct: "Strong mountain! Stand grounded",
            adjust_shoulder: "Roll shoulders back and down",
            adjust_hip: "Engage core, tuck tailbone",
            adjust_knee: "Keep legs straight but not locked"
          },
          kn: {
            start: "ಎತ್ತರವಾಗಿ ನಿಲ್ಲಿಸಿ, ಪಾದಗಳನ್ನು ಒಟ್ಟಿಗೆ, ತೋಳುಗಳು ಪಕ್ಕದಲ್ಲಿ",
            correct: "ಶಕ್ತಿಶಾಲಿ ಪರ್ವತ! ನೆಲೆಗೊಂಡು ನಿಲ್ಲಿಸಿ",
            adjust_shoulder: "ಭುಜಗಳನ್ನು ಹಿಂದಕ್ಕೆ ಮತ್ತು ಕೆಳಗೆ ತಿರುಗಿಸಿ",
            adjust_hip: "ತೊಳೆಯನ್ನು ತೊಡಗಿಸಿ, ಬಾಲದ ಮೂಳೆಯನ್ನು ಒಳಗೆ ಎಳೆಯಿರಿ",
            adjust_knee: "ಕಾಲುಗಳನ್ನು ನೇರವಾಗಿ ಇರಿಸಿ ಆದರೆ ಬಿಗುವಲ್ಲ"
          }
        }
      },
    ],
    normal: [
      {
        name: "Trikonasana (Triangle Pose)",
        img: "imagex/Trikonasana (Triangle Pose).webp",
        fallback_img: "https://images.unsplash.com/photo-1573361467587-2e48dbf9d907?w=600&h=400&fit=crop&q=80",
        angles: { hip: 135, knee: 170, shoulder: 160 },
        tolerance: 15,
        benefits: {
          en: [
            "Stretches hips and hamstrings",
            "Strengthens legs and core",
            "Improves balance and coordination",
            "Reduces waistline fat",
            "Enhances digestion"
          ],
          kn: [
            "ಸೊಂಟ ಮತ್ತು ಹ್ಯಾಮ್‌ಸ್ಟ್ರಿಂಗ್‌ಗಳನ್ನು ವಿಸ್ತರಿಸುತ್ತದೆ",
            "ಕಾಲುಗಳು ಮತ್ತು ತೊಳೆಯನ್ನು ಬಲಪಡಿಸುತ್ತದೆ",
            "ಸಮತೋಲನ ಮತ್ತು ಸಮನ್ವಯವನ್ನು ಸುಧಾರಿಸುತ್ತದೆ",
            "ಸೊಂಟದ ಕೊಬ್ಬನ್ನು ಕಡಿಮೆ ಮಾಡುತ್ತದೆ",
            "ಜೀರ್ಣಕ್ರಿಯೆಯನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ"
          ]
        },
        instructions: {
          en: {
            start: "Stand wide, extend arms, reach forward",
            correct: "Beautiful triangle! Hold strong",
            adjust_hip: "Open hips to the side",
            adjust_knee: "Keep front leg straight",
            adjust_shoulder: "Stack shoulders vertically"
          },
          kn: {
            start: "ಅಗಲವಾಗಿ ನಿಲ್ಲಿಸಿ, ತೋಳುಗಳನ್ನು ಚಾಚಿ, ಮುಂದೆ ತಲುಪಿ",
            correct: "ಸುಂದರ ತ್ರಿಕೋನ! ಶಕ್ತಿಶಾಲಿಯಾಗಿ ಹಿಡಿದುಕೊಳ್ಳಿ",
            adjust_hip: "ಸೊಂಟವನ್ನು ಪಕ್ಕಕ್ಕೆ ತೆರೆಯಿರಿ",
            adjust_knee: "ಮುಂಭಾಗದ ಕಾಲನ್ನು ನೇರವಾಗಿ ಇರಿಸಿ",
            adjust_shoulder: "ಭುಜಗಳನ್ನು ಲಂಬವಾಗಿ ಜೋಡಿಸಿ"
          }
        }
      },
    ],
    overweight: [
      {
        name: "Balasana (Child's Pose)",
        img: "imagex/Balasana (Child's Pose) - Copy.webp",
        fallback_img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=400&fit=crop&q=80",
        angles: { hip: 100, knee: 130, shoulder: 150 },
        tolerance: 15,
        benefits: {
          en: [
            "Gentle full-body stretch",
            "Relieves back and hip tension",
            "Calms the nervous system",
            "Reduces stress and fatigue",
            "Promotes relaxation"
          ],
          kn: [
            "ಸೌಮ್ಯವಾದ ಪೂರ್ಣ ದೇಹದ ವಿಸ್ತರಣೆ",
            "ಬೆನ್ನು ಮತ್ತು ಸೊಂಟದ ಒತ್ತಡವನ್ನು ಕಡಿಮೆ ಮಾಡುತ್ತದೆ",
            "ನರಮಂಡಲವನ್ನು ಶಾಂತಗೊಳಿಸುತ್ತದೆ",
            "ಒತ್ತಡ ಮತ್ತು ಆಯಾಸವನ್ನು ಕಡಿಮೆ ಮಾಡುತ್ತದೆ",
            "ವಿಶ್ರಾಂತಿಯನ್ನು ಪ್ರೋತ್ಸಾಹಿಸುತ್ತದೆ"
          ]
        },
        instructions: {
          en: {
            start: "Kneel, sit back, extend arms forward",
            correct: "Resting peacefully! Relax completely",
            adjust_hip: "Sit back towards heels",
            adjust_knee: "Separate knees comfortably",
            adjust_shoulder: "Reach arms forward gently"
          },
          kn: {
            start: "ಮಂಡಿಯೂರಿ, ಹಿಂದಕ್ಕೆ ಕುಳಿತು, ತೋಳುಗಳನ್ನು ಮುಂದೆ ಚಾಚಿ",
            correct: "ಶಾಂತಿಯಾಗಿ ವಿಶ್ರಾಂತಿ! ಪೂರ್ತಿಯಾಗಿ ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ",
            adjust_hip: "ಹಿಮ್ಮಡಿಗಳ ಕಡೆಗೆ ಹಿಂದಕ್ಕೆ ಕುಳಿತುಕೊಳ್ಳಿ",
            adjust_knee: "ಮೊಣಕಾಲುಗಳನ್ನು ಆರಾಮದಾಯಕವಾಗಿ ಪ್ರತ್ಯೇಕಿಸಿ",
            adjust_shoulder: "ತೋಳುಗಳನ್ನು ಸೌಮ್ಯವಾಗಿ ಮುಂದೆ ಚಾಚಿ"
          }
        }
      },
    ],
  },
  
  diabetes_type_1: {
    underweight: [
      {
        name: "Pranayama (Deep Breathing)",
        img: "imagex/Pranayama.jpg",
        fallback_img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=400&fit=crop&q=80",
        angles: { spine: 180, shoulder: 170 },
        tolerance: 15,
        benefits: {
          en: [
            "Regulates endocrine system",
            "Reduces stress-induced glucose spikes",
            "Improves oxygenation",
            "Calms the nervous system",
            "Supports pancreatic health"
          ],
          kn: [
            "ಎಂಡೋಕ್ರೈನ್ ವ್ಯವಸ್ಥೆಯನ್ನು ನಿಯಂತ್ರಿಸುತ್ತದೆ",
            "ಒತ್ತಡದಿಂದ ಉಂಟಾಗುವ ಗ್ಲೂಕೋಸ್ ಏರಿಳಿತವನ್ನು ಕಡಿಮೆ ಮಾಡುತ್ತದೆ",
            "ಆಮ್ಲಜನಕೀಕರಣವನ್ನು ಸುಧಾರಿಸುತ್ತದೆ",
            "ನರಮಂಡಲವನ್ನು ಶಾಂತಗೊಳಿಸುತ್ತದೆ",
            "ಪ್ಯಾಂಕ್ರಿಯಾಸ್ ಆರೋಗ್ಯವನ್ನು ಬೆಂಬಲಿಸುತ್ತದೆ"
          ]
        },
        instructions: {
          en: {
            start: "Sit straight, hands on knees, eyes closed",
            correct: "Perfect posture! Breathe slowly",
            adjust_spine: "Straighten your back",
            adjust_shoulder: "Relax your shoulders"
          },
          kn: {
            start: "ನೇರವಾಗಿ ಕುಳಿತುಕೊಳ್ಳಿ, ಮೊಣಕಾಲುಗಳ ಮೇಲೆ ಕೈಗಳನ್ನು ಇರಿಸಿ",
            correct: "ಪರಿಪೂರ್ಣ ಭಂಗಿ! ನಿಧಾನವಾಗಿ ಉಸಿರಾಡಿ",
            adjust_spine: "ನಿಮ್ಮ ಬೆನ್ನನ್ನು ನೇರಗೊಳಿಸಿ",
            adjust_shoulder: "ನಿಮ್ಮ ಭುಜಗಳನ್ನು ಸಡಿಲಗೊಳಿಸಿ"
          }
        }
      },
    ],
    normal: [
      {
        name: "Vrikshasana (Tree Pose)",
        img: "imagex/Vrikshasana.jpg",
        fallback_img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop&q=80",
        angles: { knee: 60, hip: 90, shoulder: 180 },
        tolerance: 15,
        benefits: {
          en: [
            "Improves balance and focus",
            "Strengthens leg muscles",
            "Enhances neuromuscular coordination",
            "Helps in consistent glucose regulation",
            "Improves concentration"
          ],
          kn: [
            "ಸಮತೋಲನ ಮತ್ತು ಗಮನವನ್ನು ಸುಧಾರಿಸುತ್ತದೆ",
            "ಕಾಲಿನ ಸ್ನಾಯುಗಳನ್ನು ಬಲಪಡಿಸುತ್ತದೆ",
            "ನರಸ್ನಾಯುಕ ಸಮನ್ವಯವನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ",
            "ಸ್ಥಿರ ಗ್ಲೂಕೋಸ್ ನಿಯಂತ್ರಣಕ್ಕೆ ಸಹಾಯ ಮಾಡುತ್ತದೆ",
            "ಏಕಾಗ್ರತೆಯನ್ನು ಸುಧಾರಿಸುತ್ತದೆ"
          ]
        },
        instructions: {
          en: {
            start: "Stand on one leg, place other foot on inner thigh",
            correct: "Great balance! Focus on one point",
            adjust_knee: "Turn your knee outward more",
            adjust_hip: "Keep your hips level",
            adjust_shoulder: "Reach arms up to the sky"
          },
          kn: {
            start: "ಒಂದು ಕಾಲಿನ ಮೇಲೆ ನಿಲ್ಲಿಸಿ, ಇನ್ನೊಂದು ಪಾದವನ್ನು ತೊಡೆಯ ಮೇಲೆ ಇರಿಸಿ",
            correct: "ಅದ್ಭುತ ಸಮತೋಲನ! ಒಂದು ಬಿಂದುವಿನ ಮೇಲೆ ಗಮನ ಹರಿಸಿ",
            adjust_knee: "ನಿಮ್ಮ ಮೊಣಕಾಲನ್ನು ಹೆಚ್ಚು ಹೊರಕ್ಕೆ ತಿರುಗಿಸಿ",
            adjust_hip: "ನಿಮ್ಮ ಸೊಂಟವನ್ನು ಮಟ್ಟವಾಗಿ ಇರಿಸಿ",
            adjust_shoulder: "ತೋಳುಗಳನ್ನು ಆಕಾಶದ ಕಡೆಗೆ ಚಾಚಿ"
          }
        }
      },
    ],
    overweight: [
      {
        name: "Ardha Matsyendrasana (Half Fish Pose)",
        img: "imagex/Ardha Matsyendrasana.jpg",
        fallback_img: "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=600&h=400&fit=crop&q=80",
        angles: { spine: 130, shoulder: 140 },
        tolerance: 15,
        benefits: {
          en: [
            "Massages abdominal organs",
            "Stimulates insulin secretion",
            "Improves spinal flexibility",
            "Helps with weight management",
            "Relieves back tension"
          ],
          kn: [
            "ಹೊಟ್ಟೆಯ ಅಂಗಗಳಿಗೆ ಮಸಾಜ್ ನೀಡುತ್ತದೆ",
            "ಇನ್ಸುಲಿನ್ ಸ್ರವಿಕೆಯನ್ನು ಉತ್ತೇಜಿಸುತ್ತದೆ",
            "ಬೆನ್ನುಹುರಿಯ ನಮ್ಯತೆಯನ್ನು ಸುಧಾರಿಸುತ್ತದೆ",
            "ತೂಕ ನಿರ್ವಹಣೆಗೆ ಸಹಾಯ ಮಾಡುತ್ತದೆ",
            "ಬೆನ್ನು ಒತ್ತಡವನ್ನು ಕಡಿಮೆ ಮಾಡುತ್ತದೆ"
          ]
        },
        instructions: {
          en: {
            start: "Sit cross-legged, twist your upper body",
            correct: "Excellent twist! Breathe deeply",
            adjust_spine: "Sit tall and lengthen spine",
            adjust_shoulder: "Twist further from shoulders"
          },
          kn: {
            start: "ಕಾಲುಗಳನ್ನು ಅಡ್ಡಲಾಗಿ ಹಾಕಿ ಕುಳಿತು, ದೇಹವನ್ನು ತಿರುಗಿಸಿ",
            correct: "ಅದ್ಭುತ ತಿರುವು! ಆಳವಾಗಿ ಉಸಿರಾಡಿ",
            adjust_spine: "ನೇರವಾಗಿ ಕುಳಿತು ಬೆನ್ನುಹುರಿಯನ್ನು ಉದ್ದಗೊಳಿಸಿ",
            adjust_shoulder: "ಭುಜಗಳಿಂದ ಇನ್ನೂ ಹೆಚ್ಚು ತಿರುಗಿಸಿ"
          }
        }
      },
    ],
  },
  diabetes_type_2: {
    underweight: [
      {
        name: "Trikonasana (Triangle Pose)",
        img: "imagex/Trikonasana.webp",
        fallback_img: "https://images.unsplash.com/photo-1573361467587-2e48dbf9d907?w=600&h=400&fit=crop&q=80",
        angles: { hip: 135, knee: 170, shoulder: 160 },
        tolerance: 15,
        benefits: {
          en: [
            "Increases insulin sensitivity",
            "Stretches and strengthens whole body",
            "Improves digestion",
            "Reduces blood sugar levels",
            "Builds core strength"
          ],
          kn: [
            "ಇನ್ಸುಲಿನ್ ಸೂಕ್ಷ್ಮತೆಯನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ",
            "ಪೂರ್ಣ ದೇಹವನ್ನು ವಿಸ್ತರಿಸುತ್ತದೆ ಮತ್ತು ಬಲಪಡಿಸುತ್ತದೆ",
            "ಜೀರ್ಣಕ್ರಿಯೆಯನ್ನು ಸುಧಾರಿಸುತ್ತದೆ",
            "ರಕ್ತದ ಸಕ್ಕರೆ ಮಟ್ಟವನ್ನು ಕಡಿಮೆ ಮಾಡುತ್ತದೆ",
            "ತೊಳೆ ಶಕ್ತಿಯನ್ನು ನಿರ್ಮಿಸುತ್ತದೆ"
          ]
        },
        instructions: {
          en: {
            start: "Stand wide, reach down to your ankle",
            correct: "Perfect triangle! Stay steady",
            adjust_hip: "Push your hips to the side",
            adjust_knee: "Keep your legs straight",
            adjust_shoulder: "Stack your shoulders vertically"
          },
          kn: {
            start: "ಅಗಲವಾಗಿ ನಿಲ್ಲಿಸಿ, ನಿಮ್ಮ ಮೊಣಕಾಲನ್ನು ತಲುಪಿ",
            correct: "ಪರಿಪೂರ್ಣ ತ್ರಿಕೋನ! ಸ್ಥಿರವಾಗಿರಿ",
            adjust_hip: "ನಿಮ್ಮ ಸೊಂಟವನ್ನು ಪಕ್ಕಕ್ಕೆ ತಳ್ಳಿ",
            adjust_knee: "ನಿಮ್ಮ ಕಾಲುಗಳನ್ನು ನೇರವಾಗಿ ಇರಿಸಿ",
            adjust_shoulder: "ಭುಜಗಳನ್ನು ಲಂಬವಾಗಿ ಜೋಡಿಸಿ"
          }
        }
      },
    ],
    normal: [
      {
        name: "Utkatasana (Chair Pose)",
        img: "imagex/Utkatasana.jpg",
        fallback_img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=400&fit=crop&q=80",
        angles: { knee: 100, hip: 110, shoulder: 170 },
        tolerance: 15,
        benefits: {
          en: [
            "Boosts metabolism and fat burn",
            "Improves insulin resistance in large muscles",
            "Strengthens legs and lower back",
            "Increases heart rate for calorie burn",
            "Tones abdominal organs"
          ],
          kn: [
            "ಚಯಾಪಚಯ ಮತ್ತು ಕೊಬ್ಬು ಸುಡುವಿಕೆಯನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ",
            "ದೊಡ್ಡ ಸ್ನಾಯುಗಳಲ್ಲಿ ಇನ್ಸುಲಿನ್ ಪ್ರತಿರೋಧವನ್ನು ಸುಧಾರಿಸುತ್ತದೆ",
            "ಕಾಲುಗಳು ಮತ್ತು ಕೆಳ ಬೆನ್ನನ್ನು ಬಲಪಡಿಸುತ್ತದೆ",
            "ಕ್ಯಾಲೋರಿ ಸುಡಲು ಹೃದಯ ಬಡಿತವನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ",
            "ಹೊಟ್ಟೆಯ ಅಂಗಗಳನ್ನು ಟೋನ್ ಮಾಡುತ್ತದೆ"
          ]
        },
        instructions: {
          en: {
            start: "Sit back like you're in a chair",
            correct: "Strong chair pose! Feel the burn",
            adjust_knee: "Bend your knees more",
            adjust_hip: "Lower your hips more",
            adjust_shoulder: "Keep your arms straight up"
          },
          kn: {
            start: "ಕುರ್ಚಿಯಲ್ಲಿ ಕುಳಿತಂತೆ ಹಿಂದಕ್ಕೆ ಕುಳಿತುಕೊಳ್ಳಿ",
            correct: "ಶಕ್ತಿಶಾಲಿ ಕುರ್ಚಿಯ ಭಂಗಿ! ಬಿಸಿಯನ್ನು ಅನುಭವಿಸಿ",
            adjust_knee: "ನಿಮ್ಮ ಮೊಣಕಾಲುಗಳನ್ನು ಹೆಚ್ಚು ಬಾಗಿಸಿ",
            adjust_hip: "ನಿಮ್ಮ ಸೊಂಟವನ್ನು ಇನ್ನೂ ಕೆಳಕ್ಕೆ ಇಳಿಸಿ",
            adjust_shoulder: "ನಿಮ್ಮ ತೋಳುಗಳನ್ನು ನೇರವಾಗಿ ಮೇಲೆ ಇರಿಸಿ"
          }
        }
      },
    ],
    overweight: [
      {
        name: "Surya Namaskar (Sun Salutation)",
        img: "imagex/Surya Namaskar.jpg",
        fallback_img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=400&fit=crop&q=80",
        angles: { spine: 150, knee: 160, hip: 140 },
        tolerance: 20,
        benefits: {
          en: [
            "Complete body workout for weight loss",
            "Significantly improves insulin sensitivity",
            "Enhances cardiovascular health",
            "Improves whole-body blood circulation",
            "Reduces obesity-related diabetes risks"
          ],
          kn: [
            "ತೂಕ ಇಳಿಕೆಗೆ ಪೂರ್ಣ ದೇಹದ ವ್ಯಾಯಾಮ",
            "ಇನ್ಸುಲಿನ್ ಸೂಕ್ಷ್ಮತೆಯನ್ನು ಗಣನೀಯವಾಗಿ ಸುಧಾರಿಸುತ್ತದೆ",
            "ಹೃದಯರಕ್ತನಾಳದ ಆರೋಗ್ಯವನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ",
            "ಪೂರ್ಣ ದೇಹದ ರಕ್ತ ಪರಿಚಲನೆಯನ್ನು ಸುಧಾರಿಸುತ್ತದೆ",
            "ಬೊಜ್ಜು ಸಂಬಂಧಿತ ಮಧುಮೇಹದ ಅಪಾಯವನ್ನು ಕಡಿಮೆ ಮಾಡುತ್ತದೆ"
          ]
        },
        instructions: {
          en: {
            start: "Flow through the 12 positions",
            correct: "Great flow! Keep it moving",
            adjust_spine: "Arch your back gracefully",
            adjust_knee: "Bend or straighten knees as guided",
            adjust_hip: "Move hips with control"
          },
          kn: {
            start: "12 ಸ್ಥಾನಗಳ ಮೂಲಕ ಚಲಿಸಿ",
            correct: "ಅದ್ಭುತ ಚಲನೆ! ಮುಂದುವರಿಸಿ",
            adjust_spine: "ಬೆನ್ನನ್ನು ಆಕರ್ಷಕವಾಗಿ ಬಾಗಿಸಿ",
            adjust_knee: "ಸೂಚಿಸಿದಂತೆ ಮೊಣಕಾಲುಗಳನ್ನು ಬಾಗಿಸಿ ಅಥವಾ ನೇರಗೊಳಿಸಿ",
            adjust_hip: "ಸೊಂಟವನ್ನು ನಿಯಂತ್ರಣದಿಂದ ಚಲಿಸಿ"
          }
        }
      },
    ],
  },
};

const dietDatabase = {
  diabetes_type_1: {
    underweight: [
      "Focus on high-protein, high-calorie healthy meals.",
      "Carbohydrate counting is essential for insulin management.",
      "Include healthy fats like avocados, nuts, and olive oil.",
      "Eat 5-6 small meals throughout the day to maintain energy."
    ],
    normal: [
      "Maintain a balanced intake of complex carbs, fiber, and lean protein.",
      "Pre-exercise snack with 15g carbs if level is < 100 mg/dL.",
      "Focus on low-glycemic index (GI) foods to avoid spikes.",
      "Ensure adequate hydration during exercise."
    ],
    overweight: [
      "Focus on portion control and high-fiber vegetables.",
      "Prioritize lean proteins (fish, chicken breast, tofu).",
      "Avoid sugary drinks and refined carbohydrates.",
      "Consistent timing of meals helps stabilize glucose."
    ]
  },
  diabetes_type_2: {
    underweight: [
      "Increase calorie intake with nutrient-dense foods.",
      "Avoid large amounts of simple sugars even if underweight.",
      "Strength-building diet with adequate protein (1.2g/kg).",
      "Include whole grains and legumes for sustained energy."
    ],
    normal: [
      "Mediterranean-style diet is highly recommended.",
      "Focus on leafy greens, whole grains, and healthy fats.",
      "Limit saturated fats and trans fats.",
      "15-20% of calories from protein, 45-50% from complex carbs."
    ],
    overweight: [
      "Calorie deficit (500-750 kcal/day) for weight loss.",
      "High fiber intake (>25g/day) to improve insulin sensitivity.",
      "Intermittent fasting can be considered under supervision.",
      "Avoid 'low-fat' processed foods which often have hidden sugars."
    ]
  },
  general: [
    "Stay hydrated: Drink at least 8-10 glasses of water.",
    "Limit processed foods and excessive salt.",
    "Prioritize whole, single-ingredient foods.",
    "Consult a certified dietician for a personalized meal plan."
  ]
};
