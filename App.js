import React from "react";
import { StyleSheet, View } from "react-native";
import RegisterPage from "./components/RegisterPage";

export default function App() {
  return (
    <View style={styles.container}>
      <RegisterPage />
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
