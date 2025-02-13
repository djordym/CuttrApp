import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../../theme/colors';
// Adjust the following import to wherever your profile hook or service is defined.
import { useMyProfile } from '../../../features/main/hooks/useMyProfileHooks';
import { userService } from '../../../api/userService';
import { useTranslation } from 'react-i18next';

const OnboardingBioScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { data: userProfile } = useMyProfile();
  const [bio, setBio] = useState(userProfile?.bio ?? '');

  const handleSkip = () => {
    navigation.navigate('OnboardingLocation' as never);
  };

  const handleSubmitBio = async () => {
    Keyboard.dismiss();
    try {
      await userService.updateMe({ name: userProfile?.name ?? '', bio });
      navigation.navigate('OnboardingLocation' as never);
    } catch (error) {
      Alert.alert(
        t('onboarding.bio.errorTitle'),
        t('onboarding.bio.errorMessage')
      );
    }
  };

  return (
    <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{t('onboarding.bio.title')}</Text>
        <Text style={styles.subtitle}>{t('onboarding.bio.subtitle')}</Text>
        <TextInput
          style={styles.textInput}
          value={bio}
          onChangeText={setBio}
          placeholder={t('onboarding.bio.placeholder')}
          placeholderTextColor="#ccc"
          multiline
          textAlignVertical="top"
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={handleSkip} style={[styles.button, styles.skipButton]}>
            <Text style={styles.buttonText}>{t('onboarding.bio.skipButton')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSubmitBio} style={[styles.button, styles.submitButton]}>
            <Text style={styles.buttonText}>{t('onboarding.bio.submitButton')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

export default OnboardingBioScreen;

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
    fontSize: 30,
    fontWeight: '700',
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: COLORS.textDark,
    marginBottom: 30,
    minHeight: 100,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  skipButton: {
    backgroundColor: COLORS.accentRed,
  },
  submitButton: {
    backgroundColor: COLORS.accentGreen,
  },
  buttonText: {
    color: COLORS.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
});
