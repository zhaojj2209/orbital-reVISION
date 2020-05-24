import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Button,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";

import firebase from "../firebaseDb";

export default class LoginPage extends React.Component {
  state = {
    email: "",
    password: "",
  };

  handleLookupUser = (email, password) =>
    firebase
      .firestore()
      .collection("users")
      .get()
      .then((querySnapshot) => {
        const results = [];
        querySnapshot.docs.map((documentSnapshot) =>
          results.push(documentSnapshot.data())
        );
        results
          .filter((item) => item.email == email)
          .filter((item) => item.password == password).length > 0
          ? Alert.alert("Login Successful", "Press OK to continue", [
              {
                text: "OK",
                onPress: () =>
                  this.setState({
                    email: "",
                    password: "",
                  }),
              },
            ])
          : Alert.alert("User not found");
      })
      .catch((err) => console.error(err));

  handleUpdateEmail = (email) => this.setState({ email });

  handleUpdatePassword = (password) => this.setState({ password });

  render() {
    const { email, password } = this.state;
    const { navigation } = this.props;

    return (
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.container}>
          <TextInput
            style={styles.textInput}
            placeholder="Email"
            onChangeText={this.handleUpdateEmail}
            value={email}
          />
          <TextInput
            style={styles.textInput}
            placeholder="Password"
            onChangeText={this.handleUpdatePassword}
            value={password}
          />
          <Button
            title="Login"
            style={styles.button}
            onPress={() => {
              if (email.length && password.length) {
                this.handleLookupUser(email, password);
              }
            }}
          />
          <Button
            title="Register"
            style={styles.button}
            onPress={() => navigation.navigate("Register")}
          />
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    marginBottom: 40,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "black",
    fontSize: 20,
    marginBottom: 20,
    paddingLeft: 10,
    width: 200,
    height: 40,
  },
  button: {
    marginTop: 42,
  },
});
