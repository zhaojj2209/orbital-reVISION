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

export default class RegisterPage extends React.Component {
  state = {
    username: "",
    email: "",
    password: "",
  };

  handleCreateUser = () =>
    firebase
      .auth()
      .createUserWithEmailAndPassword(this.state.email, this.state.password)
      .then(() =>
        Alert.alert("Registration Successful!", "", [
          {
            text: "OK",
            onPress: () =>
              this.setState({
                username: "",
                email: "",
                password: "",
              }),
          },
        ])
      )
      .catch((err) => console.error(err));

  handleUpdateUsername = (username) => this.setState({ username });

  handleUpdateEmail = (email) => this.setState({ email });

  handleUpdatePassword = (password) => this.setState({ password });

  render() {
    const { username, email, password } = this.state;
    const { navigation } = this.props;

    return (
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.container}>
          <TextInput
            style={styles.textInput}
            placeholder="Username"
            onChangeText={this.handleUpdateUsername}
            value={username}
          />
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
            title="Register"
            style={styles.button}
            onPress={() => {
              if (username.length && email.length && password.length) {
                this.handleCreateUser();
              }
            }}
          />
          <Button
            title="Login"
            style={styles.button}
            onPress={() => navigation.goBack()}
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
