/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StatusBar, useColorScheme } from 'react-native';
import { ThemeProvider, useTheme } from '@rneui/themed';
import { createStaticNavigation, NavigationContainer, NavigationIndependentTree, Theme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from "@react-native-vector-icons/ionicons/static";
import SellerStack from './screens/seller/Stack';
import PriceStack from './screens/pricing/Stack';
import PurchaseStack from './screens/purchaseing/Stack';
import { navTheme, theme } from './theme';
import { SafeAreaProvider } from 'react-native-safe-area-context';


const RootStack = createBottomTabNavigator({
  // initialRouteName: 'Purchase',
  initialRouteName: 'Price',
  screenOptions: {
    headerShown: false,
    tabBarActiveTintColor: theme.lightColors?.primary,
    tabBarStyle: {
      minHeight: 70,
      paddingTop: 5,
      alignItems: 'center',
    },
    tabBarLabelStyle: {
      fontWeight: 'bold',
      fontSize: 12
    },
  },
  screens: {
    Price: {
      screen: PriceStack,
      options: {
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="pricetags-outline" color={color} size={size} />
        ),
        tabBarLabel: "Prices"
      }
    },
    Purchase: {
      screen: PurchaseStack,
      options: {
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="grid-outline" color={color} size={size + 2} />
        ),
        tabBarLabel: "Purchasing"
      }
    },
    Seller: {
      screen: SellerStack,
      options: {
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="people-outline" color={color} size={size} />
        ),
        tabBarLabel: "Sellers"
      }
    },
  }
});


const Navigator = createStaticNavigation(RootStack);

function Navigation() {

  const isDarkMode = useColorScheme() === 'dark';
  const { theme } = useTheme();

  return (
    <NavigationContainer
      theme={{
        ...navTheme as unknown as Theme,
        colors: {
          ...navTheme.colors,
          background: theme.colors.background,
          primary: theme.colors.primary,
        },
        dark: isDarkMode
      }}
    >
      <NavigationIndependentTree>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.background}
        />
        <Navigator />
      </NavigationIndependentTree>
    </NavigationContainer>

  )
}


function App() {

  return (
    <ThemeProvider theme={theme}>
      <SafeAreaProvider>
        <Navigation />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

export default App;
