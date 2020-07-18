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

export default function TaskDetailsPage({ route, navigation }) {
  const { userId, item, getTasks } = route.params;
  const {
    title,
    description,
    deadline,
    importance,
    expectedCompletionTime,
    repeat,
    repeatDate,
  } = item.data;
  const taskDoc = firebase
    .firestore()
    .collection("users")
    .doc(userId)
    .collection("tasks")
    .doc(item.key);

  const handleRepeat = () => {
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

  const handleSetNextDeadline = (nextDeadline) => {
    taskDoc.update({ deadline: nextDeadline }).then(
      Alert.alert("Task deleted", "", [
        {
          text: "Ok",
          onPress: () => {
            getTasks();
            navigation.navigate("TaskList");
          },
        },
      ])
    );
  };

  const handleDeleteTask = () => {
    taskDoc.delete().then(
      Alert.alert("Task deleted", "", [
        {
          text: "Ok",
          onPress: () => {
            getTasks();
            navigation.navigate("TaskList");
          },
        },
      ])
    );
  };

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
              onGoBack: getTasks,
              isNewTask: false,
              task: item,
            })
          }
        />
        <Button
          title="Completed"
          onPress={() =>
            Alert.alert("Confirm delete?", "Task: " + title, [
              {
                text: "Yes",
                onPress: () => {
                  handleRepeat();
                },
              },
              { text: "No", onPress: () => {} },
            ])
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
