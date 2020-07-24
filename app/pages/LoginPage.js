import React, { useState, Component } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Button,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  StatusBar,
  Text,
} from "react-native";

import firebase from "../FirebaseDb";
import globalStyles from "../constants/GlobalStyles";

export default function LoginPage({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const validateLoginInput = () => {
    if (email.length < 10 || email.search("@") == -1) {
      Alert.alert("Email incorrect!", "", [{ text: "OK", onPress: () => {} }]);
    } else if (password.length < 6) {
      Alert.alert("Password incorrect!", "", [
        { text: "OK", onPress: () => {} },
      ]);
    } else {
      handleLookupUser();
    }
  };

  const handleLookupUser = () =>
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then((res) => {
        Keyboard.dismiss();
        setPassword("");
        Alert.alert("Login Successful", "", [
          {
            text: "OK",
            onPress: () => navigation.navigate("Home"),
          },
        ]);
      })
      .catch((err) =>
        Alert.alert(err.message, "", [{ text: "OK", onPress: () => {} }])
      );

  const handleUpdateEmail = (email) => setEmail(email);

  const handleUpdatePassword = (password) => setPassword(password);

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
        <TextInput
          style={styles.textInput}
          placeholder="Email"
          onChangeText={handleUpdateEmail}
          value={email}
          placeholderTextColor="#a2d5f2"
        />
        <TextInput
          style={styles.textInput}
          placeholder="Password"
          placeholderTextColor="#a2d5f2"
          secureTextEntry
          onChangeText={handleUpdatePassword}
          value={password}
        />
        <Button title="Login" onPress={validateLoginInput} />
        <View style={styles.bottomButton}>
          <Button
            title="Create an Account"
            onPress={() => navigation.navigate("Register")}
          />
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

  bottomButton: {
    marginTop: 90,
  },
});
