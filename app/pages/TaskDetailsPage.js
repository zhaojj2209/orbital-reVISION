import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert,
  SafeAreaView,
} from "react-native";
import firebase from "../firebaseDb";

export default function TaskDetailsPage({ navigation }) {
  const item = navigation.getParam("item");

  const getTasks = navigation.getParam("getTasks");
  const handleDeleteTask = (key) => {
    firebase
      .firestore()
      .collection("tasks")
      .doc(key)
      .delete()
      .then(
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
        <Text style={styles.detailsText}>Title: {item.data.title}</Text>
        <Text style={styles.detailsText}>
          Description: {item.data.description}
        </Text>
        <Text style={styles.detailsText}>
          Importance: {item.data.importance}
        </Text>
        <Text style={styles.detailsText}>
          Expected Completion Time: {item.data.expectedCompletionTime}
          {" hours"}
        </Text>

        <Text style={styles.detailsText}>Deadline: {item.data.deadline}</Text>
      </View>
      <View style={styles.buttonRow}>
        <Button
          title="Edit"
          onPress={() =>
            navigation.navigate("TaskInput", {
              onGoBack: getTasks,
              isNewTask: false,
              task: item,
            })
          }
        />
        <Button
          title="Completed"
          onPress={() =>
            Alert.alert("Confirm delete?", "Task: " + item.data.title, [
              {
                text: "Yes",
                onPress: () => {
                  handleDeleteTask(item.key);
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
