import React,  {useEffect, useState} from 'react';
import {
    StyleSheet,
    View,
    Text,
    Platform,
    PermissionsAndroid,
} from 'react-native';
import Boundary, {Events} from 'react-native-boundary';
import useBackgroundGeolocationTracker from './useBackgroundGeolocationTracker';
// import MapView, { PROVIDER_GOOGLE } from 'react-native-maps'; // remove PROVIDER_GOOGLE import if not using Google Maps
const Example = () => {
    const [state, setState] = useState({
        isEnter: false
    });
    const location = useBackgroundGeolocationTracker();
    console.log('useTraking latitude', location.latitude);
    const hasLocationPermission = async () => {
        // if (Platform.OS === 'ios') {
        //   Geolocation.requestAuthorization('always');
        // }

        if (Platform.OS === 'android') {
            await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            );
        }
    };

    useEffect(() => {
        if (hasLocationPermission()) {
            const BoundaryData = [

                {
                    lat: 40.9736396,
                    lng: 29.0454794,
                    radius: 100,
                    id: 'Company',
                },
            ];
            BoundaryData.map((boundary) => {
                Boundary.add(boundary)
                    .then(() => console.log('success!'))
                    .catch((e) => console.log(e));
            });
        }

        Boundary.on(Events.ENTER, (id) => {
            console.warn('Enter Boundary ', id);
            state.isEnter=true;
        });
        Boundary.on(Events.EXIT, (id) => {
            console.warn('Exit Boundary ', id);
            state.isEnter=false;
        });
    }, []);

    // Cluster Zone Location
    const P0 = {latitude: 37.5692842, longitude: 126.8267638};
    const P1 = {latitude: 37.8949, longitude: 127.0586};
    return (
        <View style={styles.container}>
            <View style={styles.infoContainer}>
                <Text>latitude : {location.latitude}</Text>
                <Text>longitude : {location.longitude}</Text>
                <Text>
                    Boundary entered : {state.isEnter ? 'Enter' : 'Not Enter'}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    mapConatiner: {
        flex: 3,
    },
    button: {
        width: 70,
        height: 70,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoContainer: {
        flex: 1,
        justifyContent: 'center',
        margin: 40,
    },
});

export default Example;
