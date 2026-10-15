import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Sellers from "./Sellers";
import SellerDetails from "./SellerDetails";
import SellerPurchases from "./SellerPurchases";
import SellerPayments from "./SellerPayments";
import RecordPayment from "./RecordPayment";
import PaymentReview from "./PaymentReview";
import PurchaseSummary from "../purchasing/PurchaseSummary";
import { ROUTES } from "../../constants";

// Screen titles are rendered by each screen's own SellerScreenHeader (or
// SectionHeader), so the navigator does not carry per-screen i18n titles.
const SellerStack = createNativeStackNavigator({
  // Options resolve against the active React Navigation theme (light/dark), so
  // header colors follow the app theme whenever a native header is shown.
  screenOptions: ({ theme }) => ({
    headerShown: false,
    headerStyle: { backgroundColor: theme.colors.background },
    headerTintColor: theme.colors.primary,
    headerShadowVisible: false,
    contentStyle: { backgroundColor: theme.colors.background },
  }),
  screens: {
    [ROUTES.SELLER]: {
      screen: Sellers,
    },
    [ROUTES.SELLER_DETAILS]: {
      screen: SellerDetails,
    },
    [ROUTES.PURCHASE_SUMMARY]: {
      screen: PurchaseSummary,
    },
    [ROUTES.SELLER_PURCHASES]: {
      screen: SellerPurchases,
    },
    [ROUTES.SELLER_PAYMENTS]: {
      screen: SellerPayments,
    },
    [ROUTES.RECORD_PAYMENT]: {
      screen: RecordPayment,
    },
    [ROUTES.PAYMENT_REVIEW]: {
      screen: PaymentReview,
    }
  }
})

export default SellerStack;