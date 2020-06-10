import React, { useState, useEffect } from "react";
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

export default function CategoryFormPage({ route, navigation }) {
  const [title, setTitle] = useState("");
  const [colour, setColour] = useState("f9c2ff");

  const { userId, isNewCategory, category } = route.params;

  useEffect(() => {
    if (!isNewCategory) {
      const { title, colour } = category.data;
      setTitle(title);
      setColour(colour);
    }
  }, [category]);

  const handleCreateCategory = () =>
    firebase
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("categories")
      .add({
        title: title,
        colour: colour,
      })
      .then(() =>
        Alert.alert("Category Created", "", [
          {
            text: "OK",
            onPress: () => navigation.navigate("CategoryList"),
          },
        ])
      )
      .catch((err) => console.error(err));

  const handleEditCategory = () =>
    firebase
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("categories")
      .doc(category.key)
      .set({
        title: title,
        colour: colour,
      })
      .then(() =>
        Alert.alert("Category Edited Successfully", "", [
          {
            text: "OK",
            onPress: () => navigation.navigate("CategoryList"),
          },
        ])
      )
      .catch((err) => console.error(err));

  const handleUpdateTitle = (title) => setTitle(title);

  const handleUpdateColour = (colour) => setColour(colour);

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
        <TextInput
          style={styles.textInput}
          placeholder="Event"
          onChangeText={handleUpdateTitle}
          value={title}
        />
        <TextInput
          style={styles.textInput}
          placeholder="Colour"
          onChangeText={handleUpdateColour}
          value={colour}
        />
        <Button
          title={isNewCategory ? "Create Category" : "Edit Category"}
          onPress={() => {
            if (title.length && colour.length) {
              if (isNewCategory) {
                handleCreateCategory();
              } else {
                handleEditCategory();
              }
            }
          }}
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
  textInput: {
    borderWidth: 1,
    borderColor: "black",
    fontSize: 20,
    marginBottom: 20,
    paddingLeft: 10,
    width: 200,
    height: 40,
  },
});
