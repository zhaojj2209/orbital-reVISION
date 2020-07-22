import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Button,
  FlatList,
  TouchableOpacity,
} from "react-native";
import moment from "moment";
import { useIsFocused } from "@react-navigation/native";

import firebase from "../FirebaseDb";
import { formatDateDisplay, getHours } from "../constants/DateFormats";
import { taskColours } from "../constants/Colours";

export default function TaskListScreen({ route, navigation }) {
  const [tasks, setTasks] = useState(null);
  const { userId } = route.params;
  const isFocused = useIsFocused();

  useEffect(() => getTasks(), [isFocused]);

  const getTasks = () => {
    let studyHours;
    function taskColor(task) {
      const { deadline, expectedCompletionTime, importance } = task;
      const date = moment(deadline.toDate());
      const currentTime = moment();
      if (date.isAfter(currentTime)) {
        const complTime = parseInt(expectedCompletionTime);
        const imp = parseInt(importance);
        const multiplier =
          imp == 5 ? 2 : imp == 4 ? 1.75 : imp == 3 ? 1.5 : imp == 2 ? 1.25 : 1;
        const dayDiff = date.diff(currentTime, "days");
        const dayTime = dayDiff * studyHours;
        const priority = Math.round(dayTime / complTime / multiplier);
        return priority <= 1
          ? taskColours.one
          : priority <= 2
          ? taskColours.two
          : priority <= 3
          ? taskColours.three
          : priority <= 4
          ? taskColours.four
          : taskColours.five;
      } else {
        return taskColours.overdue;
      }
    }
    firebase
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("sleep")
      .doc("schedule")
      .get()
      .then((doc) => {
        const { wakeTime, sleepTime } = doc.data();
        studyHours = (sleepTime - wakeTime) / getHours(1) / 3;
        firebase
          .firestore()
          .collection("users")
          .doc(userId)
          .collection("tasks")
          .orderBy("deadline")
          .get()
          .then((querySnapshot) => {
            const results = [];
            querySnapshot.docs.map((documentSnapshot) => {
              const data = documentSnapshot.data();
              results.push({
                key: documentSnapshot.id,
                data: {
                  title: data.title,
                  description: data.description,
                  importance: data.importance,
                  expectedCompletionTime: data.expectedCompletionTime,
                  deadline: data.deadline.toDate(),
                  repeat: data.repeat,
                  repeatDate:
                    data.repeatDate == null ? null : data.repeatDate.toDate(),
                },
                color: taskColor(data),
              });
            });
            setTasks(results);
          })
          .catch((err) => console.error(err));
      })
      .catch((err) => console.error(err));
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={tasks}
        renderItem={({ item }) => (
          <View>
            <View>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("TaskDetails", {
                    userId,
                    item,
                  })
                }
                style={StyleSheet.flatten([
                  styles.card,
                  { backgroundColor: item.color },
                ])}
              >
                <Text style={styles.title}> {item.data.title}</Text>
                <Text style={styles.deadline}>
                  {formatDateDisplay(item.data.deadline)}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <View style={styles.buttonRow}>
        <Button
          title="Add Tasks"
          onPress={() => {
            navigation.navigate("TaskInput", {
              userId: userId,
              isNewTask: true,
              task: null,
            });
          }}
        />
        <Button
          title="Logout"
          style={styles.button}
          onPress={() =>
            firebase
              .auth()
              .signOut()
              .then(() => navigation.navigate("Login"))
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
  card: {
    borderRadius: 6,
    elevation: 3,
    shadowOffset: { width: 1, height: 1 },
    shadowColor: "#333",
    shadowOpacity: 0.3,
    margin: 6,
    width: 350,
  },

  title: { fontSize: 20, padding: 10 },
  deadline: { fontSize: 14, margin: 10 },

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
