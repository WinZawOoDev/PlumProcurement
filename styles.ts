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
        borderRadius: DIMENSIONS.BORDER_RADIUS_MEDIUM,
        paddingVertical: DIMENSIONS.BUTTON_PADDING_VERTICAL,
    },
    primaryButtonTitle: {
        color: theme.colors.white,
        fontWeight: 'bold',
        fontSize: 16,
    },
    secondaryButton: {
        backgroundColor: theme.colors.neutral,
        borderRadius: DIMENSIONS.BORDER_RADIUS_MEDIUM,
        paddingVertical: DIMENSIONS.BUTTON_PADDING_VERTICAL,
        borderWidth: 0.5,
        borderColor: theme.colors.primary,
    },
    secondaryButtonTitle: {
        color: theme.colors.primary,
        fontWeight: 'bold',
        fontSize: 16,
    },
    iconButtonBase: {
        display: 'flex',
        justifyContent: 'flex-start',
        paddingHorizontal: DIMENSIONS.BUTTON_PADDING_HORIZONTAL,
        paddingBlock: DIMENSIONS.BUTTON_PADDING_VERTICAL,
        borderRadius: DIMENSIONS.BORDER_RADIUS_SMALL,
        elevation: 0,
        shadowOpacity: 0,
        borderWidth: 0,
    },
    iconButtonPrimary: {
        backgroundColor: theme.colors.primary,
    },
    iconButtonSecondary: {
        backgroundColor: theme.colors.neutral,
    },
    iconButtonTitlePrimary: {
        fontWeight: '600',
        fontSize: 17,
        lineHeight: 20,
        fontFamily: TYPOGRAPHY.FONT_FAMILY_SECONDARY,
        marginLeft: 10,
        color: 'white',
    },
    iconButtonTitleSecondary: {
        fontWeight: '600',
        fontSize: 17,
        lineHeight: 20,
        fontFamily: TYPOGRAPHY.FONT_FAMILY_SECONDARY,
        marginLeft: 10,
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
        paddingBlock: 5,
        marginTop: 10,
        backgroundColor: theme.colors.secondary,
    },
    formInput: {
        paddingHorizontal: 15,
        fontSize: 18,
        paddingBlock: 10,
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
    },


    // ===== PRICING - ACTION BUTTONS =====
    actionButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: "center"
    },

    // ===== PRICING - PRICE CARD =====
    priceCardContainer: {
        width: '100%',
        borderRadius: 8,
        borderWidth: 0,
        marginHorizontal: 'auto',
        shadowColor: 'transparent',
        elevation: 0,
        shadowOpacity: 0,
        backgroundColor: theme.colors.white
    },
    priceCardHeader: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
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
    priceCardEditButtonTitle: {
        color: theme.colors.black,
        fontWeight: '600',
        fontSize: 14,
    },
    priceCardRow: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    priceCardLabel: {
        marginBottom: 10,
        fontWeight: 'thin',
        fontSize: 13,
        lineHeight: 17,
        fontFamily: TYPOGRAPHY.FONT_FAMILY_SECONDARY,
        color: theme.colors.tertiary
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
    priceCardCategoryValue: {
        marginBottom: 10,
        fontWeight: 'condensed',
        fontSize: 14,
        lineHeight: 17,
        fontFamily: TYPOGRAPHY.FONT_FAMILY_SECONDARY
    },
    priceCardBadgeStyle: {
        backgroundColor: theme.colors.neutral
    },
    priceCardBadgeText: {
        fontSize: 12,
        fontWeight: 'thin',
        color: theme.colors.black,
        fontFamily: TYPOGRAPHY.FONT_FAMILY_SECONDARY
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
    titleDescription: {
        marginBottom: 10
    },
    titleText: {
        fontFamily: TYPOGRAPHY.FONT_FAMILY_PRIMARY,
        fontSize: 25,
        fontWeight: '700',
        color: theme.colors.primary,
        letterSpacing: TYPOGRAPHY.LETTER_SPACING,
        lineHeight: 40
    },
    descriptionText: {
        fontFamily: TYPOGRAPHY.FONT_FAMILY_SECONDARY,
        fontWeight: '500',
        fontSize: 16,
        lineHeight: 24,
    },
    emptyPriceListContainer: {
        flex: 1,
        width: '100%',
        backgroundColor: theme.colors.secondary,
        height: DIMENSIONS.EMPTY_LIST_HEIGHT,
        alignItems: 'center',
        justifyContent: 'center'
    },
    priceListFlatList: {
        marginBottom: DIMENSIONS.FLAT_LIST_MARGIN_BOTTOM,
    },

    // ===== PURCHASE =====
    quantityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        marginBottom: 20,
        gap: 15,
    },
    quantityStepperButton: {
        fontSize: 26,
        fontWeight: 'bold',
        color: theme.colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 2,
        borderWidth: 1,
        borderColor: theme.colors.secondary,
        borderRadius: DIMENSIONS.BORDER_RADIUS_SMALL,
        backgroundColor: theme.colors.secondary,
    },
    quantityValue: {
        fontSize: 20,
        fontWeight: '700',
        minWidth: 40,
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
        backgroundColor: theme.colors.white,
        borderRadius: DIMENSIONS.BORDER_RADIUS_MEDIUM,
        paddingVertical: 10,
        paddingHorizontal: 5,
        marginBottom: 10,
    },
    exportButtonContainer: {
        marginBottom: 15,
    },
    recentPurchasesTitle: {
        fontWeight: '700',
        fontSize: 16,
        fontFamily: TYPOGRAPHY.FONT_FAMILY_PRIMARY,
        color: theme.colors.primary,
        marginTop: 20,
        marginBottom: 8,
    },
    purchaseItemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 0.5,
        borderColor: theme.colors.secondary,
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


    // ===== SELLERS =====
    addSellerButton: {
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
    rowIconButton: {
        backgroundColor: theme.colors.neutral,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: DIMENSIONS.BORDER_RADIUS_SMALL,
    },
    rowIconDeleteButton: {
        backgroundColor: theme.colors.error,
    },

}));
