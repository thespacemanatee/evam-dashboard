import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Icon,
  Layout,
  Text,
  TopNavigation,
  TopNavigationAction,
} from '@ui-kitten/components';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    // alignItems: 'center',
  },
  text: {
    textAlign: 'center',
  },
  scanButton: {
    marginVertical: 16,
  },
  indicator: {
    position: 'absolute',
    right: 20,
  },
});

const DrawerIcon = props => <Icon {...props} name='menu-outline' />;

const Dashboard = ({ navigation }) => {
  const DrawerAction = () => (
    <TopNavigationAction
      icon={DrawerIcon}
      onPress={() => {
        navigation.openDrawer();
      }}
    />
  );
  return (
    <View style={styles.screen}>
      <TopNavigation
        title='Dashboard'
        alignment='center'
        accessoryLeft={DrawerAction}
      />
      <Layout style={styles.container}>
        <Text style={styles.text} category='h1'>
          Welcome to EVAM 😻
        </Text>
      </Layout>
    </View>
  );
};

export default Dashboard;
