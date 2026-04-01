/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StatusBar, StyleSheet, useColorScheme } from 'react-native';
import { createTheme, ThemeProvider } from '@rneui/themed';
import { createStaticNavigation } from '@react-navigation/native';;
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from "@react-native-vector-icons/ionicons/static";
import SellerStack from './screens/seller/Stack';
import PriceStack from './screens/price/Stack';
import PurchaseStack from './screens/purchase/Stack';


const RootStack = createBottomTabNavigator({
  initialRouteName: 'Purchase',
  screens: {
    Price: {
      screen: PriceStack,
      options: {
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="pricetags-outline" color={color} size={size} />
        ),
        tabBarLabel: "Price",
        tabBarActiveTintColor: 'tomato',
      }
    },
    Purchase: {
      screen: PurchaseStack,
      options: {
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="grid-outline" color={color} size={size} />
        ),
        tabBarLabel: "Purchase",
        tabBarActiveTintColor: 'tomato',
      }
    },
    Seller: {
      screen: SellerStack,
      options: {
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="person-outline" color={color} size={size} />
        ),
        tabBarLabel: "Seller",
        tabBarActiveTintColor: 'tomato',
      }
    },
  }
});



const Navigation = createStaticNavigation(RootStack);

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ThemeProvider theme={theme}>
        <Navigation />
      </ThemeProvider>
    </>
  );
}


const theme = createTheme({
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
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
