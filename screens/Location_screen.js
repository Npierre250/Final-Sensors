import React, { useEffect, useState } from "react";
import { StyleSheet, View, Dimensions, Text } from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import { requestForegroundPermissionsAsync, getCurrentPositionAsync, watchPositionAsync } from "expo-location";
import * as Notifications from 'expo-notifications';

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const LocationScreen = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [initialRegion, setInitialRegion] = useState(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [geofenceData, setGeofenceData] = useState({
    latitude: -1.9242076,
    longitude: 30.0525105,
    radius: 100, // in meters
  });
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const getLocation = async () => {
      try {
        const { status } = await requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.error("Location permission denied");
          return;
        }

        const location = await getCurrentPositionAsync({});
        setCurrentLocation(location.coords);
        setInitialRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.02, // Adjust the values as needed
          longitudeDelta: 0.02, // Adjust the values as needed
        });
      } catch (error) {
        console.error("Error getting current location:", error);
      }
    };

    getLocation();

    return () => {
      // Cleanup function
    };
  }, []);

  useEffect(() => {
    const watchLocation = async () => {
      try {
        const locationWatcher = await watchPositionAsync(
          { accuracy: 1, timeInterval: 1000, distanceInterval: 10 },
          (location) => {
            setCurrentLocation(location.coords);
            checkGeofence(location.coords); // Check if the device is inside the geofence
          }
        );

        return () => {
          locationWatcher.remove();
        };
      } catch (error) {
        console.error("Error watching location:", error);
      }
    };

    if (currentLocation) {
      watchLocation();
    }
  }, [currentLocation]);

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });

    const subscription = Notifications.addNotificationReceivedListener(handleNotification);

    return () => {
      subscription.remove();
    };
  }, []);

  const handleNotification = (notification) => {
    console.log("Notification received:", notification);
    setNotifications((prevNotifications) => [...prevNotifications, notification]);
  };

  const onMapLayout = () => {
    setIsMapReady(true);
  };

  const handleRegionChange = (region) => {
    setInitialRegion(region);
  };

  const checkGeofence = (coords) => {
    const { latitude, longitude } = coords;
    const { latitude: fenceLat, longitude: fenceLng, radius } = geofenceData;

    const distance = calculateDistance(latitude, longitude, fenceLat, fenceLng);
    const insideGeofence = distance <= radius;

    if (!insideGeofence) {
      // Device is outside the geofence, trigger notification
      sendNotification("Outside Geofence", "You have exited the geofence area.");
    }
  };

  const sendNotification = async (title, body) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
      },
      trigger: null,
    });
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d * 1000;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  return (
    <View style={styles.container}>
      {initialRegion && (
        <MapView
          style={styles.map}
          initialRegion={initialRegion}
          onRegionChangeComplete={handleRegionChange}
          onLayout={onMapLayout}
        >
          {isMapReady && currentLocation && (
            <Marker
              coordinate={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
              }}
              title="Current Location"
            />
          )}
          {geofenceData && (
            <>
              <Circle
                center={{
                  latitude: geofenceData.latitude,
                  longitude: geofenceData.longitude,
                }}
                radius={geofenceData.radius}
                strokeColor="rgba(255, 0, 0, 0.5)"
                fillColor="rgba(255, 0, 0, 0.2)"
              />
              <Marker
                coordinate={{
                  latitude: geofenceData.latitude,
                  longitude: geofenceData.longitude,
                }}
                title="Geofence Center"
              />
            </>
          )}
        </MapView>
      )}

      {/* Notification container to display current status */}
      <View style={styles.notificationContainer}>
        <Text style={styles.notificationText}>
          {currentLocation &&
            (checkGeofence(currentLocation) ? "Inside Geofence" : "Outside Geofence")}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  map: {
    width: windowWidth,
    height: windowHeight,
  },
  notificationContainer: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 999,
    elevation: 5,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    padding: 10,
    borderRadius: 5,
  },
  notificationText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
  },
});

export default LocationScreen;
