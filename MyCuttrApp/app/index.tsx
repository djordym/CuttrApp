import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from 'react-query';
import { I18nextProvider } from 'react-i18next';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ErrorBoundary from './ErrorBoundary';
import { store } from './store';
import AppNavigator from './navigation/AppNavigator';
import { initI18n } from './i18n';
import { log } from './utils/logger';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from './theme/colors';
import * as Sentry from '@sentry/react-native';
import { isRunningInExpoGo } from 'expo';
import { useNavigationContainerRef } from '@react-navigation/native';

// Import Expo push notifications libraries
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

// Import the userService method for updating the push token
import userService from './api/userService';

// ---------- Sentry Configuration (unchanged) ----------
const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: !isRunningInExpoGo(),
});

Sentry.init({
  dsn: 'https://257bb6061b5f62855c8c40b523c87628@o4508793864978432.ingest.de.sentry.io/4508793930317904',
  debug: true,
  tracesSampleRate: 1.0,
  integrations: [navigationIntegration],
  enableNativeFramesTracking: !isRunningInExpoGo(),
});
// -------------------------------------------------------

const queryClient = new QueryClient();

function App() {
  log.debug('App.tsx rendering...');
  const navigationRef = useNavigationContainerRef();

  useEffect(() => {
    if (navigationRef?.current) {
      navigationIntegration.registerNavigationContainer(navigationRef);
    }
  }, [navigationRef]);

  const [i18nInstance, setI18nInstance] = useState<any>(null);

  useEffect(() => {
    const setupI18n = async () => {
      const i18n = await initI18n();
      setI18nInstance(i18n);
    };
    setupI18n();
  }, []);

  useEffect(() => {
    if (Device.osName === 'Android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  }, []);

  // ----- PUSH NOTIFICATIONS SETUP -----
  useEffect(() => {
    const registerPushNotifications = async () => {
      if (Device.isDevice) {
        // Check existing permissions
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') {
          log.warn('Failed to get push token for notifications!');
          return;
        }
        // Get the Expo push token
        const tokenResponse = await Notifications.getExpoPushTokenAsync();
        const expoPushToken = tokenResponse.data;

        // Call the user service to update the token in the backend
        try {
          await userService.updatePushToken({ expoPushToken });
        } catch (error) {
          log.error('Error updating push token:', error);
        }
      } else {
        log.warn('Push notifications require a physical device.');
      }
    };

    registerPushNotifications();
  }, []);
  // ---------------------------------------

  if (!i18nInstance) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <I18nextProvider i18n={i18nInstance}>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <StatusBar style="dark" backgroundColor={COLORS.primary} />
              <AppNavigator />
            </GestureHandlerRootView>
          </I18nextProvider>
        </QueryClientProvider>
      </Provider>
    </ErrorBoundary>
  );
}

export default Sentry.wrap(App);
