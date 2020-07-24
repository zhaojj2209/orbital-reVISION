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
import { getCategoriesDb } from "../FirebaseDb";

export default function CategoryFormPage({ route, navigation }) {
  const [title, setTitle] = useState("");
  const [colour, setColour] = useState(categoryColours.one);
  const [showPicker, setShowPicker] = useState(Platform.OS === "android");

  const { userId, isNewCategory, category } = route.params;
  const categoriesDb = getCategoriesDb(userId);

  useEffect(() => {
    if (!isNewCategory) {
      const { title, colour } = category.data;
      setTitle(title);
      setColour(colour);
    }
  }, [category]);

  const handleCreateCategory = () =>
    categoriesDb
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
    categoriesDb
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

  const handleTogglePicker = () => {
    Keyboard.dismiss();
    setShowPicker(!showPicker);
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
        <TextInput
          multiline
          style={styles.textInput}
          placeholder="Category"
          onChangeText={handleUpdateTitle}
          value={title}
          placeholderTextColor="#a2d5f2"
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
            if (title.length) {
              if (isNewCategory) {
                handleCreateCategory();
              } else {
                handleEditCategory();
              }
            } else {
              Alert.alert(
                "Category cannot be saved!",
                "Category title cannot be blank",
                [{ text: "OK", onPress: () => {} }]
              );
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
    backgroundColor: "#fafafa",
  },
  colour: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    justifyContent: "space-evenly",
  },
  colourText: { fontSize: 18, padding: 25, color: "#07689f" },
  colourBox: {
    width: 74,
    height: 50,
    borderRadius: 10,
  },
  textInput: {
    borderWidth: 1.2,
    borderColor: "#07689f",
    fontSize: 20,
    padding: 10,
    width: 300,
    borderRadius: 2,
    color: "#07689f",
    marginTop: 10,
  },
  pickerText: {
    fontSize: 40,
  },
});
