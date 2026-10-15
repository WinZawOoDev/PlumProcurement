import React from 'react'
import { Pressable, Text as RNText, View } from 'react-native'
import { ParamListBase, useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useTranslation } from 'react-i18next'
import { useStyles } from '../../styles'
import { ROUTES } from '../../constants'
import { useLocalizedConstants } from '../../hooks/useLocalizedConstants'
import { IPurchaseDetail } from '../../types/database'
import { formatDateDisplay, formatNumber } from '../../utils'
import { MoneyText } from '../../components/MoneyText'

interface SellerPurchaseRowProps {
    item: IPurchaseDetail
    /** `recent` is the compact row used in the seller detail preview; `list` is the full history. */
    variant?: 'list' | 'recent'
    isLast?: boolean
}

/** One purchase row shared by the seller detail preview and the purchase history. */
export function SellerPurchaseRow({ item, variant = 'list', isLast = false }: SellerPurchaseRowProps) {
    const styles = useStyles()
    const { t } = useTranslation()
    const { UI_TEXT } = useLocalizedConstants()
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>()
    const recent = variant === 'recent'
    const date = formatDateDisplay(item.created_at)
    return (
        <Pressable
            style={[
                styles.purchaseItemRow,
                recent && styles.sellerRecentRow,
                recent && isLast && styles.sellerRecentRowLast,
            ]}
            onPress={() => navigation.navigate(ROUTES.PURCHASE_SUMMARY, { purchase: item })}
            accessible
            accessibilityRole="button"
            accessibilityLabel={t('a11y.LABELED_VALUE', {
                label: UI_TEXT.PURCHASE_SUMMARY_TITLE,
                value: date,
            })}
        >
            <View style={styles.sellerInfo}>
                <RNText style={recent ? styles.sellerRecentTitle : styles.purchaseItemTitle}>{date}</RNText>
                <RNText style={recent ? styles.sellerRecentSubtitle : styles.purchaseItemSubtitle}>
                    {formatNumber(item.items.length, 0)} {UI_TEXT.ITEMS.toLowerCase()}
                </RNText>
            </View>
            <View style={styles.purchaseItemActions}>
                <MoneyText
                    amount={item.total}
                    valueStyle={recent ? styles.sellerRecentTotal : styles.purchaseItemTotal}
                />
            </View>
        </Pressable>
    )
}
