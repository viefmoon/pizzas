import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { PaperProvider } from "react-native-paper";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { RootStack } from "./src/app/navigation/RootStack";
import { useThemeStore } from "./src/app/store/themeStore";
import GlobalSnackbar from "./src/app/components/common/GlobalSnackbar";

const queryClient = new QueryClient();

export default function App() {
  const { activeTheme } = useThemeStore();

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={activeTheme}>
        <SafeAreaProvider>
          <NavigationContainer>
            <RootStack />
          </NavigationContainer>
          <GlobalSnackbar />
        </SafeAreaProvider>
      </PaperProvider>
    </QueryClientProvider>
  );
}
