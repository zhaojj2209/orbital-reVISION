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
} from "react-native";
import { format } from "date-fns";

import DatePicker from "./DatePicker";
import firebase from "../firebaseDb";

export default function EventFormPage({ route, navigation }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const { userId, isNewEvent, event } = route.params;

  useEffect(() => {
    if (!isNewEvent) {
      const { title, description, startDate, endDate } = event.data;
      setTitle(title);
      setDescription(description);
      setStartDate(startDate);
      setEndDate(endDate);
    }
  }, [event]);

  const handleCreateEvent = () =>
    firebase
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("events")
      .add({
        title: title,
        description: description,
        startDate: startDate,
        endDate: endDate,
      })
      .then(() => {
        setTitle("");
        setDescription("");
        setStartDate(new Date());
        setEndDate(new Date());
        Alert.alert("Event Created", "", [
          {
            text: "OK",
            onPress: () => navigation.navigate("Calendar"),
          },
        ]);
      })
      .catch((err) => console.error(err));

  const handleEditEvent = () =>
    firebase
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
      })
      .then(() => {
        setTitle("");
        setDescription("");
        setStartDate(new Date());
        setEndDate(new Date());
        Alert.alert("Event Edited Successfully", "", [
          {
            text: "OK",
            onPress: () => navigation.navigate("Calendar"),
          },
        ]);
      })
      .catch((err) => console.error(err));

  const handleUpdateTitle = (title) => setTitle(title);

  const handleUpdateDescription = (description) => setDescription(description);

  const closeAllDatePickers = () => {
    setShowStartDatePicker(false);
    setShowStartTimePicker(false);
    setShowEndDatePicker(false);
    setShowEndTimePicker(false);
  };

  const handleUpdateStartDate = (event, selectedDate) => {
    const currentDate = selectedDate || startDate;
    setStartDate(currentDate);
    setEndDate(currentDate);
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

  const handleToggleStartDatePicker = () => {
    setShowStartDatePicker(!showStartDatePicker);
    setShowStartTimePicker(false);
    setShowEndDatePicker(false);
    setShowEndTimePicker(false);
  };

  const handleToggleStartTimePicker = () => {
    setShowStartDatePicker(false);
    setShowStartTimePicker(!showStartTimePicker);
    setShowEndDatePicker(false);
    setShowEndTimePicker(false);
  };
  const handleToggleEndDatePicker = () => {
    setShowStartDatePicker(false);
    setShowStartTimePicker(false);
    setShowEndDatePicker(!showEndDatePicker);
    setShowEndTimePicker(false);
  };
  const handleToggleEndTimePicker = () => {
    setShowStartDatePicker(false);
    setShowStartTimePicker(false);
    setShowEndDatePicker(false);
    setShowEndTimePicker(!showEndTimePicker);
  };

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
          placeholder="Description"
          onChangeText={handleUpdateDescription}
          value={description}
        />
        <View style={styles.dates}>
          <Text>Start:</Text>
          <Button
            onPress={handleToggleStartDatePicker}
            title={format(startDate, "dd MMM yyyy")}
          />
          <Button
            onPress={handleToggleStartTimePicker}
            title={format(startDate, "h:mm a")}
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
          <Text>End:</Text>
          <Button
            onPress={handleToggleEndDatePicker}
            title={format(endDate, "dd MMM yyyy")}
          />
          <Button
            onPress={handleToggleEndTimePicker}
            title={format(endDate, "h:mm a")}
          />
        </View>
        {showEndDatePicker && (
          <DatePicker
            initialDate={endDate}
            onChange={handleUpdateEndDate}
            mode="date"
          />
        )}
        {showEndTimePicker && (
          <DatePicker
            initialDate={endDate}
            onChange={handleUpdateEndDate}
            mode="time"
          />
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
