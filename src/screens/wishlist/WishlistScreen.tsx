import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const WishlistScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>위시리스트</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default WishlistScreen; 