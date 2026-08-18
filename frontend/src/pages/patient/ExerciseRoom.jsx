import { useEffect, useRef, useState, useCallback } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { ExerciseCounter, detectFall, getPostureFeedback } from '../../utils/exerciseLogic';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const renderExerciseGuideSVG = (slug) => {
  const transition = {
    duration: 2.5,
    repeat: Infinity,
    repeatType: "reverse",
    ease: "easeInOut"
  };

  switch (slug) {
    case 'bicep-curl':
      return (
        <svg width="150" height="150" viewBox="0 0 200 200" className="text-primary-600">
          <circle cx="100" cy="60" r="8" fill="currentColor" />
          <text x="100" y="45" textAnchor="middle" className="text-[10px] font-bold" fill="currentColor">Shoulder</text>
          <line x1="100" y1="60" x2="100" y2="110" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
          <circle cx="100" cy="110" r="6" fill="#ef4444" />
          <motion.g
            animate={{ rotate: [0, -95, 0] }}
            style={{ originX: "100px", originY: "110px" }}
            transition={transition}
          >
            <line x1="100" y1="110" x2="100" y2="160" stroke="#3b82f6" strokeWidth="5" strokeLinecap="round" />
            <circle cx="100" cy="160" r="6" fill="currentColor" />
            <rect x="85" y="157" width="30" height="6" rx="2" fill="#1e293b" />
            <circle cx="85" cy="160" r="8" fill="#1e293b" />
            <circle cx="115" cy="160" r="8" fill="#1e293b" />
          </motion.g>
        </svg>
      );
    case 'shoulder-press':
      return (
        <svg width="150" height="150" viewBox="0 0 200 200" className="text-primary-600">
          <circle cx="100" cy="50" r="12" fill="currentColor" />
          <line x1="100" y1="62" x2="100" y2="130" stroke="currentColor" strokeWidth="5" />
          <line x1="75" y1="75" x2="125" y2="75" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
          <motion.g animate={{ y: [0, -35, 0] }} transition={transition}>
            <line x1="75" y1="75" x2="60" y2="60" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
            <line x1="60" y1="60" x2="60" y2="30" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
            <rect x="45" y="27" width="30" height="6" rx="2" fill="#1e293b" />
            <circle cx="45" cy="30" r="8" fill="#1e293b" />
            <circle cx="75" cy="30" r="8" fill="#1e293b" />
          </motion.g>
          <motion.g animate={{ y: [0, -35, 0] }} transition={transition}>
            <line x1="125" y1="75" x2="140" y2="60" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
            <line x1="140" y1="60" x2="140" y2="30" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
            <rect x="125" y="27" width="30" height="6" rx="2" fill="#1e293b" />
            <circle cx="125" cy="30" r="8" fill="#1e293b" />
            <circle cx="155" cy="30" r="8" fill="#1e293b" />
          </motion.g>
        </svg>
      );
    case 'squat':
      return (
        <svg width="150" height="150" viewBox="0 0 200 200" className="text-primary-600">
          <motion.g animate={{ y: [0, 30, 0] }} transition={transition}>
            <circle cx="100" cy="40" r="10" fill="currentColor" />
            <line x1="100" y1="50" x2="100" y2="100" stroke="currentColor" strokeWidth="5" />
            <circle cx="100" cy="100" r="5" fill="#ef4444" />
          </motion.g>
          <motion.path
            d="M 100 100 L 75 130 L 75 180"
            animate={{
              d: [
                "M 100 100 L 75 130 L 75 180",
                "M 100 130 L 60 145 L 75 180",
                "M 100 100 L 75 130 L 75 180"
              ]
            }}
            transition={transition}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <motion.path
            d="M 100 100 L 125 130 L 125 180"
            animate={{
              d: [
                "M 100 100 L 125 130 L 125 180",
                "M 100 130 L 140 145 L 125 180",
                "M 100 100 L 125 130 L 125 180"
              ]
            }}
            transition={transition}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <line x1="50" y1="180" x2="150" y2="180" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case 'lateral-raise':
      return (
        <svg width="150" height="150" viewBox="0 0 200 200" className="text-primary-600">
          <circle cx="100" cy="50" r="12" fill="currentColor" />
          <line x1="100" y1="62" x2="100" y2="140" stroke="currentColor" strokeWidth="5" />
          <motion.g
            animate={{ rotate: [0, -80, 0] }}
            style={{ originX: "100px", originY: "70px" }}
            transition={transition}
          >
            <line x1="100" y1="70" x2="50" y2="70" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
            <circle cx="50" cy="70" r="5" fill="#1e293b" />
            <line x1="50" y1="60" x2="50" y2="80" stroke="#1e293b" strokeWidth="3" />
          </motion.g>
          <motion.g
            animate={{ rotate: [0, 80, 0] }}
            style={{ originX: "100px", originY: "70px" }}
            transition={transition}
          >
            <line x1="100" y1="70" x2="150" y2="70" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
            <circle cx="150" cy="70" r="5" fill="#1e293b" />
            <line x1="150" y1="60" x2="150" y2="80" stroke="#1e293b" strokeWidth="3" />
          </motion.g>
        </svg>
      );
    case 'seated-march':
      return (
        <svg width="150" height="150" viewBox="0 0 200 200" className="text-primary-600">
          {/* Chair */}
          <line x1="85" y1="120" x2="85" y2="170" stroke="#94a3b8" strokeWidth="4" />
          <line x1="125" y1="120" x2="125" y2="170" stroke="#94a3b8" strokeWidth="4" />
          <line x1="75" y1="120" x2="125" y2="120" stroke="#64748b" strokeWidth="6" strokeLinecap="round" />
          <line x1="75" y1="70" x2="75" y2="120" stroke="#64748b" strokeWidth="6" strokeLinecap="round" />
          
          {/* Torso */}
          <circle cx="100" cy="55" r="10" fill="currentColor" />
          <line x1="100" y1="65" x2="100" y2="115" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
          
          {/* Seated Arms */}
          <line x1="100" y1="75" x2="120" y2="95" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          
          {/* Marching Legs */}
          <motion.g
            animate={{ rotate: [0, -35, 0] }}
            style={{ originX: "100px", originY: "115px" }}
            transition={transition}
          >
            <line x1="100" y1="115" x2="135" y2="115" stroke="#3b82f6" strokeWidth="5" strokeLinecap="round" />
            <line x1="135" y1="115" x2="135" y2="150" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
          </motion.g>
        </svg>
      );
    case 'seated-twist':
      return (
        <svg width="150" height="150" viewBox="0 0 200 200" className="text-primary-600">
          {/* Chair */}
          <line x1="80" y1="130" x2="80" y2="175" stroke="#94a3b8" strokeWidth="4" />
          <line x1="120" y1="130" x2="120" y2="175" stroke="#94a3b8" strokeWidth="4" />
          <line x1="70" y1="130" x2="130" y2="130" stroke="#64748b" strokeWidth="6" strokeLinecap="round" />
          
          {/* Head & Torso */}
          <circle cx="100" cy="55" r="10" fill="currentColor" />
          <line x1="100" y1="65" x2="100" y2="125" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
          
          {/* Twisting Shoulders/Arms */}
          <motion.g
            animate={{ scaleX: [1, -0.6, 1] }}
            style={{ originX: "100px", originY: "75px" }}
            transition={transition}
          >
            <line x1="70" y1="75" x2="130" y2="75" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" />
            <circle cx="70" cy="75" r="5" fill="currentColor" />
            <circle cx="130" cy="75" r="5" fill="currentColor" />
            {/* Crossed arms shape */}
            <path d="M 70 75 Q 100 95 130 75" fill="none" stroke="#3b82f6" strokeWidth="4" />
          </motion.g>
          
          {/* Static legs */}
          <line x1="100" y1="125" x2="85" y2="135" stroke="currentColor" strokeWidth="4" />
          <line x1="85" y1="135" x2="85" y2="170" stroke="currentColor" strokeWidth="4" />
          <line x1="100" y1="125" x2="115" y2="135" stroke="currentColor" strokeWidth="4" />
          <line x1="115" y1="135" x2="115" y2="170" stroke="currentColor" strokeWidth="4" />
        </svg>
      );
    case 'walking-place':
      return (
        <svg width="150" height="150" viewBox="0 0 200 200" className="text-primary-600">
          {/* Head & Torso */}
          <circle cx="100" cy="45" r="10" fill="currentColor" />
          <line x1="100" y1="55" x2="100" y2="115" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
          
          {/* Walking Legs */}
          <motion.g
            animate={{ rotate: [-20, 20, -20] }}
            style={{ originX: "100px", originY: "115px" }}
            transition={transition}
          >
            <line x1="100" y1="115" x2="90" y2="150" stroke="#3b82f6" strokeWidth="5" strokeLinecap="round" />
            <line x1="90" y1="150" x2="100" y2="180" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
          </motion.g>
          
          <motion.g
            animate={{ rotate: [20, -20, 20] }}
            style={{ originX: "100px", originY: "115px" }}
            transition={transition}
          >
            <line x1="100" y1="115" x2="110" y2="150" stroke="#3b82f6" strokeWidth="5" strokeLinecap="round" />
            <line x1="110" y1="150" x2="120" y2="180" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
          </motion.g>

          {/* Walking Arms */}
          <motion.g
            animate={{ rotate: [25, -25, 25] }}
            style={{ originX: "100px", originY: "65px" }}
            transition={transition}
          >
            <line x1="100" y1="65" x2="85" y2="100" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </motion.g>
          <motion.g
            animate={{ rotate: [-25, 25, -25] }}
            style={{ originX: "100px", originY: "65px" }}
            transition={transition}
          >
            <line x1="100" y1="65" x2="115" y2="100" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </motion.g>
          
          <line x1="60" y1="180" x2="140" y2="180" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg width="150" height="150" viewBox="0 0 200 200" className="text-primary-600">
          <circle cx="100" cy="45" r="12" fill="currentColor" />
          <line x1="100" y1="57" x2="100" y2="120" stroke="currentColor" strokeWidth="5" />
          <line x1="75" y1="70" x2="125" y2="70" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
          <line x1="100" y1="120" x2="80" y2="170" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <line x1="100" y1="120" x2="120" y2="170" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <motion.circle
            cx="100"
            cy="45"
            r="20"
            stroke="#ef4444"
            strokeWidth="2"
            fill="none"
            animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0.8] }}
            transition={transition}
          />
          <motion.circle
            cx="75"
            cy="70"
            r="12"
            stroke="#ef4444"
            strokeWidth="2"
            fill="none"
            animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
            transition={transition}
          />
          <motion.circle
            cx="125"
            cy="70"
            r="12"
            stroke="#ef4444"
            strokeWidth="2"
            fill="none"
            animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
            transition={transition}
          />
        </svg>
      );
  }
};

export default function ExerciseRoom() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [exercises, setExercises] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [activeTab, setActiveTab] = useState('recommended'); // 'recommended', 'all', 'caution'
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [reps, setReps] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [feedback, setFeedback] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [sessionFeedbackHistory, setSessionFeedbackHistory] = useState([]);
  const [correctionsCount, setCorrectionsCount] = useState(0);
  const [fallDetected, setFallDetected] = useState(false);
  const [configuringExercise, setConfiguringExercise] = useState(null);
  const [timeLimit, setTimeLimit] = useState(300); // default 5 minutes
  const [preExerciseSugar, setPreExerciseSugar] = useState('');
  
  // Camera absence tracking
  const [absenceWarningSeconds, setAbsenceWarningSeconds] = useState(null);
  const lastVisibleTimeRef = useRef(Date.now());
  const isEmergencyDispatchedRef = useRef(false);
  const hasMediaPipeReceivedFirstFrameRef = useRef(false);
  const [liveAngle, setLiveAngle] = useState(0);
  const [hasMedicalClearance, setHasMedicalClearance] = useState(false);
  const [emailSending, setEmailSending] = useState(false);

  const isLocked = (exId) => {
    if (!recommendations) return false;
    return !recommendations.recommendations.primary.some(p => p._id === exId);
  };
  const exerciseCounterRef = useRef(null);
  const animFrameRef = useRef(null);
  const poseRef = useRef(null);
  const lastVoiceRef = useRef(0);

  // Profile Form States
  const [profileForm, setProfileForm] = useState({
    height: '',
    weight: '',
    age: '',
    gender: '',
    isPregnant: false,
    pregnancyWeeks: 0,
    conditions: []
  });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Exercise Completion & Diet Plan States
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [workoutSummary, setWorkoutSummary] = useState(null);
  const [dietPlan, setDietPlan] = useState(null);
  const [loadingDiet, setLoadingDiet] = useState(false);

  useEffect(() => {
    // Fetch personalized recommendations
    api.get('/exercises/recommendations')
      .then(res => {
        setRecommendations(res.data.data);
        const recs = res.data.data.recommendations;
        const combined = [...recs.primary, ...recs.secondary, ...recs.caution];
        setExercises(combined);
      })
      .catch(() => {
        // Fallback to fetch all active exercises if recommendations fail
        api.get('/exercises').then(res => setExercises(res.data.data)).catch(() => {});
      });
  }, []);

  const unmountRef = useRef({ isActive: false, sessionId: null, reps: 0, elapsed: 0, accuracy: 100, fallDetected: false, correctionsCount: 0, sessionFeedbackHistory: [], selectedExercise: null });

  useEffect(() => {
    unmountRef.current = { isActive, sessionId, reps, elapsed, accuracy, fallDetected, correctionsCount, sessionFeedbackHistory, selectedExercise };
  }, [isActive, sessionId, reps, elapsed, accuracy, fallDetected, correctionsCount, sessionFeedbackHistory, selectedExercise]);

  useEffect(() => {
    const handleUnload = () => {
      const data = unmountRef.current;
      if (data.isActive && data.sessionId) {
        data.isActive = false; // Prevent duplicate execution
        
        const finalReps = exerciseCounterRef.current ? exerciseCounterRef.current.reps : data.reps;
        const finalDuration = exerciseCounterRef.current?._startTime
          ? Math.round((Date.now() - exerciseCounterRef.current._startTime) / 1000)
          : data.elapsed;
        const finalCalories = Math.round(finalDuration * (data.selectedExercise?.caloriesPerMinute || 5) / 60);

        let finalAccuracy = data.accuracy;
        if (exerciseCounterRef.current && exerciseCounterRef.current.frameCount > 0) {
          const avgErr = exerciseCounterRef.current.totalAngleError / exerciseCounterRef.current.frameCount;
          finalAccuracy = Math.round(Math.max(0, 100 - avgErr * 2));
        }

        const payload = JSON.stringify({
          repsCompleted: finalReps,
          setsCompleted: Math.floor(finalReps / (data.selectedExercise?.targetReps || 10)) || 1,
          accuracyScore: finalAccuracy,
          caloriesBurned: finalCalories,
          fallDetected: data.fallDetected,
          postureCorrections: data.correctionsCount,
          feedback: data.sessionFeedbackHistory.map(msg => ({ timestamp: new Date(), message: msg, severity: 'warning' }))
        });

        const token = localStorage.getItem('token');
        const baseUrl = api.defaults.baseURL.startsWith('http')
          ? api.defaults.baseURL
          : `${window.location.protocol}//${window.location.hostname}:5000${api.defaults.baseURL}`;

        const blob = new Blob([payload], { type: 'text/plain' });
        navigator.sendBeacon(`${baseUrl}/exercises/session/${data.sessionId}/end-beacon?token=${token}`, blob);
      }
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      handleUnload();
    };
  }, []);

  // Initialize profile form once recommendations are loaded
  useEffect(() => {
    if (recommendations && recommendations.profile) {
      setProfileForm({
        height: recommendations.profile.height || '',
        weight: recommendations.profile.weight || '',
        age: recommendations.profile.age || '',
        gender: recommendations.profile.gender || '',
        isPregnant: recommendations.profile.isPregnant || false,
        pregnancyWeeks: recommendations.profile.pregnancyWeeks || 0,
        conditions: recommendations.profile.conditions || []
      });
    }
  }, [recommendations]);

  useEffect(() => {
    setHasMedicalClearance(false);
  }, [configuringExercise]);

  useEffect(() => {
    if (isActive && videoRef.current && (!exerciseCounterRef.current || !exerciseCounterRef.current._camera)) {
      loadMediaPipe();
    }
  }, [isActive, videoRef.current]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      let dateOfBirth = null;
      if (profileForm.age) {
        const birthYear = new Date().getFullYear() - parseInt(profileForm.age);
        dateOfBirth = new Date(birthYear, 0, 1);
      }
      
      const payload = {
        profile: {
          height: parseFloat(profileForm.height),
          weight: parseFloat(profileForm.weight),
          dateOfBirth: dateOfBirth,
          gender: profileForm.gender,
        },
        patientInfo: {
          isPregnant: profileForm.isPregnant,
          pregnancyWeeks: profileForm.isPregnant ? parseInt(profileForm.pregnancyWeeks) || 0 : 0,
          conditions: profileForm.conditions
        }
      };
      
      await api.put('/users/me', payload);
      toast.success('Health profile updated successfully!');
      
      // Re-fetch recommendations to sync
      const res = await api.get('/exercises/recommendations');
      setRecommendations(res.data.data);
      const recs = res.data.data.recommendations;
      const combined = [...recs.primary, ...recs.secondary, ...recs.caution];
      setExercises(combined);
      setIsProfileModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const speak = useCallback((text, bypassThrottle = false) => {
    if (!voiceEnabled) return;
    if (!bypassThrottle && Date.now() - lastVoiceRef.current < 3000) return;
    if (!bypassThrottle) lastVoiceRef.current = Date.now();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1;
    utterance.volume = 0.8;
    window.speechSynthesis.speak(utterance);
  }, [voiceEnabled]);

  const speakEmergency = (text) => {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.volume = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("Speech error:", e);
    }
  };

  const startExercise = async (exercise, durationLimit, preSugarValue) => {
    setSelectedExercise(exercise);
    exerciseCounterRef.current = new ExerciseCounter(exercise.slug);
    exerciseCounterRef.current._startTime = Date.now();
    setReps(0);
    setAccuracy(100);
    setFeedback([]);
    setFallDetected(false);
    setElapsed(0);
    setSessionFeedbackHistory([]);
    setCorrectionsCount(0);
    
    // Reset camera absence states
    lastVisibleTimeRef.current = Date.now();
    isEmergencyDispatchedRef.current = false;
    hasMediaPipeReceivedFirstFrameRef.current = false;
    setAbsenceWarningSeconds(null);

    try {
      const res = await api.post('/exercises/session/start', { 
        exerciseId: exercise._id,
        preExerciseSugar: preSugarValue
      });
      setSessionId(res.data.data._id);
    } catch { toast.error('Failed to start session'); return; }

    // Start camera
    setIsActive(true);
    speak(`Starting ${exercise.name}. Follow the instructions and keep good form!`);

    // Timer
    const startTime = Date.now();
    const timer = setInterval(() => {
        const secondsPassed = Math.floor((Date.now() - startTime) / 1000);
        setElapsed(secondsPassed);

        // Track camera absence time
        if (!hasMediaPipeReceivedFirstFrameRef.current) {
          lastVisibleTimeRef.current = Date.now();
        }
        const timeSinceLastSeen = Date.now() - lastVisibleTimeRef.current;
        const secondsAbsent = Math.floor(timeSinceLastSeen / 1000);

        if (secondsAbsent > 15) {
          if (!isEmergencyDispatchedRef.current) {
            isEmergencyDispatchedRef.current = true;
            triggerEmergencyAlert('user_absent');
          }
        } else if (secondsAbsent > 5) {
          const countdown = 15 - secondsAbsent;
          setAbsenceWarningSeconds(countdown);
          if (secondsAbsent % 3 === 0) {
            speakEmergency(`Warning. User not visible. Emergency alert in ${countdown} seconds.`);
          }
        } else {
          setAbsenceWarningSeconds(null);
          if (isEmergencyDispatchedRef.current) {
            isEmergencyDispatchedRef.current = false;
          }
        }
        
        // Enforce time limit if set (limit > 0)
        if (durationLimit > 0 && secondsPassed >= durationLimit) {
          clearInterval(timer);
          stopExercise(true);
        }
      }, 1000);
      exerciseCounterRef.current._timer = timer;

      // MediaPipe will be loaded via useEffect once the video element is mounted in the DOM
  };

  const handleStartWorkout = async () => {
    if (isConfigLocked) return;
    if (isCautionConfig && !hasMedicalClearance) return;
    
    const preSugarNum = parseFloat(preExerciseSugar);
    if (!preSugarNum || isNaN(preSugarNum) || preSugarNum <= 0) {
      toast.error('Please enter a valid pre-exercise blood sugar level (mg/dL) to unlock the workout.');
      return;
    }

    try {
      // 1. Log to general Health Log
      await api.post('/health', {
        metricType: 'random',
        value: preSugarNum,
        unit: 'mg/dL',
        notes: `Logged automatically before starting ${configuringExercise.name}`
      });
      
      // 2. Start active session
      await startExercise(configuringExercise, timeLimit, preSugarNum);
      
      // 3. Cleanup configuration states
      setPreExerciseSugar('');
      setConfiguringExercise(null);
    } catch (err) {
      toast.error('Failed to log blood sugar and initialize workout session');
    }
  };

  const loadMediaPipe = async () => {
    try {
      let PoseClass, CameraClass, drawConnectorsFunc, drawLandmarksFunc;

      if (window.Pose && window.Camera) {
        PoseClass = window.Pose;
        CameraClass = window.Camera;
        drawConnectorsFunc = window.drawConnectors;
        drawLandmarksFunc = window.drawLandmarks;
      } else {
        const { Pose } = await import('@mediapipe/pose');
        const { Camera } = await import('@mediapipe/camera_utils');
        const { drawConnectors, drawLandmarks } = await import('@mediapipe/drawing_utils');
        PoseClass = Pose;
        CameraClass = Camera;
        drawConnectorsFunc = drawConnectors;
        drawLandmarksFunc = drawLandmarks;
      }

      const pose = new PoseClass({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });

      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      pose.onResults((results) => {
        hasMediaPipeReceivedFirstFrameRef.current = true;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = 640;
        canvas.height = 480;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (results.poseLandmarks && results.poseLandmarks.length > 0) {
          // Update presence timestamp and clear warnings
          lastVisibleTimeRef.current = Date.now();
          setAbsenceWarningSeconds(null);

          // Draw skeleton
          drawConnectorsFunc(ctx, results.poseLandmarks, [[11,13],[13,15],[12,14],[14,16],[11,12],[11,23],[12,24],[23,24],[23,25],[24,26],[25,27],[26,28],[27,29],[28,30],[29,31],[30,32]], { color: '#3b82f6', lineWidth: 3 });
          drawLandmarksFunc(ctx, results.poseLandmarks, { color: '#ef4444', lineWidth: 1, radius: 4 });

          // Process exercise
          const counter = exerciseCounterRef.current;
          if (counter) {
            const config = selectedExercise?.landmarks?.angleThresholds || { minAngle: 30, maxAngle: 160 };
            const result = counter.processFrame(results.poseLandmarks, config);
            if (result) {
              setReps(result.reps);
              setAccuracy(result.accuracy);
              setLiveAngle(result.primaryAngle || 0);

              // Posture feedback
              const postureFeedback = getPostureFeedback(results.poseLandmarks);
              const combinedFeedback = [...(postureFeedback || []), ...(result.feedback || [])];
              setFeedback(combinedFeedback.slice(0, 3));

              if (combinedFeedback.length > 0) {
                setSessionFeedbackHistory(prev => {
                  const updated = [...prev];
                  combinedFeedback.forEach(msg => {
                    if (!updated.includes(msg)) {
                      updated.push(msg);
                    }
                  });
                  return updated;
                });
                setCorrectionsCount(prev => prev + combinedFeedback.length);
              }

              // Voice coaching on rep completion
              if (result.reps > 0 && result.reps !== counter._lastReps) {
                speak(`Rep ${result.reps}! ${result.accuracy > 80 ? 'Great form!' : 'Focus on your form.'}`);
                counter._lastReps = result.reps;
              } else if (postureFeedback.length > 0) {
                if (postureFeedback[0]) speak(postureFeedback[0]);
              }
            }

            if (detectFall(results.poseLandmarks)) {
              if (!isEmergencyDispatchedRef.current) {
                isEmergencyDispatchedRef.current = true;
                setFallDetected(true);
                triggerEmergencyAlert('fall_detected');
              }
            }
          }
        }
      });

      poseRef.current = pose;

      const camera = new CameraClass(videoRef.current, {
        onFrame: async () => { await pose.send({ image: videoRef.current }); },
        facingMode: 'user'
      });
      camera.start();
      exerciseCounterRef.current._camera = camera;
    } catch (err) {
      console.error('MediaPipe load error:', err);
      toast.error('Pose detection failed to load. Exercise tracking disabled.');
    }
  };

  const triggerEmergencyAlert = (reason) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          sendEmergencyPayload(reason, latitude, longitude);
        },
        (error) => {
          console.error("Geolocation retrieval error:", error);
          sendEmergencyPayload(reason, null, null);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      sendEmergencyPayload(reason, null, null);
    }
  };

  const sendEmergencyPayload = async (reason, latitude, longitude) => {
    let message = "A potential emergency was detected.";
    let title = "Emergency Alert";
    
    if (reason === 'user_absent') {
      title = "Emergency Alert: User Absent";
      message = "User has been absent from the camera for more than 10 seconds during exercise.";
      speakEmergency("Emergency alert triggered. User not detected. Notifying emergency contacts.");
    } else if (reason === 'fall_detected') {
      title = "Emergency Alert: Fall Detected";
      message = "A potential fall was detected during exercise.";
      speakEmergency("Emergency alert triggered. Potential fall detected. Notifying emergency contacts.");
    }

    toast.error("Emergency Alert Dispatched!", { duration: 5000 });

    try {
      const locationData = latitude && longitude ? {
        latitude,
        longitude,
        address: `GPS Coordinates: Lat ${latitude.toFixed(6)}, Lon ${longitude.toFixed(6)}`
      } : {
        address: "Location access denied or unavailable"
      };

      await api.post('/alerts', {
        type: reason === 'user_absent' ? 'user_absent' : 'fall_detected',
        severity: 'critical',
        title,
        message,
        location: locationData,
        data: {
          exerciseName: selectedExercise?.name || 'Unknown Exercise',
          sessionStartTime: exerciseCounterRef.current?._startTime ? new Date(exerciseCounterRef.current._startTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
          duration: elapsed ? `${elapsed} seconds` : '10 seconds'
        }
      });
    } catch (err) {
      console.error("Failed to post emergency alert:", err);
    }

    stopExercise(false);
  };

  const stopExercise = async (isTimeLimitReached = false) => {
    setIsActive(false);
    setAbsenceWarningSeconds(null);
    try {
      if (exerciseCounterRef.current) {
        if (exerciseCounterRef.current._timer) clearInterval(exerciseCounterRef.current._timer);
        if (exerciseCounterRef.current._camera) exerciseCounterRef.current._camera.stop();
      }
    } catch (e) { console.error('Error stopping timer/camera', e); }
    try {
      if (poseRef.current) poseRef.current.close();
    } catch (e) { console.error('Error closing pose detector', e); }
    try {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop());
        videoRef.current.srcObject = null;
      }
    } catch (e) { console.error('Error stopping video stream tracks', e); }
    try {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    } catch (e) { console.error('Error cancelling animation frame', e); }

    // Compute exact metrics from the source of truth
    const finalDuration = exerciseCounterRef.current?._startTime
      ? Math.round((Date.now() - exerciseCounterRef.current._startTime) / 1000)
      : elapsed;

    const finalReps = exerciseCounterRef.current ? exerciseCounterRef.current.reps : reps;

    let finalAccuracy = accuracy;
    if (exerciseCounterRef.current && exerciseCounterRef.current.frameCount > 0) {
      const avgErr = exerciseCounterRef.current.totalAngleError / exerciseCounterRef.current.frameCount;
      finalAccuracy = Math.round(Math.max(0, 100 - avgErr * 2));
    }

    const finalCalories = Math.round(finalDuration * (selectedExercise?.caloriesPerMinute || 5) / 60);

    const summaryData = {
      exerciseName: selectedExercise?.name,
      exerciseCategory: selectedExercise?.category,
      reps: finalReps,
      sets: Math.floor(finalReps / (selectedExercise?.targetReps || 10)) || 1,
      accuracy: finalAccuracy,
      duration: finalDuration,
      calories: finalCalories,
      postureCorrections: correctionsCount,
      feedbackHistory: sessionFeedbackHistory,
      isCaution: recommendations?.recommendations?.caution?.some(c => c._id === selectedExercise?._id) || false
    };

    setWorkoutSummary(summaryData);
    setShowCompletionModal(true);

    // End session in backend and load pre-generated diet plan
    setLoadingDiet(true);
    if (sessionId) {
      try {
        const res = await api.put(`/exercises/session/${sessionId}/end`, {
          repsCompleted: finalReps,
          setsCompleted: summaryData.sets,
          accuracyScore: finalAccuracy,
          caloriesBurned: finalCalories,
          fallDetected,
          postureCorrections: correctionsCount,
          feedback: sessionFeedbackHistory.map(msg => ({ timestamp: new Date(), message: msg, severity: 'warning' }))
        });

        if (res.data?.dietPlan) {
          setDietPlan(res.data.dietPlan);
        }
      } catch (err) {
        console.error('Failed to save session', err);
      } finally {
        setLoadingDiet(false);
      }
    } else {
      setLoadingDiet(false);
    }

    speak(isTimeLimitReached 
      ? 'Time limit reached. Fantastic work!'
      : 'Exercise session ended. Great job!'
    );
  };

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  
  const isCautionConfig = configuringExercise && recommendations?.recommendations?.caution?.some(c => c._id === configuringExercise._id);
  const isConfigLocked = configuringExercise && isLocked(configuringExercise._id);

  return (
    <Layout>
      <div className="page-container">
        <h1 className="text-2xl font-bold mb-6">AI Exercise Room</h1>

        {!isActive ? (
          recommendations && (!recommendations.profile.height || !recommendations.profile.weight || recommendations.profile.age === null) ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-xl mx-auto py-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card p-8 bg-white border border-gray-150 rounded-3xl shadow-xl flex flex-col items-center"
              >
                <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-4xl mb-6 border border-amber-100 animate-pulse">
                  ⚠️
                </div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Health Profile Metrics Required</h2>
                <p className="text-gray-600 text-sm mt-3 leading-relaxed font-medium">
                  Welcome to the AI Exercise Room! To ensure your safety, prevent injuries, and configure pose-guided target thresholds, we require your health metrics.
                </p>
                <p className="text-gray-500 text-xs mt-2 italic bg-gray-50 px-4 py-2.5 rounded-2xl border border-gray-100 font-medium">
                  We use your height and weight to calculate your BMI, customize exercises, and select safe body mapping joint bounds.
                </p>
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="mt-8 px-8 py-3.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-extrabold text-sm rounded-2xl shadow-lg hover:shadow-indigo-500/25 transition duration-300 transform hover:-translate-y-0.5"
                >
                  Configure Health Metrics Now
                </button>
              </motion.div>
            </div>
          ) : (
            <div className="space-y-8">
            {/* Recommendations profile dashboard */}
            {recommendations && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl border border-indigo-900/30 flex flex-col md:flex-row gap-6 items-stretch"
              >
                {/* Profile Stats */}
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        Personalized Plan
                      </span>
                      {recommendations.profile.isPregnant && (
                        <span className="ml-2 bg-pink-500/20 text-pink-300 border border-pink-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                          🤰 Pregnant ({recommendations.profile.pregnancyWeeks} Weeks)
                        </span>
                      )}
                      <h2 className="text-xl font-bold mt-3 text-white">Your Health Profile Summary</h2>
                      <p className="text-gray-400 text-xs mt-1">
                        {recommendations.profile.isPregnant 
                          ? 'Exercises are customized for pregnancy health, safety guidelines, and active trimesters.' 
                          : 'Exercises are dynamically scored based on your body metrics and age group.'}
                      </p>
                    </div>
                    <button
                      onClick={() => setIsProfileModalOpen(true)}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-bold text-white transition duration-300 flex items-center gap-1.5"
                    >
                      ✏️ Edit Metrics
                    </button>
                  </div>
                  
                  {/* Grid of stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                    <div className="bg-white/5 rounded-2xl p-3 border border-white/5 flex flex-col justify-center">
                      <span className="text-[10px] text-gray-400 font-bold uppercase">Height</span>
                      <span className="text-lg font-black text-white mt-1">{recommendations.profile.height ? `${recommendations.profile.height} cm` : 'N/A'}</span>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-3 border border-white/5 flex flex-col justify-center">
                      <span className="text-[10px] text-gray-400 font-bold uppercase">Weight</span>
                      <span className="text-lg font-black text-white mt-1">{recommendations.profile.weight ? `${recommendations.profile.weight} kg` : 'N/A'}</span>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-3 border border-white/5 flex flex-col justify-center">
                      <span className="text-[10px] text-gray-400 font-bold uppercase">BMI Score</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-lg font-black text-white">{recommendations.profile.bmi || 'N/A'}</span>
                        {recommendations.profile.bmiCategory && (
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                            recommendations.profile.bmiCategory === 'Normal Weight' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                            recommendations.profile.bmiCategory === 'Underweight' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                            recommendations.profile.bmiCategory === 'Overweight' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                            'bg-red-500/20 text-red-300 border border-red-500/30'
                          }`}>
                            {recommendations.profile.bmiCategory}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-3 border border-white/5 flex flex-col justify-center">
                      <span className="text-[10px] text-gray-400 font-bold uppercase">Age Group</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-lg font-black text-white">{recommendations.profile.age !== null ? `${recommendations.profile.age} yrs` : 'N/A'}</span>
                        {recommendations.profile.ageCategory && (
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                            recommendations.profile.ageCategory === 'Senior Citizen' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                            recommendations.profile.ageCategory === 'Child' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                            'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                          }`}>
                            {recommendations.profile.ageCategory}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Conditions & Injury Badges */}
                  {recommendations.profile.conditions && recommendations.profile.conditions.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2 items-center border-t border-white/10 pt-3">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Active Injuries:</span>
                      {recommendations.profile.conditions.map(cond => (
                        <span key={cond} className="px-2.5 py-0.5 rounded-full text-[9px] font-black bg-red-500/20 text-red-300 border border-red-500/30 uppercase tracking-wide">
                          ⚠️ {cond.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Precaution Box */}
                <div className="md:w-5/12 bg-amber-500/10 border border-amber-500/20 rounded-3xl p-5 flex flex-col justify-center text-amber-100">
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <span className="text-xl">🛡️</span>
                    <h3 className="font-extrabold text-sm uppercase tracking-wider text-amber-300">Safety & Joint Precautions</h3>
                  </div>
                  <p className="text-xs leading-relaxed font-medium text-amber-100/90 whitespace-pre-line">
                    {recommendations.precautionText}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Warning if metrics are missing */}
            {recommendations && (!recommendations.profile.height || !recommendations.profile.weight || recommendations.profile.age === null) && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-extrabold text-amber-950 text-base">⚠️ Missing Health Metrics</h3>
                  <p className="text-amber-800 text-xs mt-1">Please enter your height, weight, and age to get personalized AI exercise recommendations and joint safety guidelines.</p>
                </div>
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xs rounded-xl shadow transition duration-300"
                >
                  Enter Profile Metrics
                </button>
              </div>
            )}

            {/* Selection Tabs */}
            {recommendations && (
              <div className="flex border-b border-gray-200 gap-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('recommended')}
                  className={`pb-3 px-4 font-bold text-sm transition-all border-b-2 ${
                    activeTab === 'recommended'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  ⭐ Recommended ({recommendations.recommendations.primary.length})
                </button>
                
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`pb-3 px-4 font-bold text-sm transition-all border-b-2 flex items-center gap-1.5 ${
                    activeTab === 'all'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  🔒 Other Workouts ({recommendations.recommendations.secondary.length})
                </button>

                {recommendations.recommendations.caution.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('caution')}
                    className={`pb-3 px-4 font-bold text-sm transition-all border-b-2 flex items-center gap-1.5 ${
                      activeTab === 'caution'
                        ? 'border-red-500 text-red-500'
                        : 'border-transparent text-red-300/60 hover:text-red-400'
                    }`}
                  >
                    🔒 Caution / Avoid ({recommendations.recommendations.caution.length})
                  </button>
                )}
              </div>
            )}

            <div>
              <p className="text-gray-600 mb-6">
                {activeTab === 'recommended' && 'These exercises are highly recommended for your specific age category and body mass index (BMI).'}
                {activeTab === 'all' && 'Additional active exercises that are safe to incorporate into your routines.'}
                {activeTab === 'caution' && 'These exercises require caution or special support. Consult with a doctor or health professional if you feel joint strain.'}
              </p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {(recommendations 
                  ? (activeTab === 'recommended' 
                      ? recommendations.recommendations.primary 
                      : (activeTab === 'all' 
                          ? recommendations.recommendations.secondary 
                          : recommendations.recommendations.caution)) 
                  : exercises
                ).map(ex => {
                  const isSitting = ['seated-march', 'seated-twist', 'ankle-pump'].includes(ex.slug);
                  const exerciseTypeTag = isSitting ? "Sitting Posture" : "Active Movement";
                  const typeColor = isSitting 
                    ? "bg-teal-50 text-teal-700 border border-teal-200" 
                    : "bg-indigo-50 text-indigo-700 border border-indigo-200";

                  const isExLocked = isLocked(ex._id);

                  return (
                    <motion.div 
                      key={ex._id} 
                      whileHover={{ y: -4 }} 
                      className={`card overflow-hidden flex flex-col justify-between border bg-white rounded-xl transition-all duration-300 cursor-pointer ${
                        isExLocked ? 'opacity-80 border-dashed border-gray-300 hover:shadow-md' : 'border-gray-100 hover:shadow-lg'
                      }`}
                      onClick={() => setConfiguringExercise(ex)}
                    >
                      <div>
                        {/* Exercise Thumbnail */}
                        <div className="relative h-44 w-full bg-slate-50 overflow-hidden border-b border-gray-100 flex items-center justify-center">
                          {ex.thumbnail ? (
                            <img 
                              src={ex.thumbnail} 
                              alt={ex.name} 
                              className="w-full h-full object-contain p-2 transition-transform duration-500 hover:scale-105" 
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400';
                              }}
                            />
                          ) : (
                            <div className="text-gray-400 font-bold text-sm">No Image</div>
                          )}
                          <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm ${typeColor}`}>
                            {exerciseTypeTag}
                          </span>
                          
                          {/* Locked Badge */}
                          {isExLocked && (
                            <span className="absolute top-3 left-1/2 transform -translate-x-1/2 text-[10px] font-extrabold px-2.5 py-1 bg-gray-600 text-white rounded-full shadow-sm uppercase tracking-wide flex items-center gap-1">
                              🔒 Locked for your BMI
                            </span>
                          )}

                          <span className="absolute top-3 right-3 text-xs font-semibold px-2 py-0.5 bg-gray-900/80 text-white rounded-full backdrop-blur-sm">
                            {ex.difficulty}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          <h3 className="font-bold text-lg text-gray-800 mb-1">{ex.name}</h3>
                          <p className="text-xs text-primary-600 font-semibold mb-2 capitalize">
                            {ex.category.replace('_', ' ')}
                          </p>
                          <p className="text-sm text-gray-600 line-clamp-2 h-10 mb-4">{ex.description}</p>
                        </div>
                      </div>

                      {/* Stats & Actions */}
                      <div className="px-4 pb-4 pt-2 border-t border-gray-50 flex items-center justify-between bg-gray-50/50">
                        <div className="flex gap-3 text-xs text-gray-500 font-medium">
                          <div>
                            <span className="text-gray-800 font-bold">{ex.targetSets}</span> sets
                          </div>
                          <div>
                            <span className="text-gray-800 font-bold">{ex.targetReps}</span> reps
                          </div>
                          <div>
                            <span className="text-gray-800 font-bold">{ex.caloriesPerMinute}</span> cal/m
                          </div>
                        </div>
                        <span className={`text-xs font-semibold flex items-center gap-1 ${
                          isExLocked
                            ? 'text-gray-400'
                            : 'text-primary-600 hover:underline'
                        }`}>
                          {isExLocked ? 'Locked 🔒' : 'Start →'}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
          )
        ) : (
          <div className="max-w-5xl mx-auto pb-12">
            {/* Header: Exercise Info */}
            <div className="card flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm mb-6">
              <div>
                <h2 className="font-bold text-xl text-gray-900">{selectedExercise?.name}</h2>
                <p className="text-xs text-gray-500 capitalize">
                  {selectedExercise?.category?.replace('_', ' ')} • {selectedExercise?.difficulty}
                </p>
              </div>
              <button 
                onClick={() => stopExercise(false)} 
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl transition shadow-sm"
              >
                Stop Exercise
              </button>
            </div>

            {/* Responsive Split Layout */}
            <div className="grid md:grid-cols-12 gap-6 items-start">
              {/* Left Column: Big Camera View (takes 7 cols on desktop, full width on mobile) */}
              <div className="md:col-span-7 space-y-4">
                <div className="card overflow-hidden bg-black relative rounded-3xl border border-gray-100 shadow-lg aspect-[3/4] md:max-h-[650px] w-full flex items-center justify-center">
                  <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                  <canvas ref={canvasRef} className="pose-overlay" />
                  
                  {/* Fall Warning */}
                  {fallDetected && (
                    <div className="absolute inset-0 bg-red-500/60 flex items-center justify-center backdrop-blur-sm z-30">
                      <div className="bg-white rounded-3xl p-8 text-center shadow-2xl max-w-sm mx-4">
                        <span className="text-5xl">⚠️</span>
                        <p className="text-red-600 text-2xl font-black mt-3">FALL DETECTED</p>
                        <p className="text-gray-600 text-sm mt-2 font-medium leading-relaxed">
                          A potential fall was detected. Emergency alert has been dispatched to your healthcare provider.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Camera Absence Warning */}
                  {absenceWarningSeconds !== null && (
                    <div className="absolute inset-0 bg-red-600/70 flex items-center justify-center backdrop-blur-md z-30 animate-pulse">
                      <div className="bg-white rounded-3xl p-6 text-center shadow-2xl max-w-sm mx-4 border-2 border-red-500">
                        <span className="text-5xl">⚠️</span>
                        <p className="text-red-600 text-2xl font-black mt-3">USER NOT DETECTED</p>
                        <p className="text-gray-600 text-sm mt-2 font-medium leading-relaxed">
                          Please return in front of the camera. Emergency alert will trigger in:
                        </p>
                        <p className="text-4xl font-black text-red-600 mt-2">{absenceWarningSeconds}s</p>
                      </div>
                    </div>
                  )}

                  {/* Floating Live Angle & Live Status Badge */}
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-black/60 text-white px-4 py-3 rounded-2xl backdrop-blur-md border border-white/10 text-xs font-semibold z-20">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                      Webcam Stream
                    </span>
                    
                    {/* Live Angle Indicator */}
                    <div className="flex items-center gap-2">
                      <span className="text-gray-300">Live Angle:</span>
                      <span className={`px-2.5 py-1 rounded-lg font-black text-sm tracking-wide transition-colors ${
                        (liveAngle >= (selectedExercise?.landmarks?.angleThresholds?.minAngle ?? 30) && 
                         liveAngle <= (selectedExercise?.landmarks?.angleThresholds?.maxAngle ?? 160))
                          ? 'bg-green-500 text-white shadow-sm' 
                          : 'bg-yellow-500 text-black shadow-sm'
                      }`}>
                        {Math.round(liveAngle)}°
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Visual Guide & Stats (takes 5 cols on desktop, full width on mobile) */}
              <div className="md:col-span-5 space-y-4">
                {/* Visual Guide Card */}
                <div className="card p-5 bg-gradient-to-br from-primary-50/80 to-blue-50/30 border border-primary-100 rounded-3xl shadow-sm flex flex-col items-center">
                  <div className="text-center w-full mb-4">
                    <h3 className="font-extrabold text-sm text-primary-950 tracking-wide uppercase">Posture Guide & Reference</h3>
                    <div className="flex justify-center gap-3 mt-3">
                      {/* Target Angle Range */}
                      <div className="bg-white px-3 py-1.5 rounded-xl border border-primary-100/50 text-xs shadow-xs">
                        <span className="text-gray-500 font-medium">Target:</span>
                        <span className="font-extrabold text-primary-700 ml-1">
                          {(selectedExercise?.landmarks?.angleThresholds?.minAngle ?? 30)}° - {(selectedExercise?.landmarks?.angleThresholds?.maxAngle ?? 160)}°
                        </span>
                      </div>
                      {/* Match Status Badge */}
                      <div className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-300 shadow-xs ${
                        (liveAngle >= (selectedExercise?.landmarks?.angleThresholds?.minAngle ?? 30) && 
                         liveAngle <= (selectedExercise?.landmarks?.angleThresholds?.maxAngle ?? 160))
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : 'bg-gray-100 text-gray-500 border-gray-200'
                      }`}>
                        {(liveAngle >= (selectedExercise?.landmarks?.angleThresholds?.minAngle ?? 30) && 
                          liveAngle <= (selectedExercise?.landmarks?.angleThresholds?.maxAngle ?? 160))
                          ? '✓ In Target Zone'
                          : 'Adjust Angle'}
                      </div>
                    </div>
                  </div>

                  {/* Photo & SVG Side-by-Side inside a small box */}
                  <div className="w-full grid grid-cols-2 gap-3 mb-4">
                    {selectedExercise?.thumbnail ? (
                      <div className="h-32 rounded-2xl overflow-hidden border border-primary-100/60 bg-white flex items-center justify-center shadow-xs">
                        <img 
                          src={selectedExercise.thumbnail} 
                          alt={selectedExercise.name} 
                          className="w-full h-full object-contain p-1.5" 
                        />
                      </div>
                    ) : (
                      <div className="h-32 rounded-2xl border border-primary-100/60 bg-white flex items-center justify-center text-xs text-gray-400">
                        No image
                      </div>
                    )}
                    <div className="h-32 rounded-2xl border border-primary-100/60 bg-white flex items-center justify-center p-2 shadow-xs">
                      {renderExerciseGuideSVG(selectedExercise?.slug)}
                    </div>
                  </div>

                  <div className="w-full bg-white/95 p-3 rounded-2xl border border-primary-50/60 text-xs text-gray-700 shadow-xs">
                    <p className="font-bold text-primary-900 mb-1">Target Movement:</p>
                    <p className="leading-relaxed text-gray-600 font-medium">{selectedExercise?.description}</p>
                  </div>
                </div>

                {/* Performance Stats Panel */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="card text-center p-4 bg-white border border-gray-100 rounded-3xl shadow-sm">
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Reps</p>
                    <p className="text-3xl font-black text-primary-600 mt-1">{reps}</p>
                  </div>
                  <div className="card text-center p-4 bg-white border border-gray-100 rounded-3xl shadow-sm">
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Accuracy</p>
                    <p className="text-3xl font-black text-green-600 mt-1">{accuracy}%</p>
                  </div>
                  <div className="card text-center p-4 bg-white border border-gray-100 rounded-3xl shadow-sm">
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Duration</p>
                    <p className="text-3xl font-black text-gray-800 mt-1">{formatTime(elapsed)}</p>
                  </div>
                </div>

                {/* Real-time Feedback & Safety Controls */}
                <div className="card p-5 bg-white border border-gray-100 rounded-3xl shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b pb-3 border-gray-100">
                    <span className="text-xs font-bold text-gray-800">Voice Assistant Feedback</span>
                    <button 
                      onClick={() => setVoiceEnabled(!voiceEnabled)} 
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                        voiceEnabled 
                          ? 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100' 
                          : 'bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100'
                      }`}
                    >
                      {voiceEnabled ? 'Coaching On' : 'Coaching Off'}
                    </button>
                  </div>

                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Real-Time Feedback</p>
                    {feedback.length > 0 ? (
                      <div className="space-y-1.5">
                        {feedback.map((f, i) => (
                          <div key={i} className="p-2.5 bg-amber-50 text-amber-800 rounded-2xl text-xs flex items-center gap-2 border border-amber-100 font-medium">
                            <span className="text-sm">⚠️</span>
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic font-medium">No posture adjustments needed. Form is perfect!</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Workout Configuration Modal */}
        {configuringExercise && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border flex flex-col justify-between max-h-[90vh] overflow-y-auto ${
                isConfigLocked 
                  ? 'border-amber-200 shadow-amber-100/40'
                  : isCautionConfig 
                    ? 'border-red-200 shadow-red-100/50' 
                    : 'border-gray-100'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{configuringExercise.name}</h3>
                    <p className="text-xs text-primary-600 font-semibold uppercase mt-0.5">{configuringExercise.category.replace('_', ' ')}</p>
                  </div>
                  <button 
                    onClick={() => setConfiguringExercise(null)} 
                    className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
                  >
                    &times;
                  </button>
                </div>

                {isConfigLocked && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 text-xs text-amber-800 flex items-start gap-2.5 shadow-sm animate-pulse">
                    <span className="text-lg">🔒</span>
                    <div>
                      <span className="font-extrabold uppercase block tracking-wider mb-0.5 text-amber-950">Exercise Locked</span>
                      <p className="font-medium leading-relaxed">
                        This exercise is currently locked. It is not recommended for your current safety level or BMI category. Please consult your physician or specialist to adjust your profile metrics.
                      </p>
                    </div>
                  </div>
                )}

                {isCautionConfig && !isConfigLocked && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4 text-xs text-red-800 flex items-start gap-2.5 shadow-sm">
                    <span className="text-lg">⚠️</span>
                    <div>
                      <span className="font-extrabold uppercase block tracking-wider mb-0.5 text-red-950">Clinical Safety Precaution</span>
                      <p className="font-medium leading-relaxed">
                        This exercise is classified under **Caution / Avoid** because it could aggravate your physical injuries or present a safety hazard based on your health profile.
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Image */}
                {configuringExercise.thumbnail && (
                  <div className="h-44 w-full rounded-lg overflow-hidden bg-slate-50 border border-gray-100 mb-4 flex items-center justify-center">
                    <img 
                      src={configuringExercise.thumbnail} 
                      alt={configuringExercise.name} 
                      className="w-full h-full object-contain p-3" 
                    />
                  </div>
                )}
                
                <p className="text-sm text-gray-600 mb-4">{configuringExercise.description}</p>
                
                {/* Time selector */}
                {!isConfigLocked && (
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Select Workout Duration
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: '1 Minute', value: 60 },
                        { label: '2 Minutes', value: 120 },
                        { label: '5 Minutes', value: 300 },
                        { label: '10 Minutes', value: 600 },
                        { label: 'No Limit (Free Play)', value: 0 }
                      ].map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setTimeLimit(opt.value)}
                          className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                            timeLimit === opt.value
                              ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pre-Exercise Blood Sugar Input (Required) */}
                {!isConfigLocked && (
                  <div className="mb-6 bg-blue-50/50 border border-blue-100 rounded-2xl p-4">
                    <label className="block text-xs font-black text-blue-900 uppercase tracking-wide mb-2 flex items-center gap-1">
                      🩸 Pre-Exercise Blood Sugar (Required)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={preExerciseSugar}
                        onChange={e => setPreExerciseSugar(e.target.value)}
                        placeholder="Enter current glucose e.g. 120"
                        className="w-full pl-3 pr-16 py-2.5 rounded-xl border border-blue-200 bg-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs font-bold text-gray-400">
                        mg/dL
                      </span>
                    </div>
                    <p className="text-[10px] text-blue-700/80 mt-1.5 font-medium leading-normal">
                      Entering your current blood sugar is clinically required to auto-sync with your Health Log and track glycemic improvements.
                    </p>
                  </div>
                )}


                {/* Precautions */}
                {configuringExercise.precautions?.length > 0 && (
                  <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <h4 className="text-xs font-bold text-amber-800 mb-1 flex items-center gap-1">⚠️ Safety Precautions:</h4>
                    <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
                      {configuringExercise.precautions.map((p, idx) => (
                        <li key={idx}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              {isCautionConfig && !isConfigLocked && (
                <div className="mt-4 mb-4 bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-2 shadow-xs">
                  <input
                    type="checkbox"
                    id="medicalClearance"
                    checked={hasMedicalClearance}
                    onChange={(e) => setHasMedicalClearance(e.target.checked)}
                    className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500 mt-0.5 cursor-pointer"
                  />
                  <label htmlFor="medicalClearance" className="text-xs font-bold text-gray-700 leading-tight cursor-pointer select-none">
                    Unlock Gated Activity: I verify that I have medical clearance from my physician to perform this exercise.
                  </label>
                </div>
              )}

              <div className="flex gap-3">
                <button 
                  onClick={() => setConfiguringExercise(null)} 
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium text-sm transition"
                >
                  Cancel
                </button>
                <button 
                  disabled={isConfigLocked || (isCautionConfig && !hasMedicalClearance) || (!isConfigLocked && !preExerciseSugar)}
                  onClick={handleStartWorkout}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition shadow-md flex items-center justify-center gap-1.5 ${
                    isConfigLocked
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-250 shadow-none'
                      : isCautionConfig
                        ? (hasMedicalClearance 
                            ? 'bg-red-600 hover:bg-red-700 text-white' 
                            : 'bg-gray-150 text-gray-400 cursor-not-allowed shadow-none border border-gray-200')
                        : (!preExerciseSugar
                            ? 'bg-gray-150 text-gray-400 cursor-not-allowed shadow-none border border-gray-200'
                            : 'bg-primary-600 hover:bg-primary-700 text-white')
                  }`}
                >
                  {isConfigLocked ? (
                    <>
                      <span>🔒 Locked for Safety</span>
                    </>
                  ) : isCautionConfig && !hasMedicalClearance ? (
                    <>
                      <span>🔒 Locked</span>
                    </>
                  ) : (
                    'Start Workout'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Profile Metrics Update Modal */}
        {isProfileModalOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 flex flex-col justify-between max-h-[90vh] overflow-y-auto"
            >
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="flex justify-between items-start border-b pb-3 border-gray-100">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Health Profile Metrics</h3>
                    <p className="text-xs text-gray-500">Update your vitals, conditions, and injuries to automatically customize recommended activities.</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsProfileModalOpen(false)} 
                    className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
                  >
                    &times;
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Height (cm)</label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 175"
                        min="50"
                        max="300"
                        value={profileForm.height}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, height: e.target.value }))}
                        className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Weight (kg)</label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 70"
                        min="20"
                        max="500"
                        value={profileForm.weight}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, weight: e.target.value }))}
                        className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Age (Years)</label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 35"
                        min="1"
                        max="120"
                        value={profileForm.age}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, age: e.target.value }))}
                        className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Gender</label>
                      <select
                        value={profileForm.gender}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, gender: e.target.value }))}
                        className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Pregnancy Status toggles inside Edit Metrics */}
                  {profileForm.gender === 'female' && (
                    <div className="bg-pink-50/50 border border-pink-100 rounded-2xl p-3 space-y-2.5">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="modalIsPregnant"
                          checked={profileForm.isPregnant}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, isPregnant: e.target.checked }))}
                          className="h-4 w-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                        />
                        <label htmlFor="modalIsPregnant" className="text-xs font-bold text-gray-700">Are you currently pregnant?</label>
                      </div>
                      {profileForm.isPregnant && (
                        <div>
                          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">Pregnancy Weeks</label>
                          <input
                            type="number"
                            min="1"
                            max="42"
                            value={profileForm.pregnancyWeeks || ''}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, pregnancyWeeks: parseInt(e.target.value) || 0 }))}
                            className="w-full px-3 py-1.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                            placeholder="Weeks (e.g. 14)"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Injuries Checkboxes */}
                  <div className="border-t pt-3 mt-3">
                    <label className="block text-xs font-bold text-gray-800 uppercase tracking-wide mb-2">Injuries & Physical Conditions</label>
                    <div className="space-y-2">
                      {[
                        { id: 'knee_pain', label: 'Knee Pain / Knee Injury' },
                        { id: 'shoulder_pain', label: 'Shoulder Pain / Shoulder Injury' },
                        { id: 'back_pain', label: 'Chronic Lower Back Pain' },
                        { id: 'hypertension', label: 'High Blood Pressure (Hypertension)' }
                      ].map(cond => {
                        const isChecked = profileForm.conditions.includes(cond.id);
                        return (
                          <div key={cond.id} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`cond-${cond.id}`}
                              checked={isChecked}
                              onChange={(e) => {
                                const updated = e.target.checked
                                  ? [...profileForm.conditions, cond.id]
                                  : profileForm.conditions.filter(c => c !== cond.id);
                                setProfileForm(prev => ({ ...prev, conditions: updated }));
                              }}
                              className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                            />
                            <label htmlFor={`cond-${cond.id}`} className="text-xs font-medium text-gray-700">
                              {cond.label}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-3">
                  <button 
                    type="button"
                    onClick={() => setIsProfileModalOpen(false)} 
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs transition uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-bold text-xs transition shadow-md uppercase tracking-wider"
                  >
                    Save & Sync
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Exercise Session Completion & AI Diet Plan Recommendation Modal */}
        {showCompletionModal && workoutSummary && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 my-8 shadow-2xl border border-gray-100 overflow-hidden flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="text-center">
                  <span className="text-4xl">🎉</span>
                  <h2 className="text-2xl font-black text-gray-900 mt-2">Workout Complete! Excellent Effort!</h2>
                  <p className="text-sm text-gray-500 mt-1">Here is your detailed session breakdown and recommended post-exercise diet plan.</p>
                </div>

                {/* Pregnancy Safety Notice */}
                {recommendations?.profile?.isPregnant && (
                  <div className={`p-4 rounded-2xl flex items-start gap-3 border text-xs ${
                    workoutSummary.isCaution 
                      ? 'bg-red-50 text-red-800 border-red-100'
                      : 'bg-green-50 text-green-800 border-green-100'
                  }`}>
                    <span className="text-lg">{workoutSummary.isCaution ? '⚠️' : '🤰'}</span>
                    <div>
                      <span className="font-extrabold uppercase block tracking-wider mb-0.5">
                        {workoutSummary.isCaution ? 'Pregnancy Safety Alert' : 'Pregnancy Verified Exercise'}
                      </span>
                      <p className="font-medium leading-relaxed">
                        {workoutSummary.isCaution 
                          ? `Caution: This exercise (${workoutSummary.exerciseName}) is restricted or requires medical check for week ${recommendations.profile.pregnancyWeeks}. Please follow safe exercises.` 
                          : `Great job! This exercise is fully safe and recommended for your pregnancy time (${recommendations.profile.pregnancyWeeks} weeks).`}
                      </p>
                    </div>
                  </div>
                )}

                {/* Workout Summary Section */}
                <div className="bg-gray-50/80 border border-gray-100 rounded-3xl p-5">
                  <h3 className="font-extrabold text-sm text-gray-800 uppercase tracking-wider mb-3">Today's Workout: {workoutSummary.exerciseName}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                    <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-50 text-center">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Duration</span>
                      <span className="text-base font-black text-gray-800 mt-1 block">
                        {Math.floor(workoutSummary.duration / 60) > 0 ? `${Math.floor(workoutSummary.duration / 60)}m ` : ''}
                        {workoutSummary.duration % 60}s
                      </span>
                    </div>
                    <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-50 text-center">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Reps Completed</span>
                      <span className="text-base font-black text-primary-600 mt-1 block">{workoutSummary.reps} <span className="text-[10px] text-gray-400 font-medium">({workoutSummary.sets} sets)</span></span>
                    </div>
                    <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-50 text-center">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Form Accuracy</span>
                      <span className="text-base font-black text-green-600 mt-1 block">{workoutSummary.accuracy}%</span>
                    </div>
                    <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-50 text-center">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Est. Calories</span>
                      <span className="text-base font-black text-indigo-600 mt-1 block">{workoutSummary.calories} cal</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-3.5 border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                    <div>
                      <span className="text-gray-500 font-semibold">Exact Duration Done:</span>
                      <span className="font-extrabold text-gray-800 ml-1">
                        {Math.floor(workoutSummary.duration / 60)} minutes and {workoutSummary.duration % 60} seconds ({workoutSummary.duration}s total)
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 font-semibold">Posture Corrections:</span>
                      <span className={`font-extrabold ml-1 ${workoutSummary.postureCorrections > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                        {workoutSummary.postureCorrections} times
                      </span>
                    </div>
                  </div>
                </div>

                {/* Real-time Posture Feedback Log */}
                <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5">
                  <h3 className="font-extrabold text-sm text-gray-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    📋 Workout Posture & Safety Log
                  </h3>
                  {workoutSummary.feedbackHistory?.length > 0 ? (
                    <div className="max-h-28 overflow-y-auto space-y-1.5 pr-2">
                      {workoutSummary.feedbackHistory.map((msg, idx) => (
                        <div key={idx} className="p-2 bg-white border border-gray-100 rounded-xl text-[11px] font-medium text-gray-600 flex items-center gap-2">
                          <span className="text-amber-500">⚠️</span>
                          <span>{msg}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-green-600 italic font-semibold flex items-center gap-1">
                      ⭐ Form perfect! No posture adjustments or safety alerts were triggered.
                    </p>
                  )}
                </div>

                {/* Diet Plan Section */}
                <div>
                  <div className="flex items-center gap-2 mb-3 border-b pb-2 border-gray-100">
                    <span className="text-lg">🥗</span>
                    <h3 className="font-black text-base text-gray-900">AI Tailored Post-Workout Diet Recommendation</h3>
                  </div>

                  {loadingDiet ? (
                    <div className="flex flex-col items-center justify-center py-10 space-y-3">
                      <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-xs text-gray-500 font-semibold">Generating customized meal recommendations for your health metrics...</p>
                    </div>
                  ) : dietPlan ? (
                    <div className="space-y-4">
                      {/* Macros Bar */}
                      <div className="bg-primary-50/50 border border-primary-100 rounded-2xl p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-xs text-primary-950 uppercase tracking-wide">Nutrition Summary: {dietPlan.title}</span>
                          <span className="font-black text-sm text-primary-700">{dietPlan.totalCalories} kcal / day</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="bg-white p-2 rounded-xl border border-primary-100/50">
                            <span className="text-gray-400 font-medium block">Carbs</span>
                            <span className="font-extrabold text-gray-800">{dietPlan.totalCarbs}g</span>
                          </div>
                          <div className="bg-white p-2 rounded-xl border border-primary-100/50">
                            <span className="text-gray-400 font-medium block">Protein</span>
                            <span className="font-extrabold text-gray-800">{dietPlan.totalProtein}g</span>
                          </div>
                          <div className="bg-white p-2 rounded-xl border border-primary-100/50">
                            <span className="text-gray-400 font-medium block">Fat</span>
                            <span className="font-extrabold text-gray-800">{dietPlan.totalFat}g</span>
                          </div>
                        </div>
                      </div>

                      {/* Meals list */}
                      <div className="grid sm:grid-cols-2 gap-3">
                        {dietPlan.meals?.slice(0, 4).map((meal, index) => (
                          <div key={index} className="border border-gray-100 rounded-2xl p-3 bg-white hover:border-indigo-100 transition shadow-xs">
                            <div className="flex justify-between items-center border-b pb-1.5 mb-1.5 border-gray-50">
                              <span className="font-black text-xs text-gray-800">{meal.name} <span className="text-[10px] text-gray-400 font-semibold">({meal.time})</span></span>
                              <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">{meal.calories} kcal</span>
                            </div>
                            <ul className="text-[11px] text-gray-600 space-y-1">
                              {meal.items?.map((item, idx) => (
                                <li key={idx} className="flex justify-between font-medium">
                                  <span>• {item.name}</span>
                                  <span className="text-gray-400">{item.quantity}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>

                      {/* Safety / Dietary tips */}
                      <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-3 text-xs flex gap-2 items-start">
                        <span className="text-sm">💡</span>
                        <div className="space-y-1">
                          <span className="font-extrabold text-amber-800 uppercase block tracking-wider text-[10px]">Healthy Diet Tip</span>
                          <p className="text-amber-800/90 font-medium leading-relaxed">
                            {dietPlan.recommendations?.[0] || 'Include fiber-rich foods and monitor portion sizes.'} {dietPlan.restrictions?.[0] ? `Avoid ${dietPlan.restrictions[0].toLowerCase()}.` : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 border border-dashed rounded-3xl text-xs text-gray-400">
                      Diet plan recommendation could not be loaded. Please ensure ML service is active.
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-4 mt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={async () => {
                      const token = localStorage.getItem('token');
                      const baseUrl = api.defaults.baseURL.startsWith('http')
                        ? api.defaults.baseURL
                        : `${window.location.protocol}//${window.location.hostname}:5000${api.defaults.baseURL}`;
                      window.open(`${baseUrl}/exercises/session/${sessionId}/download-pdf?token=${token}`, '_blank');
                      toast.success('Downloading PDF report...');
                    }}
                    className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition duration-200 flex items-center justify-center gap-1.5 w-full sm:w-auto shadow-sm"
                  >
                    📥 Download PDF
                  </button>

                  <button
                    type="button"
                    disabled={emailSending}
                    onClick={async () => {
                      setEmailSending(true);
                      try {
                        await api.post(`/exercises/session/${sessionId}/send-email`);
                        toast.success('PDF report sent to your patient email!');
                      } catch (err) {
                        toast.error('Failed to send email report');
                      } finally {
                        setEmailSending(false);
                      }
                    }}
                    className="px-4 py-2.5 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-bold rounded-xl transition duration-200 flex items-center justify-center gap-1.5 w-full sm:w-auto shadow-sm disabled:opacity-50"
                  >
                    {emailSending ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-green-700 border-t-transparent rounded-full animate-spin"></div>
                        Sending...
                      </>
                    ) : (
                      '📧 Send to Email'
                    )}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowCompletionModal(false);
                    setWorkoutSummary(null);
                    setDietPlan(null);
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-gray-900 to-slate-800 hover:from-black hover:to-slate-900 text-white font-bold text-xs rounded-xl shadow-md uppercase tracking-wider transition duration-300 text-center"
                >
                  Done & Back to Room
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </Layout>
  );
}
