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
      .then((res) =>
        Alert.alert("Login Successful", "", [
          {
            text: "OK",
            onPress: () => navigation.navigate("Home"),
          },
        ])
      )
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
        />
        <TextInput
          style={styles.textInput}
          placeholder="Password"
          onChangeText={handleUpdatePassword}
          value={password}
        />
        <Button
          title="Login"
          style={styles.button}
          onPress={validateLoginInput}
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
    padding: 10,
    width: 300,
    margin: 12,
  },

  button: {
    marginTop: 42,
  },
});
