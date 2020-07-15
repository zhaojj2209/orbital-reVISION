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
import moment from "moment";

import firebase from "../FirebaseDb";
import {
  formatDateDisplay,
  newRoundedDate,
  getHours,
  formatDate,
  today,
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
  const [repeat, setRepeat] = useState("None");
  const [repeatId, setRepeatId] = useState("");
  const [repeatDate, setRepeatDate] = useState(today);
  const [showRepeatPicker, setShowRepeatPicker] = useState(false);
  const [showRepeatDatePicker, setShowRepeatDatePicker] = useState(false);

  const { userId, isNewEvent, event, categories, onGoBack } = route.params;
  const prevRepeatStatus = event.data.repeat;

  const eventsDb = firebase
    .firestore()
    .collection("users")
    .doc(userId)
    .collection("events");

  useEffect(() => {
    if (!isNewEvent) {
      const {
        title,
        description,
        startDate,
        endDate,
        category,
        repeat,
        repeatId,
        repeatDate,
      } = event.data;
      setTitle(title);
      setDescription(description);
      setStartDate(startDate);
      setEndDate(endDate);
      setRepeat(repeat);
      setRepeatId(repeatId);
      setRepeatDate(repeatDate);
      if (category.length > 0) {
        setCategoryId(category);
        const filtered = categories.filter((cat) => cat.key == category);
        setCategoryName(
          filtered.length ? filtered[0].data.title : "Study Session"
        );
      }
    }
  }, [event]);

  const handleCreateEvent = () => {
    if (startDate >= endDate) {
      Alert.alert("Event duration invalid!", "", [
        {
          text: "OK",
          onPress: () => {},
        },
      ]);
    } else {
      eventsDb
        .add({
          title: title,
          description: description,
          startDate: startDate,
          endDate: endDate,
          category: categoryId,
          repeat: repeat,
          repeatId: "",
          repeatDate: null,
        })
        .then((doc) => {
          if (repeat != "None") {
            setRepeatId(doc.id);
            eventsDb.doc(doc.id).update({
              repeatId: doc.id,
              repeatDate: repeatDate,
            });
            createRepeatedEvents(doc.id);
          }
          Alert.alert("Event Created", "", [
            {
              text: "OK",
              onPress: () => {
                onGoBack();
                navigation.navigate("Calendar");
              },
            },
          ]);
        })
        .catch((err) => console.error(err));
    }
  };

  const handleEditEvent = () => {
    console.log(prevRepeatStatus);
    if (startDate >= endDate) {
      Alert.alert("Event duration invalid!", "", [
        {
          text: "OK",
          onPress: () => {},
        },
      ]);
    } else if (prevRepeatStatus != "None") {
      Alert.alert(
        "Change all repeated events?",
        "Past repeated events will be deleted!",
        [
          {
            text: "All events",
            onPress: () => {
              eventsDb
                .where("repeatId", "==", repeatId)
                .get()
                .then((querySnapshot) => {
                  querySnapshot.docs.forEach((documentSnapshot) => {
                    documentSnapshot.ref.delete();
                  });
                  editEvents();
                });
            },
          },
          {
            text: "This event",
            onPress: () => editEvents(),
          },
        ]
      );
    } else {
      editEvents();
    }
  };

  const editEvents = () => {
    eventsDb
      .doc(event.key)
      .set({
        title: title,
        description: description,
        startDate: startDate,
        endDate: endDate,
        category: categoryId,
        repeat: repeat,
        repeatId: "",
        repeatDate: null,
      })
      .then(() => {
        if (repeat != "None") {
          setRepeatId(event.key);
          eventsDb.doc(event.key).update({
            repeatId: event.key,
            repeatDate: repeatDate,
          });
          createRepeatedEvents(event.key);
        }
        Alert.alert("Event Edited Successfully", "", [
          {
            text: "OK",
            onPress: () => {
              onGoBack();
              navigation.navigate("Calendar");
            },
          },
        ]);
      })
      .catch((err) => console.error(err));
  };

  const createRepeatedEvents = (repeatId) => {
    const interval =
      repeat == "Daily"
        ? "days"
        : repeat == "Weekly"
        ? "weeks"
        : repeat == "Monthly"
        ? "months"
        : "";
    if (interval.length) {
      let nextStartDate = moment(startDate).add(1, interval);
      let nextEndDate = moment(endDate).add(1, interval);
      while (nextStartDate < repeatDate) {
        eventsDb
          .add({
            title: title,
            description: description,
            startDate: nextStartDate.toDate(),
            endDate: nextEndDate.toDate(),
            category: categoryId,
            repeat: repeat,
            repeatId: repeatId,
            repeatDate: repeatDate,
          })
          .catch((err) => console.error(err));
        nextStartDate.add(1, interval);
        nextEndDate.add(1, interval);
      }
    }
  };

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

  const handleToggleCategoryPicker = () => {
    Keyboard.dismiss();
    setShowRepeatPicker(false);
    setShowCategoryPicker(!showCategoryPicker);
  };

  const handleToggleRepeatPicker = () => {
    Keyboard.dismiss();
    setShowCategoryPicker(false);
    setShowRepeatPicker(!showRepeatPicker);
  };

  const showPicker = (pickingStartDate) => {
    Keyboard.dismiss();
    setShowCategoryPicker(false);
    setShowRepeatPicker(false);
    setPickingStartDate(pickingStartDate);
    setShowDatePicker(true);
  };

  const toggleRepeatDatePicker = () => {
    Keyboard.dismiss();
    setShowCategoryPicker(false);
    setShowRepeatPicker(false);
    setShowRepeatDatePicker(true);
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
        <View style={styles.dates}>
          <Text style={styles.dateText}>Repeat:</Text>
          <TouchableOpacity onPress={handleToggleRepeatPicker}>
            <Text style={styles.dateText}>{repeat}</Text>
          </TouchableOpacity>
        </View>
        {repeat != "None" && (
          <View style={styles.dates}>
            <Text style={styles.dateText}>Repeat until:</Text>
            <TouchableOpacity onPress={toggleRepeatDatePicker}>
              <Text style={styles.dateText}>{formatDate(repeatDate)}</Text>
            </TouchableOpacity>
          </View>
        )}
        <DateTimePickerModal
          isVisible={showRepeatDatePicker}
          mode="date"
          onConfirm={(date) => {
            setRepeatDate(date);
            setShowRepeatDatePicker(false);
          }}
          onCancel={() => setShowRepeatDatePicker(false)}
          date={repeatDate}
        />
        {showRepeatPicker && (
          <Picker
            selectedValue={repeat}
            style={{ width: 350 }}
            onValueChange={(itemValue, itemIndex) => setRepeat(itemValue)}
          >
            <Picker.Item label="None" value="None" />
            <Picker.Item label="Daily" value="Daily" />
            <Picker.Item label="Weekly" value="Weekly" />
            <Picker.Item label="Monthly" value="Monthly" />
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
            } else {
              Alert.alert(
                "Event cannot be saved!",
                "Event title cannot be blank",
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
