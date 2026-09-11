import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Sellers from "./Sellers";
import SellerDetails from "./SellerDetails";
import SellerPurchases from "./SellerPurchases";
import SellerPayments from "./SellerPayments";
import RecordPayment from "./RecordPayment";
import PaymentReview from "./PaymentReview";
import PurchaseSummary from "../purchasing/PurchaseSummary";
import { ROUTES } from "../../constants";
import i18n from "../../i18n";


const SellerStack = createNativeStackNavigator({
  screenOptions: {
    headerShown: false
  },
  screens: {
    [ROUTES.SELLER]: {
      screen: Sellers,
      options: { title: i18n.t('tabs.SELLERS') }
    },
    [ROUTES.SELLER_DETAILS]: {
      screen: SellerDetails,
      options: { title: i18n.t('uiText.SELLER_DETAILS') }
    },
    [ROUTES.PURCHASE_SUMMARY]: {
      screen: PurchaseSummary,
      options: { title: i18n.t('uiText.PURCHASE_SUMMARY_TITLE') }
    },
    [ROUTES.SELLER_PURCHASES]: {
      screen: SellerPurchases,
      options: { title: i18n.t('uiText.PURCHASE_HISTORY_TITLE') }
    },
    [ROUTES.SELLER_PAYMENTS]: {
      screen: SellerPayments,
      options: { title: i18n.t('uiText.PAYMENT_HISTORY') }
    },
    [ROUTES.RECORD_PAYMENT]: {
      screen: RecordPayment,
      options: { title: i18n.t('uiText.RECORD_PAYMENT') }
    },
    [ROUTES.PAYMENT_REVIEW]: {
      screen: PaymentReview,
      options: { title: i18n.t('uiText.PAYMENT_REVIEW_TITLE') }
    }
  }
})

export default SellerStack;