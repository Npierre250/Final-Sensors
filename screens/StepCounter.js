import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Vibration } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { Notifications } from 'expo';

export default function MotionDetection() {
  const [{ x, y, z }, setData] = useState({ x: 0, y: 0, z: 0 });
  const [subscription, setSubscription] = useState(null);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [stepCount, setStepCount] = useState(0);
  const threshold = 1.4;
  const motionThresholdMultiplier = 2; // Adjust this multiplier for sensitivity

  const _slow = () => Accelerometer.setUpdateInterval(1000);
  const _fast = () => Accelerometer.setUpdateInterval(16);

  const _subscribe = () => {
    setSubscription(Accelerometer.addListener(setData));
  };

  const _unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  useEffect(() => {
    _subscribe();
    return () => _unsubscribe();
  }, []);

  useEffect(() => {
    detectMotion();
    detectSteps();
  }, [x, y, z]);

  const detectSteps = () => {
    const acceleration = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
    if (acceleration > threshold) {
      setStepCount(prevCount => prevCount + 1);
    }
  };

  const detectMotion = () => {
    const acceleration = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
    const motionThreshold = threshold * motionThresholdMultiplier;

    if (acceleration > motionThreshold) {
      sendNotification();
      setNotificationMessage('Unexpected movement detected!');
      Vibration.vibrate(); // Vibrate the device
      setTimeout(() => setNotificationMessage(''), 5000); // Clear message after 5 seconds
    }
  };

  const sendNotification = async () => {
    await Notifications.presentLocalNotificationAsync({
      title: 'Motion Detected',
      body: 'Unexpected movement detected!',
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Motion Detection</Text>
      <Text style={styles.stepCount}>Steps: {stepCount}</Text>
      <Text style={styles.acceleration}>Acceleration:</Text>
      <Text style={styles.data}>x: {x.toFixed(2)}</Text>
      <Text style={styles.data}>y: {y.toFixed(2)}</Text>
      <Text style={styles.data}>z: {z.toFixed(2)}</Text>
      <View style={styles.notificationContainer}>
        {typeof notificationMessage === 'string' && notificationMessage !== '' && (
          <Text style={styles.notification}>{notificationMessage}</Text>
        )}
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={subscription ? _unsubscribe : _subscribe} style={styles.button}>
          <Text style={{ color: '#fff' }}>{subscription ? 'Stop' : 'Start'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={_slow} style={[styles.button, styles.middleButton]}>
          <Text style={{ color: '#fff' }}>Slow</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={_fast} style={styles.button}>
          <Text style={{ color: '#fff' }}>Fast</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#7EA1FF',
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#ffffff',
  },
  stepCount: {
    fontSize: 18,
    marginBottom: 10,
    color: '#ffffff',
  },
  acceleration: {
    fontSize: 18,
    marginBottom: 10,
    color: '#ffffff',
  },
  data: {
    fontSize: 16,
    marginBottom: 5,
    color: '#ffffff',
  },
  notificationContainer: {
    marginTop: 20,
  },
  notification: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  middleButton: {
    marginHorizontal: 5,
  },
});
