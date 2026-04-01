/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StatusBar, StyleSheet, useColorScheme, Platform } from 'react-native';
import { createTheme, ThemeProvider, useTheme } from '@rneui/themed';
import { createStaticNavigation, NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from "@react-native-vector-icons/ionicons/static";
import SellerStack from './screens/seller/Stack';
import PriceStack from './screens/pricing/Stack';
import PurchaseStack from './screens/purchaseing/Stack';

const WEB_FONT_STACK =
  'system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';

export const theme = createTheme({
  mode: 'light',
  lightColors: {
    primary: 'red',
  },
  darkColors: {
    primary: 'blue',
  },
  components: {
    Button: {
      raised: true,
    },
  },
  spacing: {
    xl: 1,
    lg: 0.8,
    md: 0.6,
    sm: 0.4,
    xs: 0.2
  }
})

const RootStack = createBottomTabNavigator({
  initialRouteName: 'Purchase',
  screenOptions: {
    tabBarActiveTintColor: 'tomato',
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
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="pricetags-outline" color={color} size={size} />
        ),
        tabBarLabel: "Prices"
      }
    },
    Purchase: {
      screen: PurchaseStack,
      options: {
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="grid-outline" color={color} size={size + 2} />
        ),
        tabBarLabel: "Purchase"
      }
    },
    Seller: {
      screen: SellerStack,
      options: {
        headerShown: false,
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
        colors: {
          primary: theme.colors.primary,
          background: theme.colors.background,
          card: theme.colors.white,
          text: theme.colors.black,
          border: theme.colors.grey3,
          notification: theme.colors.primary,
        },
        dark: theme.mode === 'dark',
        fonts: Platform.select({
          web: {
            regular: {
              fontFamily: WEB_FONT_STACK,
              fontWeight: '400',
            },
            medium: {
              fontFamily: WEB_FONT_STACK,
              fontWeight: '500',
            },
            bold: {
              fontFamily: WEB_FONT_STACK,
              fontWeight: '600',
            },
            heavy: {
              fontFamily: WEB_FONT_STACK,
              fontWeight: '700',
            },
          },
          ios: {
            regular: {
              fontFamily: 'System',
              fontWeight: '400',
            },
            medium: {
              fontFamily: 'System',
              fontWeight: '500',
            },
            bold: {
              fontFamily: 'System',
              fontWeight: '600',
            },
            heavy: {
              fontFamily: 'System',
              fontWeight: '700',
            },
          },
          default: {
            regular: {
              fontFamily: 'sans-serif',
              fontWeight: 'normal',
            },
            medium: {
              fontFamily: 'sans-serif-medium',
              fontWeight: 'normal',
            },
            bold: {
              fontFamily: 'sans-serif',
              fontWeight: '600',
            },
            heavy: {
              fontFamily: 'sans-serif',
              fontWeight: '700',
            },
          },
        })
      }}
    >
      <NavigationIndependentTree>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor='white'
        />
        <Navigator />
      </NavigationIndependentTree>
    </NavigationContainer>

  )
}


function App() {

  return (
    <ThemeProvider theme={theme}>
      <Navigation />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
