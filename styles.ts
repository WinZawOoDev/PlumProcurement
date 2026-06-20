import { makeStyles } from "@rneui/themed";

export const useStyles = makeStyles((theme) => ({
    // ===== GLOBAL =====
    container: {
        flex: 1,
    },
    screenContainer: {
        flex: 1,
        flexDirection: 'column',
        padding: 15,
        backgroundColor: theme.colors.background
    },

    // ===== PRICING - CREATE PRICE =====
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
        borderRadius: 4,
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
        height: 55,
        borderRadius: 5,
        padding: 1,
        backgroundColor: theme.colors.secondary,
    },
    buttonGroupButtonContainer: {
        padding: 2
    },
    checkboxContainer: {
        width: '100%',
        paddingHorizontal: 10,
        marginBottom: 20,
        backgroundColor: 'transparent',
        borderWidth: 0,
    },
    priceInputContainer: {
        width: '100%',
        paddingHorizontal: 10,
        marginBottom: 20
    },
    priceLabel: {
        fontWeight: '600',
        color: theme.colors.primary,
        marginBottom: 8,
        fontSize: 16
    },
    priceInputFieldContainer: {
        borderBottomWidth: 0,
        backgroundColor: theme.colors.white,
        borderRadius: 4
    },
    priceInputField: {
        color: theme.colors.black,
        fontWeight: 'bold',
        fontSize: 25,
        letterSpacing: 0.5,
        fontFamily: 'Inter',
        textAlign: 'center'
    },
    saveButtonContainer: {
        width: '100%',
        paddingHorizontal: 10
    },
    saveButton: {
        backgroundColor: theme.colors.primary,
        borderRadius: 4,
        paddingVertical: 12,
        marginTop: 10
    },
    saveTitleStyle: {
        color: theme.colors.white,
        fontSize: 16,
        fontWeight: 'bold'
    },

    // ===== PRICING - EDIT PRICE =====
    bottomSheetContainer: {
        width: '100%',
        backgroundColor: theme.colors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingVertical: 20,
        paddingHorizontal: 25
    },
    bottomSheetTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.primary,
        fontFamily: 'Manrope'
    },
    bottomSheetHeaderRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row'
    },
    bottomSheetCategoryText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.tertiary,
        fontFamily: 'Manrope',
        letterSpacing: 0.5,
        lineHeight: 30
    },
    bottomSheetUnitText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: theme.colors.tertiary,
        fontFamily: 'Inter',
        letterSpacing: 0.5,
        lineHeight: 15
    },
    editPriceInputContainer: {
        borderBottomWidth: 0,
        backgroundColor: theme.colors.white,
        borderRadius: 4
    },
    editPriceInput: {
        color: theme.colors.black,
        fontWeight: 'bold',
        fontSize: 25,
        letterSpacing: 0.5,
        fontFamily: 'Inter',
        textAlign: 'center'
    },
    updateButtonStyle: {
        backgroundColor: theme.colors.primary,
        borderRadius: 4,
        paddingVertical: 12,
        marginTop: 10
    },
    updateButtonContainerStyle: {
        shadowColor: 'transparent',
        elevation: 0,
        shadowOpacity: 0,
        borderWidth: 0,
    },
    updateButtonTitleStyle: {
        color: theme.colors.white,
        fontSize: 16
    },
    cancelButtonStyle: {
        backgroundColor: theme.colors.neutral,
        borderRadius: 4,
        paddingVertical: 12,
        marginTop: 10
    },
    cancelButtonTitleStyle: {
        color: theme.colors.primary,
        fontSize: 16
    },

    // ===== PRICING - ACTION BUTTONS =====
    actionButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: "center"
    },
    addPriceButtonContainer: {
        shadowColor: 'transparent',
    },
    addPriceButton: {
        display: 'flex',
        justifyContent: 'flex-start',
        paddingHorizontal: 20,
        paddingBlock: 12,
        borderRadius: 4,
        backgroundColor: theme.colors.primary,
        elevation: 0,
        shadowOpacity: 0,
        borderWidth: 0
    },
    addPriceButtonTitle: {
        fontWeight: '600',
        fontSize: 17,
        lineHeight: 20,
        fontFamily: 'Inter',
        color: 'white',
        marginLeft: 10
    },
    searchButtonContainer: {
        shadowColor: 'transparent',
        borderRadius: 5,
    },
    searchButton: {
        display: 'flex',
        justifyContent: 'flex-start',
        paddingBlock: 12,
        borderRadius: 5,
        backgroundColor: theme.colors.neutral,
        elevation: 0,
        shadowOpacity: 0,
        borderWidth: 0,
    },
    searchIconContainer: {
        marginHorizontal: 10
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
        letterSpacing: 0.5,
        alignSelf: 'flex-start',
        textAlign: 'left',
        fontWeight: 'bold',
        color: theme.colors.primary,
        fontSize: 16,
        fontFamily: 'Manrope',
        textTransform: 'capitalize'
    },
    priceCardEditButton: {
        backgroundColor: theme.colors.neutral,
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
        fontFamily: 'Inter',
        color: theme.colors.tertiary
    },
    priceCardValue: {
        marginBottom: 10,
        fontWeight: 'bold',
        fontSize: 15,
        lineHeight: 17,
        fontFamily: 'Inter'
    },
    priceCardCurrencySymbol: {
        fontWeight: '700'
    },
    priceCardCategoryValue: {
        marginBottom: 10,
        fontWeight: 'condensed',
        fontSize: 14,
        lineHeight: 17,
        fontFamily: 'Inter'
    },
    priceCardBadgeStyle: {
        backgroundColor: theme.colors.neutral
    },
    priceCardBadgeText: {
        fontSize: 12,
        fontWeight: 'thin',
        color: theme.colors.black,
        fontFamily: 'Inter'
    },

    // ===== PRICING - PURCHASE PRICE =====
    priceListContainer: {
        paddingHorizontal: 12,
        paddingBlock: 15
    },
    titleDescription: {
        marginBottom: 10
    },
    titleText: {
        fontFamily: 'Manrope',
        fontSize: 25,
        fontWeight: '700',
        color: theme.colors.primary,
        letterSpacing: 0.5,
        lineHeight: 40
    },
    descriptionText: {
        fontFamily: 'Inter',
        fontWeight: '500',
        fontSize: 16,
        lineHeight: 24,
    },
    emptyPriceListContainer: {
        flex: 1,
        width: '100%',
        backgroundColor: theme.colors.secondary,
        height: 200,
        alignItems: 'center',
        justifyContent: 'center'
    },
    priceListFlatList: {
        marginBottom: 130,
    },

    // ===== PURCHASE =====
    purchaseContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    plumCountDisplayContainer: {
        flex: 3,
        justifyContent: 'center',
        alignItems: 'center'
    },
    plumCountCircle: {
        display: 'flex',
        backgroundColor: '#F2F2F5',
        width: 300,
        height: 300,
        padding: 'auto',
        margin: 'auto',
        borderRadius: '100%',
        alignItems: 'center',
        alignContent: 'center'
    },
    plumCountText: {
        fontWeight: "bold",
        color: 'black',
        fontSize: 50
    },
    countButtonContainer: {
        marginVertical: 20,
        width: '80%',
    },
    countButton: {
        paddingBlock: 15,
        paddingHorizontal: 30,
        borderRadius: 10,
    },
    countButtonTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.5
    },

    // ===== SELLERS =====
    sellersContainer: {
        flex: 1,
        backgroundColor: theme.colors.background
    }
}));
