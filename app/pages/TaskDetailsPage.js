import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert,
  SafeAreaView,
} from "react-native";
import moment from "moment";

import firebase from "../FirebaseDb";
import { formatDate, formatDateDisplay } from "../constants/DateFormats";
import * as Notifications from "expo-notifications";

export default function TaskDetailsPage({ route, navigation }) {
  const { userId, item } = route.params;
  const {
    title,
    description,
    deadline,
    importance,
    expectedCompletionTime,
    repeat,
    repeatDate,
    identifier,
  } = item.data;
  const taskDoc = firebase
    .firestore()
    .collection("users")
    .doc(userId)
    .collection("tasks")
    .doc(item.key);

  const handleRepeat = async () => {
    const interval =
      repeat.slice(0, 5) == "Daily"
        ? "days"
        : repeat.slice(0, 6) == "Weekly"
        ? "weeks"
        : repeat.slice(0, 7) == "Monthly"
        ? "months"
        : "";
    if (interval.length) {
      const nextDeadline = moment(deadline).add(1, interval);
      if (repeatDate != null && nextDeadline.isAfter(moment(repeatDate))) {
        handleDeleteTask();
      } else {
        handleSetNextDeadline(nextDeadline.toDate());
      }
    } else {
      handleDeleteTask();
    }
  };

  const handleSetNextDeadline = async (nextDeadline) => {
    let newIdentifer = await rescheduleNotif(
      identifier,
      title,
      expectedCompletionTime,
      nextDeadline
    );

    taskDoc.update({ deadline: nextDeadline, identifier: newIdentifer }).then(
      Alert.alert("Task deleted", "", [
        {
          text: "Ok",
          onPress: () => navigation.navigate("TaskList"),
        },
      ])
    );
  };

  const handleDeleteTask = async () => {
    await Notifications.cancelScheduledNotificationAsync(identifier);

    taskDoc.delete().then(() => {
      Alert.alert("Task deleted", "", [
        {
          text: "Ok",
          onPress: () => navigation.navigate("TaskList"),
        },
      ]);
    });
  };
  async function scheduleNotif(title, expectedCompletionTime, deadline) {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: title + " is due soon!",
        body:
          moment(deadline, "MMMM Do YYYY, h:mm a").diff(moment(), "minutes") /
            60 <
          expectedCompletionTime
            ? "Deadline of task in " +
              (
                moment(deadline, "MMMM Do YYYY, h:mm a").diff(
                  moment(),
                  "minutes"
                ) / 60
              ).toFixed(2) +
              " hour(s)"
            : "Deadline of task in " + expectedCompletionTime + " hour(s)",
      },
      trigger:
        moment(deadline, "MMMM Do YYYY, h:mm a").diff(moment(), "minutes") /
          60 <
        expectedCompletionTime
          ? null
          : moment(deadline, "MMMM Do YYYY, h:mm a")
              .subtract({
                hours: expectedCompletionTime,
              })
              .toDate(),
    });
    return identifier;
  }

  async function rescheduleNotif(
    oldIdentifier,
    title,
    expectedCompletionTime,
    deadline
  ) {
    await Notifications.cancelScheduledNotificationAsync(oldIdentifier);
    return scheduleNotif(title, expectedCompletionTime, deadline);
  }
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  function isNotRepeat() {
    return repeat === "None";
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.details}>
        <Text style={styles.detailsText}>Title: {title}</Text>
        <Text style={styles.detailsText}>Description: {description}</Text>
        <Text style={styles.detailsText}>Importance: {importance}</Text>
        <Text style={styles.detailsText}>
          Expected Completion Time: {expectedCompletionTime}
          {" hours"}
        </Text>
        <Text style={styles.detailsText}>
          Deadline: {formatDateDisplay(deadline)}
        </Text>
        <Text style={styles.detailsText}>
          Repeat:{" "}
          {repeat.slice(-8) == "until..."
            ? repeat.slice(0, repeat.length - 3) + " " + formatDate(repeatDate)
            : repeat}
        </Text>
      </View>
      <View style={styles.buttonRow}>
        <Button
          title="Edit"
          onPress={() =>
            navigation.navigate("TaskInput", {
              userId: userId,
              isNewTask: false,
              task: item,
            })
          }
        />
        <Button
          title="Complete"
          onPress={() =>
            Alert.alert(
              "Confirm complete?",
              isNotRepeat()
                ? "Task: " + title
                : "Next instance of task: " + title + " will be generated",
              [
                {
                  text: "Yes",
                  onPress: () => handleRepeat(),
                },
                { text: "No", onPress: () => {} },
              ]
            )
          }
        />
        <Button
          title="Delete"
          onPress={() =>
            Alert.alert(
              "Confirm delete?",
              isNotRepeat()
                ? "Task: " + title
                : "All future instances of task " +
                    title +
                    " will be deleted as well",
              [
                {
                  text: "Yes",
                  onPress: () => handleDeleteTask(),
                },
                { text: "No", onPress: () => {} },
              ]
            )
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  details: {
    padding: 40,
  },

  detailsText: {
    fontSize: 18,
    textAlign: "left",
    textAlignVertical: "center",
    lineHeight: 25,
    padding: 8,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
});
