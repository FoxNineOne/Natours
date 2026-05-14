/* eslint-disable */
import axios from "axios";
import { showAlert, hideAlert } from "./alerts";
const stripe = Stripe(
  "pk_test_51TWXUWD5YfW3lSwJRdShHe4cmKuqKYVUoJk9iFZktBkCCFhc400h4bCJhABh2tuQaNZjqmzzREofzhR2gtbcw19f00ska8kSbV",
);

export const bookTour = async (tourId) => {
  try {
    // 1) get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    // 2) user Stripe object to create checkout form + charge credit card
    // THIS IS DEPRECATED - CHEERS JONAS!
    //await stripe.redirectToCheckout({ sessionId: session.data.session.id });
    // 2) Redirect directly to Stripe Checkout
    window.location.assign(session.data.session.url);
  } catch (err) {
    // console.log(err);
    showAlert("error", err.response?.data?.message || err.message);
  }
};
