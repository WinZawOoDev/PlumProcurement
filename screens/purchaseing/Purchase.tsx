import { View } from 'react-native'
import React, { useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link } from '@react-navigation/native';
import { Button, Text } from '@rneui/base';
import { useStyles } from '../../styles';

export default function Purchase() {

    const safeAreaInsets = useSafeAreaInsets();

    const [count, setCount] = useState(0)
    const styles = useStyles()

    return (
        <View style={styles.screenContainer}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text h4>
                    Let's count the Plums
                </Text>
            </View>
            <View style={{ flex: 3, justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ display: 'flex', backgroundColor: '#F2F2F5', width: 300, height: 300, padding: 'auto', margin: 'auto', borderRadius: '100%', alignItems: 'center', alignContent: 'center' }}>
                    <Text style={{ fontWeight: "bold", color: 'black', fontSize: 50 }}>
                        {count}
                    </Text>
                </View>
            </View>
            {/* <View style={{flex: 3, justifyContent: 'center', alignItems: 'center' }}>
                <Link screen='Details' params={{}} style={{ padding: 20, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: "red", fontSize: 18, fontWeight: 'bold' }}>
                        Go to Details
                    </Text>
                </Link>
            </View> */}
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
    );
}