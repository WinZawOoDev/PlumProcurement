import { FlatList, RefreshControl, Text as RNText, View } from 'react-native';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@rneui/themed';
import FontAwesomeIcon from '@react-native-vector-icons/fontawesome-free-solid';
import { useStyles } from '../../styles';
import {
  UI_TEXT,
  MESSAGES,
  SAFE_AREA,
  DIMENSIONS,
  A11Y_LABELS,
} from '../../constants';
import { purchaseService } from '../../services/purchaseService';
import { IPurchaseWithSeller } from '../../types/database';
import {
  buildPurchasesCsvWithBom,
  formatDate,
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
import { EditPurchaseSheet } from './EditPurchaseSheet';

export default function PurchaseDetails() {
  const styles = useStyles();
  const { theme } = useTheme();
  const [purchases, setPurchases] = useState<IPurchaseWithSeller[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const { loading, withLoading } = useLoading(false);
  const [editingPurchase, setEditingPurchase] =
    useState<IPurchaseWithSeller | null>(null);
  // Keyset cursor (id of the last loaded row); undefined = first page.
  const cursorRef = useRef<number | undefined>(undefined);
  // Search here is server-side (paginated queries); only the shared
  // visibility/query/toggle state comes from the hook.
  const {
    visible: searchVisible,
    query: searchQuery,
    setQuery: setSearchQuery,
    toggle: handleToggleSearch,
    hasQuery,
  } = useSearchFilter(
    purchases,
    useCallback(() => true, []),
  );

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
          showError((error as Error)?.message ?? MESSAGES.ERROR_GENERIC);
        }
      });
    },
    [withLoading, searchQuery],
  );

  useEffect(() => {
    loadPurchases(true, '');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  const grandTotal = visiblePurchases.reduce((sum, p) => sum + p.total, 0);

  const csv = useMemo(
    () => buildPurchasesCsvWithBom(visiblePurchases),
    [visiblePurchases],
  );

  const handleExport = async () => {
    if (visiblePurchases.length === 0) {
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
    else showSuccess(`${UI_TEXT.EXPORT_CSV} — ${visiblePurchases.length} rows`);
  };

  return (
    <SafeAreaView edges={SAFE_AREA.EDGES} style={styles.purchaseHistoryScreen}>
      <View style={styles.purchaseHistoryContainer}>
        <SectionHeader
          icon="time-outline"
          title={UI_TEXT.PURCHASE_HISTORY_TITLE}
          description={UI_TEXT.PURCHASE_HISTORY_DESCRIPTION}
        />

        <View style={styles.purchaseSummaryCard}>
          <View style={styles.purchaseSummaryRow}>
            <RNText style={styles.purchaseSummaryLabel}>
              {UI_TEXT.PURCHASES_COUNT}
            </RNText>
            <RNText style={styles.purchaseSummaryValue}>
              {visiblePurchases.length}
            </RNText>
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
            <RNText style={styles.purchaseTotalText}>
              {grandTotal.toFixed(2)}$
            </RNText>
          </View>
        </View>

        <View style={[styles.actionButtonsRow, styles.purchaseActionsRow]}>
          <SecondaryButton
            title={UI_TEXT.EXPORT_CSV}
            disabled={purchases.length === 0}
            onPress={handleExport}
            buttonStyle={styles.exportButton}
          />
          <SearchIconButton
            active={searchVisible}
            onPress={handleToggleSearch}
          />
        </View>

        {searchVisible && (
          <SearchBar
            placeholder={UI_TEXT.SEARCH_PURCHASES_PLACEHOLDER}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        )}

        <FlatList
          style={styles.purchaseHistoryItems}
          data={visiblePurchases}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.purchaseItemRow}>
              <View style={styles.sellerInfo}>
                <RNText style={styles.purchaseItemTitle}>
                  {item.category} ({item.unit})
                </RNText>
                <RNText style={styles.purchaseItemSubtitle}>
                  {formatDate(item.created_at)}
                  {item.seller_name
                    ? ` · ${UI_TEXT.SOLD_BY}: ${item.seller_name}`
                    : ''}
                </RNText>
                <RNText style={styles.purchaseItemSubtitle}>
                  {item.quantity} × {item.unit_price.toFixed(2)}$
                </RNText>
              </View>
              <View style={styles.purchaseItemActions}>
                <RNText style={styles.purchaseItemTotal}>
                  {item.total.toFixed(2)}$
                </RNText>
                <View style={styles.purchaseItemButtons}>
                  <IconButton
                    icon={
                      <FontAwesomeIcon
                        name="edit"
                        size={DIMENSIONS.ICON_SIZE_SMALL}
                        color={theme.colors.grey5}
                      />
                    }
                    variant="ghost"
                    onPress={() => setEditingPurchase(item)}
                    accessibilityLabel={A11Y_LABELS.EDIT_PURCHASE}
                  />
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <EmptyState
              icon="receipt-outline"
              title={
                hasQuery
                  ? UI_TEXT.NO_MATCHING_RESULTS
                  : UI_TEXT.EMPTY_PURCHASE_LIST
              }
              description={
                hasQuery
                  ? `No purchases matching "${searchQuery}"`
                  : 'Your purchase history will appear here'
              }
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <RNText style={styles.emptyPriceListText}>
                {MESSAGES.LOADING}
              </RNText>
            ) : null
          }
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
            />
          }
        />
      </View>

      <EditPurchaseSheet
        visible={!!editingPurchase}
        purchase={editingPurchase}
        onClose={() => setEditingPurchase(null)}
        onSaved={() => loadPurchases(true, searchQuery)}
      />
    </SafeAreaView>
  );
}
