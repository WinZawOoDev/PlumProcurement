import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Purchase from "./Purchase";
import PurchaseDetails from "./PurchaseDetails";


const PurchaseStack = createNativeStackNavigator({
  screenOptions: {
    headerShown: false,
  },
  screens: {
    Purchase: {
      screen: Purchase,
      options: { title: 'Purchase' }
    },
    Details: {
      screen: PurchaseDetails,
      options: { title: 'Details' }
    }
  }
})

export default PurchaseStack;