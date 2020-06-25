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
  Platform,
  Picker,
} from "react-native";

import DatePicker from "../components/DatePicker";
import firebase from "../FirebaseDb";
import {
  formatDate,
  formatTime,
  newRoundedDate,
  getHours,
} from "../constants/DateFormats";

export default function EventFormPage({ route, navigation }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(newRoundedDate());
  const [endDate, setEndDate] = useState(newRoundedDate());
  const [categoryId, setCategoryId] = useState("");
  const [categoryName, setCategoryName] = useState("None");
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const { userId, isNewEvent, event, categories, onGoBack } = route.params;

  useEffect(() => {
    if (!isNewEvent) {
      const { title, description, startDate, endDate, category } = event.data;
      setTitle(title);
      setDescription(description);
      setStartDate(startDate);
      setEndDate(endDate);
      if (category.length > 0) {
        setCategoryId(category);
        const filtered = categories.filter((cat) => cat.key == category);
        setCategoryName(filtered[0].data.title);
      }
    }
  }, [event]);

  const handleCreateEvent = () =>
    startDate >= endDate
      ? Alert.alert("Event duration invalid!", "", [
          {
            text: "OK",
            onPress: () => {},
          },
        ])
      : firebase
          .firestore()
          .collection("users")
          .doc(userId)
          .collection("events")
          .add({
            title: title,
            description: description,
            startDate: startDate,
            endDate: endDate,
            category: categoryId,
          })
          .then(() =>
            Alert.alert("Event Created", "", [
              {
                text: "OK",
                onPress: () => {
                  onGoBack();
                  navigation.navigate("Calendar");
                },
              },
            ])
          )
          .catch((err) => console.error(err));

  const handleEditEvent = () =>
    startDate >= endDate
      ? Alert.alert("Event duration invalid!", "", [
          {
            text: "OK",
            onPress: () => {},
          },
        ])
      : firebase
          .firestore()
          .collection("users")
          .doc(userId)
          .collection("events")
          .doc(event.key)
          .set({
            title: title,
            description: description,
            startDate: startDate,
            endDate: endDate,
            category: categoryId,
          })
          .then(() =>
            Alert.alert("Event Edited Successfully", "", [
              {
                text: "OK",
                onPress: () => {
                  onGoBack();
                  navigation.navigate("Calendar");
                },
              },
            ])
          )
          .catch((err) => console.error(err));

  const handleUpdateTitle = (title) => setTitle(title);

  const handleUpdateDescription = (description) => setDescription(description);

  const togglePickers = (
    showStartDate,
    showStartTime,
    showEndDate,
    showEndTime,
    showCategory
  ) => {
    setShowStartDatePicker(showStartDate);
    setShowStartTimePicker(showStartTime);
    setShowEndDatePicker(showEndDate);
    setShowEndTimePicker(showEndTime);
    setShowCategoryPicker(showCategory);
  };

  const closeAllDatePickers = () =>
    togglePickers(false, false, false, false, false);

  const handleUpdateStartDate = (event, selectedDate) => {
    const currentDate = selectedDate || startDate;
    if (currentDate > startDate && currentDate >= endDate) {
      setEndDate(new Date(currentDate.getTime() + getHours(1)));
    }
    setStartDate(currentDate);
    if (Platform.OS === "android") {
      closeAllDatePickers();
    }
  };

  const handleUpdateEndDate = (event, selectedDate) => {
    const currentDate = selectedDate || startDate;
    setEndDate(currentDate);
    if (Platform.OS === "android") {
      closeAllDatePickers();
    }
  };

  const handleToggleStartDatePicker = () =>
    togglePickers(!showStartDatePicker, false, false, false, false);

  const handleToggleStartTimePicker = () =>
    togglePickers(false, !showStartTimePicker, false, false, false);

  const handleToggleEndDatePicker = () =>
    togglePickers(false, false, !showEndDatePicker, false, false);

  const handleToggleEndTimePicker = () =>
    togglePickers(false, false, false, !showEndTimePicker, false);

  const handleToggleCategoryPicker = () =>
    togglePickers(false, false, false, false, !showCategoryPicker);

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
          multiline
          style={styles.textInput}
          placeholder="Description"
          onChangeText={handleUpdateDescription}
          value={description}
        />
        <View style={styles.dates}>
          <Text style={styles.dateText}>Start:</Text>
          <Button
            onPress={handleToggleStartDatePicker}
            title={formatDate(startDate)}
          />
          <Button
            onPress={handleToggleStartTimePicker}
            title={formatTime(startDate)}
          />
        </View>
        {showStartDatePicker && (
          <DatePicker
            initialDate={startDate}
            onChange={handleUpdateStartDate}
            mode="date"
          />
        )}
        {showStartTimePicker && (
          <DatePicker
            initialDate={startDate}
            onChange={handleUpdateStartDate}
            mode="time"
          />
        )}
        <View style={styles.dates}>
          <Text style={styles.dateText}>End:</Text>
          <Button
            onPress={handleToggleEndDatePicker}
            title={formatDate(endDate)}
          />
          <Button
            onPress={handleToggleEndTimePicker}
            title={formatTime(endDate)}
          />
        </View>
        {showEndDatePicker && (
          <DatePicker
            initialDate={endDate}
            minimumDate={startDate}
            onChange={handleUpdateEndDate}
            mode="date"
          />
        )}
        {showEndTimePicker && (
          <DatePicker
            initialDate={endDate}
            minimumDate={startDate}
            onChange={handleUpdateEndDate}
            mode="time"
          />
        )}
        <View style={styles.dates}>
          <Text style={styles.dateText}>Category:</Text>
          {Platform.OS === "ios" ? (
            <Button onPress={handleToggleCategoryPicker} title={categoryName} />
          ) : (
            <Text>{categoryName}</Text>
          )}
        </View>
        {showCategoryPicker && (
          <Picker
            selectedValue={categoryId}
            style={{ width: 150 }}
            onValueChange={(itemValue, itemIndex) => {
              setCategoryId(itemValue);
              setCategoryName(
                itemIndex == 0 ? "None" : categories[itemIndex - 1].data.title
              );
            }}
          >
            <Picker.Item label="None" value="" />
            {categories.map((cat) => (
              <Picker.Item label={cat.data.title} value={cat.key} />
            ))}
          </Picker>
        )}
        <Button
          title={isNewEvent ? "Create Event" : "Edit Event"}
          onPress={() => {
            if (title.length) {
              if (isNewEvent) {
                handleCreateEvent();
              } else {
                handleEditEvent();
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
  dates: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: 250,
  },
  dateText: {
    fontSize: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "black",
    fontSize: 20,
    padding: 10,
    width: 300,
    margin: 12,
  },
});
