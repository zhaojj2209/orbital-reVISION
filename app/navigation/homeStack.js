import { createStackNavigator } from "react-navigation-stack";
import { createAppContainer } from "react-navigation";
import TaskListScreen from "../screens/TaskListScreen";
import TaskInputPage from "../pages/TaskInputPage";
import TaskDetailsPage from "../pages/TaskDetailsPage";

const screens = {
  TaskList: {
    screen: TaskListScreen,
  },
  TaskInput: {
    screen: TaskInputPage,
  },
  TaskDetails: {
    screen: TaskDetailsPage,
  },
};

const HomeStack = createStackNavigator(screens);

export default createAppContainer(HomeStack);
