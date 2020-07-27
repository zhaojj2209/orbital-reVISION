import React, { useState, useEffect } from "react";
import {
  Alert,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Button,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import moment from "moment";
import { useIsFocused } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";

import firebase, { getTasksDb, getSleepSchedule } from "../FirebaseDb";
import { formatDateDisplay, getHours } from "../constants/DateFormats";
import { taskColours } from "../constants/Colours";

console.disableYellowBox = true;

export default function TaskListScreen({ route, navigation }) {
  const [tasks, setTasks] = useState(null);
  const { userId } = route.params;
  const isFocused = useIsFocused();

  const tasksDb = getTasksDb(userId);
  const sleepSchedule = getSleepSchedule(userId);

  useEffect(() => {
    if (isFocused) {
      getTasks();
    }
  }, [isFocused]);

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
    sleepSchedule
      .get()
      .then((doc) => {
        const { wakeTime, sleepTime } = doc.data();
        studyHours = (sleepTime - wakeTime) / getHours(1) / 3;
        tasksDb
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
      <View style={styles.box}>
        {tasks != null && tasks.length ? (
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
                      { backgroundColor: item.color, flexDirection: "column" },
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
        ) : (
          <Text style={styles.title}>No tasks. Create one now!</Text>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              navigation.navigate("TaskInput", {
                userId: userId,
                isNewTask: true,
                task: null,
              });
            }}
          >
            <Entypo name="add-to-list" size={20} color="#ff7e67" />
            <Text style={styles.buttonText}>Add Task</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              Alert.alert("Confirm logout?", "", [
                {
                  text: "OK",
                  onPress: () =>
                    firebase
                      .auth()
                      .signOut()
                      .then(() => navigation.navigate("Login")),
                },
                {
                  text: "Cancel",
                  onPress: () => {},
                },
              ])
            }
          >
            <Feather name="log-out" size={20} color="#ff7e67" />
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fafafa",
  },
  box: { marginTop: 24, paddingHorizontal: 18 },
  button: { flexDirection: "row", paddingBottom: 10, paddingTop: 10 },
  buttonText: { fontSize: 16, paddingLeft: 10, color: "#ff7e67" },
  card: {
    borderRadius: 6,
    elevation: 3,
    shadowOffset: { width: 1, height: 1 },
    shadowColor: "#333",
    shadowOpacity: 0.3,
    width: Dimensions.get("window").width - 44,
    margin: 6,
  },

  title: { fontSize: 20, paddingLeft: 10, paddingVertical: 10 },
  deadline: { fontSize: 14, paddingLeft: 16, paddingBottom: 10 },

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
