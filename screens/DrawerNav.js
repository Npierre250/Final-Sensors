import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image, Text, View } from 'react-native';
import { DrawerItemList } from '@react-navigation/drawer';
import { FontAwesome5, MaterialCommunityIcons, SimpleLineIcons } from '@expo/vector-icons';
import Home from './Home';
import Location_screen from './Location_screen';
import StepCounter from './StepCounter';
import LightSensors from "./LightSensors"

const Drawer = createDrawerNavigator();

function DrawerContent(props) {
    return (
        <SafeAreaView>
            <View style={{ height: 100, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                <Image
                    source={require('../assets/user.jpeg')}
                    style={{ marginTop: 15, height: 50, width: 50, borderRadius: 100 }}
                />
                <Text style={{ fontSize: 15, marginVertical: 6, fontWeight: 'bold', color: '#7EA1FF' }}>
                    Ndagijima Pierre
                </Text>
            </View>
            <DrawerItemList {...props} />
        </SafeAreaView>
    );
}

function DrawerNav() {
    return (
        <Drawer.Navigator
            drawerContent={props => <DrawerContent {...props} />}
            drawerStyle={{ width: '60%', backgroundColor: '#7EA1FF' }}
            screenOptions={{
                headerStyle: { backgroundColor: 'blue' },
                headerTintColor: '#fff',
                drawerActiveTintColor: 'blue',
                drawerLabelStyle: { color: '#111' },
            }}
        >
            <Drawer.Screen
                name="Home"
                options={{
                    drawerLabel: 'Home',
                    drawerIcon: () => <SimpleLineIcons name="home" size={20} color="#7EA1FF" />,
                }}
                component={Home}
            />
            <Drawer.Screen
                name="Location_screen"
                options={{
                    drawerLabel: 'Location_screen',
                    drawerIcon: () => <FontAwesome5 name="map-marker-alt" size={20} color="#7EA1FF" />, // Adjust icon name if needed
                }}
                component={Location_screen}
            />

            {/* <Drawer.Screen
                name="Charts"
                options={{
                    drawerLabel: 'Charts',
                    drawerIcon: () => (
                        <MaterialCommunityIcons name="chart-line" size={22} color="#7EA1FF" />
                    ),
                }}
                component={Charts}
            /> */}

            <Drawer.Screen
                name="StepCounter"
                options={{
                    drawerLabel: 'StepCounter',
                    drawerIcon: () => (
                        <MaterialCommunityIcons name="walk" size={22} color="#7EA1FF" />
                    ),
                }}
                component={StepCounter}
            />

            <Drawer.Screen
                name="LightSensors"
                options={{
                    drawerLabel: 'LightSensors',
                    drawerIcon: () => (
                        <MaterialCommunityIcons name="lightbulb-on-outline" size={22} color="#7EA1FF" />
                    ),
                }}
                component={LightSensors}
            />


        </Drawer.Navigator>
    );
}

export default DrawerNav;
