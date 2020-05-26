import React from "react";
import { StyleSheet, View, Text, Button } from "react-native";

import firebase from "../firebaseDb";

export default class Homepage extends React.Component {
  state = {
    username: "",
  };
  componentDidMount() {
    const user = firebase.auth().currentUser;
    firebase
      .firestore()
      .collection("users")
      .doc(user.uid)
      .get()
      .then((doc) =>
        this.setState({
          username: doc.data().username,
        })
      );
  }
  render() {
    const { navigation } = this.props;
    const welcomeText = "Welcome, " + this.state.username + "!";
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
