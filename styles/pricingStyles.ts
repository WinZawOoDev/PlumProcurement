import type { ThemeOptions } from '@rneui/themed'
import { StyleSheet } from 'react-native'
import { DIMENSIONS, TYPOGRAPHY } from '../constants'

export const pricingStyles = (theme: ThemeOptions) => StyleSheet.create({
    // ===== PRICING - CREATE PRICE =====
    createPriceActions: {
        marginTop: 24,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
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
        paddingHorizontal: 20,
        paddingBlock: 15,
        flexDirection: 'column',
        gap: 16,
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
        paddingTop: 20,
        paddingBottom: 28,
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
        alignItems: "center",
        marginBottom: 14,
    },

    // ===== PRICING - PRICE CARD =====
    priceCardMinimal: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 8,
        borderBottomWidth: 0.5,
        borderColor: theme.colors.grey1,
        gap: 12,
    },
    priceCardPressed: {
        backgroundColor: theme.colors.secondary,
    },
    priceCardUnitText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 0.4,
        color: theme.colors.primary,
        textTransform: 'uppercase',
    },
    priceCardPriceValue: {
        fontSize: 17,
        fontWeight: '800',
        color: theme.colors.black,
        fontVariant: ['tabular-nums'],
        letterSpacing: 0.2,
        textAlign: 'right',
    },
    priceCardCurrencySymbol: {
        fontSize: 13,
        fontWeight: '700',
        color: theme.colors.grey4,
    },
    priceListSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        paddingTop: 16,
        paddingBottom: 2,
    },
    priceListSectionHeaderSticky: {
        backgroundColor: theme.colors.background,
        paddingTop: 16,
        paddingBottom: 8,
    },
    priceDetailActions: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 20,
    },
    priceDetailAction: {
        flex: 1,
    },
    priceDetailButtonIcon: {
        marginRight: 8,
    },
    priceDetailCompactButton: {
        paddingVertical: 0,
        paddingHorizontal: 12,
        height: 40,
        minHeight: 40,
    },
    priceDetailCompactTitle: {
        fontSize: 13,
        fontWeight: '700',
    },
    priceDetailHero: {
        gap: 10,
        marginTop: 14,
    },
    priceDetailCategoryChip: {
        alignSelf: 'flex-start',
        backgroundColor: theme.colors.primary + '14',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    priceDetailCategoryText: {
        fontSize: 12,
        fontWeight: '700',
        color: theme.colors.primary,
        textTransform: 'capitalize',
        letterSpacing: 0.3,
    },
    priceDetailPrice: {
        fontSize: 26,
        fontWeight: '800',
        color: theme.colors.black,
        fontVariant: ['tabular-nums'],
        letterSpacing: 0.2,
    },
    priceDetailCurrency: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.grey4,
    },
    priceDetailUnit: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.grey4,
    },
    priceDetailDivider: {
        height: 1,
        backgroundColor: theme.colors.grey1,
        marginVertical: 16,
    },
    priceDetailMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    priceDetailMetaText: {
        fontSize: 13,
        color: theme.colors.grey5,
    },
    priceListSectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: theme.colors.grey5,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        flexShrink: 1,
    },
    priceListSectionCount: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.grey4,
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
    searchInputContainer: {
        borderBottomWidth: 0,
        borderRadius: 14,
        backgroundColor: theme.colors.secondary,
        paddingHorizontal: 10,
        paddingVertical: 2,
    },
    searchInput: {
        fontSize: 15,
        paddingVertical: 8,
    },
    searchBarIcon: {
        marginRight: 8,
    },
    sellerSelectRow: {
        borderBottomWidth: 0,
    },
    sellerRecentRow: {
        paddingVertical: 8,
        gap: 10,
    },
    sellerRecentRowLast: {
        borderBottomWidth: 0,
    },
    sellerRecentTitle: {
        fontWeight: '600',
        fontSize: 14,
        color: theme.colors.black,
    },
    sellerRecentSubtitle: {
        fontSize: 12,
        color: theme.colors.tertiary,
        marginTop: 2,
    },
    sellerRecentTotal: {
        fontWeight: '700',
        fontSize: 14,
        color: theme.colors.black,
    },
    sellerSummaryCardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 4,
        paddingTop: 10,
    },
    sellerSummaryCardFooterText: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.primary,
    },
    sellerSectionAction: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    sellerSelectSeparator: {
        height: 1,
        backgroundColor: theme.colors.grey1,
        marginLeft: 4,
        marginRight: 4,
    },
    priceListContainer: {
        flex: 1,
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
        flex: 1,
        marginBottom: 8,
    },
})
