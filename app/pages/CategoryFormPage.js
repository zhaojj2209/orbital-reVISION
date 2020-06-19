import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  Picker,
  Platform,
} from "react-native";

import Colours from "../constants/Colours";
import firebase from "../FirebaseDb";

export default function CategoryFormPage({ route, navigation }) {
  const [title, setTitle] = useState("");
  const [colour, setColour] = useState(Colours.one);
  const [showPicker, setShowPicker] = useState(Platform.OS === "android");

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

  const handleTogglePicker = () => setShowPicker(!showPicker);

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
        <TextInput
          style={styles.textInput}
          placeholder="Event"
          onChangeText={handleUpdateTitle}
          value={title}
        />
        <View style={styles.colour}>
          <Text>Colour:</Text>
          {Platform.OS === "ios" ? (
            <Button onPress={handleTogglePicker} title={colour} />
          ) : (
            <Text>{colour}</Text>
          )}
        </View>
        {showPicker && (
          <Picker
            selectedValue={colour}
            style={{ width: 150 }}
            onValueChange={(itemValue, itemIndex) => setColour(itemValue)}
          >
            <Picker.Item label="One" value={Colours.one} />
            <Picker.Item label="Two" value={Colours.two} />
            <Picker.Item label="Three" value={Colours.three} />
            <Picker.Item label="Four" value={Colours.four} />
            <Picker.Item label="Five" value={Colours.five} />
            <Picker.Item label="Six" value={Colours.six} />
            <Picker.Item label="Seven" value={Colours.seven} />
            <Picker.Item label="Eight" value={Colours.eight} />
            <Picker.Item label="Nine" value={Colours.nine} />
            <Picker.Item label="Ten" value={Colours.ten} />
          </Picker>
        )}
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
  colour: {
    flexDirection: "row",
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
