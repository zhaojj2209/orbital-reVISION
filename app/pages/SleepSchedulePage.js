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
import * as Permissions from "expo-permissions";
import * as Notifications from "expo-notifications";

import { getSleepSchedule } from "../FirebaseDb";
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

  const sleepSchedule = getSleepSchedule(userId);

  useEffect(() => {
    sleepSchedule
      .get()
      .then((doc) => {
        if (doc.exists) {
          setWakeTime(new Date(todayTimestamp + doc.data().wakeTime));
          setSleepTime(new Date(todayTimestamp + doc.data().sleepTime));
        }
      })
      .catch((err) => console.error(err));
    async function registerForPushNotif() {
      const { status } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
      let exisitingStatus = status;

      if (exisitingStatus !== "granted") {
        const { status } = await Permissions.askAsync(
          Permissions.NOTIFICATIONS
        );

        exisitingStatus = status;
      }
      if (exisitingStatus !== "granted") {
        Alert.alert("Permission not granted");
        return;
      }

      let token = await Notifications.getExpoPushTokenAsync();
      let uid = firebase.auth().currentUser.uid;
      firebase
        .database()
        .ref("users")
        .child(uid)
        .update({ expoPushToken: token });
    }
    registerForPushNotif();
  }, [userId]);

  const handleEditSleepSchedule = () =>
    sleepSchedule
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
        <Text style={styles.text}>Please set your sleep schedule below!</Text>
        <View style={styles.dates}>
          <Text style={styles.dateText}>Wake-up time: </Text>
          <Button
            onPress={handleToggleShowWakeTimePicker}
            title={formatTime(wakeTime)}
          />
        </View>
        <DateTimePickerModal
          headerTextIOS="Pick a time"
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
          <Text style={styles.dateText}>Sleep time: </Text>
          <Button
            onPress={handleToggleShowSleepTimePicker}
            title={formatTime(sleepTime)}
          />
        </View>
        <DateTimePickerModal
          headerTextIOS="Pick a time"
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
  text: { fontSize: 18, marginBottom: 10 },
  dates: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: 20,
  },
});
