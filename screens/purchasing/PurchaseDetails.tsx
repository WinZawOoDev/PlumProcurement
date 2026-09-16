import { FlatList, Pressable, RefreshControl, StyleProp, Text as RNText, TextStyle, View } from 'react-native';
import React, {
  useCallback,
  useEffect,
  // CSV export disabled — re-enable with the EXPORT_CSV button below.
  // useMemo,
  useRef,
  useState,
} from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ParamListBase, useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@rneui/themed';
import { useTranslation } from 'react-i18next';
import FontAwesomeIcon from '@react-native-vector-icons/fontawesome-free-solid';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useStyles } from '../../styles';
import {
  ROUTES,
  SAFE_AREA,
  DIMENSIONS,
} from '../../constants';
import { useLocalizedConstants } from '../../hooks/useLocalizedConstants';
import { purchaseService } from '../../services/purchaseService';
import { IPurchaseDetail } from '../../types/database';
import {
  // CSV export disabled — re-enable with the EXPORT_CSV button below.
  // buildPurchasesCsvWithBom,
  formatDateDisplay,
  formatNumber,
  // getCsvFilename,
} from '../../utils';
// import { shareOrSaveCsv } from '../../utils/csvExport';
import { IconButton /* , SecondaryButton */ } from '../../components/buttons/Button';
import { SearchBar } from '../../components/SearchBar';
import { SearchIconButton } from '../../components/SearchIconButton';
import { MoneyText } from '../../components/MoneyText';
import { showError /* , showSuccess */ } from '../../utils/notifications';
import { useSearchFilter } from '../../hooks/useSearchFilter';
import { PAGINATION_CONFIG } from '../../constants';
import { SectionHeader } from '../../components/SectionHeader';
import { EmptyState } from '../../components/EmptyState';
import { CardSkeleton, Skeleton } from '../../components/Skeleton';

function PurchaseSummaryCard({ count, total }: { count: number; total: number }) {
  const styles = useStyles();
  const { UI_TEXT } = useLocalizedConstants();
  return (
    <View style={styles.purchaseSummaryCard}>
      <View style={styles.purchaseSummaryRow}>
        <RNText style={styles.purchaseSummaryLabel}>
          {UI_TEXT.PURCHASES_COUNT}
        </RNText>
        <RNText style={styles.purchaseSummaryValue}>{formatNumber(count, 0)}</RNText>
      </View>
      <View
        style={[
          styles.purchaseSummaryRow,
          styles.purchaseDetailsSummaryDivider,
        ]}
      >
        <RNText style={styles.purchaseSummaryLabel}>
          {UI_TEXT.TOTAL_VALUE}
        </RNText>
        <MoneyText amount={total} valueStyle={styles.purchaseTotalText} />
      </View>
    </View>
  );
}

function PurchaseSummarySkeleton() {
  const styles = useStyles();
  const { UI_TEXT } = useLocalizedConstants();
  return (
    <View style={styles.purchaseSummaryCard}>
      <View style={styles.purchaseSummaryRow}>
        <RNText style={styles.purchaseSummaryLabel}>
          {UI_TEXT.PURCHASES_COUNT}
        </RNText>
        <Skeleton width={48} height={16} />
      </View>
      <View
        style={[
          styles.purchaseSummaryRow,
          styles.purchaseDetailsSummaryDivider,
        ]}
      >
        <RNText style={styles.purchaseSummaryLabel}>
          {UI_TEXT.TOTAL_VALUE}
        </RNText>
        <Skeleton width={80} height={18} />
      </View>
    </View>
  );
}

function HighlightedText({
  text,
  query,
  style,
  highlightStyle,
}: {
  text: string;
  query: string;
  style: StyleProp<TextStyle>;
  highlightStyle: StyleProp<TextStyle>;
}) {
  const q = query.trim();
  if (!q) {
    return <RNText style={style}>{text}</RNText>;
  }
  const lowerText = text.toLowerCase();
  const lowerQuery = q.toLowerCase();
  const parts: React.ReactNode[] = [];
  let index = 0;
  let key = 0;
  while (index < text.length) {
    const match = lowerText.indexOf(lowerQuery, index);
    if (match === -1) {
      parts.push(text.slice(index));
      break;
    }
    if (match > index) {
      parts.push(text.slice(index, match));
    }
    parts.push(
      <RNText key={key++} style={highlightStyle}>
        {text.slice(match, match + q.length)}
      </RNText>
    );
    index = match + q.length;
  }
  return <RNText style={style}>{parts}</RNText>;
}

function PurchaseRow({
  item,
  locked,
  query,
  onEdit,
}: {
  item: IPurchaseDetail;
  locked: boolean;
  query: string;
  onEdit: (item: IPurchaseDetail) => void;
}) {
  const styles = useStyles();
  const { theme } = useTheme();
  const { UI_TEXT, A11Y_LABELS } = useLocalizedConstants();
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  return (
    <Pressable
      style={styles.purchaseItemRow}
      onPress={() =>
        navigation.navigate(ROUTES.PURCHASE_SUMMARY, { purchase: item })
      }
      accessible
      accessibilityRole="button"
      accessibilityLabel={`${UI_TEXT.PURCHASE_SUMMARY_TITLE}: ${item.seller_name ?? UI_TEXT.NO_SELLER}`}
    >
      <View style={styles.sellerInfo}>
        <HighlightedText
          text={item.seller_name ?? UI_TEXT.NO_SELLER}
          query={query}
          style={styles.purchaseItemTitle}
          highlightStyle={styles.purchaseItemTitleHighlight}
        />
        <RNText style={styles.purchaseItemSubtitle}>
          {formatDateDisplay(item.created_at)}
        </RNText>
        <RNText style={styles.purchaseItemSubtitle}>
          {formatNumber(item.items.length, 0)} {UI_TEXT.ITEMS.toLowerCase()}
        </RNText>
      </View>
      <View style={styles.purchaseItemActions}>
        <MoneyText amount={item.total} valueStyle={styles.purchaseItemTotal} />
        <View style={styles.purchaseItemButtons}>
          {locked ? (
            <Ionicons
              name="lock-closed-outline"
              size={DIMENSIONS.ICON_SIZE_SMALL}
              color={theme.colors.grey4}
              accessible
              accessibilityLabel={A11Y_LABELS.LOCKED_PURCHASE}
            />
          ) : (
            <IconButton
              icon={
                <FontAwesomeIcon
                  name="edit"
                  size={DIMENSIONS.ICON_SIZE_SMALL}
                  color={theme.colors.grey5}
                />
              }
              variant="ghost"
              onPress={() => onEdit(item)}
              accessibilityLabel={A11Y_LABELS.EDIT_PURCHASE}
            />
          )}
        </View>
      </View>
    </Pressable>
  );
}

function PurchaseListSkeleton() {
  const styles = useStyles();
  return (
    <View style={styles.purchaseHistoryItems}>
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </View>
  );
}

function LoadMoreSkeleton() {
  return (
    <>
      <CardSkeleton />
      <CardSkeleton />
    </>
  );
}

function PurchaseActions({
  // CSV export disabled — re-enable with the EXPORT_CSV button below.
  // canExport,
  // onExport,
  searchVisible,
  onToggleSearch,
}: {
  // canExport: boolean;
  // onExport: () => void;
  searchVisible: boolean;
  onToggleSearch: () => void;
}) {
  const styles = useStyles();
  // const { UI_TEXT } = useLocalizedConstants();
  return (
    <View style={[styles.actionButtonsRow, styles.purchaseActionsRow]}>
      {/* CSV export disabled
      <SecondaryButton
        title={UI_TEXT.EXPORT_CSV}
        disabled={!canExport}
        onPress={onExport}
        buttonStyle={styles.exportButton}
      />
      */}
      <SearchIconButton active={searchVisible} onPress={onToggleSearch} />
    </View>
  );
}

function PurchaseSearch({
  visible,
  query,
  onChangeText,
}: {
  visible: boolean;
  query: string;
  onChangeText: (query: string) => void;
}) {
  const { UI_TEXT } = useLocalizedConstants();
  if (!visible) {
    return null;
  }
  return (
    <SearchBar
      placeholder={UI_TEXT.SEARCH_PURCHASES_PLACEHOLDER}
      value={query}
      onChangeText={onChangeText}
    />
  );
}

export default function PurchaseDetails() {
  const styles = useStyles();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { UI_TEXT /* , MESSAGES */ } = useLocalizedConstants();
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const [purchases, setPurchases] = useState<IPurchaseDetail[]>([]);
  const [summary, setSummary] = useState<{ count: number; total: number } | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  // Keyset cursor (id of the last loaded row); undefined = first page.
  const cursorRef = useRef<number | undefined>(undefined);
  // Monotonic token: only the latest load may commit, so an in-flight page
  // (search / refresh / load-more overlapping) cannot overwrite newer results.
  const requestTokenRef = useRef(0);
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
  // Search here is server-side (paginated queries); only the shared
  // visibility/query/toggle state comes from the hook, so no predicate.
  const {
    visible: searchVisible,
    query: searchQuery,
    setQuery: setSearchQuery,
    toggle: handleToggleSearch,
    hasQuery,
  } = useSearchFilter(purchases);

  const loadPurchases = useCallback(
    async (reset = true, queryOverride?: string) => {
      const query = queryOverride !== undefined ? queryOverride : searchQuery;
      const trimmed = query.trim() || undefined;
      const cursor = reset ? undefined : cursorRef.current;
      const token = ++requestTokenRef.current;
      if (reset) setLoading(true);
      else setLoadingMore(true);
      try {
        const [page, nextSummary] = await Promise.all([
          purchaseService.getPurchasesPage({
            limit: PAGINATION_CONFIG.PURCHASE_PAGE_SIZE,
            cursor,
            query: trimmed,
          }),
          reset
            ? purchaseService.getPurchasesSummary({ query: trimmed })
            : Promise.resolve(null),
        ]);
        if (!mountedRef.current || token !== requestTokenRef.current) return;
        const { items, nextCursor } = page;
        if (reset) {
          setPurchases(items);
          if (nextSummary) setSummary(nextSummary);
        } else {
          setPurchases(prev => [...prev, ...items]);
        }
        cursorRef.current = nextCursor ?? undefined;
        setHasMore(nextCursor !== null);
      } catch (error) {
        if (!mountedRef.current || token !== requestTokenRef.current) return;
        showError((error as Error)?.message ?? t('messages.ERROR_GENERIC'));
      } finally {
        if (mountedRef.current && token === requestTokenRef.current) {
          if (reset) setLoading(false);
          else setLoadingMore(false);
        }
      }
    },
    [searchQuery, t],
  );

  useEffect(() => {
    loadPurchases(true, '');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Refresh when returning from the Edit Purchase screen (or any child screen),
  // skipping the initial focus since the mount effect above already loaded.
  const hasFocusedRef = useRef(false);
  const loadPurchasesRef = useRef(loadPurchases);
  loadPurchasesRef.current = loadPurchases;
  const searchQueryRef = useRef(searchQuery);
  searchQueryRef.current = searchQuery;
  useFocusEffect(
    useCallback(() => {
      if (!hasFocusedRef.current) {
        hasFocusedRef.current = true;
        return;
      }
      loadPurchasesRef.current(true, searchQueryRef.current || '');
    }, [])
  );

  const handleEdit = useCallback(
    (item: IPurchaseDetail) => {
      navigation.navigate(ROUTES.EDIT_PURCHASE, { purchase: item });
    },
    [navigation]
  );

  // Reload on search changes, but skip the mount-time run (initial load above)
  const searchEffectReady = useRef(false);
  useEffect(() => {
    if (!searchEffectReady.current) {
      searchEffectReady.current = true;
      return;
    }
    if (searchVisible) {
      loadPurchases(true, searchQuery);
    } else if (searchQuery === '') {
      // when search closed, reload without filter
      loadPurchases(true, '');
    }
  }, [searchQuery, searchVisible]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLoadMore = useCallback(() => {
    if (!loading && !loadingMore && hasMore) {
      loadPurchases(false, searchQuery);
    }
  }, [loading, loadingMore, hasMore, searchQuery, loadPurchases]);

  const handleRefresh = useCallback(() => {
    loadPurchases(true, searchQuery);
  }, [loadPurchases, searchQuery]);

  const visiblePurchases = purchases;
  const isInitialLoading = loading && purchases.length === 0;

  const grandTotal = visiblePurchases.reduce((sum, p) => sum + p.total, 0);
  const summaryCount = summary?.count ?? visiblePurchases.length;
  const summaryTotal = summary?.total ?? grandTotal;

  // CSV export disabled — re-enable with the EXPORT_CSV button above.
  // Flatten each purchase into one CSV row per line item.
  // const csvRows = useMemo(
  //   () =>
  //     visiblePurchases.flatMap((p) => {
  //       if (p.items.length === 0) {
  //         return [
  //           {
  //             id: p.id,
  //             created_at: p.created_at,
  //             seller_name: p.seller_name,
  //             category: '',
  //             unit: '',
  //             unit_price: 0,
  //             quantity: 0,
  //             total: p.total,
  //           },
  //         ];
  //       }
  //       return p.items.map((line) => ({
  //         id: p.id,
  //         created_at: p.created_at,
  //         seller_name: p.seller_name,
  //         category: line.category,
  //         unit: line.unit,
  //         unit_price: line.unit_price,
  //         quantity: line.quantity,
  //         total: line.line_total,
  //       }));
  //     }),
  //   [visiblePurchases],
  // );

  // const csv = useMemo(
  //   () => buildPurchasesCsvWithBom(csvRows),
  //   [csvRows],
  // );

  // const handleExport = async () => {
  //   if (csvRows.length === 0) {
  //     showError(UI_TEXT.EMPTY_PURCHASE_LIST);
  //     return;
  //   }
  //   const filename = getCsvFilename();
  //   const result = await shareOrSaveCsv(
  //     csv,
  //     filename,
  //     `${UI_TEXT.EXPORT_CSV}: ${filename}`,
  //   );
  //   if (result === 'failed') showError(MESSAGES.ERROR_GENERIC);
  //   else showSuccess(`${UI_TEXT.EXPORT_CSV} — ${t('uiText.EXPORT_ROWS', { count: csvRows.length })}`);
  // };

  return (
    <SafeAreaView edges={SAFE_AREA.EDGES} style={styles.purchaseHistoryScreen}>
      <View style={styles.purchaseHistoryContainer}>
        <SectionHeader
          icon="time-outline"
          title={UI_TEXT.PURCHASE_HISTORY_TITLE}
          description={UI_TEXT.PURCHASE_HISTORY_DESCRIPTION}
        />

        {isInitialLoading ? (
          <PurchaseSummarySkeleton />
        ) : (
          <PurchaseSummaryCard count={summaryCount} total={summaryTotal} />
        )}

        <PurchaseActions
          // CSV export disabled — re-enable with the EXPORT_CSV button above.
          // canExport={purchases.length > 0}
          // onExport={handleExport}
          searchVisible={searchVisible}
          onToggleSearch={handleToggleSearch}
        />

        <PurchaseSearch
          visible={searchVisible}
          query={searchQuery}
          onChangeText={setSearchQuery}
        />

        {hasQuery && !isInitialLoading ? (
          <RNText style={styles.purchaseResultsCount}>
            {t('uiText.SHOWING_COUNT', {
              filtered: visiblePurchases.length,
              total: summaryCount,
            })}
          </RNText>
        ) : null}

        {isInitialLoading ? (
          <PurchaseListSkeleton />
        ) : (
          <FlatList
            style={styles.purchaseHistoryItems}
            contentContainerStyle={styles.scrollContentGutter}
            data={visiblePurchases}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <PurchaseRow
                item={item}
                locked={Number(item.has_payment) > 0}
                query={hasQuery ? searchQuery : ''}
                onEdit={handleEdit}
              />
            )}
            ListEmptyComponent={
              loading ? null : (
                <EmptyState
                  icon="receipt-outline"
                  title={
                    hasQuery
                      ? UI_TEXT.NO_MATCHING_RESULTS
                      : UI_TEXT.EMPTY_PURCHASE_LIST
                  }
                  description={
                    hasQuery
                      ? t('uiText.NO_PURCHASES_MATCHING', { query: searchQuery })
                      : UI_TEXT.PURCHASE_HISTORY_EMPTY_HINT
                  }
                />
              )
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={loadingMore ? <LoadMoreSkeleton /> : null}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={handleRefresh}
                colors={[theme.colors.primary]}
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}
