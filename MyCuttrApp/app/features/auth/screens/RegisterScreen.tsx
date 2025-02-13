import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  KeyboardAvoidingView,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';

import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { RootState } from '../../../store';
import { registerThunk } from '../store/authSlice';
import TextInputField from '../../../components/common/TextInputField';
import ErrorMessage from '../../../components/feedback/ErrorMessage';

import { COLORS } from '../../../theme/colors';
import { log } from '../../../utils/logger';
import { UserRegistrationRequest } from '../../../types/apiTypes';

// Import the shared auth styles
import { authStyles as styles } from '../styles/authStyles'; // <- Adjust path if needed

const RegisterScreen = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Local state for error messages
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const { error } = useAppSelector((state: RootState) => state.auth);

  const handleRegister = async () => {
    let valid = true;

    // Reset error messages
    setNameError('');
    setEmailError('');
    setPasswordError('');

    // Check for empty fields
    if (!name.trim()) {
      setNameError(t('Name is required.'));
      valid = false;
    }
    if (!email.trim()) {
      setEmailError(t('Email is required.'));
      valid = false;
    }
    if (!password.trim()) {
      setPasswordError(t('Password is required.'));
      valid = false;
    }
    if (!valid) return;

    // Validate email using a regex pattern
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(email.trim())) {
      setEmailError(t('Please enter a valid email address.'));
      valid = false;
    }

    // Validate password: at least 8 characters with one uppercase, one lowercase, and one number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      setPasswordError(
        t(
          'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.'
        )
      );
      valid = false;
    }

    if (!valid) return;

    const userRegistrationRequest: UserRegistrationRequest = {
      email: email.trim(),
      password: password.trim(),
      name: name.trim(),
    };

    log.debug('Pressed register button, userRegistrationRequest:', userRegistrationRequest);

    setLoading(true);
    try {
      await dispatch(registerThunk(userRegistrationRequest));
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={styles.gradientBackground}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoid}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../../assets/images/logo.png')}
              style={styles.logo}
            />
          </View>

          <View style={styles.cardContainer}>
            <Text style={styles.title}>{t('create_account')}</Text>

            <ErrorMessage message={error} />

            {/* Name */}
            <TextInputField
              value={name}
              onChangeText={setName}
              placeholder={t('name')}
            />
            {nameError ? (
              <Text style={{ color: 'red', marginTop: 5, fontSize: 12 }}>
                {nameError}
              </Text>
            ) : null}

            {/* Email */}
            <TextInputField
              value={email}
              onChangeText={setEmail}
              placeholder={t('email')}
            />
            {emailError ? (
              <Text style={{ color: 'red', marginTop: 5, fontSize: 12 }}>
                {emailError}
              </Text>
            ) : null}

            {/* Password */}
            <TextInputField
              value={password}
              onChangeText={setPassword}
              placeholder={t('password')}
              secureTextEntry
            />
            {passwordError ? (
              <Text style={{ color: 'red', marginTop: 5, fontSize: 12 }}>
                {passwordError}
              </Text>
            ) : null}

            {/* Submit */}
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={COLORS.accentGreen} />
              ) : (
                <Text style={styles.confirmButtonText}>
                  {t('register_button')}
                </Text>
              )}
            </TouchableOpacity>

            {/* Already have an account */}
            <TouchableOpacity
              onPress={() => navigation.navigate('Login' as never)}
              style={styles.navLinkContainer}
            >
              <Text style={styles.navLinkText}>
                {t('have_account_login')}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </LinearGradient>
  );
};

export default RegisterScreen;
