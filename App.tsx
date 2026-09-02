/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StatusBar, useColorScheme } from 'react-native';
import { ThemeProvider, useTheme } from '@rneui/themed';
import { DefaultTheme, DarkTheme, createStaticNavigation, NavigationContainer, NavigationIndependentTree, Theme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useCallback, useMemo } from 'react';
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
import { Onboarding } from './components/Onboarding';
import { StartupLoader } from './components/StartupLoader';
import { ROUTES, ThemeMode } from './constants';
import { priceService } from './services/priceService';
import { sellerService } from './services/sellerService';
import { settingsService } from './services/settingsService';

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


function Navigation({ onReady, isDarkMode }: { onReady?: () => void; isDarkMode: boolean }) {

  const { theme: currentTheme } = useTheme();

  // Signal that the main tab UI has mounted (NavigationContainer's onReady
  // does not fire reliably when the tree is wrapped in NavigationIndependentTree)
  React.useEffect(() => {
    onReady?.();
  }, [onReady]);

  const RootStack = useMemo(() => createBottomTabNavigator({
    initialRouteName: ROUTES.PRICE_TAB,
    screenOptions: {
      headerShown: false,
      tabBarActiveTintColor: currentTheme.colors.primary,
      tabBarInactiveTintColor: currentTheme.colors.grey4,
      tabBarStyle: {
        minHeight: 68,
        paddingTop: 6,
        paddingBottom: 6,
        alignItems: 'center',
        backgroundColor: currentTheme.colors.surface ?? currentTheme.colors.white,
        borderTopWidth: 0.5,
        borderTopColor: currentTheme.colors.grey1,
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
          tabBarLabel: "Prices"
        }
      },
      [ROUTES.PURCHASE_TAB]: {
        screen: PurchaseStack,
        options: {
          tabBarIcon: PurchaseTabIcon,
          tabBarLabel: "Purchasing"
        }
      },
      [ROUTES.SELLER_TAB]: {
        screen: SellerStack,
        options: {
          tabBarIcon: SellerTabIcon,
          tabBarLabel: "Sellers"
        }
      },
      [ROUTES.SETTINGS_TAB]: {
        screen: SettingsStack,
        options: {
          tabBarIcon: SettingsTabIcon,
          tabBarLabel: "Settings"
        }
      },
    }
  }), [currentTheme]);

  const Navigator = useMemo(() => createStaticNavigation(RootStack), [RootStack]);

  return (
    <NavigationContainer
      theme={{
        ...(isDarkMode ? DarkTheme : DefaultTheme) as unknown as Theme,
        colors: {
          ...(isDarkMode ? DarkTheme.colors : DefaultTheme.colors),
          background: currentTheme.colors.background,
          primary: currentTheme.colors.primary,
        },
        dark: isDarkMode
      }}
    >
      <NavigationIndependentTree>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={currentTheme.colors.background}
        />
        <Navigator />
      </NavigationIndependentTree>
    </NavigationContainer>

  )
}


function App() {
  const systemIsDarkMode = useColorScheme() === 'dark';
  const [themeMode, setThemeModeState] = React.useState<ThemeMode>('system');
  const isDarkMode = themeMode === 'system' ? systemIsDarkMode : themeMode === 'dark';
  const appTheme = useMemo(() => makeAppTheme(isDarkMode), [isDarkMode]);
  const [onboarded, setOnboarded] = React.useState(false);
  const [checkingData, setCheckingData] = React.useState(true);
  const [mainReady, setMainReady] = React.useState(false);

  const handleSetThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    settingsService.setThemeMode(mode).catch(() => undefined);
  }, []);

  const themeModeContextValue = useMemo(
    () => ({ mode: themeMode, setMode: handleSetThemeMode }),
    [themeMode, handleSetThemeMode]
  );

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      // Skip onboarding for returning users: persisted flag first,
      // then data heuristic for installs that predate the flag.
      try {
        settingsService.getThemeMode().then((mode) => {
          if (!cancelled) setThemeModeState(mode);
        }).catch(() => undefined);
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
    return (
      <ThemeProvider theme={appTheme}>
        <SafeAreaProvider>
          <StartupLoader />
        </SafeAreaProvider>
      </ThemeProvider>
    );
  }

  if (!onboarded) {
    return (
      <ThemeProvider theme={appTheme}>
        <SafeAreaProvider>
          <Onboarding onDone={handleOnboardingDone} />
        </SafeAreaProvider>
      </ThemeProvider>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider theme={appTheme}>
        <PriceProvider>
          <SafeAreaProvider>
            <ThemeModeContext.Provider value={themeModeContextValue}>
              <Navigation onReady={handleMainReady} isDarkMode={isDarkMode} />
            </ThemeModeContext.Provider>
            {!mainReady && <StartupLoader overlay />}
          </SafeAreaProvider>
        </PriceProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
