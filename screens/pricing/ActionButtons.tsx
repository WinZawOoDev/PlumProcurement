import { View } from 'react-native'
import React from 'react'
import { useStyles } from '../../styles'
import { Button, useTheme } from '@rneui/themed'
import Ionicons from '@react-native-vector-icons/ionicons'
import { useNavigation } from '@react-navigation/native'

export default function ActionButtons() {

    const styles = useStyles()
    const { theme } = useTheme()
    const navigation = useNavigation()

    return (
        <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: "center"
        }}>
            <Button
                containerStyle={{
                    shadowColor: 'transparent',
                }}
                buttonStyle={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    paddingHorizontal: 20,
                    paddingBlock: 12,
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
                //@ts-expect-error
                onPress={() => navigation.navigate('CreatePrice')}
            />
            <Button
                containerStyle={{
                    shadowColor: 'transparent',
                    borderRadius: 5,
                }}
                buttonStyle={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    // paddingHorizontal: 20,
                    paddingBlock: 12,
                    borderRadius: 5,
                    backgroundColor: theme.colors.neutral,
                    elevation: 0,
                    shadowOpacity: 0,
                    borderWidth: 0,
                }}
                icon={<Ionicons name='search-outline' size={25} color={theme.colors.secondary} />}
                iconContainerStyle={{
                    marginHorizontal: 10
                }}
            />
        </View>
    )
}