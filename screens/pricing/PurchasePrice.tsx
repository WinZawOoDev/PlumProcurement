import { View, Text, FlatList } from 'react-native'
import React, { useEffect } from 'react'
import { useStyles } from '../../styles'
import { useTheme } from '@rneui/themed'
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import PriceCard, { Price } from './PriceCard'
import ActionButtons from './ActionButtons'
import { fetchPrices, initializeDatabase } from '../../database'

const prices: Price[] = [
  { id: 1, price: 20000, unit: 'kg', category: 'Fruits', status: 'Available' },
  { id: 2, price: 15000, unit: 'kg', category: 'Vegetables', status: 'Unavailable' },
  { id: 3, price: 30000, unit: 'kg', category: 'Grains', status: 'Available' },
  { id: 4, price: 25000, unit: 'kg', category: 'Dairy', status: 'Unavailable' },
  { id: 5, price: 18000, unit: 'kg', category: 'Meat', status: 'Available' },
];

export default function PurchasePrices() {

  const safeAreaInsets = useSafeAreaInsets();
  const styles = useStyles()
  const { theme } = useTheme()

  useEffect(() => {
    initializeDatabase().then(() => {
      console.log('Database initialized successfully')
    }).catch((error) => {
      console.error('Error initializing database:', error)
    })
    fetchPrices().then((data) => {
      console.log('Fetched prices:', data)
    }).catch((error) => {
      console.error('Error fetching prices:', error)
    })
  }, [])

  return (
    <SafeAreaProvider>
      <View style={{ ...styles.screenContainer, paddingTop: safeAreaInsets.top }}>
        <View style={{ paddingHorizontal: 12, paddingBlock: 15 }}>
          <TitleAndDescription />
          <ActionButtons />
          <SafeAreaView style={{ marginBottom: 20 }}>
            <FlatList
              data={prices}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => <PriceCard {...item} />}
            />
          </SafeAreaView>
        </View>
      </View>
    </SafeAreaProvider>
  )
}

function TitleAndDescription() {
  const { theme } = useTheme()
  return (
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
  )
}

// function SearchPrice() {

//   const { theme } = useTheme()

//   return (
//     <View
//       style={{
//         marginBlock: 30,
//         paddingBlock: 20,
//         borderRadius: 8,
//         backgroundColor: '#F3F4F5',
//       }}
//     >
//       <Input
//         inputContainerStyle={{
//           borderBottomWidth: 0,
//           backgroundColor: theme.colors.white,
//           borderRadius: 4,
//           paddingBlock: 2
//         }}
//         inputStyle={{
//           backgroundColor: theme.colors.white,
//           paddingBlock: 15,
//         }}
//         placeholder='Search variety or category...'
//         placeholderTextColor={'#80747B'}
//         leftIcon={<Ionicons name='search' size={25} color={'#80747B'} />}
//         leftIconContainerStyle={{
//           marginLeft: 15,
//           marginRight: 5
//         }}
//       />
//       <View
//         style={{
//           marginTop: -10,
//           flexDirection: 'row',
//           gap: 10,
//           marginHorizontal: 12
//         }}
//       >
//         <Button
//           containerStyle={{
//             shadowColor: 'transparent',
//           }}
//           buttonStyle={{
//             width: 'auto',
//             backgroundColor: "#E1E3E4",
//             paddingHorizontal: 10,
//             paddingBlock: 8,
//             elevation: 0,
//             shadowOpacity: 0,
//             borderWidth: 0,
//             borderRadius: 4
//           }}
//           title="Category"
//           titleStyle={{
//             color: '#4E444A',
//             paddingLeft: 5,
//             fontWeight: '600',
//             fontSize: 14,
//             lineHeight: 20,
//             fontFamily: 'Inter'
//           }}
//           icon={<Ionicons name='filter' size={18} color={'#4E444A'} />}
//         />
//         <Button
//           containerStyle={{
//             shadowColor: 'transparent',
//           }}
//           buttonStyle={{
//             width: 'auto',
//             backgroundColor: "#E1E3E4",
//             paddingHorizontal: 10,
//             paddingBlock: 8,
//             elevation: 0,
//             shadowOpacity: 0,
//             borderWidth: 0,
//             borderRadius: 4
//           }}
//           title="Sort"
//           titleStyle={{
//             color: '#4E444A',
//             paddingLeft: 5,
//             fontWeight: '600',
//             fontSize: 14,
//             lineHeight: 20,
//             fontFamily: 'Inter'
//           }}
//           icon={<Ionicons name='funnel-outline' size={18} color={'#4E444A'} />}
//         />
//       </View>
//     </View>
//   )
// }