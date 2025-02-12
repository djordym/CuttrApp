import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { COLORS } from '../../../theme/colors';

export interface ToggleButtonProps<T = string> {
  /** The list of internal option keys. */
  options: T[];
  /** The currently selected option key. */
  selected: T;
  /** Callback fired when a new option is selected. */
  onToggle: (option: T) => void;
  /**
   * Function to map an option key to a display label.
   * For example, you might map 'thumbnail' → t('Thumbnails').
   */
  getLabel?: (option: T) => string;
  /** Optional container style override for the toggle group wrapper. */
  containerStyle?: StyleProp<ViewStyle>;
  /** Optional style override for individual buttons. */
  buttonStyle?: StyleProp<ViewStyle>;
  /** Optional style override for selected buttons. */
  buttonSelectedStyle?: StyleProp<ViewStyle>;
  /** Optional style override for text inside each button. */
  buttonTextStyle?: StyleProp<TextStyle>;
  /** Optional style override for text in a selected button. */
  buttonTextSelectedStyle?: StyleProp<TextStyle>;
}

export const ToggleButton = <T extends string>({
  options,
  selected,
  onToggle,
  getLabel,
  containerStyle,
  buttonStyle,
  buttonSelectedStyle,
  buttonTextStyle,
  buttonTextSelectedStyle,
}: ToggleButtonProps<T>) => {
  return (
    <View style={[styles.toggleContainer, containerStyle]}>
      {options.map((option) => {
        const isActive = selected === option;
        return (
          <TouchableOpacity
            key={option}
            onPress={() => onToggle(option)}
            style={[
              styles.button,
              buttonStyle,
              isActive && [styles.activeButton, buttonSelectedStyle],
            ]}
            accessibilityRole="button"
            accessibilityLabel={getLabel ? getLabel(option) : option}
          >
            <Text
              style={[
                styles.buttonText,
                buttonTextStyle,
                isActive && [styles.activeButtonText, buttonTextSelectedStyle],
              ]}
            >
              {getLabel ? getLabel(option) : option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.textLight,
    borderRadius: 20,
    alignSelf: 'center',
    padding: 3,
    marginBottom: 15,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 18,
  },
  activeButton: {
    backgroundColor: COLORS.accentGreen,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  activeButtonText: {
    color: COLORS.textLight,
  },
});

export default ToggleButton;
