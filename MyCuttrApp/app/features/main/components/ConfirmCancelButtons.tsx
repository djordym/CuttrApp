import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from '../../../theme/colors';
import { useTranslation } from 'react-i18next';

interface ConfirmCancelButtonsProps {
  confirmButtonText: string;
  cancelButtonText: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const ConfirmCancelButtons: React.FC<ConfirmCancelButtonsProps> = ({
  confirmButtonText,
  cancelButtonText,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.actions}>
      <TouchableOpacity
        style={styles.confirmButton}
        onPress={onConfirm}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.confirmButtonText}>{t(confirmButtonText)}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={onCancel}
        disabled={loading}
      >
        <Text style={styles.cancelButtonText}>{t(cancelButtonText)}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ConfirmCancelButtons;

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  confirmButton: {
    backgroundColor: COLORS.accentGreen,
    borderRadius: 8,
    padding: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '600',
    textAlign: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: COLORS.accentGreen,
    borderRadius: 8,
    padding: 13,
    marginTop: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    color: COLORS.accentGreen,
    fontWeight: '600',
    textAlign: 'center',
  },
});
