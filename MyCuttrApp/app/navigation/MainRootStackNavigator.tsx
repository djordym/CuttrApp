// RootStackNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SetUserPreferencesScreen from '../features/main/screens/SetUserPreferencesScreen';
import MainTabNavigator from './MainTabNavigator';
import ChatScreen from '../features/main/screens/ChatScreen';
import AddPlantScreen from '../features/main/screens/AddPlantScreen';
import OtherProfileScreen from '../features/main/screens/OtherProfileScreen';
import MakeTradeProposalScreen from '../features/main/screens/MakeTradeProposalScreen';
import BrowseMatchesScreen from '../features/main/screens/BrowseMatchesScreen';
import TradeProposalsScreen from '../features/main/screens/TradeProposalsScreen';
import EditPlantScreen from '../features/main/screens/EditPlantScreen';

const RootStack = createNativeStackNavigator();

const MainRootStackNavigator = () => (
  <RootStack.Navigator screenOptions={{ headerShown: false }}>
    {/* Main Tabs of the app */}
    <RootStack.Screen name="MainTabs" component={MainTabNavigator} />
    {/* Modal screen presented over tabs */}
    <RootStack.Screen 
      name="SetUserPreferences" 
      component={SetUserPreferencesScreen}
      options={{ presentation: 'modal' }} 
    />
    <RootStack.Screen
        name="Chat"
        component={ChatScreen}
        options={{ presentation: 'modal' }}
    />
    <RootStack.Screen
        name="AddPlant"
        component={AddPlantScreen}
        options={{ presentation: 'modal' }}
    />
    <RootStack.Screen
      name="EditPlant"
      component={EditPlantScreen}
      options={{ presentation: 'modal' }}
    />
    <RootStack.Screen
      name="OtherProfile"
      component={OtherProfileScreen}
      options={{ presentation: 'modal' }}
    />
    <RootStack.Screen
      name="MakeTradeProposal"
      component={MakeTradeProposalScreen}
      options={{ presentation: 'transparentModal' }}
    />
    <RootStack.Screen
      name="BrowseMatches"
      component={BrowseMatchesScreen}
      options={{ presentation: 'modal' }}
    />
    <RootStack.Screen
      name="TradeProposals"
      component={TradeProposalsScreen}
      options={{ presentation: 'modal' }}
    />
  </RootStack.Navigator>

);

export default MainRootStackNavigator;
