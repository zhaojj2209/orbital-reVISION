import React from "react";
import { StyleSheet, View, Text, Button } from "react-native";

import firebase from "../FirebaseDb";

export default class TaskScreen extends React.Component {
  render() {
    const { navigation } = this.props;
    const welcomeText = "Welcome to the task view!";
    return (
      <View style={styles.container}>
        <Text>{welcomeText}</Text>
        <Button
          title="Logout"
          style={styles.button}
          onPress={() =>
            firebase
              .auth()
              .signOut()
              .then(() => navigation.navigate("Login"))
          }
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
