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

import firebase from "../FirebaseDb";
import { formatDateDisplay } from "../constants/DateFormats";
import { taskColours } from "../constants/Colours";

export default function TaskListScreen({ route, navigation }) {
  const [tasks, setTasks] = useState(null);
  const { userId } = route.params;

  useEffect(() => getTasks(), []);

  const getTasks = () => {
    let counter = 0;

    function taskColor(deadline) {
      let date = moment(deadline);
      if (date.isAfter(moment())) {
        while (date.isAfter(moment())) {
          counter += 1;
          date.subtract(1, "days");
        }
        return counter == 1
          ? taskColours.one
          : counter == 2
          ? taskColours.two
          : counter == 3
          ? taskColours.three
          : counter == 4
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
            },
            color: taskColor(data.deadline.toDate()),
          });
        });
        setTasks(results);
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
                    getTasks,
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
              onGoBack: getTasks,
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
