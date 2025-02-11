import React from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "../../../theme/colors";
import { useMyProfile } from "../hooks/useMyProfileHooks";
import {
  useTradeProposals,
  useUpdateTradeProposalStatus,
  useConfirmTradeProposalCompletion,
} from "../hooks/useTradeProposalHooks";
import { TradeProposalResponse } from "../../../types/apiTypes";
import { TradeProposalStatus } from "../../../types/enums";
import PlantThumbnail from "../components/PlantThumbnail";
import CompletedTradeActions from "../components/CompletedTradeActions";
import { headerStyles } from "../styles/headerStyles";
import { Ionicons } from "@expo/vector-icons";

// New imports for the info modal functionality.
import InfoModal from "../modals/InfoModal";
import PlantCardWithInfo from "../components/PlantCardWithInfo";
import { PlantResponse } from "../../../types/apiTypes";
import { useMarkPlantsAsTraded } from "../hooks/usePlantHooks";

// Import the translation hook
import { useTranslation } from "react-i18next";

type RouteParams = {
  connectionId: number;
};

const TradeProposalsScreen: React.FC = () => {
  const { t } = useTranslation();
  const route = useRoute();
  const navigation = useNavigation();
  const { connectionId } = route.params as RouteParams;

  const { data: myProfile, isLoading: profileLoading, isError: profileError } =
    useMyProfile();

  const {
    data: proposals,
    isLoading,
    isError,
    refetch,
  } = useTradeProposals(connectionId);

  const { mutate: updateStatus } = useUpdateTradeProposalStatus(connectionId);
  const { mutate: confirmCompletion } = useConfirmTradeProposalCompletion(connectionId);
  const { mutate: markPlantsAsTraded } = useMarkPlantsAsTraded();

  // State to track which plant's info to display.
  const [plantInfo, setPlantInfo] = React.useState<PlantResponse | null>(null);

  // Helper to update proposal status.
  const handleUpdateStatus = (proposalId: number, newStatus: TradeProposalStatus) => {
    updateStatus({ proposalId, newStatus });
  };

  // Callback invoked by CompletedTradeActions
  const handleConfirmDecisions = (proposalId: number, plantsToDelete: number[]) => {
    // 1) Mark the plants as traded if we have any
    // 2) Then confirm the trade proposal completion
    if (plantsToDelete.length > 0) {
      markPlantsAsTraded(plantsToDelete, {
        onSuccess: () => {
          confirmCompletion(proposalId);
        },
        onError: (err) => {
          console.error("Error marking as traded:", err);
        },
      });
    } else {
      // If no plants to delete, just confirm completion
      confirmCompletion(proposalId);
    }
  };

  const renderItem = ({ item }: { item: TradeProposalResponse }) => {
    // Determine which side is yours.
    const isUser1 = myProfile!.userId === item.connection.user1.userId;
    const myPlants = isUser1 ? item.plantsProposedByUser1 : item.plantsProposedByUser2;
    const otherPlants = isUser1 ? item.plantsProposedByUser2 : item.plantsProposedByUser1;

    // Determine confirmation flag.
    const isOwner = myProfile!.userId === item.proposalOwnerUserId;
    const hasConfirmed = isOwner
      ? item.ownerCompletionConfirmed
      : item.responderCompletionConfirmed;

    // Column titles.
    const userOfferTitle = t("tradeProposalsScreen.yourOffer");
    const otherOfferTitle = t("tradeProposalsScreen.theirOffer");

    // Handlers for pending proposals.
    const handleAccept = () =>
      Alert.alert(
        t("tradeProposalsScreen.alert.acceptProposalTitle"),
        t("tradeProposalsScreen.alert.acceptProposalMessage"),
        [
          { text: t("tradeProposalsScreen.alert.no") },
          {
            text: t("tradeProposalsScreen.alert.yes"),
            onPress: () =>
              handleUpdateStatus(item.tradeProposalId, TradeProposalStatus.Accepted),
          },
        ]
      );
    const handleDecline = () =>
      Alert.alert(
        t("tradeProposalsScreen.alert.declineProposalTitle"),
        t("tradeProposalsScreen.alert.declineProposalMessage"),
        [
          { text: t("tradeProposalsScreen.alert.no") },
          {
            text: t("tradeProposalsScreen.alert.yes"),
            onPress: () =>
              handleUpdateStatus(item.tradeProposalId, TradeProposalStatus.Rejected),
          },
        ]
      );
    const handleCancel = () =>
      Alert.alert(
        t("tradeProposalsScreen.alert.cancelProposalTitle"),
        t("tradeProposalsScreen.alert.cancelProposalMessage"),
        [
          { text: t("tradeProposalsScreen.alert.no") },
          {
            text: t("tradeProposalsScreen.alert.yes"),
            onPress: () =>
              handleUpdateStatus(item.tradeProposalId, TradeProposalStatus.Rejected),
          },
        ]
      );

    // Handlers for accepted proposals.
    const handleMarkCompleted = () =>
      Alert.alert(
        t("tradeProposalsScreen.alert.completeTradeTitle"),
        t("tradeProposalsScreen.alert.completeTradeMessage"),
        [
          { text: t("tradeProposalsScreen.alert.no") },
          {
            text: t("tradeProposalsScreen.alert.yes"),
            onPress: () =>
              handleUpdateStatus(item.tradeProposalId, TradeProposalStatus.Completed),
          },
        ]
      );
    const handleChangedMyMind = () =>
      Alert.alert(
        t("tradeProposalsScreen.alert.changedMyMindTitle"),
        t("tradeProposalsScreen.alert.changedMyMindMessage"),
        [
          { text: t("tradeProposalsScreen.alert.no") },
          {
            text: t("tradeProposalsScreen.alert.yes"),
            onPress: () =>
              handleUpdateStatus(item.tradeProposalId, TradeProposalStatus.Rejected),
          },
        ]
      );

    let actions = null;
    if (item.tradeProposalStatus === TradeProposalStatus.Pending) {
      actions = isOwner ? (
        <TouchableOpacity
          style={[styles.actionButton, styles.cancelButton]}
          onPress={handleCancel}
        >
          <Text style={styles.actionButtonText}>
            {t("tradeProposalsScreen.button.cancelProposal")}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={handleAccept}
          >
            <Text style={styles.actionButtonText}>
              {t("tradeProposalsScreen.button.accept")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={handleDecline}
          >
            <Text style={styles.actionButtonText}>
              {t("tradeProposalsScreen.button.decline")}
            </Text>
          </TouchableOpacity>
        </View>
      );
    } else if (item.tradeProposalStatus === TradeProposalStatus.Accepted) {
      actions = (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.completeButton]}
            onPress={handleMarkCompleted}
          >
            <Text style={styles.actionButtonText}>
              {t("tradeProposalsScreen.button.markCompleted")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.changedMyMindButton]}
            onPress={handleChangedMyMind}
          >
            <Text style={styles.actionButtonText}>
              {t("tradeProposalsScreen.button.changedMyMind")}
            </Text>
          </TouchableOpacity>
        </View>
      );
    } else if (item.tradeProposalStatus === TradeProposalStatus.Completed) {
      // For completed proposals, show the CompletedTradeActions component.
      actions = !hasConfirmed ? (
        <CompletedTradeActions
          plants={myPlants}
          proposalId={item.tradeProposalId}
          onConfirmDecisions={handleConfirmDecisions}
          onPlantInfoPress={(plant) => setPlantInfo(plant)}
        />
      ) : (
        <View style={styles.completedSection}>
          <Text style={styles.completedMessage}>
            {t("tradeProposalsScreen.completed.tradeCompleted")}
          </Text>
        </View>
      );
    }

    // Determine layout:
    // • If both offers have exactly one plant, display them side-by-side (horizontally).
    // • Otherwise, stack the two sections vertically. In both cases the plant thumbnails use a flex container.
    const isHorizontalLayout = myPlants.length === 1 && otherPlants.length === 1;

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {t("tradeProposalsScreen.proposalTitle")}{item.tradeProposalId}
        </Text>
        <Text style={styles.cardSubtitle}>
          {t("tradeProposalsScreen.card.createdAt")} {new Date(item.createdAt).toLocaleString()}
        </Text>

        {isHorizontalLayout ? (
          // Horizontal layout (one plant per offer)
          <View style={styles.offersSectionHorizontal}>
            <View style={styles.offerColumnHorizontal}>
              <Text style={styles.columnTitle}>{userOfferTitle}</Text>
              <View style={styles.offerListFlex}>
                {myPlants.map((plant) => (
                  <PlantThumbnail
                    key={plant.plantId}
                    plant={plant}
                    selectable={false}
                    onInfoPress={() => setPlantInfo(plant)}
                  />
                ))}
              </View>
            </View>
            <View style={styles.offerColumnHorizontal}>
              <Text style={styles.columnTitle}>{otherOfferTitle}</Text>
              <View style={styles.offerListFlex}>
                {otherPlants.map((plant) => (
                  <PlantThumbnail
                    key={plant.plantId}
                    plant={plant}
                    selectable={false}
                    onInfoPress={() => setPlantInfo(plant)}
                  />
                ))}
              </View>
            </View>
          </View>
        ) : (
          // Vertical layout: sections stacked one on top of the other
          <View style={styles.offersSectionVertical}>
            <View style={styles.offerSection}>
              <Text style={styles.columnTitle}>{userOfferTitle}</Text>
              <View style={styles.offerListFlex}>
                {myPlants.map((plant) => (
                  <PlantThumbnail
                    key={plant.plantId}
                    plant={plant}
                    selectable={false}
                    onInfoPress={() => setPlantInfo(plant)}
                  />
                ))}
              </View>
            </View>
            <View style={styles.offerSection}>
              <Text style={styles.columnTitle}>{otherOfferTitle}</Text>
              <View style={styles.offerListFlex}>
                {otherPlants.map((plant) => (
                  <PlantThumbnail
                    key={plant.plantId}
                    plant={plant}
                    selectable={false}
                    onInfoPress={() => setPlantInfo(plant)}
                  />
                ))}
              </View>
            </View>
          </View>
        )}

        <Text style={styles.statusText}>
          {t("tradeProposalsScreen.statusText")}{item.tradeProposalStatus}
        </Text>
        {actions}
      </View>
    );
  };

  if (isLoading || profileLoading) {
    return (
      <SafeAreaProvider style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaProvider>
    );
  }
  if (isError || profileError) {
    return (
      <SafeAreaProvider style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {t("tradeProposalsScreen.error.failedToLoad")}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>{t("tradeProposalsScreen.retry")}</Text>
        </TouchableOpacity>
      </SafeAreaProvider>
    );
  }
  return (
    <SafeAreaProvider style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={headerStyles.headerGradient}
      >
        <View style={headerStyles.headerColumn1}>
          <TouchableOpacity
            style={headerStyles.headerBackButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={30} color={COLORS.textLight} />
          </TouchableOpacity>
          <Text style={headerStyles.headerTitle}>
            {t("tradeProposalsScreen.headerTitle")}
          </Text>
          <View style={{ width: 50 }} />
        </View>
      </LinearGradient>
      {proposals && proposals.length > 0 ? (
        <FlatList
          data={proposals}
          keyExtractor={(item) => item.tradeProposalId.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {t("tradeProposalsScreen.empty.noProposals")}
          </Text>
        </View>
      )}
      {/* InfoModal shows the full plant card when a thumbnail’s info is pressed */}
      <InfoModal visible={!!plantInfo} onClose={() => setPlantInfo(null)}>
        {plantInfo && <PlantCardWithInfo plant={plantInfo} compact={false} />}
      </InfoModal>
    </SafeAreaProvider>
  );
};

export default TradeProposalsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textDark,
    marginBottom: 10,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textDark,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  columnTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 2,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  acceptButton: {
    backgroundColor: COLORS.accentGreen,
  },
  rejectButton: {
    backgroundColor: COLORS.accentRed,
  },
  cancelButton: {
    backgroundColor: COLORS.accentRed,
  },
  completeButton: {
    backgroundColor: COLORS.accentGreen,
  },
  changedMyMindButton: {
    backgroundColor: "#F39C12",
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  completedSection: {
    marginTop: 10,
    alignItems: "center",
  },
  completedMessage: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textDark,
    paddingVertical: 10,
  },
  // ----- Horizontal Layout Styles (when each offer has one plant) -----
  offersSectionHorizontal: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  offerColumnHorizontal: {
    flex: 1,
    alignItems: "center",
  },
  // ----- Vertical Layout Styles (when one or both offers have more than one plant) -----
  offersSectionVertical: {
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 12,
  },
  offerSection: {
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
  },
  // Common flex container for plant thumbnails (similar to MyProfileScreen's thumbViewContainer)
  offerListFlex: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 8,
  },
});
