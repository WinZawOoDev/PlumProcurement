import { FlatList, Pressable, RefreshControl, Text as RNText, View } from 'react-native';
import React, {
  useCallback,
  useEffect,
  useMemo,
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
  buildPurchasesCsvWithBom,
  formatDateDisplay,
  formatNumber,
  getCsvFilename,
} from '../../utils';
import { shareOrSaveCsv } from '../../utils/csvExport';
import { IconButton, SecondaryButton } from '../../components/buttons/Button';
import { SearchBar } from '../../components/SearchBar';
import { SearchIconButton } from '../../components/SearchIconButton';
import { showError, showSuccess } from '../../utils/notifications';
import { useLoading } from '../../hooks/useAsync';
import { useSearchFilter } from '../../hooks/useSearchFilter';
import { PAGINATION_CONFIG } from '../../constants';
import { SectionHeader } from '../../components/SectionHeader';
import { EmptyState } from '../../components/EmptyState';
import { CardSkeleton, Skeleton } from '../../components/Skeleton';

function PurchaseSummaryCard({ count, total }: { count: number; total: number }) {
  const styles = useStyles();
  const { UI_TEXT, CURRENCY } = useLocalizedConstants();
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
        <RNText style={styles.purchaseTotalText}>{formatNumber(total)}{CURRENCY}</RNText>
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

function PurchaseRow({
  item,
  locked,
  onEdit,
}: {
  item: IPurchaseDetail;
  locked: boolean;
  onEdit: (item: IPurchaseDetail) => void;
}) {
  const styles = useStyles();
  const { theme } = useTheme();
  const { UI_TEXT, A11Y_LABELS, CURRENCY } = useLocalizedConstants();
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
        <RNText style={styles.purchaseItemTitle}>
          {item.seller_name ?? UI_TEXT.NO_SELLER}
        </RNText>
        <RNText style={styles.purchaseItemSubtitle}>
          {formatDateDisplay(item.created_at)}
        </RNText>
        <RNText style={styles.purchaseItemSubtitle}>
          {formatNumber(item.items.length, 0)} {UI_TEXT.ITEMS.toLowerCase()}
        </RNText>
      </View>
      <View style={styles.purchaseItemActions}>
        <RNText style={styles.purchaseItemTotal}>
          {formatNumber(item.total)}{CURRENCY}
        </RNText>
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
  canExport,
  onExport,
  searchVisible,
  onToggleSearch,
}: {
  canExport: boolean;
  onExport: () => void;
  searchVisible: boolean;
  onToggleSearch: () => void;
}) {
  const styles = useStyles();
  const { UI_TEXT } = useLocalizedConstants();
  return (
    <View style={[styles.actionButtonsRow, styles.purchaseActionsRow]}>
      <SecondaryButton
        title={UI_TEXT.EXPORT_CSV}
        disabled={!canExport}
        onPress={onExport}
        buttonStyle={styles.exportButton}
      />
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
  const { UI_TEXT, MESSAGES } = useLocalizedConstants();
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const [purchases, setPurchases] = useState<IPurchaseDetail[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const { loading, withLoading } = useLoading(false);
  // Keyset cursor (id of the last loaded row); undefined = first page.
  const cursorRef = useRef<number | undefined>(undefined);
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
      const cursor = reset ? undefined : cursorRef.current;
      const loader = reset
        ? withLoading
        : async (fn: () => Promise<void>) => {
            setLoadingMore(true);
            try {
              await fn();
            } finally {
              setLoadingMore(false);
            }
          };
      await loader(async () => {
        try {
          const { items, nextCursor } = await purchaseService.getPurchasesPage({
            limit: PAGINATION_CONFIG.PURCHASE_PAGE_SIZE,
            cursor,
            query: query.trim() || undefined,
          });
          if (reset) {
            setPurchases(items);
          } else {
            setPurchases(prev => [...prev, ...items]);
          }
          cursorRef.current = nextCursor ?? undefined;
          setHasMore(nextCursor !== null);
        } catch (error) {
          showError((error as Error)?.message ?? t('messages.ERROR_GENERIC'));
        }
      });
    },
    [withLoading, searchQuery, t],
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

  // Flatten each purchase into one CSV row per line item.
  const csvRows = useMemo(
    () =>
      visiblePurchases.flatMap((p) => {
        if (p.items.length === 0) {
          return [
            {
              id: p.id,
              created_at: p.created_at,
              seller_name: p.seller_name,
              category: '',
              unit: '',
              unit_price: 0,
              quantity: 0,
              total: p.total,
            },
          ];
        }
        return p.items.map((line) => ({
          id: p.id,
          created_at: p.created_at,
          seller_name: p.seller_name,
          category: line.category,
          unit: line.unit,
          unit_price: line.unit_price,
          quantity: line.quantity,
          total: line.line_total,
        }));
      }),
    [visiblePurchases],
  );

  const csv = useMemo(
    () => buildPurchasesCsvWithBom(csvRows),
    [csvRows],
  );

  const handleExport = async () => {
    if (csvRows.length === 0) {
      showError(UI_TEXT.EMPTY_PURCHASE_LIST);
      return;
    }
    const filename = getCsvFilename();
    const result = await shareOrSaveCsv(
      csv,
      filename,
      `${UI_TEXT.EXPORT_CSV}: ${filename}`,
    );
    if (result === 'failed') showError(MESSAGES.ERROR_GENERIC);
    else showSuccess(`${UI_TEXT.EXPORT_CSV} — ${t('uiText.EXPORT_ROWS', { count: csvRows.length })}`);
  };

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
          <PurchaseSummaryCard count={visiblePurchases.length} total={grandTotal} />
        )}

        <PurchaseActions
          canExport={purchases.length > 0}
          onExport={handleExport}
          searchVisible={searchVisible}
          onToggleSearch={handleToggleSearch}
        />

        <PurchaseSearch
          visible={searchVisible}
          query={searchQuery}
          onChangeText={setSearchQuery}
        />

        {isInitialLoading ? (
          <PurchaseListSkeleton />
        ) : (
          <FlatList
            style={styles.purchaseHistoryItems}
            data={visiblePurchases}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <PurchaseRow
                item={item}
                locked={Number(item.has_payment) > 0}
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
