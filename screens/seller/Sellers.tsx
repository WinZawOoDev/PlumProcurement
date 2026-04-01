import { View, Text } from 'react-native'
import React from 'react'
import { useTheme } from '@rneui/themed'

export default function Sellers() {

  const { theme } = useTheme()

  return (
    <View style={{
      flex: 1,
      backgroundColor: theme.colors.background
    }}>
      <Text>Sellers</Text>
    </View>
  )
}