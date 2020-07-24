import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Button,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";

import firebase from "../FirebaseDb";

export default function RegisterPage({ navigation }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const validateRegistrationInput = () => {
    if (username.length == 0) {
      Alert.alert("Please enter valid username!", "Username cannot be blank", [
        { text: "OK", onPress: () => {} },
      ]);
    } else if (email.length < 10 || email.search("@") == -1) {
      Alert.alert("Please enter valid email!", "", [
        { text: "OK", onPress: () => {} },
      ]);
    } else if (password.length < 6) {
      Alert.alert(
        "Please enter valid password!",
        "Password must be at least 6 characters long",
        [{ text: "OK", onPress: () => {} }]
      );
    } else {
      handleCreateUser();
    }
  };

  const handleCreateUser = () =>
    firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then(() =>
        firebase
          .firestore()
          .collection("users")
          .doc(firebase.auth().currentUser.uid)
          .set({
            username: username,
          })
      )
      .then(() =>
        Alert.alert("Registration Successful!", "", [
          {
            text: "OK",
            onPress: () =>
              navigation.navigate("Home", {
                screen: "SleepSchedule",
                params: {
                  userId: firebase.auth().currentUser.uid,
                },
              }),
          },
        ])
      )
      .catch((err) =>
        Alert.alert(err.message, "", [{ text: "OK", onPress: () => {} }])
      );

  const handleUpdateUsername = (username) => setUsername(username);

  const handleUpdateEmail = (email) => setEmail(email);

  const handleUpdatePassword = (password) => setPassword(password);

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
        <TextInput
          style={styles.textInput}
          placeholder="Username"
          onChangeText={handleUpdateUsername}
          placeholderTextColor="#a2d5f2"
          value={username}
        />
        <TextInput
          style={styles.textInput}
          placeholder="Email"
          onChangeText={handleUpdateEmail}
          placeholderTextColor="#a2d5f2"
          value={email}
        />
        <TextInput
          secureTextEntry
          style={styles.textInput}
          placeholder="Password"
          onChangeText={handleUpdatePassword}
          placeholderTextColor="#a2d5f2"
          value={password}
        />
        <View style={styles.button}>
          <Button title="Register" onPress={validateRegistrationInput} />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fafafa",
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: "#07689f",
    fontSize: 20,
    padding: 10,
    width: 300,
    borderRadius: 2,
    color: "#07689f",
    margin: 10,
  },
  button: {
    marginTop: 75,
  },
});
