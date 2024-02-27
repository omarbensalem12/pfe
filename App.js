import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import StackNavigator from "./StackNavigator";
import { UserContext } from "./UserContext";
import { QueryClient, QueryClientProvider } from 'react-query';
import { MyProvider } from "./MyContext";
import i18n from './i18/i18n';
import 'intl-pluralrules';
const queryClient = new QueryClient();
export default function App() {
  i18n.init();
  return (
    <MyProvider>
      <QueryClientProvider client={queryClient}>
        <UserContext>
          <StackNavigator />
        </UserContext>
      </QueryClientProvider>
    </MyProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
