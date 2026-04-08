import { RefreshControl, View, Text, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useStyles } from '../../styles'
import { useTheme } from '@rneui/themed'
import { SafeAreaView } from 'react-native-safe-area-context'
import PriceCard from './PriceCard'
import ActionButtons from './ActionButtons'
import { fetchPrices, initializePrices, IPrice, truncatePrices } from '../../database'
import { useRoute } from '@react-navigation/native'

export default function PurchasePrices() {

  const styles = useStyles()
  const { theme } = useTheme()
  const route = useRoute();

  const [price, setPrice] = useState<{ list: IPrice[], isLoading: boolean }>({ list: [], isLoading: false })

  async function getPrices() {
    setPrice(prev => ({ ...prev, isLoading: true }))
    await initializePrices()
    const data = await fetchPrices()
    console.log('Fetched prices:', data)
    setPrice({ list: data, isLoading: false })
  }

  useEffect(() => {
    getPrices()
  }, [])


  useEffect(() => {

    //@ts-expect-error
    const isRefresh = route.params?.refresh;

    if (isRefresh) {
      getPrices()
    }

  }, [route.params])


  return (
    <SafeAreaView
      edges={{ bottom: "maximum" }}
      style={{ ...styles.screenContainer, height: '100%' }} >
      <View style={{ paddingHorizontal: 12, paddingBlock: 15 }}>
        <TitleAndDescription />
        <ActionButtons />
        <FlatList
          data={price.list}
          keyExtractor={(item) => item.id.toString()}
          refreshing={price.isLoading}
          initialScrollIndex={0}
          renderItem={({ item }) => <PriceCard {...item} />}
          ListEmptyComponent={<EmptyPriceList />}
          refreshControl={
            <RefreshControl
              refreshing={price.isLoading}
              onRefresh={getPrices}
              colors={[theme.colors.primary]}
            />
          }
          style={{
            marginBottom: 130,
          }}
        />
      </View>
    </SafeAreaView>
  )
}


function EmptyPriceList() {

  const { theme } = useTheme()

  return (
    <View style={{
      flex: 1,
      width: '100%',
      backgroundColor: theme.colors.secondary,
      height: 200,
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Text style={{ alignSelf: 'center' }}>Empty Price</Text>
    </View>
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