"use client";
import { getErrorRedirect } from "@/utils/helpers";
import { getStripe } from "@/utils/stripe/client";
import { checkoutWithStripe, createStripePortal } from "@/utils/stripe/server";
import { Box, Button, Typography } from "@mui/material";
import { User } from "firebase/auth";
import { usePathname } from "next/navigation";
import { useRouter } from "next/router";

interface Props {
  user: User;
  paymentDetails: any;
}

export default function Account({ user, paymentDetails }: Props) {
  const currentPath = usePathname() as string;
  const router = useRouter();

  const handleStripeCheckout = async () => {
    // setPriceIdLoading(price.id);

    if (!user) {
      // setPriceIdLoading(undefined);
      return router.push("/signin");
    }

    const { sessionId } = await checkoutWithStripe(user, currentPath);

    if (!sessionId) {
      // setPriceIdLoading(undefined);
      return router.push(
        getErrorRedirect(
          currentPath,
          "An unknown error occurred.",
          "Please try again later or contact a system administrator."
        )
      );
    }

    const stripe = await getStripe();
    stripe?.redirectToCheckout({ sessionId });
  };
  const handlePaymentAccount = async () => {
    const redirectUrl = await createStripePortal(user, currentPath);
    return router.push(redirectUrl);
  };

  return (
    <Box sx={{ width: "100vw", height: "100vh" }}>
      <Typography variant="h4">Conta</Typography>
      <Box>
        {paymentDetails?.status && paymentDetails?.status !== "canceled" && (
          <Typography color="success">Pagamento Ativado</Typography>
        )}
        <Button onClick={handleStripeCheckout}>Pagamento</Button>
        <Button onClick={handlePaymentAccount}>Gerenciar pagamentos</Button>
      </Box>
    </Box>
  );
}
