/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StatusBar, StyleSheet, Text, useColorScheme } from 'react-native';
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
import { MYANMAR_FONT_FAMILY_BOLD } from './styles/fonts';
import { Onboarding } from './components/Onboarding';
import { StartupLoader } from './components/StartupLoader';
import { ROUTES, ThemeMode, Language, DEFAULT_LANGUAGE } from './constants';
import Toast from 'react-native-toast-message';
import { toastConfig } from './components/UndoToast';
import { priceService } from './services/priceService';
import { sellerService } from './services/sellerService';
import { settingsService } from './services/settingsService';
import { changeLanguage } from './i18n';

const tabLabelStyles = StyleSheet.create({
  label: { fontWeight: '700', fontSize: 11, letterSpacing: 0.3, marginTop: 2 },
  myanmar: { fontFamily: MYANMAR_FONT_FAMILY_BOLD },
});

function LocalizedTabLabel({ label, color }: { label: string; color: string }) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  return (
    <Text style={[tabLabelStyles.label, { color }, language === 'my' && tabLabelStyles.myanmar]}>
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
  return <Ionicons name="cart-outline" color={color} size={size + 2} />;
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
    tabBarStyle: {
      minHeight: 68,
      paddingTop: 6,
      paddingBottom: 6,
      alignItems: 'center',
      borderTopWidth: 0.5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -1 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
      elevation: 2,
    },
    tabBarLabelStyle: {
      fontWeight: '700',
      fontSize: 11,
      letterSpacing: 0.3,
      marginTop: 2,
    },
    tabBarIconStyle: {
      marginTop: 2,
    },
  },
  screens: {
    [ROUTES.PRICE_TAB]: {
      screen: PriceStack,
      options: {
        tabBarIcon: PriceTabIcon,
        tabBarLabel: ({ color }) => <LocalizedTabLabel label="tabs.PRICES" color={color} />,
      }
    },
    [ROUTES.PURCHASE_TAB]: {
      screen: PurchaseStack,
      options: {
        tabBarIcon: PurchaseTabIcon,
        tabBarLabel: ({ color }) => <LocalizedTabLabel label="tabs.PURCHASING" color={color} />,
      }
    },
    [ROUTES.SELLER_TAB]: {
      screen: SellerStack,
      options: {
        tabBarIcon: SellerTabIcon,
        tabBarLabel: ({ color }) => <LocalizedTabLabel label="tabs.SELLERS" color={color} />,
      }
    },
    [ROUTES.SETTINGS_TAB]: {
      screen: SettingsStack,
      options: {
        tabBarIcon: SettingsTabIcon,
        tabBarLabel: ({ color }) => <LocalizedTabLabel label="tabs.SETTINGS" color={color} />,
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

  React.useEffect(() => {
    let cancelled = false;
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
      } catch {
        // DB unavailable — fall back to showing onboarding
      } finally {
        if (!cancelled) setCheckingData(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleOnboardingDone = () => {
    setOnboarded(true);
    settingsService.setOnboarded().catch(() => undefined);
  };

  const handleMainReady = React.useCallback(() => setMainReady(true), []);

  if (checkingData) {
    return <StartupLoader />;
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
    settingsService.setThemeMode(mode).catch(() => undefined);
  }, []);

  const handleSetLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    changeLanguage(next).catch(() => undefined);
    settingsService.setLanguage(next).catch(() => undefined);
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
