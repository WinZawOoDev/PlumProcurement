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
import { useMemo } from 'react';
import { Ionicons } from "@react-native-vector-icons/ionicons/static";
import SellerStack from './screens/seller/Stack';
import PriceStack from './screens/pricing/Stack';
import PurchaseStack from './screens/purchasing/Stack';
import { makeAppTheme } from './theme';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PriceProvider } from './context/PriceContext';

function PriceTabIcon({ color, size }: { color: string; size: number }) {
  return <Ionicons name="pricetags-outline" color={color} size={size} />;
}

function PurchaseTabIcon({ color, size }: { color: string; size: number }) {
  return <Ionicons name="grid-outline" color={color} size={size + 2} />;
}

function SellerTabIcon({ color, size }: { color: string; size: number }) {
  return <Ionicons name="people-outline" color={color} size={size} />;
}


function Navigation() {

  const isDarkMode = useColorScheme() === 'dark';
  const { theme: currentTheme } = useTheme();

  const RootStack = useMemo(() => createBottomTabNavigator({
    initialRouteName: 'Price',
    screenOptions: {
      headerShown: false,
      tabBarActiveTintColor: currentTheme.colors.primary,
      tabBarInactiveTintColor: currentTheme.colors.grey4,
      tabBarStyle: {
        minHeight: 72,
        paddingTop: 6,
        paddingBottom: 8,
        alignItems: 'center',
        backgroundColor: currentTheme.colors.surface ?? currentTheme.colors.white,
        borderTopWidth: 1,
        borderTopColor: currentTheme.colors.grey1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 8,
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
      Price: {
        screen: PriceStack,
        options: {
          tabBarIcon: PriceTabIcon,
          tabBarLabel: "Prices"
        }
      },
      Purchase: {
        screen: PurchaseStack,
        options: {
          tabBarIcon: PurchaseTabIcon,
          tabBarLabel: "Purchasing"
        }
      },
      Seller: {
        screen: SellerStack,
        options: {
          tabBarIcon: SellerTabIcon,
          tabBarLabel: "Sellers"
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
  const isDarkMode = useColorScheme() === 'dark';
  const appTheme = useMemo(() => makeAppTheme(isDarkMode), [isDarkMode]);

  return (
    <ErrorBoundary>
      <ThemeProvider theme={appTheme}>
        <PriceProvider>
          <SafeAreaProvider>
            <Navigation />
          </SafeAreaProvider>
        </PriceProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
