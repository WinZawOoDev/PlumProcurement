import { View } from 'react-native'
import React, { useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link } from '@react-navigation/native';
import { Button, Text } from '@rneui/base';

export default function Purchase() {
    const safeAreaInsets = useSafeAreaInsets();

    const [count, setCount] = useState(0)

    return (
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
            <View>
                <Link screen='Details' params={{}} style={{ padding: 20, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: "red", fontSize: 18, fontWeight: 'bold' }}>
                        Go to Details
                    </Text>
                </Link>
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
    );
}