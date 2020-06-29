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
import { formatDateDisplay } from "../constants/DateFormats";

import firebase from "../FirebaseDb";

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
          ? "#ee6969"
          : counter == 2
          ? "#f97c7c"
          : counter == 3
          ? "#fdaaaa"
          : counter == 4
          ? "#f4c1c1"
          : "#fde0e0";
      } else {
        return "red";
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
