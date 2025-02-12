// File: app/features/main/screens/EditPlantScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import ConfirmCancelButtons from '../components/ConfirmCancelButtons';
import TagGroup from '../components/TagGroup';
import { COLORS } from '../../../theme/colors';
import { useUpdatePlant } from '../hooks/usePlantHooks';
import {
  PlantRequest,
  PlantResponse,
} from '../../../types/apiTypes';
import {
  PlantStage,
  PlantCategory,
  WateringNeed,
  LightRequirement,
  Size,
  IndoorOutdoor,
  PropagationEase,
  PetFriendly,
  Extras,
} from '../../../types/enums';

// Define the route params type (adjust the name of your navigator as needed)
type RootStackParamList = {
  EditPlantScreen: { plant: PlantResponse };
};
type EditPlantScreenRouteProp = RouteProp<RootStackParamList, 'EditPlantScreen'>;

const EditPlantScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<EditPlantScreenRouteProp>();

  // Retrieve the plant passed as a route parameter
  const { plant } = route.params;

  // Initialize state with the current plant data
  const [speciesName, setSpeciesName] = useState(plant.speciesName);
  const [description, setDescription] = useState(plant.description);
  const [stage, setStage] = useState(plant.plantStage);
  const [category, setCategory] = useState(plant.plantCategory);
  const [watering, setWatering] = useState(plant.wateringNeed);
  const [light, setLight] = useState(plant.lightRequirement);
  const [size, setSize] = useState(plant.size ?? null);
  const [indoorOutdoor, setIndoorOutdoor] = useState(plant.indoorOutdoor ?? null);
  const [propagationEase, setPropagationEase] = useState(plant.propagationEase ?? null);
  const [petFriendly, setPetFriendly] = useState(plant.petFriendly ?? null);
  const [selectedExtras, setSelectedExtras] = useState<Extras[]>(plant.extras ?? []);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use the update mutation hook we defined earlier
  const updatePlantMutation = useUpdatePlant();

  const handleExtraToggle = (extra: Extras) => {
    setSelectedExtras((prev) =>
      prev.includes(extra) ? prev.filter((e) => e !== extra) : [...prev, extra]
    );
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const handleSave = () => {
    // Basic validations (you can expand these as needed)
    if (!speciesName.trim()) {
      Alert.alert('Validation Error', 'Species name is required.');
      return;
    }
    if (!stage) {
      Alert.alert('Validation Error', 'Plant stage is required.');
      return;
    }

    // Create an update payload using the PlantRequest shape
    const plantUpdate: PlantRequest = {
      speciesName: speciesName.trim(),
      description: description.trim() ? description : null,
      plantStage: stage,
      plantCategory: category,
      wateringNeed: watering,
      lightRequirement: light,
      size: size,
      indoorOutdoor: indoorOutdoor,
      propagationEase: propagationEase,
      petFriendly: petFriendly,
      extras: selectedExtras,
    };

    setLoading(true);
    setError(null);

    updatePlantMutation.mutate(
      { plantId: plant.plantId, data: plantUpdate },
      {
        onSuccess: () => {
          setLoading(false);
          navigation.goBack();
        },
        onError: (err) => {
          console.error('Error updating plant:', err);
          setError(t('edit_plant_error_message'));
          setLoading(false);
        },
      }
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.gradientBackground}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={30} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('edit_plant_title')}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.formContainer}>
            {error && <Text style={styles.errorText}>{error}</Text>}

            <Text style={styles.label}>{t('species_name_question')}:</Text>
            <TextInput
              style={styles.input}
              value={speciesName}
              onChangeText={setSpeciesName}
              placeholder="e.g. Monstera Deliciosa"
            />

            <Text style={styles.label}>{t('description_question')}:</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <Text style={styles.label}>{t('stage_question')}:</Text>
            <TagGroup
              mode="single"
              values={Object.values(PlantStage)}
              selectedValue={stage}
              onSelectSingle={(val) => setStage(val)}
              isRequired={true}
              getLabel={(val) => t(`plantTags.${val}`)}
            />

            <Text style={styles.label}>{t('category_question')}:</Text>
            <TagGroup
              mode="single"
              values={Object.values(PlantCategory)}
              selectedValue={category}
              onSelectSingle={(val) => setCategory(val === category ? null : val)}
              isRequired={false}
              getLabel={(val) => t(`plantTags.${val}`)}
            />

            <Text style={styles.label}>{t('watering_question')}:</Text>
            <TagGroup
              mode="single"
              values={Object.values(WateringNeed)}
              selectedValue={watering}
              onSelectSingle={(val) => setWatering(val === watering ? null : val)}
              isRequired={false}
              getLabel={(val) => t(`plantTags.${val}`)}
            />

            <Text style={styles.label}>{t('light_question')}:</Text>
            <TagGroup
              mode="single"
              values={Object.values(LightRequirement)}
              selectedValue={light}
              onSelectSingle={(val) => setLight(val === light ? null : val)}
              isRequired={false}
              getLabel={(val) => t(`plantTags.${val}`)}
            />

            <Text style={styles.label}>{t('size_question')}:</Text>
            <TagGroup
              mode="single"
              values={Object.values(Size)}
              selectedValue={size}
              onSelectSingle={(val) => setSize(val === size ? null : val)}
              isRequired={false}
              getLabel={(val) => t(`plantTags.${val}`)}
            />

            <Text style={styles.label}>{t('indoor_outdoor_question')}:</Text>
            <TagGroup
              mode="single"
              values={Object.values(IndoorOutdoor)}
              selectedValue={indoorOutdoor}
              onSelectSingle={(val) => setIndoorOutdoor(val === indoorOutdoor ? null : val)}
              isRequired={false}
              getLabel={(val) => t(`plantTags.${val}`)}
            />

            <Text style={styles.label}>{t('propagation_ease_question')}:</Text>
            <TagGroup
              mode="single"
              values={Object.values(PropagationEase)}
              selectedValue={propagationEase}
              onSelectSingle={(val) => setPropagationEase(val === propagationEase ? null : val)}
              isRequired={false}
              getLabel={(val) => t(`plantTags.${val}`)}
            />

            <Text style={styles.label}>{t('pet_friendly_question')}:</Text>
            <TagGroup
              mode="single"
              values={Object.values(PetFriendly)}
              selectedValue={petFriendly}
              onSelectSingle={(val) => setPetFriendly(val === petFriendly ? null : val)}
              isRequired={false}
              getLabel={(val) => t(`plantTags.${val}`)}
            />

            <Text style={styles.label}>{t('extras_question')}:</Text>
            <TagGroup
              mode="multiple"
              values={Object.values(Extras)}
              selectedValues={selectedExtras}
              onToggleMulti={(val) => handleExtraToggle(val)}
              getLabel={(val) => t(`plantTags.${val}`)}
            />

            <ConfirmCancelButtons
              onConfirm={handleSave}
              onCancel={handleCancel}
              confirmButtonText={t('edit_plant_save_button')}
              cancelButtonText={t('edit_plant_cancel_button')}
              loading={loading}
            />
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

export default EditPlantScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 16,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  formContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 3,
      },
    }),
  },
  errorText: {
    color: COLORS.textDark,
    marginBottom: 10,
    fontWeight: '600',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
});
