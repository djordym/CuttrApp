import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PlantCardWithInfo } from '../components/PlantCardWithInfo';
import { useMyProfile } from '../hooks/useMyProfileHooks';
import { useMyPlants } from '../hooks/usePlantHooks';
import { useSearchRadius } from '../hooks/useSearchRadius';
import { PlantResponse } from '../../../types/apiTypes';
import { COLORS } from '../../../theme/colors';
import { EditProfileModal } from '../modals/EditProfileModal';
import PlantThumbnail from '../components/PlantThumbnail';
import { headerStyles } from '../styles/headerStyles';
import { ProfileCard } from '../components/ProfileCard';
import { ToggleButton } from '../components/ToggleButton';

const MyProfileScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const {
    data: userProfile,
    isLoading: loadingProfile,
    isError: errorProfile,
    refetch: refetchProfile,
  } = useMyProfile();
  const {
    data: myPlants,
    isLoading: loadingPlants,
    isError: errorPlants,
    refetch: refetchPlants,
  } = useMyPlants();
  const { searchRadius, isLoading: srLoading, isError: srError } = useSearchRadius();

  // For showing city, country (if needed)
  const [cityCountry, setCityCountry] = useState<string>('');
  const [editProfileVisible, setEditProfileVisible] = useState(false);

  // Use internal language‐independent keys for the toggle:
  type ViewOption = 'thumbnail' | 'full';
  const [viewOption, setViewOption] = useState<ViewOption>('thumbnail');

  // Position for the EditProfileModal
  const [editCardLayout, setEditCardLayout] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const cardRef = useRef<View>(null);
  const screenWidth = Dimensions.get('window').width;

  // Handler for measuring the card and opening the modal
  const openEditModal = () => {
    cardRef.current?.measureInWindow((x, y, width, height) => {
      setEditCardLayout({ x, y, width, height });
      setEditProfileVisible(true);
    });
  };

  const OnDelete = () => {
    //show message soon to be implemented
    alert('Feature to delete plant will be implemented soon.');

  };

  // Navigation to AddPlant
  const handleAddPlant = () => {
    navigation.navigate('AddPlant' as never);
  };

  // Rendering plants (either as thumbnails or full-size)
  const renderPlantItem = (item: PlantResponse) => {
    if (viewOption === 'thumbnail') {
      return (
        <PlantThumbnail
          key={item.plantId}
          plant={item}
          selectable
          deletable
          OnDelete={OnDelete}
          onEditPress={() =>
            navigation.navigate('EditPlant', { plant: item })
          }
        />
      );
    } else {
      return (
        <View key={item.plantId} style={styles.plantCardWrapper}>
          <PlantCardWithInfo plant={item} />
        </View>
      );
    }
  };

  // Loading states
  if (loadingProfile || loadingPlants || srLoading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>{t('profile_loading_message')}</Text>
      </SafeAreaView>
    );
  }

  if (errorProfile || errorPlants || srError) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.errorText}>{t('profile_error_message')}</Text>
        <TouchableOpacity
          onPress={() => {
            refetchProfile();
            refetchPlants();
          }}
          style={styles.retryButton}
        >
          <Text style={styles.retryButtonText}>{t('profile_retry_button')}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!userProfile) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.errorText}>{t('profile_no_user_profile_error')}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaProvider style={styles.container}>
      <ScrollView style={{ flex: 1 }}>
        {/* Header */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={headerStyles.headerGradient}
        >
          <Text style={headerStyles.headerTitle}>{t('profile_title')}testestes</Text>
        </LinearGradient>

        {/* --- Profile Card --- */}
        <View ref={cardRef} style={styles.cardContainer}>
          <ProfileCard
            userProfile={userProfile}
            isEditable={true} // Show the edit button
            onEditPress={openEditModal}
            screenWidth={screenWidth}
          />
        </View>

        {/* ---- My Plants Section ---- */}
        <View style={styles.plantsSectionWrapper}>
          <View style={styles.plantsSectionHeader}>
            <Text style={styles.plantsSectionTitle}>
              {t('profile_my_plants_section')}
            </Text>
            <TouchableOpacity
              onPress={handleAddPlant}
              style={styles.addPlantButton}
              accessibilityRole="button"
              accessibilityLabel={t('profile_add_plant_button')}
            >
              <Ionicons name="add-circle" size={24} color={COLORS.textLight} />
              <Text style={styles.addPlantButtonText}>
                {t('profile_add_plant_button')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Toggle between Thumbnails and Full view */}
          <ToggleButton<ViewOption>
            options={['thumbnail', 'full']}
            selected={viewOption}
            onToggle={(option) => setViewOption(option)}
            getLabel={(option) =>
              option === 'thumbnail' ? t('Thumbnails') : t('Full Size')
            }
          />

          {/* Plants List */}
          {myPlants && myPlants.length > 0 ? (
            <View
              style={
                viewOption === 'full'
                  ? styles.fullViewContainer
                  : styles.thumbViewContainer
              }
            >
              {myPlants.map((plant) => renderPlantItem(plant))}
            </View>
          ) : (
            <View style={styles.noPlantsContainer}>
              <Text style={styles.noPlantsText}>
                {t('profile_no_plants_message')}
              </Text>
            </View>
          )}
        </View>

        {/* Edit Profile Modal */}
        <EditProfileModal
          visible={editProfileVisible}
          userProfile={userProfile}
          onClose={() => setEditProfileVisible(false)}
          onUpdated={() => {
            refetchProfile();
          }}
          cardLayout={editCardLayout}
        />
      </ScrollView>
    </SafeAreaProvider>
  );
};

export default MyProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textDark,
    marginTop: 10,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textDark,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Profile Card
  cardContainer: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  // ---- Plants Section ----
  plantsSectionWrapper: {
    paddingTop: 20,
    paddingBottom: 15,
  },
  plantsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  plantsSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  addPlantButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accentGreen,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  addPlantButtonText: {
    color: COLORS.textLight,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  // Layouts for plant items
  thumbViewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  fullViewContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  plantCardWrapper: {
    marginBottom: 15,
  },
  noPlantsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noPlantsText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
});
