import { View, Text } from 'react-native'
import React from 'react'
import { useStyles } from '../../styles'
import { useTheme, Button, Input, ButtonProps } from '@rneui/themed'
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
          containerStyle={{
            shadowColor: 'transparent',
          }}
          buttonStyle={{
            display: 'flex',
            justifyContent: 'flex-start',
            paddingHorizontal: 25,
            paddingBlock: 15,
            borderRadius: 4,
            backgroundColor: theme.colors.primary,
            elevation: 0,
            shadowOpacity: 0,
            borderWidth: 0
          }}
          icon={<Ionicons name='add-sharp' size={20} color={'white'} />}
          title='Add New Price'
          titleStyle={{
            fontWeight: '600',
            fontSize: 17,
            lineHeight: 20,
            fontFamily: 'Inter',
            color: 'white',
            marginLeft: 10
          }}
        />
        <SearchPrice />
      </View>
    </View>
  )
}

function SearchPrice() {

  const { theme } = useTheme()

  return (
    <View
      style={{
        marginBlock: 30,
        paddingBlock: 20,
        borderRadius: 8,
        backgroundColor: '#F3F4F5',
      }}
    >
      <Input
        inputContainerStyle={{
          borderBottomWidth: 0,
          backgroundColor: theme.colors.white,
          borderRadius: 4,
          paddingBlock: 2
        }}
        inputStyle={{
          backgroundColor: theme.colors.white,
          paddingBlock: 15,
        }}
        placeholder='Search variety or category...'
        placeholderTextColor={'#80747B'}
        leftIcon={<Ionicons name='search' size={25} color={'#80747B'} />}
        leftIconContainerStyle={{
          marginLeft: 15,
          marginRight: 5
        }}
      />
      <View
        style={{
          marginTop: -10,
          flexDirection: 'row',
          gap: 10,
          marginHorizontal: 12
        }}
      >
        <Button
          containerStyle={{
            shadowColor: 'transparent',
          }}
          buttonStyle={{
            width: 'auto',
            backgroundColor: "#E1E3E4",
            paddingHorizontal: 10,
            paddingBlock: 8,
            elevation: 0,
            shadowOpacity: 0,
            borderWidth: 0,
            borderRadius: 4
          }}
          title="Category"
          titleStyle={{
            color: '#4E444A',
            paddingLeft: 5,
            fontWeight: '600',
            fontSize: 14,
            lineHeight: 20,
            fontFamily: 'Inter'
          }}
          icon={<Ionicons name='filter' size={18} color={'#4E444A'} />}
        />
        <Button
          containerStyle={{
            shadowColor: 'transparent',
          }}
          buttonStyle={{
            width: 'auto',
            backgroundColor: "#E1E3E4",
            paddingHorizontal: 10,
            paddingBlock: 8,
            elevation: 0,
            shadowOpacity: 0,
            borderWidth: 0,
            borderRadius: 4
          }}
          title="Sort"
          titleStyle={{
            color: '#4E444A',
            paddingLeft: 5,
            fontWeight: '600',
            fontSize: 14,
            lineHeight: 20,
            fontFamily: 'Inter'
          }}
          icon={<Ionicons name='funnel-outline' size={18} color={'#4E444A'} />}
        />
      </View>
    </View>
  )
}