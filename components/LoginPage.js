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
      .auth()
      .signInWithEmailAndPassword(this.state.email, this.state.password)
      .then((res) =>
        firebase
          .firestore()
          .collection("users")
          .doc(res.user.uid)
          .get()
          .then((doc) =>
            Alert.alert(
              "Login Successful",
              "Username: " + doc.data().username,
              [
                {
                  text: "OK",
                  onPress: () =>
                    this.setState({
                      email: "",
                      password: "",
                    }),
                },
              ]
            )
          )
      )
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
