import { View, Text } from 'react-native'
import React from 'react'
import { useStyles } from '../../styles'
import { useTheme } from '@rneui/themed'
import { Button } from '@rneui/base'
import Ionicons from '@react-native-vector-icons/ionicons'

export default function PurchasePrices() {

  const styles = useStyles()
  const { theme } = useTheme()

  return (
    <View style={styles.screenContainer}>
      <View style={{ paddingHorizontal: 12, paddingBlock: 15 }}>
        <View style={{ marginBottom: 10 }}>
          <Text style={{ fontFamily: 'Manrope', fontSize: 25, fontWeight: '700', color: theme.colors.primary, letterSpacing: 0.5, lineHeight: 40 }}>Price Management</Text>
          <Text style={{
            fontFamily: 'Inter',
            fontWeight: '500',
            fontSize: 16,
            lineHeight: 24,
          }}>
            Define and adjust market rates for plum
            varieties.
          </Text>
        </View>
        <Button
          buttonStyle={{
            display: 'flex',
            justifyContent: 'flex-start',
            paddingHorizontal: 25,
            paddingBlock: 15,
            borderRadius: 4,
            backgroundColor: theme.colors.primary
          }}
          icon={<Ionicons name='add-sharp' size={20} color={'white'} />}
          title='Add New Price'
          titleStyle={{
            fontWeight: '600',
            fontSize: 15,
            lineHeight: 20,
            fontFamily: 'Inter',
            color: 'white',
            marginLeft: 10
          }}
        />
      </View>
    </View>
  )
}