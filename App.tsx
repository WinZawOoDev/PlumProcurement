/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NewAppScreen } from '@react-native/new-app-screen';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { createTheme, ThemeProvider } from '@rneui/themed'
import { Button, Text } from '@rneui/base';
import { useState } from 'react';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();

  const [count, setCount] = useState(0)

  return (
    <ThemeProvider theme={theme}>
      <View style={{ flex: 1, paddingBottom: safeAreaInsets.bottom }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text h4>
            Let's count the Plums
          </Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#F2F2F5', padding: 100, borderRadius: '100%', alignItems: 'center', alignContent: 'center' }}>
            <Text style={{ fontWeight: "bold", fontSize: 50, }}>
              {count}
            </Text>
          </View>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Button
            containerStyle={{ marginVertical: 20, width: '80%', }}
            buttonStyle={{ paddingBlock: 15, paddingHorizontal: 30, borderRadius: 10, }}
            title="count"
            color="secondary"
            titleStyle={{ fontSize: 18, fontWeight: 'bold', letterSpacing: 0.5 }}
            type='outline'
            size='lg'
            onPress={() => setCount(prev => prev + 1)}
          />
        </View>
      </View>
    </ThemeProvider>
    // <View style={styles.container}>
    //   <NewAppScreen
    //     templateFileName="App.tsx"
    //     safeAreaInsets={safeAreaInsets}
    //   />
    // </View>
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
