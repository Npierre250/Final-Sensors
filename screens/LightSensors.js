import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, Alert, Button } from 'react-native';
import * as Brightness from 'expo-brightness';
import * as Sensors from 'expo-sensors';
import { LightGraph } from '../components/LightLevelGraph';
import { useIsFocused } from '@react-navigation/native';
import { SendPushNotification } from '../components/Notification';

const LightSensors = () => {
    const [lightLevel, setLightLevel] = useState(0);
    const [isScreenCovered, setIsScreenCovered] = useState(false);
    const [notificationSent, setNotificationSent] = useState(false);
    const [brightnessPercentage, setBrightnessPercentage] = useState(0);
    const SCREEN_COVER_THRESHOLD = 10;
    const BRIGHTNESS_THRESHOLD = 5000;
    const isFocused = useIsFocused();
    const currentBrightnessRef = useRef();
    const debounceTimerRef = useRef(null);

    useEffect(() => {
        const requestPermissions = async () => {
            const { status } = await Brightness.requestPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('Permission Error', 'Please grant permission to access brightness and sensors.');
            } else {
                await fetchBrightness();
            }
        };
        requestPermissions();
    }, []);

    useEffect(() => {
        const subscription = Sensors.LightSensor.addListener(({ illuminance }) => {
            setLightLevel(illuminance);
            updateBrightnessPercentage(illuminance);
        });

        return () => {
            subscription.remove();
        };
    }, []);

    useEffect(() => {
        if (isFocused) {
            checkScreenCover(lightLevel);
        }
    }, [isFocused, lightLevel]);

    useEffect(() => {
        if (lightLevel <= SCREEN_COVER_THRESHOLD) {
            setIsScreenCovered(true);
            setNotificationSent(false);
        }

        manageNotifications();
    }, [lightLevel]);

    const fetchBrightness = async () => {
        try {
            currentBrightnessRef.current = await Brightness.getBrightnessAsync();
            updateBrightnessPercentage(currentBrightnessRef.current);
        } catch (error) {
            console.error('Error fetching brightness:', error);
        }
    };

    const manageNotifications = () => {
        if (lightLevel > BRIGHTNESS_THRESHOLD && !notificationSent) {
            debounceNotification();
        }
    };

    const checkScreenCover = async illuminance => {
        if (illuminance <= SCREEN_COVER_THRESHOLD) {
            try {
                setIsScreenCovered(true);
                await turnOffScreen();
            } catch (error) {
                console.error(error);
            } finally {
                setNotificationSent(false);
            }
            return;
        }

        setIsScreenCovered(false);
        await restoreBrightness();
    };

    const debounceNotification = () => {
        try {
            clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = setTimeout(() => {
                SendPushNotification('Sensors App - Light', 'The environment is too bright.');
            }, 2000);
        } catch (error) {
            console.error(error);
        } finally {
            setNotificationSent(true);
        }
    };

    const restoreBrightness = async () => {
        if (currentBrightnessRef.current !== undefined) {
            try {
                await Brightness.setSystemBrightnessAsync(currentBrightnessRef.current);
            } catch (error) {
                console.error('Error setting brightness:', error);
            }
        }
    };

    const turnOffScreen = async () => {
        try {
            await Brightness.setSystemBrightnessAsync(0);
        } catch (error) {
            console.error('Error turning off screen:', error);
        }
    };

    const updateBrightnessPercentage = (brightness) => {
        const maxBrightness = 1;
        const percentage = (brightness / maxBrightness) * 100;
        setBrightnessPercentage(percentage.toFixed(1));
    };

    const increaseBrightness = async () => {
        try {
            let currentBrightness = await Brightness.getBrightnessAsync();
            currentBrightness += 0.1;
            await Brightness.setBrightnessAsync(Math.min(1, currentBrightness));
            updateBrightnessPercentage(currentBrightness);
        } catch (error) {
            console.error('Error increasing brightness:', error);
        }
    };

    const decreaseBrightness = async () => {
        try {
            let currentBrightness = await Brightness.getBrightnessAsync();
            currentBrightness -= 0.1;
            await Brightness.setBrightnessAsync(Math.max(0, currentBrightness));
            updateBrightnessPercentage(currentBrightness);
        } catch (error) {
            console.error('Error decreasing brightness:', error);
        }
    };

    return (
        <View style={styles.container}>
            <LightGraph lightLevel={lightLevel} />
            <Text style={styles.lightLevel}>
                {isScreenCovered ? 'Screen covered' : `Screen is covered below ${SCREEN_COVER_THRESHOLD} lux!`}
            </Text>
            <Text style={styles.brightness}>Brightness: {brightnessPercentage}%</Text>
            <View style={styles.buttonContainer}>
                <Button title="Increase Brightness" onPress={increaseBrightness} />
                <Button title="Decrease Brightness" onPress={decreaseBrightness} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    lightLevel: {
        fontSize: 18,
    },
    brightness: {
        fontSize: 16,
        marginTop: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
    },
});

export default LightSensors;
