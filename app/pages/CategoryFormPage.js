import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  Picker,
  Platform,
} from "react-native";

import { categoryColours } from "../constants/Colours";
import firebase from "../FirebaseDb";

export default function CategoryFormPage({ route, navigation }) {
  const [title, setTitle] = useState("");
  const [colour, setColour] = useState(categoryColours.one);
  const [showPicker, setShowPicker] = useState(Platform.OS === "android");

  const { userId, isNewCategory, category, onGoBack } = route.params;

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
            onPress: () => {
              onGoBack();
              navigation.navigate("CategoryList");
            },
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
            onPress: () => {
              onGoBack();
              navigation.navigate("CategoryList");
            },
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
          multiline
          style={styles.textInput}
          placeholder="Event"
          onChangeText={handleUpdateTitle}
          value={title}
        />
        <View style={styles.colour}>
          <Text style={styles.colourText}>Colour:</Text>
          {Platform.OS === "ios" ? (
            <TouchableOpacity onPress={handleTogglePicker}>
              <View
                style={StyleSheet.flatten([
                  styles.colourBox,
                  { backgroundColor: colour },
                ])}
              />
            </TouchableOpacity>
          ) : (
            <Text>{colour}</Text>
          )}
        </View>
        {showPicker && (
          <Picker
            selectedValue={colour}
            style={{ width: 300 }}
            onValueChange={(itemValue, itemIndex) => setColour(itemValue)}
            itemStyle={styles.pickerText}
          >
            <Picker.Item
              label="██"
              value={categoryColours.one}
              color={categoryColours.one}
            />
            <Picker.Item
              label="██"
              value={categoryColours.two}
              color={categoryColours.two}
            />
            <Picker.Item
              label="██"
              value={categoryColours.three}
              color={categoryColours.three}
            />
            <Picker.Item
              label="██"
              value={categoryColours.four}
              color={categoryColours.four}
            />
            <Picker.Item
              label="██"
              value={categoryColours.five}
              color={categoryColours.five}
            />
            <Picker.Item
              label="██"
              value={categoryColours.six}
              color={categoryColours.six}
            />
            <Picker.Item
              label="██"
              value={categoryColours.seven}
              color={categoryColours.seven}
            />
            <Picker.Item
              label="██"
              value={categoryColours.eight}
              color={categoryColours.eight}
            />
            <Picker.Item
              label="██"
              value={categoryColours.nine}
              color={categoryColours.nine}
            />
            <Picker.Item
              label="██"
              value={categoryColours.ten}
              color={categoryColours.ten}
            />
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
    padding: 20,
    justifyContent: "space-evenly",
  },
  colourText: { fontSize: 18, padding: 25 },
  colourBox: {
    width: 74,
    height: 50,
    borderRadius: 10,
  },

  textInput: {
    borderWidth: 1,
    borderColor: "black",
    fontSize: 20,
    padding: 10,
    width: 300,
  },
  pickerText: {
    fontSize: 40,
  },
});
