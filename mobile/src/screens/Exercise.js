import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { WebView } from 'react-native-webview';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import api from '../utils/api';

const { width: SCREEN_WIDTH } = Dimensions('window');

// MediaPipe Pose detection via WebView (React Native doesn't have direct MediaPipe support)
const POSE_DETECTION_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js" crossorigin="anonymous"></script>
  <style>
    body { margin: 0; background: #000; display: flex; justify-content: center; align-items: center; height: 100vh; }
    video { width: 100%; height: 100%; object-fit: cover; }
    canvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
  </style>
</head>
<body>
  <video id="video" autoplay playsinline></video>
  <canvas id="canvas"></canvas>
  <script>
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    let pose = null;
    let isRunning = false;
    
    async function init() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } });
        video.srcObject = stream;
        canvas.width = 640;
        canvas.height = 480;
        
        pose = new Pose({
          locateFile: (file) => 'https://cdn.jsdelivr.net/npm/@mediapipe/pose/' + file,
        });
        pose.setOptions({ modelComplexity: 1, smoothLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
        pose.onResults(onResults);
        
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready' }));
      } catch(e) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: e.message }));
      }
    }
    
    function onResults(results) {
      if (!results.poseLandmarks) return;
      const landmarks = results.poseLandmarks;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Draw connections
      const connections = [[0,1],[1,2],[2,3],[3,7],[0,4],[4,5],[5,6],[6,8],[9,10],[11,12],[11,13],[13,15],[15,17],[12,14],[14,16],[16,18],[11,23],[12,24],[23,24],[23,25],[24,26],[25,27],[26,28]];
      ctx.strokeStyle = '#4F46E5';
      ctx.lineWidth = 3;
      connections.forEach(([a, b]) => {
        if (landmarks[a] && landmarks[b]) {
          ctx.beginPath();
          ctx.moveTo(landmarks[a].x * canvas.width, landmarks[a].y * canvas.height);
          ctx.lineTo(landmarks[b].x * canvas.width, landmarks[b].y * canvas.height);
          ctx.stroke();
        }
      });
      // Draw points
      landmarks.forEach((lm, i) => {
        ctx.beginPath();
        ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 4, 0, 2 * Math.PI);
        ctx.fillStyle = '#10B981';
        ctx.fill();
      });
      
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'landmarks', data: landmarks }));
    }
    
    async function processFrame() {
      if (!isRunning || !pose) return;
      await pose.send({ image: video });
      requestAnimationFrame(processFrame);
    }
    
    window.startDetection = () => { isRunning = true; processFrame(); };
    window.stopDetection = () => { isRunning = false; };
    
    init();
  </script>
</body>
</html>
`;

function calculateAngle(a, b, c) {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs(radians * 180 / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return angle;
}

function countExercise(landmarks, exerciseName, counter) {
  let angle = 0;
  const lm = landmarks;

  switch (exerciseName?.toLowerCase()) {
    case 'bicep curl':
      angle = calculateAngle(lm[11], lm[13], lm[15]); // shoulder-elbow-wrist
      break;
    case 'squat':
      angle = calculateAngle(lm[23], lm[25], lm[27]); // hip-knee-ankle
      break;
    case 'shoulder press':
      angle = calculateAngle(lm[13], lm[11], lm[23]); // elbow-shoulder-hip
      break;
    default:
      angle = calculateAngle(lm[11], lm[13], lm[15]);
  }

  // State machine
  if (counter.state === 'rest' && angle > 150) counter.state = 'up';
  else if (counter.state === 'up' && angle < 50) counter.state = 'down';
  else if (counter.state === 'down' && angle > 150) {
    counter.reps++;
    counter.state = 'rest';
    return true; // New rep completed
  }

  // Accuracy based on range of motion
  const accuracy = Math.min(100, Math.max(0, (180 - Math.abs(angle - 90)) / 180 * 100));
  return { angle, accuracy: Math.round(accuracy), reps: counter.reps, state: counter.state };
}

export default function Exercise({ route }) {
  const exercise = route?.params?.exercise;
  const [permission, requestPermission] = useCameraPermissions();
  const [isActive, setIsActive] = useState(false);
  const [reps, setReps] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [feedback, setFeedback] = useState('Get ready...');
  const [angle, setAngle] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [duration, setDuration] = useState(0);
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(exercise || null);
  const webViewRef = useRef(null);
  const counterRef = useRef({ reps: 0, state: 'rest' });
  const timerRef = useRef(null);

  useEffect(() => {
    fetchExercises();
    return () => { clearInterval(timerRef.current); Speech.stop(); };
  }, []);

  const fetchExercises = async () => {
    try {
      const { data } = await api.get('/exercises');
      setExercises(data.data || []);
      if (!selectedExercise && data.data?.length > 0) setSelectedExercise(data.data[0]);
    } catch (err) { console.error(err); }
  };

  const startSession = async () => {
    try {
      const { data } = await api.post('/exercises/sessions/start', { exerciseId: selectedExercise?._id });
      setSessionId(data.data?._id);
    } catch (err) { console.error('Start session error:', err); }

    setIsActive(true);
    counterRef.current = { reps: 0, state: 'rest' };
    setReps(0);
    setDuration(0);
    setFeedback('Exercise started! Follow the movement.');
    Speech.speak('Exercise started. Follow the movement.', { rate: 0.9 });

    timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    webViewRef.current?.injectJavaScript('window.startDetection && window.startDetection(); true;');
  };

  const stopSession = async () => {
    setIsActive(false);
    clearInterval(timerRef.current);
    webViewRef.current?.injectJavaScript('window.stopDetection && window.stopDetection(); true;');
    Speech.speak(`Great job! You completed ${reps} repetitions.`, { rate: 0.9 });

    try {
      if (sessionId) {
        await api.post(`/exercises/sessions/${sessionId}/end`, { reps, accuracy, duration });
      }
    } catch (err) { console.error('End session error:', err); }
  };

  const handleWebViewMessage = (event) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'landmarks' && isActive) {
        const result = countExercise(msg.data, selectedExercise?.name, counterRef.current);
        if (result === true) {
          const newReps = counterRef.current.reps;
          setReps(newReps);
          setFeedback(`Rep ${newReps}! Keep going!`);
          if (newReps % 5 === 0) Speech.speak(`${newReps} reps completed!`, { rate: 1 });
        } else if (typeof result === 'object') {
          setAngle(Math.round(result.angle));
          setAccuracy(result.accuracy);
          if (result.accuracy < 40) setFeedback('Adjust your form!');
        }
      } else if (msg.type === 'error') {
        Alert.alert('Camera Error', msg.message);
      }
    } catch (err) { /* ignore parse errors */ }
  };

  if (!permission) return <View style={styles.center}><ActivityIndicator size="large" color="#4F46E5" /></View>;
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.center}>
        <Ionicons name="camera-off" size={64} color="#9CA3AF" />
        <Text style={styles.permText}>Camera access is needed for pose detection</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Exercise Selector */}
      {!isActive && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorRow} contentContainerStyle={styles.selectorContent}>
          {exercises.map(ex => (
            <TouchableOpacity
              key={ex._id}
              style={[styles.selectorChip, selectedExercise?._id === ex._id && styles.selectorChipActive]}
              onPress={() => setSelectedExercise(ex)}
            >
              <Text style={[styles.selectorChipText, selectedExercise?._id === ex._id && styles.selectorChipTextActive]}>{ex.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Camera + Pose Overlay */}
      <View style={styles.cameraContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: POSE_DETECTION_HTML }}
          style={styles.webview}
          onMessage={handleWebViewMessage}
          javaScriptEnabled
          domStorageEnabled
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback
          originWhitelist={['*']}
        />

        {/* Stats Overlay */}
        {isActive && (
          <View style={styles.overlay}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{reps}</Text>
              <Text style={styles.statLabel}>Reps</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{angle}°</Text>
              <Text style={styles.statLabel}>Angle</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: accuracy > 70 ? '#10B981' : accuracy > 40 ? '#F59E0B' : '#EF4444' }]}>{accuracy}%</Text>
              <Text style={styles.statLabel}>Accuracy</Text>
            </View>
          </View>
        )}
      </View>

      {/* Feedback */}
      <View style={styles.feedbackBar}>
        <Ionicons name={isActive ? 'checkmark-circle' : 'information-circle'} size={18} color={isActive ? '#10B981' : '#6B7280'} />
        <Text style={styles.feedbackText}>{feedback}</Text>
      </View>

      {/* Duration */}
      {isActive && (
        <Text style={styles.duration}>{Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}</Text>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        {!isActive ? (
          <TouchableOpacity style={styles.startBtn} onPress={startSession} disabled={!selectedExercise}>
            <Ionicons name="play" size={24} color="#fff" />
            <Text style={styles.startBtnText}>Start Exercise</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.stopBtn} onPress={stopSession}>
            <Ionicons name="stop" size={24} color="#fff" />
            <Text style={styles.stopBtnText}>Stop</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  permText: { fontSize: 16, color: '#6B7280', marginTop: 16, textAlign: 'center', paddingHorizontal: 40 },
  permBtn: { marginTop: 20, backgroundColor: '#4F46E5', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12 },
  permBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  selectorRow: { maxHeight: 50, backgroundColor: '#1F2937', paddingTop: 8 },
  selectorContent: { paddingHorizontal: 16, gap: 8 },
  selectorChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#374151' },
  selectorChipActive: { backgroundColor: '#4F46E5' },
  selectorChipText: { color: '#9CA3AF', fontSize: 13, fontWeight: '600' },
  selectorChipTextActive: { color: '#fff' },
  cameraContainer: { flex: 1, position: 'relative' },
  webview: { flex: 1 },
  overlay: { position: 'absolute', bottom: 20, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-around', backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 16, padding: 16 },
  statBox: { alignItems: 'center' },
  statValue: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  feedbackBar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#1F2937' },
  feedbackText: { color: '#D1D5DB', fontSize: 14 },
  duration: { textAlign: 'center', color: '#9CA3AF', fontSize: 14, paddingVertical: 4, backgroundColor: '#1F2937' },
  controls: { padding: 20, backgroundColor: '#111827' },
  startBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#4F46E5', paddingVertical: 16, borderRadius: 14 },
  startBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  stopBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#EF4444', paddingVertical: 16, borderRadius: 14 },
  stopBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
