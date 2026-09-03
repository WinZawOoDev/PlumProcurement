import { makeStyles } from "@rneui/themed";
import { DIMENSIONS, TYPOGRAPHY } from "./constants";

export const useStyles = makeStyles((theme) => ({
    // ===== SHARED - BUTTONS =====
    raisedButtonContainer: {
        shadowColor: 'transparent',
        elevation: 0,
        shadowOpacity: 0,
    },
    primaryButton: {
        backgroundColor: theme.colors.primary,
        borderRadius: 10,
        paddingVertical: 14,
        paddingHorizontal: 16,
        minHeight: 50,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        elevation: 2,
    },
    primaryButtonTitle: {
        color: theme.colors.white,
        fontWeight: '700',
        fontSize: 14,
        letterSpacing: 0.3,
        fontFamily: TYPOGRAPHY.FONT_FAMILY_PRIMARY,
    },
    secondaryButton: {
        backgroundColor: theme.colors.white,
        borderRadius: 10,
        paddingVertical: 14,
        paddingHorizontal: 16,
        minHeight: 50,
        borderWidth: 1,
        borderColor: theme.colors.grey2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    secondaryButtonTitle: {
        color: theme.colors.grey5,
        fontWeight: '600',
        fontSize: 14,
        letterSpacing: 0.2,
        fontFamily: TYPOGRAPHY.FONT_FAMILY_PRIMARY,
    },
    iconButtonBase: {
        minWidth: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 0,
        elevation: 0,
        shadowOpacity: 0,
        borderWidth: 0,
    },
    iconButtonCompact: {
        minWidth: 36,
        width: 36,
        height: 36,
        paddingHorizontal: 0,
    },
    iconButtonSmall: {
        minWidth: 32,
        width: 32,
        height: 32,
        paddingHorizontal: 0,
    },
    iconButtonPrimary: {
        backgroundColor: theme.colors.primary,
    },
    iconButtonSecondary: {
        backgroundColor: theme.colors.grey0,
        borderWidth: 1,
        borderColor: theme.colors.grey1,
    },
    iconButtonGhost: {
        backgroundColor: 'transparent',
        borderWidth: 0,
    },
    iconButtonTitlePrimary: {
        fontWeight: '600',
        fontSize: 14,
        lineHeight: 18,
        fontFamily: TYPOGRAPHY.FONT_FAMILY_SECONDARY,
        marginLeft: 8,
        color: 'white',
    },
    iconButtonTitleSecondary: {
        fontWeight: '600',
        fontSize: 14,
        lineHeight: 18,
        fontFamily: TYPOGRAPHY.FONT_FAMILY_SECONDARY,
        marginLeft: 8,
        color: theme.colors.primary,
    },

    // ===== SHARED - FORM FIELDS =====
    formErrorText: {
        color: theme.colors.error,
        fontSize: 12,
    },
    formInputLabel: {
        fontWeight: '600',
        color: theme.colors.primary,
    },
    formInputContainer: {
        borderBottomWidth: 0,
        borderRadius: DIMENSIONS.BORDER_RADIUS_SMALL,
        paddingBlock: 2,
        marginTop: 10,
        backgroundColor: theme.colors.secondary,
    },
    formInput: {
        paddingHorizontal: 15,
        fontSize: 18,
        paddingBlock: 6,
    },
    formCheckboxText: {
        fontWeight: '600',
        color: theme.colors.primary,
        fontSize: 16,
    },
    formCheckboxContainer: {
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: theme.colors.secondary,
        borderRadius: DIMENSIONS.BORDER_RADIUS_SMALL,
    },
    formButtonGroupButton: {
        borderWidth: 0,
        backgroundColor: theme.colors.secondary,
    },
    formButtonGroupSelectedButton: {
        backgroundColor: theme.colors.white,
        borderRadius: DIMENSIONS.BORDER_RADIUS_SMALL,
        borderWidth: 0.5,
        borderColor: theme.colors.secondary,
    },
    formButtonGroupSelectedText: {
        fontWeight: 'bold',
        color: theme.colors.black,
        fontSize: 14,
    },
    formButtonGroupInnerBorder: {
        color: theme.colors.secondary,
    },

    // ===== GLOBAL =====
    container: {
        flex: 1,
    },
    sectionHeaderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
        gap: 12,
    },
    sectionHeaderTextBlock: {
        flex: 1,
        gap: 4,
    },
    sectionHeaderTitle: {
        fontFamily: TYPOGRAPHY.FONT_FAMILY_PRIMARY,
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.primary,
        letterSpacing: 0.2,
        lineHeight: 26,
    },
    sectionHeaderDescription: {
        fontFamily: TYPOGRAPHY.FONT_FAMILY_SECONDARY,
        fontSize: 13,
        fontWeight: '400',
        color: theme.colors.grey4,
        lineHeight: 18,
        marginTop: 2,
    },
    emptyStateContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 32,
        paddingHorizontal: 24,
        gap: 10,
    },
    emptyStateIconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: theme.colors.grey0,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    emptyStateContainerCompact: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 24,
        gap: 4,
    },
    emptyStateIconCircleCompact: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: theme.colors.grey0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyStateTitle: {
        fontFamily: TYPOGRAPHY.FONT_FAMILY_PRIMARY,
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.grey5,
        textAlign: 'center',
    },
    emptyStateDescription: {
        fontFamily: TYPOGRAPHY.FONT_FAMILY_SECONDARY,
        fontSize: 13,
        color: theme.colors.grey4,
        textAlign: 'center',
        lineHeight: 18,
    },
    fillContainer: {
        flex: 1,
    },
    sectionHeaderTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailSheetBody: {
        gap: 8,
        marginTop: 12,
    },

    // ===== ONBOARDING =====
    onboardingContainer: {
        flex: 1,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        padding: 24,
        gap: 24,
    },
    onboardingSlides: {
        width: '100%',
    },
    onboardingSlide: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        minHeight: 260,
        paddingHorizontal: 8,
    },
    startupLoaderContainer: {
        flex: 1,
        backgroundColor: theme.colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
    },
    startupLoaderOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
    },
    startupLoaderTitle: {
        fontFamily: TYPOGRAPHY.FONT_FAMILY_PRIMARY,
        fontSize: 22,
        fontWeight: '700',
        color: theme.colors.primary,
        letterSpacing: 0.3,
    },
    onboardingCenter: {
        alignItems: 'center',
        gap: 12,
    },
    onboardingIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.primary + '12',
        alignItems: 'center',
        justifyContent: 'center',
    },
    onboardingTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: theme.colors.primary,
    },
    onboardingDescription: {
        fontSize: 14,
        color: theme.colors.grey4,
        textAlign: 'center',
        lineHeight: 20,
    },
    onboardingDotsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
    },
    onboardingDot: {
        height: 6,
        borderRadius: 3,
    },
    onboardingButtons: {
        gap: 10,
    },

    // ===== PRICING - CREATE PRICE =====
    createPriceActions: {
        marginTop: 30,
        width: '100%',
        paddingHorizontal: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
    },
    headerTitleText: {
        color: theme.colors.primary,
        fontWeight: '700',
        fontSize: 20,
        fontFamily: TYPOGRAPHY.FONT_FAMILY_PRIMARY,
        letterSpacing: TYPOGRAPHY.LETTER_SPACING,
    },
    createPriceContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        paddingHorizontal: 12,
        paddingBlock: 15,
        flexDirection: 'column',
        gap: 10,
    },
    categoryContainer: {
        width: '100%',
        paddingHorizontal: 10,
        marginBottom: 20
    },
    categoryLabel: {
        fontWeight: '600',
        color: theme.colors.primary,
        marginBottom: 8,
        fontSize: 16
    },
    pickerWrapper: {
        width: 'auto',
        backgroundColor: theme.colors.secondary,
        borderRadius: DIMENSIONS.BORDER_RADIUS_SMALL,
        padding: 1
    },
    picker: {
        backgroundColor: theme.colors.secondary,
        width: '100%',
    },
    unitContainer: {
        width: '100%',
    },
    unitLabel: {
        fontWeight: '600',
        color: theme.colors.primary,
        marginBottom: 8,
        paddingHorizontal: 10,
        fontSize: 16,
    },
    buttonGroupContainer: {
        height: DIMENSIONS.BUTTON_HEIGHT,
        borderRadius: DIMENSIONS.BORDER_RADIUS_MEDIUM,
        padding: 1,
        backgroundColor: theme.colors.secondary,
    },
    buttonGroupButtonContainer: {
        padding: 2
    },


    // ===== PRICING - EDIT PRICE =====
    bottomSheetContainer: {
        width: '100%',
        backgroundColor: theme.colors.white,
        borderTopLeftRadius: DIMENSIONS.BORDER_RADIUS_LARGE,
        borderTopRightRadius: DIMENSIONS.BORDER_RADIUS_LARGE,
        paddingVertical: 20,
        paddingHorizontal: 25
    },
    bottomSheetTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.primary,
        fontFamily: TYPOGRAPHY.FONT_FAMILY_PRIMARY
    },

    updateButtonContainerStyle: {
        shadowColor: 'transparent',
        elevation: 0,
        shadowOpacity: 0,
        borderWidth: 0,
        marginVertical: 10,
    },


    // ===== PRICING - ACTION BUTTONS =====
    actionButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: "center"
    },

    // ===== PRICING - PRICE CARD =====
    priceCardMinimal: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 6,
        borderBottomWidth: 0.5,
        borderColor: theme.colors.grey1,
        gap: 16,
    },
    priceCardAccent: {
        width: 3,
        alignSelf: 'stretch',
        borderRadius: 2,
    },
    priceCardTitle: {
        letterSpacing: TYPOGRAPHY.LETTER_SPACING,
        alignSelf: 'flex-start',
        textAlign: 'left',
        fontWeight: 'bold',
        color: theme.colors.primary,
        fontSize: 16,
        fontFamily: TYPOGRAPHY.FONT_FAMILY_PRIMARY,
        textTransform: 'capitalize'
    },
    priceCardDateText: {
        fontSize: 12,
        color: theme.colors.tertiary,
    },
    priceCardActionsRow: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    priceCardValue: {
        marginBottom: 10,
        fontWeight: 'bold',
        fontSize: 15,
        lineHeight: 17,
        fontFamily: TYPOGRAPHY.FONT_FAMILY_SECONDARY
    },
    priceCardCurrencySymbol: {
        fontWeight: '700'
    },
    priceCardIconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    priceCardInfo: {
        flex: 1,
        gap: 4,
    },
    priceCardHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    priceCardTitleSmall: {
        fontSize: 13,
        letterSpacing: 0,
    },
    priceCardStatusDot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
        opacity: 0.9,
    },
    priceCardDateTextSmall: {
        fontSize: 11,
    },
    priceCardValueLarge: {
        marginBottom: 0,
        fontSize: 15,
        color: theme.colors.black,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
    priceCardCurrencySymbolLarge: {
        fontSize: 13,
    },
    priceCardUnitText: {
        fontSize: 11,
        color: theme.colors.grey4,
        fontWeight: '400',
    },
    priceCardActionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },

    // ===== PRICING - PURCHASE PRICE =====
    priceListScreen: {
        flexDirection: 'column',
        padding: 15,
        backgroundColor: theme.colors.background,
        height: '100%',
    },
    emptyPriceListText: {
        alignSelf: 'center',
    },
    searchBarContainer: {
        marginBottom: 10,
    },
    priceListContainer: {
        paddingHorizontal: 12,
        paddingBlock: 15
    },
    descriptionText: {
        fontFamily: TYPOGRAPHY.FONT_FAMILY_SECONDARY,
        fontWeight: '500',
        fontSize: 16,
        lineHeight: 24,
    },
    priceListFlatList: {
        marginBottom: DIMENSIONS.FLAT_LIST_MARGIN_BOTTOM,
    },

    // ===== PURCHASE =====
    quantityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        marginVertical: 16,
        gap: 15,
    },
    quantityStepperButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.secondary,
        borderRadius: 22,
        backgroundColor: theme.colors.secondary,
    },
    quantityStepperButtonText: {
        fontSize: 26,
        fontWeight: 'bold',
        color: theme.colors.primary,
        textAlign: 'center',
    },
    quantityStepperButtonDisabled: {
        opacity: 0.4,
    },
    quantityStepperTextDisabled: {
        opacity: 0.4,
    },
    quantityStepperHint: {
        marginTop: -8,
        paddingHorizontal: 10,
        fontSize: 12,
        color: theme.colors.grey2,
    },
    quantityValue: {
        fontSize: 32,
        fontWeight: '700',
        minWidth: 56,
        textAlign: 'center',
        color: theme.colors.black,
    },
    purchaseSummaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 10,
    },
    purchaseSummaryLabel: {
        fontWeight: '600',
        color: theme.colors.tertiary,
        fontSize: 14,
    },
    purchaseSummaryValue: {
        fontWeight: '600',
        fontSize: 16,
        color: theme.colors.black,
    },
    purchaseTotalText: {
        fontWeight: '700',
        fontSize: 18,
        color: theme.colors.primary,
    },
    purchaseSummaryCard: {
        backgroundColor: theme.colors.grey0,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 12,
        marginBottom: 12,
        borderWidth: 0,
    },
    purchaseSummaryCardInline: {
        marginTop: 8,
        marginBottom: 0,
    },
    purchaseSummaryDivider: {
        borderTopWidth: 1,
        borderColor: '#eee',
        marginTop: 6,
        paddingTop: 6,
    },
    purchaseDetailsSummaryDivider: {
        borderTopWidth: 1,
        borderColor: theme.colors.grey1,
        marginTop: 6,
        paddingTop: 8,
    },
    formActions: {
        gap: 10,
        marginTop: 12,
    },
    formCard: {
        backgroundColor: theme.colors.surface ?? theme.colors.white,
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        borderWidth: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 1,
        gap: 2,
    },
    exportButton: {
        paddingVertical: 10,
        minHeight: 44,
    },
    purchaseActionsRow: {
        marginBottom: 15,
    },
    recentPurchasesTitle: {
        fontWeight: '700',
        fontSize: 16,
        fontFamily: TYPOGRAPHY.FONT_FAMILY_PRIMARY,
        color: theme.colors.primary,
        marginTop: 4,
        marginBottom: 8,
    },
    recentPurchasesHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 2,
        marginBottom: 1,
    },
    recentPurchasesCount: {
        fontSize: 12,
        color: '#999',
    },
    recentPurchasesList: {
        flex: 1,
    },
    recentPurchasesEmpty: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    purchaseHistoryScreen: {
        flexDirection: 'column',
        padding: 15,
        backgroundColor: theme.colors.background,
        height: '100%',
    },
    purchaseHistoryContainer: {
        paddingHorizontal: 12,
        paddingBlock: 15
    },
    purchaseHistoryItems: {
        marginBottom: 25,
    },
    purchaseItemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 4,
        borderBottomWidth: 0.5,
        borderColor: theme.colors.grey1,
        gap: 12,
    },
    purchaseItemTitle: {
        fontWeight: '600',
        fontSize: 15,
        color: theme.colors.black,
    },
    purchaseItemSubtitle: {
        fontSize: 13,
        color: theme.colors.tertiary,
        marginTop: 2,
    },
    purchaseItemTotal: {
        fontWeight: '700',
        fontSize: 15,
        color: theme.colors.black,
    },
    purchaseItemActions: {
        alignItems: 'flex-end',
        gap: 2,
    },
    purchaseItemButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 0,
    },


    // ===== PRICE TREND =====
    priceTrendContainer: {
        marginBottom: 12,
        padding: 10,
        backgroundColor: theme.colors.grey0,
        borderRadius: 12,
        borderWidth: 0,
    },
    priceTrendTitle: {
        fontWeight: '600',
        marginBottom: 6,
        color: theme.colors.primary,
    },
    priceTrendBarsRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 4,
        height: 40,
    },
    priceTrendBar: {
        flex: 1,
        borderRadius: 2,
    },
    priceTrendScaleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    priceTrendScaleText: {
        fontSize: 11,
        color: theme.colors.tertiary,
    },

    // ===== SELLERS =====
    sellerActionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    sellerInfo: {
        flex: 1,
        paddingRight: 10,
    },
    sellerNameText: {
        fontWeight: '600',
        fontSize: 15,
        color: theme.colors.black,
    },
    sellerPhoneText: {
        fontSize: 13,
        color: theme.colors.tertiary,
        marginTop: 2,
    },
    sellerPurchaseStats: {
        color: theme.colors.success,
        fontWeight: '600',
    },
    rowIconButton: {
        backgroundColor: theme.colors.neutral,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: DIMENSIONS.BORDER_RADIUS_SMALL,
    },
    rowIconDeleteButton: {
        backgroundColor: theme.colors.error + '14',
        borderWidth: 1,
        borderColor: theme.colors.error + '22',
    },
    // Enhanced seller list delete — soft danger with subtle border, matches app cards
    sellerDeleteButton: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: theme.colors.error + '12',
        borderWidth: 1,
        borderColor: theme.colors.error + '18',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 0,
        paddingVertical: 0,
    },
    sellerDeleteButtonPressed: {
        backgroundColor: theme.colors.error + '20',
        borderColor: theme.colors.error + '30',
    },
    // Detail screen danger zone
    sellerDangerCard: {
        marginTop: 16,
        padding: 16,
        borderRadius: 14,
        backgroundColor: theme.colors.error + '08',
        borderWidth: 1,
        borderColor: theme.colors.error + '18',
        gap: 12,
    },
    sellerDangerTitle: {
        fontFamily: TYPOGRAPHY.FONT_FAMILY_PRIMARY,
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.error,
        letterSpacing: 0.2,
    },
    sellerDangerDescription: {
        fontFamily: TYPOGRAPHY.FONT_FAMILY_SECONDARY,
        fontSize: 13,
        color: theme.colors.grey4,
        lineHeight: 18,
    },
    sellerDangerButton: {
        backgroundColor: theme.colors.error,
        borderRadius: 10,
        paddingVertical: 13,
        paddingHorizontal: 16,
        minHeight: 46,
        borderWidth: 0,
    },
    sellerDangerButtonTitle: {
        color: 'white',
        fontWeight: '700',
        fontSize: 14,
        letterSpacing: 0.2,
        fontFamily: TYPOGRAPHY.FONT_FAMILY_PRIMARY,
    },
    sellerDetailHeaderActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sellerDetailDeleteIconButton: {
        width: 38,
        height: 38,
        borderRadius: 10,
        backgroundColor: theme.colors.error + '12',
        borderWidth: 1,
        borderColor: theme.colors.error + '18',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sellerEditLabel: {
        color: theme.colors.primary,
        fontWeight: '700',
        fontSize: 14,
        letterSpacing: 0.3,
        fontFamily: TYPOGRAPHY.FONT_FAMILY_PRIMARY,
    },
    avatarCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: theme.colors.primary + '18',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontWeight: '700',
        fontSize: 16,
        color: theme.colors.primary,
        fontFamily: TYPOGRAPHY.FONT_FAMILY_PRIMARY,
    },
    sellerDetailsBackRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 8,
        marginLeft: -4,
    },
    sellerDetailsBackTitle: {
        fontFamily: TYPOGRAPHY.FONT_FAMILY_PRIMARY,
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.primary,
        letterSpacing: 0.2,
    },
    sellerProfileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginBottom: 14,
        backgroundColor: theme.colors.surface ?? theme.colors.white,
        borderRadius: 14,
        borderWidth: 0.5,
        borderColor: theme.colors.grey1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 1,
    },
    sellerProfileAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: theme.colors.primary + '18',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    sellerProfileInitial: {
        fontWeight: '700',
        fontSize: 22,
        color: theme.colors.primary,
        fontFamily: TYPOGRAPHY.FONT_FAMILY_PRIMARY,
    },
    sellerProfileMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 4,
    },
    sellerStatsRow: {
        flexDirection: 'row',
        alignItems: 'stretch',
        backgroundColor: theme.colors.grey0,
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 8,
        marginBottom: 14,
    },
    sellerStatCell: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingHorizontal: 6,
    },
    sellerStatIconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: theme.colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 0.5,
        borderColor: theme.colors.grey1,
    },
    sellerStatValue: {
        fontFamily: TYPOGRAPHY.FONT_FAMILY_PRIMARY,
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.black,
        textAlign: 'center',
    },
    sellerStatLabel: {
        fontFamily: TYPOGRAPHY.FONT_FAMILY_SECONDARY,
        fontSize: 11,
        fontWeight: '600',
        color: theme.colors.grey4,
        textAlign: 'center',
        letterSpacing: 0.3,
        textTransform: 'uppercase',
    },
    sellerStatDivider: {
        width: 0.5,
        backgroundColor: theme.colors.grey1,
        marginVertical: 8,
    },
    sellerSectionSpacer: {
        marginTop: 4,
    },
    sellerStatsSkeleton: {
        paddingVertical: 24,
        alignItems: 'center',
    },
    sellerHistoryEmptyContent: {
        flexGrow: 1,
    },

    // ===== SKELETON =====
    cardSkeletonContainer: {
        padding: 16,
        backgroundColor: theme.colors.surface ?? theme.colors.white,
        borderRadius: 16,
        marginBottom: 12,
        gap: 10,
    },
    cardSkeletonRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 4,
    },

    // ===== SETTINGS =====
    settingsCard: {
        backgroundColor: theme.colors.surface ?? theme.colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    settingsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    settingsLabel: {
        fontWeight: '600',
        fontSize: 15,
        color: theme.colors.black,
    },
    settingsPickerWrapper: {
        width: 150,
    },
    settingsFooterNote: {
        fontSize: 12,
        color: theme.colors.grey4,
        textAlign: 'center',
        marginTop: 8,
    },

}));
