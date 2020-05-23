import React, { Component } from "react";
import { View, TextInput, Text, StyleSheet, Button } from "react-native";
import firebase from "../firebaseDb";

export default class RegisterPage extends Component {
  state = {
    username: "",
    email: "",
    password: "",
    registerSuccess: false,
  };

  handleCreateUser = () =>
    firebase
      .firestore()
      .collection("users")
      .add({
        username: this.state.username,
        email: this.state.email,
        password: this.state.password,
      })
      .then(() =>
        this.setState({
          username: "",
          email: "",
          password: "",
          registerSuccess: true,
        })
      )
      .catch((err) => console.error(err));

  handleUpdateUsername = (username) => this.setState({ username });

  handleUpdateEmail = (email) => this.setState({ email });

  handleUpdatePassword = (password) => this.setState({ password });

  render() {
    const { username, email, password, registerSuccess } = this.state;

    return (
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
        {registerSuccess && <Text style={styles.text}>Registered!</Text>}
      </View>
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
  text: {
    fontSize: 20,
    color: "green",
    marginTop: 40,
  },
});
