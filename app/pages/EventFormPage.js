import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Keyboard,
  Alert,
  Picker,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

import firebase from "../FirebaseDb";
import {
  formatDateDisplay,
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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickingStartDate, setPickingStartDate] = useState(true);
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
        setCategoryName(
          filtered.length ? filtered[0].data.title : "Study Session"
        );
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

  const handleSubmitDate = (date) =>
    pickingStartDate ? handleUpdateStartDate(date) : handleUpdateEndDate(date);

  const handleUpdateStartDate = (selectedDate) => {
    if (selectedDate > startDate && selectedDate >= endDate) {
      setEndDate(new Date(selectedDate.getTime() + getHours(1)));
    }
    setStartDate(selectedDate);
  };

  const handleUpdateEndDate = (selectedDate) => setEndDate(selectedDate);

  const handleToggleCategoryPicker = () =>
    setShowCategoryPicker(!showCategoryPicker);

  const showPicker = (pickingStartDate) => {
    Keyboard.dismiss();
    setShowCategoryPicker(false);
    setPickingStartDate(pickingStartDate);
    setShowDatePicker(true);
  };

  const hidePicker = () => setShowDatePicker(false);

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
          <Text style={styles.dateText}>Start: </Text>
          <TouchableOpacity onPress={() => showPicker(true)}>
            <Text style={styles.dateText}>{formatDateDisplay(startDate)}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.dates}>
          <Text style={styles.dateText}>End: </Text>
          <TouchableOpacity onPress={() => showPicker(false)}>
            <Text style={styles.dateText}>{formatDateDisplay(endDate)}</Text>
          </TouchableOpacity>
        </View>
        <DateTimePickerModal
          isVisible={showDatePicker}
          mode="datetime"
          minuteInterval={15}
          onConfirm={(date) => {
            handleSubmitDate(date);
            hidePicker();
          }}
          onCancel={hidePicker}
          date={pickingStartDate ? startDate : endDate}
        />
        <View style={styles.dates}>
          <Text style={styles.dateText}>Category:</Text>
          <Button onPress={handleToggleCategoryPicker} title={categoryName} />
        </View>
        {showCategoryPicker && (
          <Picker
            selectedValue={categoryId}
            style={{ width: 350 }}
            onValueChange={(itemValue, itemIndex) => {
              setCategoryId(itemValue);
              setCategoryName(
                itemIndex == 0
                  ? "None"
                  : itemIndex == 1
                  ? "Study Session"
                  : categories[itemIndex - 2].data.title
              );
            }}
          >
            <Picker.Item label="None" value="" />
            <Picker.Item label="Study Session" value="Study Session" />
            {categories.map((cat) => (
              <Picker.Item
                label={cat.data.title}
                value={cat.key}
                key={cat.key}
              />
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
    justifyContent: "space-between",
  },
  dateText: {
    padding: 10,
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
