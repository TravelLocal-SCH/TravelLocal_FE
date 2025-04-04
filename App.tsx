/*import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigations/root/RootNavigator';
import { QueryClientProvider } from '@tanstack/react-query';
import queryClient from './src/api/queryClient';



function App() {
 


  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <RootNavigator/>
      </NavigationContainer>
    </QueryClientProvider>
  );
}



export default App;
*/

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import QuestionScreen from './src/screens/mbti/QuestionScreen';
import ResultScreen from './src/screens/mbti/ResultScreen';
import {ResultType} from './src/types/ResultType';

export type RootStackParamList = {
  Question: undefined;
  Result: {result: ResultType};
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Question">
        <Stack.Screen
          name="Question"
          component={QuestionScreen}
          options={{title: '여행 성향 질문'}}
        />
        <Stack.Screen
          name="Result"
          component={ResultScreen}
          options={{title: '분석 결과'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
