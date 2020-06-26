import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

import firebase from "../FirebaseDb";
import { formatTime, getHours, today } from "../constants/DateFormats";

export default function SleepSchedulePage({ route, navigation }) {
  const todayTimestamp = today.getTime();
  const [wakeTime, setWakeTime] = useState(
    new Date(todayTimestamp + getHours(8))
  );
  const [sleepTime, setSleepTime] = useState(
    new Date(todayTimestamp + getHours(24))
  );
  const [showWakeTimePicker, setShowWakeTimePicker] = useState(false);
  const [showSleepTimePicker, setShowSleepTimePicker] = useState(false);

  const { userId } = route.params;

  useEffect(() => {
    firebase
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("sleep")
      .doc("schedule")
      .get()
      .then((doc) => {
        if (doc.exists) {
          setWakeTime(new Date(todayTimestamp + doc.data().wakeTime));
          setSleepTime(new Date(todayTimestamp + doc.data().sleepTime));
        }
      })
      .catch((err) => console.error(err));
  }, [userId]);

  const handleEditSleepSchedule = () =>
    firebase
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("sleep")
      .doc("schedule")
      .set({
        wakeTime: wakeTime.getTime() - todayTimestamp,
        sleepTime: sleepTime.getTime() - todayTimestamp,
      })
      .then(() =>
        Alert.alert("Schedule Set", "", [
          {
            text: "OK",
            onPress: () => navigation.navigate("Tabs"),
          },
        ])
      )
      .catch((err) => console.error(err));

  const handleToggleShowWakeTimePicker = () => {
    setShowWakeTimePicker(!showWakeTimePicker);
    setShowSleepTimePicker(false);
  };

  const handleToggleShowSleepTimePicker = () => {
    setShowWakeTimePicker(false);
    setShowSleepTimePicker(!showSleepTimePicker);
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
        <Text>Please set your sleep schedule below!</Text>
        <View style={styles.dates}>
          <Text>Wake-up time: </Text>
          <Button
            onPress={handleToggleShowWakeTimePicker}
            title={formatTime(wakeTime)}
          />
        </View>
        <DateTimePickerModal
          isVisible={showWakeTimePicker}
          mode="time"
          minuteInterval={30}
          onConfirm={(wakeTime) => {
            setWakeTime(wakeTime);
            handleToggleShowWakeTimePicker();
          }}
          onCancel={handleToggleShowWakeTimePicker}
          date={wakeTime}
        />
        <View style={styles.dates}>
          <Text>Sleep time: </Text>
          <Button
            onPress={handleToggleShowSleepTimePicker}
            title={formatTime(sleepTime)}
          />
        </View>
        <DateTimePickerModal
          isVisible={showSleepTimePicker}
          mode="time"
          minuteInterval={30}
          onConfirm={(sleepTime) => {
            setSleepTime(sleepTime);
            handleToggleShowSleepTimePicker();
          }}
          onCancel={handleToggleShowSleepTimePicker}
          date={sleepTime}
        />
        <Button title={"Confirm Schedule"} onPress={handleEditSleepSchedule} />
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
