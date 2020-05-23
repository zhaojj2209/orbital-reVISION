import React from "react";
import { StyleSheet, View } from "react-native";
import RegisterPage from "./components/RegisterPage";
import LoginPage from "./components/LoginPage";

export default function App() {
  return (
    <View style={styles.container}>
      <LoginPage />
    </View>
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
