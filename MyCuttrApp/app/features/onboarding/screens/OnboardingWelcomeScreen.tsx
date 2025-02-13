import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../../theme/colors';
import { useTranslation } from 'react-i18next';

const OnboardingWelcomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const handleNextPress = () => {
    navigation.navigate('OnboardingBio' as never);
  };

  return (
    <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{t('onboarding.welcomeTitle')}</Text>
        <Text style={styles.subtitle}>{t('onboarding.welcomeSubtitle')}</Text>
        <TouchableOpacity onPress={handleNextPress} style={styles.button}>
          <Text style={styles.buttonText}>{t('onboarding.nextButton')}</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default OnboardingWelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 26,
  },
  button: {
    backgroundColor: COLORS.accentGreen,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
  },
  buttonText: {
    color: COLORS.textLight,
    fontSize: 18,
    fontWeight: '600',
  },
});
