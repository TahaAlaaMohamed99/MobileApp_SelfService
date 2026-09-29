import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import * as SecureStore from "expo-secure-store";

export default function Index() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  useEffect(() => {
    SecureStore.getItemAsync("accessToken").then((token) => {
      setIsLoggedIn(token !== null);
    });
  }, []);

  if (isLoggedIn === null) return null;

  return isLoggedIn
    ? <Redirect href="/(protected)/(tabs)/Dashboard" />
    : <Redirect href="/(auth)/login" />;
}