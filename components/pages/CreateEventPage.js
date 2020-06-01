import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Button,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";

import firebase from "../firebaseDb";

export default class CreateEventPage extends React.Component {
  state = {
    title: "",
    description: "",
  };

  handleCreateEvent = (uid, navigation) =>
    firebase
      .firestore()
      .collection("users")
      .doc(uid)
      .collection("events")
      .add({ title: this.state.title, description: this.state.description })
      .then(() => {
        this.setState({
          title: "",
          description: "",
        });
        Alert.alert("Task Created", "", [
          {
            text: "OK",
            onPress: () => navigation.navigate("Calendar"),
          },
        ]);
      })
      .catch((err) => console.error(err));

  handleUpdateTitle = (title) => this.setState({ title });

  handleUpdateDescription = (description) => this.setState({ description });

  render() {
    const { title, description } = this.state;
    const { route, navigation } = this.props;
    const { uid } = route.params;

    return (
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.container}>
          <TextInput
            style={styles.textInput}
            placeholder="Event"
            onChangeText={this.handleUpdateTitle}
            value={title}
          />
          <TextInput
            style={styles.textInput}
            placeholder="Description"
            onChangeText={this.handleUpdateDescription}
            value={description}
          />
          <Button
            title="Create Event"
            style={styles.button}
            onPress={() => {
              if (title.length) {
                this.handleCreateEvent(uid, navigation);
              }
            }}
          />
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    marginBottom: 40,
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
  button: {
    marginTop: 42,
  },
});
