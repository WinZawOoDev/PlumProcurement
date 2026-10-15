/**
 * PlumProcurement root: theme/language providers, tab navigator, onboarding
 * gate and startup loading/error states.
 */

import { StatusBar, Text, useColorScheme } from 'react-native';
import { ThemeProvider, useTheme } from '@rneui/themed';
import { DefaultTheme, DarkTheme, createStaticNavigation, Theme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Ionicons } from "@react-native-vector-icons/ionicons/static";
import SellerStack from './screens/seller/Stack';
import PriceStack from './screens/pricing/Stack';
import PurchaseStack from './screens/purchasing/Stack';
import SettingsStack from './screens/settings/Stack';
import { makeAppTheme } from './theme';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PriceProvider } from './context/PriceContext';
import { ThemeModeContext } from './context/ThemeModeContext';
import { LanguageContext, useLanguage } from './context/LanguageContext';
import { Onboarding } from './components/Onboarding';
import { StartupLoader } from './components/StartupLoader';
import { ErrorFallback } from './components/ErrorFallback';
import { ROUTES, TAB_BAR, ThemeMode, Language, DEFAULT_LANGUAGE } from './constants';
import { navigationStyles } from './styles/navigationStyles';
import Toast from 'react-native-toast-message';
import { toastConfig } from './components/UndoToast';
import { priceService } from './services/priceService';
import { sellerService } from './services/sellerService';
import { settingsService } from './services/settingsService';
import { changeLanguage } from './i18n';
import { getErrorMessage } from './utils/errors';
import { showError } from './utils/notifications';

function LocalizedTabLabel({ label, color }: { label: string; color: string }) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isMyanmar = language === 'my';
  return (
    <Text
      style={[
        navigationStyles.tabLabel,
        { color },
        isMyanmar && navigationStyles.tabLabelMyanmar,
        isMyanmar && navigationStyles.tabLabelMyanmarSpacing,
      ]}
    >
      {t(label)}
    </Text>
  );
}

function SettingsTabIcon({ color, size }: { color: string; size: number }) {
  return <Ionicons name="settings-outline" color={color} size={size} />;
}

function PriceTabIcon({ color, size }: { color: string; size: number }) {
  return <Ionicons name="pricetags-outline" color={color} size={size} />;
}

function PurchaseTabIcon({ color, size }: { color: string; size: number }) {
  return <Ionicons name="cart-outline" color={color} size={size + TAB_BAR.PURCHASE_ICON_SIZE_BONUS} />;
}

function SellerTabIcon({ color, size }: { color: string; size: number }) {
  return <Ionicons name="people-outline" color={color} size={size} />;
}


// Static navigator definition — intentionally theme-independent so switching
// light/dark mode never recreates the navigator (which would reset tab state).
// Dynamic colors flow via the NavigationContainer theme below; bottom tabs fall
// back to theme.colors.primary/card/text/border when tabBar*TintColor is unset.
const RootStack = createBottomTabNavigator({
  initialRouteName: ROUTES.PRICE_TAB,
  screenOptions: {
    headerShown: false,
    tabBarStyle: navigationStyles.tabBar,
    tabBarLabelStyle: navigationStyles.tabBarLabel,
    tabBarIconStyle: navigationStyles.tabBarIcon,
  },
  screens: {
    [ROUTES.PRICE_TAB]: {
      screen: PriceStack,
      options: {
        tabBarIcon: PriceTabIcon,
        tabBarLabel: ({ color }) => <LocalizedTabLabel label="tabs.PRICES" color={color} />,
        tabBarButtonTestID: 'tab-prices',
      }
    },
    [ROUTES.PURCHASE_TAB]: {
      screen: PurchaseStack,
      options: {
        tabBarIcon: PurchaseTabIcon,
        tabBarLabel: ({ color }) => <LocalizedTabLabel label="tabs.PURCHASING" color={color} />,
        tabBarButtonTestID: 'tab-purchasing',
      }
    },
    [ROUTES.SELLER_TAB]: {
      screen: SellerStack,
      options: {
        tabBarIcon: SellerTabIcon,
        tabBarLabel: ({ color }) => <LocalizedTabLabel label="tabs.SELLERS" color={color} />,
        tabBarButtonTestID: 'tab-sellers',
      }
    },
    [ROUTES.SETTINGS_TAB]: {
      screen: SettingsStack,
      options: {
        tabBarIcon: SettingsTabIcon,
        tabBarLabel: ({ color }) => <LocalizedTabLabel label="tabs.SETTINGS" color={color} />,
        tabBarButtonTestID: 'tab-settings',
      }
    },
  }
});

const Navigator = createStaticNavigation(RootStack);

function Navigation({ onReady, isDarkMode }: { onReady?: () => void; isDarkMode: boolean }) {

  const { theme: currentTheme } = useTheme();

  const navigationTheme: Theme = useMemo(() => {
    const base = isDarkMode ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: currentTheme.colors.primary,
        background: currentTheme.colors.background,
        card: currentTheme.colors.surface ?? currentTheme.colors.white ?? base.colors.card,
        border: currentTheme.colors.grey1 ?? base.colors.border,
        text: currentTheme.colors.grey4 ?? base.colors.text,
      },
      dark: isDarkMode,
    };
  }, [isDarkMode, currentTheme]);

  // NOTE: with the static API, Navigator already renders its own
  // NavigationContainer internally — do not wrap it again (that produces a
  // nested-container error and an extra navigation tree).
  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={currentTheme.colors.background}
      />
      <Navigator theme={navigationTheme} onReady={onReady} />
    </>

  )
}


interface AppShellProps {
  isDarkMode: boolean;
}

function AppShell({ isDarkMode }: AppShellProps) {
  const [onboarded, setOnboarded] = React.useState(false);
  const [checkingData, setCheckingData] = React.useState(true);
  const [mainReady, setMainReady] = React.useState(false);
  // A failed startup check must not send returning users to onboarding as if
  // they were new: surface an error with a retry instead.
  const [startupError, setStartupError] = React.useState<unknown>(null);

  const [startupAttempt, setStartupAttempt] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;
    setCheckingData(true);
    setStartupError(null);
    (async () => {
      // Skip onboarding for returning users: persisted flag first,
      // then data heuristic for installs that predate the flag.
      try {
        if (await settingsService.isOnboarded()) {
          if (!cancelled) setOnboarded(true);
          return;
        }
        const [prices, sellers] = await Promise.all([
          priceService.getPrices(),
          sellerService.getSellers(),
        ]);
        if (!cancelled && (prices.length > 0 || sellers.length > 0)) {
          setOnboarded(true);
          settingsService.setOnboarded().catch(() => undefined);
        }
      } catch (error) {
        if (!cancelled) setStartupError(error);
      } finally {
        if (!cancelled) setCheckingData(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [startupAttempt]);

  const retryStartup = React.useCallback(() => setStartupAttempt((n) => n + 1), []);

  const handleOnboardingDone = () => {
    setOnboarded(true);
    settingsService.setOnboarded().catch(() => undefined);
  };

  const handleMainReady = React.useCallback(() => setMainReady(true), []);

  if (checkingData) {
    return <StartupLoader />;
  }

  if (startupError) {
    return <ErrorFallback message={getErrorMessage(startupError)} isDarkMode={isDarkMode} onRetry={retryStartup} />;
  }

  if (!onboarded) {
    return <Onboarding onDone={handleOnboardingDone} />;
  }

  return (
    <>
      <Navigation onReady={handleMainReady} isDarkMode={isDarkMode} />
      {!mainReady && <StartupLoader overlay />}
    </>
  );
}

function App() {
  const systemIsDarkMode = useColorScheme() === 'dark';
  const [themeMode, setThemeModeState] = React.useState<ThemeMode>('system');
  const [language, setLanguageState] = React.useState<Language>(DEFAULT_LANGUAGE);
  const isDarkMode = themeMode === 'system' ? systemIsDarkMode : themeMode === 'dark';
  const appTheme = useMemo(() => makeAppTheme(isDarkMode), [isDarkMode]);

  const handleSetThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    settingsService.setThemeMode(mode).catch((error) => showError(getErrorMessage(error)));
  }, []);

  const handleSetLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    changeLanguage(next).catch((error) => showError(getErrorMessage(error)));
    settingsService.setLanguage(next).catch((error) => showError(getErrorMessage(error)));
  }, []);

  const themeModeContextValue = useMemo(
    () => ({ mode: themeMode, setMode: handleSetThemeMode }),
    [themeMode, handleSetThemeMode]
  );

  const languageContextValue = useMemo(
    () => ({ language, setLanguage: handleSetLanguage }),
    [language, handleSetLanguage]
  );

  // Load the persisted theme preference as early as possible
  React.useEffect(() => {
    settingsService.getThemeMode().then(setThemeModeState).catch(() => undefined);
  }, []);

  // Load the persisted (or device) language preference
  React.useEffect(() => {
    settingsService
      .getLanguage()
      .then((stored) => {
        setLanguageState(stored);
        changeLanguage(stored).catch(() => undefined);
      })
      .catch(() => undefined);
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider theme={appTheme}>
        <SafeAreaProvider>
          <PriceProvider>
            <ThemeModeContext.Provider value={themeModeContextValue}>
              <LanguageContext.Provider value={languageContextValue}>
                <AppShell isDarkMode={isDarkMode} />
              </LanguageContext.Provider>
            </ThemeModeContext.Provider>
          </PriceProvider>
          <Toast config={toastConfig} />
        </SafeAreaProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
